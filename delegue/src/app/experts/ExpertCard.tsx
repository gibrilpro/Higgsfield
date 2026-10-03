import Link from "next/link";
import { Avatar, Icon } from "@/components/ui";
import type { Expert } from "@/lib/experts";

export function ExpertCard({ e }: { e: Expert }) {
  return (
    <article className="card">
      <div className="who">
        <Avatar id={e.user_id} name={e.name} />
        <div style={{ minWidth: 0 }}><h3>{e.name}</h3><div className="tiny">{e.title} · {e.city}</div></div>
      </div>
      <div className="row">
        <span className="verified"><Icon name="check" size={14} />Vérifié</span>
        <span className="tiny mono">{e.rating ? `★ ${e.rating.toFixed(1)} (${e.reviews_count} avis)` : "Nouveau"} · {e.missions_done} mission{e.missions_done > 1 ? "s" : ""}</span>
      </div>
      <div className="tools">{e.tools.map((t) => <span className="tool" key={t}>{t}</span>)}</div>
      <div className="row">
        <div className="price">{e.rate} €<small> / heure</small></div>
        <Link className="btn sm" href={`/experts/${e.user_id}`}>Voir le profil</Link>
      </div>
    </article>
  );
}
