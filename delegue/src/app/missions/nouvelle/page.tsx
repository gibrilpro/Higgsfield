import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { getDiagnostic } from "@/lib/diagnostic";
import { getExpert, listApprovedExperts } from "@/lib/experts";
import { CATEGORIES, COMMISSION_RATE } from "@/lib/catalog";
import { createMissionAction } from "../../actions";
import { Flash, PageHead } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Nouvelle mission" };

export default async function NewMission({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => k !== "erreur" && typeof v === "string") as [string, string][]).toString();
  const self = `/missions/nouvelle${qs ? `?${qs}` : ""}`;
  const u = await requireUser(self);
  if (u.role !== "client") {
    return <div className="empty" style={{ marginTop: 40 }}><p>Les missions se commandent depuis un compte entreprise.</p><Link className="btn" href="/missions">Retour à mes missions</Link></div>;
  }
  const diag = sp.diagnostic ? await getDiagnostic(sp.diagnostic) : null;
  const sol = sp.solution ? await one<{ id: string; title: string; category: string; price: number; description: string }>("SELECT id, title, category, price, description FROM solutions WHERE id = ? AND active = 1", [sp.solution]) : null;
  const preset = sp.expert ? await getExpert(sp.expert) : null;
  const category = (diag?.result.categorie ?? sol?.category ?? preset?.skills[0] ?? CATEGORIES[0]) as string;
  const all = await listApprovedExperts();
  const experts = [...all.filter((e) => e.skills.includes(category)), ...all.filter((e) => !e.skills.includes(category))];
  const title = diag?.result.titre ?? sol?.title ?? "";
  const amount = diag ? Math.round((diag.result.prix_min + diag.result.prix_max) / 2) : sol?.price ?? (preset ? preset.rate * 8 : 400);
  const brief = diag ? `${diag.request}\n\nSolution proposée : ${diag.result.resume}` : sol ? `${sol.description}\n\nMon activité : ` : "";

  return (
    <>
      <PageHead eyebrow="Nouvelle mission" title={title || "Décrivez votre mission"}>Vérifiez les détails, choisissez votre expert, puis payez en sécurité. L&apos;expert n&apos;est payé qu&apos;à votre validation.</PageHead>
      <div className="panel" style={{ maxWidth: 820 }}>
        <Flash sp={sp} />
        {experts.length === 0 ? (
          <div className="empty"><p>Aucun expert n&apos;est encore validé sur la plateforme. Revenez très bientôt : vos informations ne sont pas perdues, votre diagnostic reste accessible.</p></div>
        ) : (
          <form className="grid2" action={createMissionAction}>
            <input type="hidden" name="retour" value={self} />
            <input type="hidden" name="diagnosticId" value={diag?.id ?? ""} />
            <input type="hidden" name="solutionId" value={sol?.id ?? ""} />
            <div className="f full"><label htmlFor="title">Titre de la mission</label><input id="title" name="title" required minLength={3} maxLength={120} defaultValue={title} /></div>
            <div className="f"><label htmlFor="category">Catégorie</label><select id="category" name="category" defaultValue={category}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="f"><label htmlFor="amount">Montant (€)</label><input id="amount" name="amount" type="number" min={50} max={20000} step={1} required defaultValue={amount} /><span className="tiny">L&apos;expert reçoit {Math.round((1 - COMMISSION_RATE) * 100)} %, la plateforme garde {Math.round(COMMISSION_RATE * 100)} %.</span></div>
            <div className="f full"><label htmlFor="expertId">Expert</label>
              <select id="expertId" name="expertId" required defaultValue={preset?.status === "approved" ? preset.user_id : experts[0]?.user_id}>
                {experts.map((e) => <option key={e.user_id} value={e.user_id}>{e.name} · {e.title} · {e.rate} €/h{e.skills.includes(category) ? " · recommandé" : ""}</option>)}
              </select>
            </div>
            <div className="f full"><label htmlFor="brief">Précisions pour l&apos;expert</label><textarea id="brief" name="brief" required minLength={20} maxLength={4000} defaultValue={brief} rows={7} /><span className="tiny">Votre activité, les outils que vous utilisez déjà, ce que vous attendez.</span></div>
            <p className="note f full">À l&apos;étape suivante, vous payez le montant. Il reste bloqué jusqu&apos;à ce que vous validiez la solution installée. Si l&apos;expert refuse la mission, vous êtes remboursé.</p>
            <div className="f full"><SubmitButton className="btn accent" pending="Création…">Continuer vers le paiement</SubmitButton></div>
          </form>
        )}
      </div>
    </>
  );
}
