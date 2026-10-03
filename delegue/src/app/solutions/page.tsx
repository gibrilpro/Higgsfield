import Link from "next/link";
import { query } from "@/lib/db";
import { CATEGORIES, eur } from "@/lib/catalog";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Solutions prêtes à installer" };
export const dynamic = "force-dynamic";

type S = { id: string; category: string; title: string; description: string; price: number; monthly: number; days: number; hours: number; tools: string };

export default async function Solutions({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const active = CATEGORIES.find((c) => c === cat);
  const rows = await query<S>(`SELECT * FROM solutions WHERE active = 1 ${active ? "AND category = ?" : ""} ORDER BY price ASC`, active ? [active] : []);
  return (
    <>
      <PageHead eyebrow="Catalogue" title="Solutions prêtes à installer">Des automatisations éprouvées, à prix indicatif connu. Un expert les adapte à votre entreprise.</PageHead>
      <nav className="filters" aria-label="Catégories">
        <Link className="chip" href="/solutions" aria-current={!active}>Toutes</Link>
        {CATEGORIES.map((c) => <Link key={c} className="chip" href={`/solutions?cat=${encodeURIComponent(c)}`} aria-current={active === c}>{c}</Link>)}
      </nav>
      <div className="grid">
        {rows.map((s) => (
          <article className="card" key={s.id}>
            <span className="cat">{s.category}</span>
            <h3>{s.title}</h3>
            <p className="desc">{s.description}</p>
            <div className="kpis"><span><b>~{s.hours} h</b>gagnées / sem.</span><span><b>{s.days} j</b>d&apos;installation</span></div>
            <div className="tools">{(JSON.parse(s.tools) as string[]).map((t) => <span className="tool" key={t}>{t}</span>)}</div>
            <div className="row">
              <div className="price">{eur(s.price * 100)}{s.monthly ? <small> + {s.monthly} €/mois</small> : <small> une fois</small>}</div>
              <Link className="btn sm primary" href={`/missions/nouvelle?solution=${s.id}`}>Commander</Link>
            </div>
          </article>
        ))}
      </div>
      <p className="tiny" style={{ marginTop: 16 }}>L&apos;abonnement mensuel éventuel (outils, maintenance) est convenu directement avec l&apos;expert.</p>
    </>
  );
}
