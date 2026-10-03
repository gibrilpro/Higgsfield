export const metadata = { title: "Mentions légales" };

export default function Mentions() {
  return (
    <div className="prose">
      <div className="page-head"><div className="eyebrow">Informations légales</div><h1>Mentions légales</h1></div>
      <h2>Éditeur du site</h2>
      <p>[Nom et prénom], entrepreneur individuel, exploitant la plateforme « délègue. ».<br />SIRET : [numéro SIRET]<br />Adresse : [adresse ou domiciliation]<br />Contact : [adresse e-mail de contact]</p>
      <p>Directeur de la publication : [Nom et prénom].</p>
      <h2>Hébergement</h2>
      <p>[Nom de l&apos;hébergeur, adresse et téléphone. Par exemple, pour Vercel : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.]</p>
      <h2>Paiements</h2>
      <p>Les paiements sont traités par Stripe Payments Europe, Ltd. La plateforme ne conserve aucune donnée de carte bancaire.</p>
      <h2>Médiation de la consommation</h2>
      <p>Conformément à l&apos;article L612-1 du Code de la consommation, l&apos;utilisateur consommateur peut recourir gratuitement au médiateur suivant : [nom et coordonnées du médiateur].</p>
    </div>
  );
}
