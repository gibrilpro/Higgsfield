import "server-only";
import { COMMISSION_RATE } from "./catalog";
import { newId, now, one, query, run } from "./db";
import type { User } from "./auth";
import { createCheckout, refund, releaseFunds, stripeEnabled } from "./payments";

export type MissionStatus = "awaiting_payment" | "paid" | "in_progress" | "delivered" | "completed" | "disputed" | "cancelled" | "refunded";

export const STATUS_LABEL: Record<MissionStatus, string> = {
  awaiting_payment: "En attente de paiement",
  paid: "Payée, en attente de l'expert",
  in_progress: "En cours d'installation",
  delivered: "Livrée, à valider",
  completed: "Terminée",
  disputed: "Litige en cours",
  cancelled: "Annulée",
  refunded: "Remboursée",
};
export const TRACK: MissionStatus[] = ["paid", "in_progress", "delivered", "completed"];

export type Mission = {
  id: string; client_id: string; expert_id: string; title: string; category: string; brief: string;
  amount_cents: number; commission_cents: number; status: MissionStatus;
  stripe_payment_intent: string | null; stripe_transfer_id: string | null;
  created_at: number; updated_at: number;
  client_name?: string; expert_name?: string;
};

export class MissionError extends Error {}

const SELECT = `SELECT m.*, c.name AS client_name, e.name AS expert_name FROM missions m
  JOIN users c ON c.id = m.client_id JOIN users e ON e.id = m.expert_id`;

export async function getMission(id: string) {
  return one<Mission>(`${SELECT} WHERE m.id = ?`, [id]);
}

export function canSee(m: Mission, u: User) {
  return u.is_admin === 1 || m.client_id === u.id || m.expert_id === u.id;
}

export async function listMissionsFor(u: User) {
  return query<Mission>(`${SELECT} WHERE m.client_id = ? OR m.expert_id = ? ORDER BY m.updated_at DESC`, [u.id, u.id]);
}

export async function createMission(client: User, input: { expertId: string; title: string; category: string; brief: string; amountEur: number; diagnosticId?: string | null; solutionId?: string | null }) {
  if (client.role !== "client") throw new MissionError("Seul un compte entreprise peut commander une mission.");
  const expert = await one<{ user_id: string }>("SELECT user_id FROM experts WHERE user_id = ? AND status = 'approved'", [input.expertId]);
  if (!expert) throw new MissionError("Cet expert n'est pas disponible.");
  if (expert.user_id === client.id) throw new MissionError("Vous ne pouvez pas vous commander une mission.");
  const amount = Math.round(input.amountEur * 100);
  if (!(amount >= 5000 && amount <= 2000000)) throw new MissionError("Le montant doit être compris entre 50 € et 20 000 €.");
  const id = newId();
  const t = now();
  await run(
    `INSERT INTO missions (id, client_id, expert_id, title, category, brief, amount_cents, commission_cents, status, diagnostic_id, solution_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'awaiting_payment', ?, ?, ?, ?)`,
    [id, client.id, input.expertId, input.title.slice(0, 120), input.category.slice(0, 60), input.brief.slice(0, 4000), amount, Math.round(amount * COMMISSION_RATE), input.diagnosticId ?? null, input.solutionId ?? null, t, t],
  );
  return id;
}

async function transition(id: string, from: MissionStatus[], to: MissionStatus, extra: Record<string, string | null> = {}) {
  const sets = ["status = ?", "updated_at = ?", ...Object.keys(extra).map((k) => `${k} = ?`)];
  const n = await run(
    `UPDATE missions SET ${sets.join(", ")} WHERE id = ? AND status IN (${from.map(() => "?").join(",")})`,
    [to, now(), ...Object.values(extra), id, ...from],
  );
  if (n !== 1) throw new MissionError("Cette action n'est plus possible : la mission a changé de statut.");
}

async function systemMessage(missionId: string, userId: string, body: string) {
  await run("INSERT INTO messages (id, mission_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?)", [newId(), missionId, userId, body, now()]);
}

/** Returns a Stripe Checkout URL, or null when the payment was simulated (demo mode). */
export async function startPayment(m: Mission, u: User): Promise<string | null> {
  if (m.client_id !== u.id || m.status !== "awaiting_payment") throw new MissionError("Paiement impossible pour cette mission.");
  if (!stripeEnabled()) {
    await transition(m.id, ["awaiting_payment"], "paid", { stripe_payment_intent: "demo" });
    await systemMessage(m.id, u.id, "Paiement simulé (mode démo). La mission attend l'acceptation de l'expert.");
    return null;
  }
  const s = await createCheckout({ missionId: m.id, title: m.title, amountCents: m.amount_cents, email: u.email });
  await run("UPDATE missions SET stripe_session_id = ?, updated_at = ? WHERE id = ?", [s.id, now(), m.id]);
  return s.url;
}

/** Called by the Stripe webhook once Checkout has captured the money. */
export async function markPaidFromStripe(missionId: string, paymentIntent: string) {
  const m = await getMission(missionId);
  if (!m || m.status !== "awaiting_payment") return;
  await transition(missionId, ["awaiting_payment"], "paid", { stripe_payment_intent: paymentIntent });
  await systemMessage(missionId, m.client_id, "Paiement reçu. L'argent est bloqué en sécurité jusqu'à la validation de la mission.");
}

