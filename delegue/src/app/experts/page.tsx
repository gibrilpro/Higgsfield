import Link from "next/link";
import { listApprovedExperts } from "@/lib/experts";
import { CATEGORIES } from "@/lib/catalog";
import { PageHead } from "@/components/ui";
import { ExpertCard } from "./ExpertCard";

export const metadata = { title: "Experts IA vérifiés" };
export const dynamic = "force-dynamic";

export default async function Experts({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const active = CATEGORIES.find((c) => c === cat);
  const experts = await listApprovedExperts(active);
  return (
    <>
      <PageHead eyebrow="Experts" title="Des experts IA vérifiés">Ils installent les automatisations et vous apprennent à les utiliser.</PageHead>
      <nav className="filters" aria-label="Spécialités">
        <Link className="chip" href="/experts" aria-current={!active}>Tous</Link>
        {CATEGORIES.map((c) => <Link key={c} className="chip" href={`/experts?cat=${encodeURIComponent(c)}`} aria-current={active === c}>{c}</Link>)}
      </nav>
      {experts.length ? <div className="grid">{experts.map((e) => <ExpertCard key={e.user_id} e={e} />)}</div> : (
        <div className="empty"><p>Aucun expert validé {active ? "dans cette spécialité " : ""}pour l&apos;instant.</p><Link className="btn" href="/inscription?role=expert">Devenir expert</Link></div>
      )}
    </>
  );
}
