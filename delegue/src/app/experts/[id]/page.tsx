import Link from "next/link";
import { notFound } from "next/navigation";
import { getExpert, listReviews } from "@/lib/experts";
import { Avatar, Icon } from "@/components/ui";

export default async function ExpertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getExpert(id);
  if (!e || e.status !== "approved") notFound();
  const reviews = await listReviews(e.user_id);
  return (
    <div className="split" style={{ paddingTop: 36 }}>
      <div className="panel">
        <div className="who"><Avatar id={e.user_id} name={e.name} /><div><h1 style={{ fontSize: 30 }}>{e.name}</h1><div className="tiny">{e.title} · {e.city}</div></div></div>
        <span className="verified"><Icon name="check" size={14} />Expert vérifié par délègue.</span>
        <p style={{ whiteSpace: "pre-wrap" }}>{e.bio}</p>
        <div><div className="label">Spécialités</div><div className="tools" style={{ marginTop: 6 }}>{e.skills.map((s) => <span className="cat" key={s}>{s}</span>)}</div></div>
        <div><div className="label">Outils</div><div className="tools" style={{ marginTop: 6 }}>{e.tools.map((t) => <span className="tool" key={t}>{t}</span>)}</div></div>
        <div>
          <div className="label">Avis clients {e.rating ? `· ★ ${e.rating.toFixed(1)} sur 5` : ""}</div>
          {reviews.length ? <div className="list" style={{ marginTop: 8 }}>{reviews.map((r, i) => (
            <div key={i} className="msg"><div className="meta">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} · {r.client_name} · {new Date(r.created_at).toLocaleDateString("fr-FR")}</div>{r.comment ? <p>{r.comment}</p> : null}</div>
          ))}</div> : <p className="tiny" style={{ marginTop: 6 }}>Pas encore d&apos;avis : cet expert vient de rejoindre délègue.</p>}
        </div>
      </div>
      <aside className="panel">
        <div className="big" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div><b>{e.rate} €</b><span>par heure</span></div>
          <div><b>{e.rating ? `★ ${e.rating.toFixed(1)}` : e.missions_done}</b><span>{e.rating ? `${e.reviews_count} avis` : "missions terminées"}</span></div>
        </div>
        <Link className="btn accent" href={`/missions/nouvelle?expert=${e.user_id}`}>Proposer une mission</Link>
        <p className="note">Votre paiement reste bloqué jusqu&apos;à ce que vous validiez le travail.</p>
      </aside>
    </div>
  );
}
