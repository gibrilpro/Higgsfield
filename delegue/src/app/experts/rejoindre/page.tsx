import Link from "next/link";
import { countApprovedExperts } from "@/lib/experts";
import { COMMISSION_RATE } from "@/lib/catalog";
import { Icon } from "@/components/ui";

export const metadata = {
  title: "Devenir expert",
  description: "Experts en automatisation et IA : recevez des missions de commerçants et d'indépendants, payées d'avance et versées à la validation.",
};
export const dynamic = "force-dynamic";

const FOUNDING_SPOTS = 20;

export default async function JoinExperts() {
  const approved = await countApprovedExperts();
  const left = Math.max(0, FOUNDING_SPOTS - approved);
  const keep = Math.round((1 - COMMISSION_RATE) * 100);
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Pour les freelances en automatisation & IA</div>
          <h1>Des clients qui savent déjà <em>ce qu&apos;ils veulent.</em></h1>
          <p className="lede">Sur délègue., chaque entreprise arrive avec un besoin clair, issu de son diagnostic : la solution, les outils, un budget indicatif. Vous installez, le client valide, vous êtes payé.</p>
          <div className="row" style={{ justifyContent: "flex-start", marginTop: 24 }}>
            <Link className="btn accent" href="/inscription?role=expert">Proposer mon profil</Link>
            <span className="tiny">{left > 0 ? `${left} place${left > 1 ? "s" : ""} sur ${FOUNDING_SPOTS} pour les experts fondateurs` : "Inscriptions ouvertes"}</span>
          </div>
        </div>
        <div className="panel">
          <div className="big" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div><b>{keep} %</b><span>du montant pour vous</span></div>
            <div><b>0 €</b><span>pour s&apos;inscrire</span></div>
          </div>
          <ul className="list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              "Le client paie avant que vous commenciez : l'argent est bloqué en sécurité.",
              "Vous êtes payé dès que le client valide, ou automatiquement 14 jours après la livraison s'il ne répond pas.",
              "En cas de désaccord, l'équipe délègue. tranche à partir des échanges écrits.",
              "Vos avis clients s'affichent sur votre profil et vous font remonter dans les recommandations.",
            ].map((t) => <li key={t} className="row" style={{ justifyContent: "flex-start", flexWrap: "nowrap", alignItems: "flex-start" }}><span style={{ color: "var(--ok)", marginTop: 3 }}><Icon name="check" /></span><span>{t}</span></li>)}
          </ul>
        </div>
      </section>
      <section className="block">
        <div className="sec-head"><div><h2>Comment rejoindre délègue.</h2><p>Nous vérifions chaque profil pour garantir la qualité aux clients.</p></div></div>
        <div className="steps3">
          {[
            ["1", "Créez votre profil", "Spécialité, outils maîtrisés, tarif, exemples de réalisations."],
            ["2", "Échange de validation", "Un court appel pour voir une automatisation que vous avez construite. Un statut d'indépendant (SIRET) est nécessaire."],
            ["3", "Recevez des missions", "Votre profil devient visible et vous êtes recommandé sur les diagnostics de vos spécialités."],
          ].map(([n, t, d]) => <div className="step" key={n}><span className="n">Étape {n}</span><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>
    </>
  );
}
