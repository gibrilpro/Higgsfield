"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUser, currentUser, endSession, requireAdmin, requireUser, safeNext, startSession, verifyLogin } from "@/lib/auth";
import { CATEGORIES } from "@/lib/catalog";
import { one } from "@/lib/db";
import { createDiagnostic } from "@/lib/diagnostic";
import { getExpert, setExpertStatus, upsertExpertProfile } from "@/lib/experts";
import {
  adminResolve, cancelUnpaid, canSee, createMission, deliver, expertRespond, getMission,
  leaveReview, MissionError, openDispute, payPendingTransfers, postMessage, startPayment, validate,
} from "@/lib/missions";
import { accountPayoutsEnabled, createConnectAccount, onboardingLink, stripeEnabled } from "@/lib/payments";
import { run } from "@/lib/db";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const back = (path: string, msg: string) => redirect(`${path}${path.includes("?") ? "&" : "?"}erreur=${encodeURIComponent(msg)}`);

// ---------- diagnostic ----------
export async function diagnoseAction(fd: FormData) {
  const text = str(fd, "besoin").slice(0, 1500);
  if (text.length < 10) back("/", "Décrivez votre tâche en une phrase (10 caractères minimum).");
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const user = await currentUser();
  const id = await createDiagnostic(text, ip, user?.id ?? null);
  redirect(`/diagnostic/${id}`);
}

// ---------- comptes ----------
const SignupSchema = z.object({
  name: z.string().min(2, "Indiquez votre nom.").max(60),
  email: z.string().email("Adresse e-mail invalide.").max(200),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères.").max(200),
  role: z.enum(["client", "expert"]),
});

export async function signupAction(fd: FormData) {
  const parsed = SignupSchema.safeParse({ name: str(fd, "name"), email: str(fd, "email").toLowerCase(), password: String(fd.get("password") ?? ""), role: str(fd, "role") });
  const next = safeNext(fd.get("suite"), "");
  const self = `/inscription?role=${encodeURIComponent(str(fd, "role") || "client")}${next ? `&suite=${encodeURIComponent(next)}` : ""}`;
  if (!parsed.success) back(self, parsed.error.issues[0].message);
  const { name, email, password, role } = parsed.data!;
  if (await one("SELECT id FROM users WHERE email = ?", [email])) back(self, "Un compte existe déjà avec cette adresse. Connectez-vous.");
  if (!fd.get("cgu")) back(self, "Vous devez accepter les conditions générales d'utilisation.");
  const id = await createUser(email, password, name, role);
  await startSession(id);
  redirect(role === "expert" ? "/expert/profil" : next || "/missions");
}

export async function loginAction(fd: FormData) {
  const email = str(fd, "email").toLowerCase();
  const next = safeNext(fd.get("suite"));
  const id = await verifyLogin(email, String(fd.get("password") ?? ""));
  if (!id) back(`/connexion?suite=${encodeURIComponent(next)}`, "E-mail ou mot de passe incorrect.");
  await startSession(id!);
  redirect(next);
}

export async function logoutAction() {
  await endSession();
  redirect("/");
}

// ---------- experts ----------
const ProfileSchema = z.object({
  title: z.string().min(5, "Décrivez votre spécialité (5 caractères minimum).").max(90),
  city: z.string().min(2, "Indiquez votre ville.").max(60),
  bio: z.string().min(30, "Présentez-vous en quelques phrases (30 caractères minimum).").max(1500),
  rate: z.coerce.number().int().min(15, "Tarif horaire minimum : 15 €.").max(500),
  tools: z.array(z.string().min(1).max(30)).max(8),
  skills: z.array(z.enum(CATEGORIES)).min(1, "Choisissez au moins une catégorie."),
});

export async function saveExpertProfileAction(fd: FormData) {
  const u = await requireUser("/expert/profil");
  if (u.role !== "expert") back("/expert/profil", "Ce compte est un compte entreprise.");
  const parsed = ProfileSchema.safeParse({
    title: str(fd, "title"), city: str(fd, "city"), bio: str(fd, "bio"), rate: str(fd, "rate"),
    tools: str(fd, "tools").split(",").map((s) => s.trim()).filter(Boolean),
    skills: fd.getAll("skills").map(String),
  });
  if (!parsed.success) back("/expert/profil", parsed.error.issues[0].message);
  await upsertExpertProfile(u.id, parsed.data!);
  revalidatePath("/experts");
  redirect("/expert/profil?ok=1");
}