export async function expertRespond(m: Mission, u: User, accept: boolean) {
  if (m.expert_id !== u.id) throw new MissionError("Action réservée à l'expert de la mission.");
  if (accept) {
    await transition(m.id, ["paid"], "in_progress");
    await systemMessage(m.id, u.id, "L'expert a accepté la mission et commence l'installation.");
  } else {
    await refundMission(m, "L'expert a décliné la mission. Le client est remboursé.", u.id, ["paid"]);
  }
}

export async function deliver(m: Mission, u: User, note: string) {
  if (m.expert_id !== u.id) throw new MissionError("Action réservée à l'expert de la mission.");
  await transition(m.id, ["in_progress"], "delivered");
  await systemMessage(m.id, u.id, "Livraison : " + (note.trim() || "la solution est installée et prête à être testée."));
}

export async function validate(m: Mission, u: User) {
  if (m.client_id !== u.id) throw new MissionError("Action réservée au client de la mission.");
  await releaseToExpert(m, u.id, ["delivered"], "Mission validée par le client. L'expert est payé.");
}

export async function openDispute(m: Mission, u: User, reason: string) {
  if (m.client_id !== u.id && m.expert_id !== u.id) throw new MissionError("Action réservée aux participants.");
  if (reason.trim().length < 10) throw new MissionError("Expliquez le problème en quelques mots (10 caractères minimum).");
  await transition(m.id, ["paid", "in_progress", "delivered"], "disputed");
  await systemMessage(m.id, u.id, "Litige ouvert : " + reason.trim().slice(0, 1000));
}

export async function cancelUnpaid(m: Mission, u: User) {
  if (m.client_id !== u.id) throw new MissionError("Action réservée au client.");
  await transition(m.id, ["awaiting_payment"], "cancelled");
}

export async function adminResolve(m: Mission, admin: User, decision: "release" | "refund") {
  if (!admin.is_admin) throw new MissionError("Action réservée à l'administration.");
  if (decision === "release") await releaseToExpert(m, admin.id, ["disputed"], "Litige résolu par délègue. : l'expert est payé.");
  else await refundMission(m, "Litige résolu par délègue. : le client est remboursé.", admin.id, ["disputed"]);
}

async function releaseToExpert(m: Mission, actorId: string, from: MissionStatus[], msg: string) {
  const payout = m.amount_cents - m.commission_cents;
  let transferId = "demo";
  if (stripeEnabled() && m.stripe_payment_intent && m.stripe_payment_intent !== "demo") {
    const ex = await one<{ stripe_account_id: string | null; payouts_enabled: number }>("SELECT stripe_account_id, payouts_enabled FROM experts WHERE user_id = ?", [m.expert_id]);
    if (!ex?.stripe_account_id || !ex.payouts_enabled) {
      // Money stays on the platform until the expert finishes Stripe onboarding.
      await transition(m.id, from, "completed", { stripe_transfer_id: null });
      await systemMessage(m.id, actorId, msg + " Le versement sera effectué dès que l'expert aura activé ses paiements.");
      return;
    }
    transferId = await releaseFunds({ missionId: m.id, paymentIntentId: m.stripe_payment_intent, destination: ex.stripe_account_id, amountCents: payout });
  }
  await transition(m.id, from, "completed", { stripe_transfer_id: transferId });
  await systemMessage(m.id, actorId, msg);
}

async function refundMission(m: Mission, msg: string, actorId: string, from: MissionStatus[]) {
  let refundId = "demo";
  if (stripeEnabled() && m.stripe_payment_intent && m.stripe_payment_intent !== "demo") refundId = await refund(m.stripe_payment_intent);
  await transition(m.id, from, "refunded", { stripe_refund_id: refundId });
  await systemMessage(m.id, actorId, msg);
}

/** Pays out completed missions that were waiting for the expert's Stripe onboarding. */
export async function payPendingTransfers(expertId: string) {
  if (!stripeEnabled()) return;
  const ex = await one<{ stripe_account_id: string | null; payouts_enabled: number }>("SELECT stripe_account_id, payouts_enabled FROM experts WHERE user_id = ?", [expertId]);
  if (!ex?.stripe_account_id || !ex.payouts_enabled) return;
  const pending = await query<Mission>("SELECT * FROM missions WHERE expert_id = ? AND status = 'completed' AND stripe_transfer_id IS NULL AND stripe_payment_intent IS NOT NULL AND stripe_payment_intent != 'demo'", [expertId]);
  for (const m of pending) {
    const id = await releaseFunds({ missionId: m.id, paymentIntentId: m.stripe_payment_intent!, destination: ex.stripe_account_id, amountCents: m.amount_cents - m.commission_cents });
    await run("UPDATE missions SET stripe_transfer_id = ?, updated_at = ? WHERE id = ? AND stripe_transfer_id IS NULL", [id, now(), m.id]);
  }
}

export async function listMessages(missionId: string) {
  return query<{ id: string; user_id: string; name: string; body: string; created_at: number }>(
    "SELECT msg.id, msg.user_id, u.name, msg.body, msg.created_at FROM messages msg JOIN users u ON u.id = msg.user_id WHERE msg.mission_id = ? ORDER BY msg.created_at ASC",
    [missionId],
  );
}

export async function postMessage(m: Mission, u: User, body: string) {
  if (!canSee(m, u)) throw new MissionError("Accès refusé.");
  const text = body.trim();
  if (!text) return;
  await systemMessage(m.id, u.id, text.slice(0, 4000));
}
