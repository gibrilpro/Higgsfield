export const CATEGORIES = [
  "Messages clients",
  "Rendez-vous",
  "Avis & réputation",
  "Devis & admin",
  "Réseaux sociaux",
  "E-commerce",
  "Téléphone",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const COMMISSION_RATE = Math.min(50, Math.max(0, Number(process.env.COMMISSION_PERCENT ?? 15))) / 100;

export const SOLUTIONS_SEED: {
  id: string; category: Category; title: string; description: string;
  price: number; monthly: number; days: number; hours: number; tools: string[];
}[] = [
  { id: "assistant-messages", category: "Messages clients", title: "Assistant de réponses Instagram & WhatsApp", description: "Répond aux questions fréquentes (prix, horaires, livraison) 24 h/24 et vous transmet les demandes importantes.", price: 490, monthly: 29, days: 5, hours: 8, tools: ["ManyChat", "API Claude", "Make"] },
  { id: "reservation-auto", category: "Rendez-vous", title: "Réservation automatique", description: "Vos clients réservent seuls, reçoivent un rappel la veille, et les annulations libèrent le créneau.", price: 390, monthly: 0, days: 4, hours: 5, tools: ["Cal.com", "Google Agenda", "Twilio"] },
  { id: "avis-google", category: "Avis & réputation", title: "Réponses aux avis Google", description: "Chaque nouvel avis reçoit une réponse personnalisée, validée par vous en un clic.", price: 190, monthly: 15, days: 2, hours: 2, tools: ["Google Business", "API Claude", "n8n"] },
  { id: "devis-auto", category: "Devis & admin", title: "Devis générés en 2 minutes", description: "Le client remplit un formulaire, l'IA prépare le devis au bon format, vous n'avez qu'à vérifier et envoyer.", price: 590, monthly: 0, days: 6, hours: 6, tools: ["Tally", "Google Docs", "n8n"] },
  { id: "posts-reseaux", category: "Réseaux sociaux", title: "Posts du mois préparés par l'IA", description: "Un calendrier de 12 posts par mois, rédigés dans votre ton, prêts à valider et à programmer.", price: 290, monthly: 49, days: 3, hours: 4, tools: ["Notion", "API Claude", "Buffer"] },
  { id: "sav-ecommerce", category: "E-commerce", title: "SAV e-commerce automatisé", description: "Suivi de colis, retours et questions produits traités automatiquement depuis votre boutique Shopify.", price: 690, monthly: 39, days: 7, hours: 10, tools: ["Shopify", "Gorgias", "API Claude"] },
  { id: "fiches-produits", category: "E-commerce", title: "Fiches produits rédigées par l'IA", description: "Titres, descriptions et textes SEO générés pour tout votre catalogue, dans votre style.", price: 250, monthly: 0, days: 3, hours: 3, tools: ["Shopify", "API Claude"] },
  { id: "standard-ia", category: "Téléphone", title: "Standard téléphonique IA", description: "Un assistant vocal répond aux appels, prend les messages et les rendez-vous quand vous êtes occupé.", price: 890, monthly: 59, days: 8, hours: 7, tools: ["Vapi", "Twilio", "Cal.com"] },
];

export function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: cents % 100 ? 2 : 0 });
}
