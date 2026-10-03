import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getExpert } from "@/lib/experts";
import { CATEGORIES } from "@/lib/catalog";
import { saveExpertProfileAction } from "../../actions";
import { Flash, PageHead } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Mon profil expert" };

const STATUS = { pending: ["En cours de vérification", "s-wait"], approved: ["Profil validé et visible", "s-ok"], rejected: ["Profil refusé", "s-bad"] } as const;

export default async function ExpertProfile({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const u = await requireUser("/expert/profil");
  if (u.role !== "expert") return <div className="empty" style={{ marginTop: 40 }}><p>Cet espace est réservé aux experts.</p><Link className="btn" href="/missions">Mes missions</Link></div>;
  const e = await getExpert(u.id);
  return (
    <>
      <PageHead eyebrow="Espace expert" title="Mon profil expert">Les entreprises vous trouvent par spécialité. Votre profil est vérifié par notre équipe avant d&apos;être visible.</PageHead>
      <div className="panel" style={{ maxWidth: 820 }}>
        <div className="row">
          {e ? <span className={`status ${STATUS[e.status][1]}`}>{STATUS[e.status][0]}</span> : <span className="status s-wait">Profil à compléter</span>}
          <Link className="btn sm" href="/expert/paiements">Recevoir mes paiements</Link>
        </div>
        <Flash sp={sp} />
        <form className="grid2" action={saveExpertProfileAction}>
          <div className="f full"><label htmlFor="title">Votre spécialité en une phrase</label><input id="title" name="title" required minLength={5} maxLength={90} defaultValue={e?.title} placeholder="Ex. : automatisations pour restaurants et commerces" /></div>
          <div className="f"><label htmlFor="city">Ville</label><input id="city" name="city" required maxLength={60} defaultValue={e?.city} /></div>
          <div className="f"><label htmlFor="rate">Tarif horaire (€)</label><input id="rate" name="rate" type="number" min={15} max={500} required defaultValue={e?.rate ?? 50} /></div>
          <div className="f full"><label htmlFor="bio">Présentation</label><textarea id="bio" name="bio" required minLength={30} maxLength={1500} rows={5} defaultValue={e?.bio} placeholder="Votre parcours, des exemples d'automatisations installées, votre façon de travailler." /></div>
          <div className="f full"><label htmlFor="tools">Outils maîtrisés (séparés par des virgules)</label><input id="tools" name="tools" maxLength={300} defaultValue={e?.tools.join(", ")} placeholder="Make, n8n, Zapier, API Claude, ManyChat…" /></div>
          <fieldset className="f full" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="label" style={{ marginBottom: 6 }}>Catégories de missions</legend>
            <div className="checks">{CATEGORIES.map((c) => <label key={c}><input type="checkbox" name="skills" value={c} defaultChecked={e?.skills.includes(c)} />{c}</label>)}</div>
          </fieldset>
          <div className="f full"><SubmitButton pending="Enregistrement…">{e ? "Mettre à jour mon profil" : "Envoyer mon profil"}</SubmitButton></div>
        </form>
      </div>
    </>
  );
}
