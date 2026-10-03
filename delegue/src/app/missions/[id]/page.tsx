import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AUTO_VALIDATE_DAYS, autoValidateDue, canSee, getMission, getReview, listMessages, STATUS_LABEL, TRACK } from "@/lib/missions";
import { eur } from "@/lib/catalog";
import { missionAction } from "../../actions";
import { Flash } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { statusClass } from "@/components/status";
import { stripeEnabled } from "@/lib/payments";

export const metadata = { title: "Mission", robots: { index: false } };

const fmt = (t: number) => new Date(t).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });

function Op({ id, op, label, cls = "btn primary", pending, children }: { id: string; op: string; label: string; cls?: string; pending?: string; children?: React.ReactNode }) {
  return (
    <form action={missionAction} className="stack">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      {children}
      <SubmitButton className={cls} pending={pending ?? "…"}>{label}</SubmitButton>
    </form>
  );
}

export default async function MissionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const u = await requireUser(`/missions/${id}`);
  await autoValidateDue();
  const m = await getMission(id);
  if (!m || !canSee(m, u)) redirect("/missions");
  const msgs = await listMessages(m.id);
  const review = m.status === "completed" ? await getReview(m.id) : null;
  const isClient = m.client_id === u.id;
  const isExpert = m.expert_id === u.id;
  const step = TRACK.indexOf(m.status);
  const payout = m.amount_cents - m.commission_cents;

  return (
    <div style={{ paddingTop: 32 }}>
      <div className="row" style={{ marginBottom: 16 }}>
        <div><div className="eyebrow">Mission · {m.category}</div><h1 style={{ fontSize: "clamp(26px,4vw,38px)", marginTop: 6 }}>{m.title}</h1>
          <p className="tiny" style={{ marginTop: 6 }}>Client : {m.client_name} · Expert : {m.expert_name}</p></div>
        <span className={`status ${statusClass(m.status)}`}>{STATUS_LABEL[m.status]}</span>
      </div>
      <Flash sp={sp} />
      {sp.paiement === "ok" && m.status === "awaiting_payment" ? <p className="alert ok">Paiement en cours de confirmation. Actualisez la page dans quelques secondes.</p> : null}
      <div className="split" style={{ marginTop: 12 }}>
        <div className="list">
          <section className="panel">
            {step >= 0 ? <div className="track">{["Payée", "Installation", "Livrée", "Validée"].map((s, i) => <div key={s} className={i <= step ? "on" : ""}>{s}</div>)}</div> : null}
            <div className="money">
              <div><span>Montant</span><b>{eur(m.amount_cents)}</b></div>
              <div><span>Part de l&apos;expert</span><b>{eur(payout)}</b></div>
              <div><span>Commission</span><b>{eur(m.commission_cents)}</b></div>
            </div>
            <div><div className="label">Précisions</div><p style={{ whiteSpace: "pre-wrap", marginTop: 6 }} className="desc">{m.brief}</p></div>
          </section>

          <section className="panel" aria-labelledby="fil">
            <h2 id="fil" style={{ fontSize: 18 }}>Échanges</h2>
            <div className="msgs">
              {msgs.length ? msgs.map((x) => (
                <div key={x.id} className={`msg${x.user_id === u.id ? " me" : ""}`}><div className="meta">{x.name} · {fmt(x.created_at)}</div><p>{x.body}</p></div>
              )) : <p className="tiny">Aucun message. Posez vos questions ici : tout reste écrit, en cas de besoin.</p>}
            </div>
            {!["cancelled", "refunded"].includes(m.status) ? (
              <form action={missionAction} className="stack">
                <input type="hidden" name="id" value={m.id} /><input type="hidden" name="op" value="message" />
                <label className="label" htmlFor="body">Votre message</label>
                <textarea id="body" name="body" required maxLength={4000} rows={3} />
                <div><SubmitButton className="btn" pending="Envoi…">Envoyer</SubmitButton></div>
              </form>
            ) : null}
          </section>
        </div>

        <aside className="panel">
          <h2 style={{ fontSize: 18 }}>Prochaine étape</h2>
          {m.status === "awaiting_payment" && isClient ? (<>
            <p className="desc">Payez pour lancer la mission. L&apos;argent reste bloqué jusqu&apos;à votre validation.</p>
            <Op id={m.id} op="pay" label={stripeEnabled() ? `Payer ${eur(m.amount_cents)}` : `Payer ${eur(m.amount_cents)} (démo)`} cls="btn accent" pending="Redirection…" />
            <Op id={m.id} op="cancel" label="Annuler la mission" cls="btn ghost" />
          </>) : null}
          {m.status === "awaiting_payment" && !isClient ? <p className="desc">En attente du paiement du client.</p> : null}
          {m.status === "paid" && isExpert ? (<>
            <p className="desc">Le client a payé. Acceptez la mission pour commencer, ou déclinez-la (le client sera remboursé).</p>
            <Op id={m.id} op="accept" label="Accepter la mission" cls="btn accent" />
            <Op id={m.id} op="decline" label="Décliner" cls="btn danger" />
          </>) : null}
          {m.status === "paid" && isClient ? <p className="desc">Paiement reçu. L&apos;expert doit accepter la mission.</p> : null}
          {m.status === "in_progress" && isExpert ? (
            <Op id={m.id} op="deliver" label="Marquer comme livrée" cls="btn accent">
              <label className="label" htmlFor="note">Note de livraison</label>
              <textarea id="note" name="note" rows={3} maxLength={2000} placeholder="Ce qui a été installé, comment l'utiliser, accès transmis…" />
            </Op>
          ) : null}
          {m.status === "in_progress" && isClient ? <p className="desc">L&apos;expert installe la solution. Échangez avec lui dans le fil de discussion.</p> : null}
          {m.status === "delivered" && isClient ? (<>
            <p className="desc">Testez la solution. Si tout fonctionne, validez : l&apos;expert sera payé. Si quelque chose ne va pas, demandez une correction dans les échanges.</p>
            <p className="tiny">Sans réponse de votre part {AUTO_VALIDATE_DAYS} jours après la livraison, la mission est validée automatiquement.</p>
            <Op id={m.id} op="validate" label="Valider et payer l'expert" cls="btn accent" />
          </>) : null}
          {m.status === "delivered" && isExpert ? <p className="desc">En attente de la validation du client (validation automatique après {AUTO_VALIDATE_DAYS} jours sans réponse).</p> : null}
          {m.status === "completed" ? <p className="desc">Mission terminée{isExpert ? (m.stripe_transfer_id ? ". Votre part a été versée." : ". Votre part sera versée dès que vos paiements seront activés.") : ". Merci !"}</p> : null}
          {m.status === "completed" && review ? (
            <div className="note"><b>Avis du client : {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</b>{review.comment ? <p style={{ marginTop: 4 }}>{review.comment}</p> : null}</div>
          ) : null}
          {m.status === "completed" && isClient && !review ? (
            <Op id={m.id} op="review" label="Publier mon avis" cls="btn accent" pending="Envoi…">
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="label" style={{ marginBottom: 6 }}>Notez l&apos;expert</legend>
                <div className="checks">{[5, 4, 3, 2, 1].map((n) => <label key={n}><input type="radio" name="rating" value={n} required defaultChecked={n === 5} />{"★".repeat(n)}</label>)}</div>
              </fieldset>
              <label className="label" htmlFor="comment">Votre avis (facultatif)</label>
              <textarea id="comment" name="comment" rows={3} maxLength={1000} placeholder="Qualité du travail, délais, communication…" />
            </Op>
          ) : null}
          {m.status === "disputed" ? <p className="desc">Un litige est ouvert. L&apos;équipe délègue. examine les échanges et tranche.</p> : null}
          {m.status === "disputed" && u.is_admin ? (<>
            <Op id={m.id} op="release" label="Payer l'expert" cls="btn primary" />
            <Op id={m.id} op="refund" label="Rembourser le client" cls="btn danger" />
          </>) : null}
          {["paid", "in_progress", "delivered"].includes(m.status) && (isClient || isExpert) ? (
            <details>
              <summary className="tiny" style={{ cursor: "pointer" }}>Un problème avec cette mission ?</summary>
              <Op id={m.id} op="dispute" label="Ouvrir un litige" cls="btn danger">
                <label className="label" htmlFor="reason">Expliquez le problème</label>
                <textarea id="reason" name="reason" rows={3} minLength={10} maxLength={1000} required />
              </Op>
            </details>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