export async function stripeConnectAction() {
  const u = await requireUser("/expert/paiements");
  const ex = await getExpert(u.id);
  if (!ex) back("/expert/paiements", "Complétez d'abord votre profil d'expert.");
  if (!stripeEnabled()) back("/expert/paiements", "Les paiements ne sont pas encore activés sur la plateforme (mode démo).");
  let account = ex!.stripe_account_id;
  if (!account) {
    account = await createConnectAccount(u.email);
    await run("UPDATE experts SET stripe_account_id = ? WHERE user_id = ?", [account, u.id]);
  }
  redirect(await onboardingLink(account));
}

export async function refreshPayoutsAction() {
  const u = await requireUser("/expert/paiements");
  const ex = await getExpert(u.id);
  if (ex?.stripe_account_id && stripeEnabled()) {
    const enabled = await accountPayoutsEnabled(ex.stripe_account_id);
    await run("UPDATE experts SET payouts_enabled = ? WHERE user_id = ?", [enabled ? 1 : 0, u.id]);
    if (enabled) await payPendingTransfers(u.id);
  }
  redirect("/expert/paiements");
}

// ---------- missions ----------
const MissionSchema = z.object({
  expertId: z.string().uuid("Choisissez un expert."),
  title: z.string().min(3).max(120),
  category: z.enum(CATEGORIES),
  brief: z.string().min(20, "Donnez quelques précisions à l'expert (20 caractères minimum).").max(4000),
  amountEur: z.coerce.number().min(50).max(20000),
  diagnosticId: z.string().uuid().nullable(),
  solutionId: z.string().max(60).nullable(),
});

export async function createMissionAction(fd: FormData) {
  const u = await requireUser("/missions/nouvelle");
  const returnTo = safeNext(fd.get("retour"), "/missions/nouvelle");
  const parsed = MissionSchema.safeParse({
    expertId: str(fd, "expertId"), title: str(fd, "title"), category: str(fd, "category"), brief: str(fd, "brief"),
    amountEur: str(fd, "amount"), diagnosticId: str(fd, "diagnosticId") || null, solutionId: str(fd, "solutionId") || null,
  });
  if (!parsed.success) back(returnTo, parsed.error.issues[0].message);
  let id = "";
  try {
    id = await createMission(u, parsed.data!);
  } catch (e) {
    if (e instanceof MissionError) back(returnTo, e.message);
    throw e;
  }
  redirect(`/missions/${id}`);
}

async function loadMission(id: string) {
  const u = await requireUser(`/missions/${id}`);
  const m = await getMission(id);
  if (!m || !canSee(m, u)) redirect("/missions");
  return { u, m: m! };
}

export async function missionAction(fd: FormData) {
  const id = str(fd, "id");
  const op = str(fd, "op");
  const { u, m } = await loadMission(id);
  let checkoutUrl: string | null = null;
  try {
    switch (op) {
      case "pay": checkoutUrl = await startPayment(m, u); break;
      case "accept": await expertRespond(m, u, true); break;
      case "decline": await expertRespond(m, u, false); break;
      case "deliver": await deliver(m, u, str(fd, "note")); break;
      case "validate": await validate(m, u); break;
      case "dispute": await openDispute(m, u, str(fd, "reason")); break;
      case "cancel": await cancelUnpaid(m, u); break;
      case "release": await adminResolve(m, u, "release"); break;
      case "refund": await adminResolve(m, u, "refund"); break;
      case "message": await postMessage(m, u, str(fd, "body")); break;
      case "review": await leaveReview(m, u, Number(str(fd, "rating")), str(fd, "comment")); break;
      default: throw new MissionError("Action inconnue.");
    }
  } catch (e) {
    if (e instanceof MissionError) back(`/missions/${id}`, e.message);
    throw e;
  }
  if (checkoutUrl) redirect(checkoutUrl);
  revalidatePath(`/missions/${id}`);
  redirect(`/missions/${id}`);
}

// ---------- administration ----------
export async function adminExpertAction(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  if (status !== "approved" && status !== "rejected" && status !== "pending") back("/admin", "Statut invalide.");
  await setExpertStatus(str(fd, "userId"), status as "approved" | "rejected" | "pending");
  revalidatePath("/experts");
  redirect("/admin");
}
