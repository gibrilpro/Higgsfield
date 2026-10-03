export const metadata = { title: "Politique de confidentialité" };

export default function Privacy() {
  return (
    <div className="prose">
      <div className="page-head"><div className="eyebrow">Informations légales</div><h1>Politique de confidentialité</h1></div>
      <h2>Responsable du traitement</h2>
      <p>[Nom et prénom], éditeur de délègue. Contact : [adresse e-mail de contact].</p>
      <h2>Données collectées</h2>
      <ul>
        <li>Compte : nom, adresse e-mail, mot de passe (stocké chiffré, jamais en clair).</li>
        <li>Profil Expert : spécialité, ville, présentation, tarif, outils.</li>
        <li>Missions et messages échangés sur la plateforme.</li>
        <li>Diagnostics : le texte saisi et le résultat ; l&apos;adresse IP est conservée sous forme chiffrée irréversible pour limiter les abus.</li>
        <li>Paiements : traités par Stripe ; nous ne recevons pas vos données de carte.</li>
      </ul>
      <h2>Finalités et bases légales</h2>
      <p>Exécution du service (contrat), prévention de la fraude (intérêt légitime), obligations fiscales et comptables (obligation légale).</p>
      <h2>Sous-traitants</h2>
      <p>Hébergement : [hébergeur]. Base de données : [prestataire]. Paiement : Stripe. Diagnostic par IA : Anthropic (le texte du diagnostic lui est transmis pour générer la réponse).</p>
      <h2>Durée de conservation</h2>
      <p>Compte : jusqu&apos;à sa suppression. Missions et factures : 10 ans (obligation comptable). Diagnostics non rattachés à un compte : 12 mois.</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données à [adresse e-mail de contact]. Vous pouvez aussi saisir la CNIL (cnil.fr).</p>
      <h2>Cookies</h2>
      <p>Le site utilise uniquement un cookie de session, nécessaire à la connexion. Aucun cookie publicitaire.</p>
    </div>
  );
}
