import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listMissionsFor, STATUS_LABEL } from "@/lib/missions";
import { statusClass } from "@/components/status";
import { eur } from "@/lib/catalog";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Mes missions" };

export default async function Missions() {
  const u = await requireUser("/missions");
  const missions = await listMissionsFor(u);
  const held = missions.filter((m) => ["paid", "in_progress", "delivered", "disputed"].includes(m.status)).reduce((a, m) => a + m.amount_cents, 0);
  return (
    <>
      <PageHead eyebrow={u.role === "expert" ? "Espace expert" : "Espace entreprise"} title="Mes missions">
        {u.role === "expert" ? "Les missions que des entreprises vous ont confiées." : "Suivez chaque installation, du paiement jusqu'à la validation."}
      </PageHead>
      {missions.length ? (
        <>
          <div className="big" style={{ marginBottom: 16 }}>
            <div><b>{missions.length}</b><span>missions</span></div>
            <div><b>{missions.filter((m) => m.status === "completed").length}</b><span>terminées</span></div>
            <div><b>{eur(held)}</b><span>bloqués en sécurité</span></div>
          </div>
          <div className="list">
            {missions.map((m) => (
              <Link key={m.id} href={`/missions/${m.id}`} className="card" style={{ textDecoration: "none" }}>
                <div className="row">
                  <div style={{ minWidth: 0 }}><h3>{m.title}</h3><div className="tiny">{u.id === m.client_id ? `avec ${m.expert_name}` : `pour ${m.client_name}`} · {m.category}</div></div>
                  <span className={`status ${statusClass(m.status)}`}>{STATUS_LABEL[m.status]}</span>
                </div>
                <div className="price">{eur(m.amount_cents)}</div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="empty">
          <p>Aucune mission pour l&apos;instant.</p>
          {u.role === "client" ? <Link className="btn accent" href="/">Faire mon diagnostic gratuit</Link> : <Link className="btn" href="/expert/profil">Compléter mon profil</Link>}
        </div>
      )}
    </>
  );
}
