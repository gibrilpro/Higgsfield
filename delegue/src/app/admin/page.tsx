import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listExpertsByStatus } from "@/lib/experts";
import { query } from "@/lib/db";
import { eur } from "@/lib/catalog";
import { STATUS_LABEL, type Mission } from "@/lib/missions";
import { adminExpertAction } from "../actions";
import { PageHead } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Administration", robots: { index: false } };

export default async function Admin() {
  await requireAdmin();
  const [pending, approved] = await Promise.all([listExpertsByStatus("pending"), listExpertsByStatus("approved")]);
  const disputes = await query<Mission>("SELECT * FROM missions WHERE status = 'disputed' ORDER BY updated_at ASC");
  const stats = await query<{ status: string; n: number; total: number; fees: number }>("SELECT status, COUNT(*) AS n, SUM(amount_cents) AS total, SUM(commission_cents) AS fees FROM missions GROUP BY status");
  const revenue = stats.filter((s) => s.status === "completed").reduce((a, s) => a + Number(s.fees), 0);
  const users = await query<{ role: string; n: number }>("SELECT role, COUNT(*) AS n FROM users GROUP BY role");
  const count = (r: string) => Number(users.find((x) => x.role === r)?.n ?? 0);
  return (
    <>
      <PageHead eyebrow="Administration" title="Tableau de bord" />
      <div className="big" style={{ marginBottom: 20 }}>
        <div><b>{count("client")}</b><span>entreprises inscrites</span></div>
        <div><b>{approved.length} / {count("expert")}</b><span>experts validés / inscrits</span></div>
        <div><b>{eur(revenue)}</b><span>commissions encaissées</span></div>
      </div>
      <section className="panel" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>Experts à vérifier ({pending.length})</h2>
        {pending.length ? pending.map((e) => (
          <div key={e.user_id} className="card">
            <div className="row"><div><b>{e.name}</b> · {e.title} · {e.city} · {e.rate} €/h</div></div>
            <p className="desc" style={{ whiteSpace: "pre-wrap" }}>{e.bio}</p>
            <div className="tools">{e.skills.map((s) => <span className="cat" key={s}>{s}</span>)}{e.tools.map((t) => <span className="tool" key={t}>{t}</span>)}</div>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              <form action={adminExpertAction}><input type="hidden" name="userId" value={e.user_id} /><input type="hidden" name="status" value="approved" /><SubmitButton className="btn sm accent">Valider</SubmitButton></form>
              <form action={adminExpertAction}><input type="hidden" name="userId" value={e.user_id} /><input type="hidden" name="status" value="rejected" /><SubmitButton className="btn sm danger">Refuser</SubmitButton></form>
            </div>
          </div>
        )) : <p className="tiny">Aucun profil en attente.</p>}
        <p className="note">Avant de valider : entretien vidéo, exemple de réalisation, vérification du SIRET.</p>
      </section>
      <section className="panel" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>Litiges ({disputes.length})</h2>
        {disputes.length ? disputes.map((m) => <Link key={m.id} href={`/missions/${m.id}`} className="row card" style={{ textDecoration: "none" }}><span>{m.title}</span><span className="mono">{eur(m.amount_cents)}</span></Link>) : <p className="tiny">Aucun litige.</p>}
      </section>
      <section className="panel">
        <h2 style={{ fontSize: 20 }}>Missions par statut</h2>
        <div className="tablewrap"><table className="adm"><thead><tr><th>Statut</th><th>Nombre</th><th>Montant</th></tr></thead><tbody>
          {stats.map((s) => <tr key={s.status}><td>{STATUS_LABEL[s.status as keyof typeof STATUS_LABEL] ?? s.status}</td><td className="mono">{s.n}</td><td className="mono">{eur(Number(s.total))}</td></tr>)}
        </tbody></table></div>
      </section>
    </>
  );
}
