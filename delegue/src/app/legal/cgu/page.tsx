import { COMMISSION_RATE } from "@/lib/catalog";

export const metadata = { title: "Conditions générales d'utilisation" };

export default function CGU() {
  const pct = Math.round(COMMISSION_RATE * 100);
  return (
    <div className="prose">
      <div className="page-head"><div className="eyebrow">Informations légales</div><h1>Conditions générales d&apos;utilisation</h1></div>
      <h2>1. Objet</h2>
      <p>délègue. est une plateforme de mise en relation entre des entreprises (les « Clients ») et des prestataires indépendants spécialisés en automatisation et en intelligence artificielle (les « Experts »). délègue. n&apos;est pas partie au contrat de prestation conclu entre le Client et l&apos;Expert ; elle fournit l&apos;outil de mise en relation, de suivi et de paiement.</p>
      <h2>2. Comptes</h2>
      <p>L&apos;inscription est gratuite. L&apos;utilisateur fournit des informations exactes et garde ses identifiants confidentiels. Les Experts doivent exercer sous un statut professionnel (SIRET ou équivalent) et sont responsables de leurs obligations fiscales et sociales.</p>
      <h2>3. Vérification des Experts</h2>
      <p>Les profils d&apos;Experts sont examinés avant d&apos;être visibles. Cette vérification ne constitue pas une garantie de résultat sur les prestations.</p>
      <h2>4. Diagnostic par intelligence artificielle</h2>
      <p>Le diagnostic gratuit est généré automatiquement. Il est indicatif (solution, durée, prix) et doit être confirmé avec l&apos;Expert. Les informations saisies dans le diagnostic sont transmises à notre prestataire d&apos;intelligence artificielle pour produire la réponse.</p>
      <h2>5. Prix, paiement et commission</h2>
      <p>Le prix de la mission est affiché avant le paiement. Le Client paie par carte via Stripe. La somme est conservée jusqu&apos;à la validation de la mission par le Client, puis reversée à l&apos;Expert, déduction faite de la commission de la plateforme ({pct} % du montant de la mission).</p>
      <h2>6. Déroulement d&apos;une mission</h2>
      <p>Après paiement, l&apos;Expert accepte ou décline la mission. En cas de refus, le Client est intégralement remboursé. L&apos;Expert signale la livraison ; le Client teste et valide. Sans réponse du Client dans un délai de [14] jours après la livraison, et en l&apos;absence de litige, la mission peut être considérée comme validée.</p>
      <h2>7. Litiges</h2>
      <p>Le Client comme l&apos;Expert peut ouvrir un litige depuis la mission. délègue. examine les échanges et décide du versement à l&apos;Expert ou du remboursement du Client. Les échanges doivent avoir lieu sur la plateforme pour pouvoir être pris en compte.</p>
      <h2>8. Obligations des utilisateurs</h2>
      <p>Il est interdit de contourner la plateforme pour payer une mission trouvée sur délègue., de publier des contenus illicites ou trompeurs, ou d&apos;utiliser les automatisations à des fins illégales (prospection non consentie, collecte illicite de données…).</p>
      <h2>9. Informations fiscales des Experts</h2>
      <p>Conformément à la réglementation (directive européenne dite « DAC7 »), délègue. peut être tenue de transmettre chaque année à l&apos;administration fiscale les revenus perçus par les Experts via la plateforme, ainsi que leurs informations d&apos;identification.</p>
      <h2>10. Responsabilité</h2>
      <p>Chaque Expert est seul responsable de ses prestations. La responsabilité de délègue. est limitée au fonctionnement de la plateforme.</p>
      <h2>11. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français. Contact : [adresse e-mail de contact].</p>
      <p className="note">Modèle de départ, à faire relire par un professionnel du droit avant le lancement.</p>
    </div>
  );
}
