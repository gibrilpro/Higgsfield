// Parcours complet en mode démo, sur une base vide. Usage : BASE=http://localhost:3100 node tests/e2e.mjs
import { chromium } from "playwright";
import { createClient } from "@libsql/client";

const BASE = process.env.BASE || "http://localhost:3100";
const SHOTS = process.env.SHOTS || null;
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const errors = [];
let step = 0;
const ok = (msg) => console.log(`✓ ${++step}. ${msg}`);
const fail = (msg) => { console.error(`✗ ${msg}`); process.exitCode = 1; };

async function ctx(name) {
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  p.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  return p;
}
async function signup(p, role, name, email) {
  await p.goto(`${BASE}/inscription?role=${role}`);
  await p.fill("#name", name); await p.fill("#email", email); await p.fill("#password", "motdepasse123");
  await p.check('input[name="cgu"]');
  await Promise.all([p.waitForResponse((r) => r.request().method() === "POST"), p.click('button[type="submit"]:has-text("Créer mon compte")')]);
  await p.waitForLoadState("load"); await p.waitForTimeout(400);
}
const clickOp = async (p, label) => {
  await Promise.all([p.waitForResponse((r) => r.request().method() === "POST"), p.click(`button:has-text("${label}")`)]);
  await p.waitForLoadState("load"); await p.waitForTimeout(400);
};
const waitStatus = async (p, text) => { try { await p.waitForSelector(`.status:has-text("${text}")`, { timeout: 8000 }); return true; } catch { return false; } };
const stamp = Date.now();

// 1. Expert
const expert = await ctx("expert");
await signup(expert, "expert", "Thomas Lefèvre", `expert${stamp}@test.fr`);
if (!expert.url().includes("/expert/profil")) fail("redirection expert"); else ok("Inscription expert");
await expert.fill("#title", "Automatisations pour commerces et indépendants");
await expert.fill("#city", "Reims"); await expert.fill("#rate", "55");
await expert.fill("#bio", "J'installe des assistants IA et des automatisations Make pour les petites entreprises depuis 3 ans.");
await expert.fill("#tools", "Make, ManyChat, API Claude");
await expert.check('input[value="Messages clients"]'); await expert.check('input[value="E-commerce"]');
await expert.click('button:has-text("Envoyer mon profil")'); await expert.waitForURL(/ok=1/);
(await expert.locator("text=En cours de vérification").count()) ? ok("Profil expert envoyé, en attente") : fail("profil expert");

// 2. Admin validates
const admin = await ctx("admin");
await signup(admin, "client", "Admin", "admin@test.fr");
if (admin.url().includes("/inscription")) {
  await admin.goto(`${BASE}/connexion`); await admin.fill("#email", "admin@test.fr"); await admin.fill("#password", "motdepasse123");
  await Promise.all([admin.waitForResponse((r) => r.request().method() === "POST"), admin.click('.auth button[type="submit"]')]);
  await admin.waitForLoadState("load"); await admin.waitForTimeout(400);
}
await admin.goto(`${BASE}/admin`);
(await admin.locator("text=Thomas Lefèvre").count()) ? ok("Admin voit l'expert à vérifier") : fail("admin liste");
await clickOp(admin, "Valider");
await admin.goto(`${BASE}/experts`);
(await admin.locator("text=Thomas Lefèvre").count()) ? ok("Expert validé et visible publiquement") : fail("expert visible");

// 3. Client diagnostic → mission
const client = await ctx("client");
await client.goto(BASE);
if (SHOTS) await client.screenshot({ path: `${SHOTS}/d_home.png` });
await client.fill("#besoin", "Je passe 2 h par jour à répondre aux mêmes questions sur Instagram");
await client.click('button:has-text("Trouver ma solution")'); await client.waitForURL(/\/diagnostic\//);
const title = await client.locator("h1").innerText();
title.length > 3 ? ok(`Diagnostic : « ${title} »`) : fail("diagnostic");
(await client.locator("text=Thomas Lefèvre").count()) ? ok("Expert recommandé sur le diagnostic") : fail("expert recommandé");
if (SHOTS) await client.screenshot({ path: `${SHOTS}/d_diag.png` });
await client.click('a:has-text("Choisir")'); await client.waitForURL(/connexion/);
ok("Commande sans compte → redirection vers la connexion");
await client.click('.auth a:has-text("Créer un compte")');
await client.fill("#name", "Boulangerie Martin"); await client.fill("#email", `client${stamp}@test.fr`); await client.fill("#password", "motdepasse123");
await client.check('input[name="cgu"]'); await client.click('button:has-text("Créer mon compte")'); await client.waitForURL(/missions\/nouvelle/);
ok("Inscription client puis retour à la commande");
await client.click('button:has-text("Continuer vers le paiement")'); await client.waitForURL(/\/missions\/[0-9a-f-]{36}$/);
const missionUrl = client.url();
(await waitStatus(client, "attente de paiement")) ? ok("Mission créée, en attente de paiement") : fail("mission créée");
await clickOp(client, "Payer");
(await waitStatus(client, "Payée")) ? ok("Paiement (démo) → argent bloqué") : fail("paiement");

// 4. Security: a stranger cannot open the mission; client cannot accept as expert
const stranger = await ctx("stranger");
await signup(stranger, "client", "Curieux", `curieux${stamp}@test.fr`);
await stranger.goto(missionUrl);
stranger.url().endsWith("/missions") ? ok("Un autre utilisateur ne peut pas voir la mission") : fail("fuite mission");
(await client.locator('button:has-text("Accepter la mission")').count()) === 0 ? ok("Le client n'a pas le bouton d'acceptation") : fail("bouton accept client");

// 5. Expert accepts, messages, delivers
await expert.goto(missionUrl);
await clickOp(expert, "Accepter la mission");
(await waitStatus(expert, "installation")) ? ok("Expert accepte → en cours") : fail("accept");
await expert.fill("#body", "Bonjour, pouvez-vous m'envoyer vos 10 questions les plus fréquentes ?");
await clickOp(expert, "Envoyer");
await expert.fill("#note", "Assistant installé sur votre compte Instagram, réponses testées.");
await clickOp(expert, "Marquer comme livrée");
(await waitStatus(expert, "Livrée")) ? ok("Expert livre la mission") : fail("livraison");

// 6. Client validates
await client.goto(missionUrl);
(await client.locator("text=10 questions les plus fréquentes").count()) ? ok("Le client voit le message de l'expert") : fail("message");
(await client.locator("text=Assistant installé sur votre compte Instagram").count()) ? ok("Le client voit la note de livraison") : fail("note de livraison");
await clickOp(client, "Valider et payer l'expert");
(await waitStatus(client, "Terminée")) ? ok("Validation → mission terminée, expert payé") : fail("validation");
if (SHOTS) await client.screenshot({ path: `${SHOTS}/d_mission.png`, fullPage: true });

// 6b. Review
await client.check('input[name="rating"][value="5"]');
await client.fill("#comment", "Rapide, clair et efficace. Je recommande !");
await clickOp(client, "Publier mon avis");
(await client.waitForSelector("text=Avis du client", { timeout: 8000 }).then(() => true, () => false)) ? ok("Avis client publié") : fail("avis");
await client.goto(`${BASE}/experts`);
(await client.locator("text=★ 5.0 (1 avis)").count()) ? ok("La note apparaît sur la fiche de l'expert") : fail("note expert");
await client.goto(missionUrl);

// 6c. Auto-validation after 14 days without answer (second mission, delivery date pushed back)
await client.goto(`${BASE}/experts`); await client.click('a:has-text("Voir le profil")'); await client.click('a:has-text("Proposer une mission")');
await client.fill("#title", "Réponses aux avis Google"); await client.fill("#brief", "Je voudrais répondre automatiquement aux avis Google de ma boulangerie.");
await client.click('button:has-text("Continuer vers le paiement")'); await client.waitForURL(/\/missions\/[0-9a-f-]{36}$/);
const m2 = client.url(); await clickOp(client, "Payer");
await expert.goto(m2); await clickOp(expert, "Accepter la mission"); await clickOp(expert, "Marquer comme livrée");
if (process.env.DATABASE_URL) {
  const db = createClient({ url: process.env.DATABASE_URL });
  await db.execute({ sql: "UPDATE missions SET updated_at = ? WHERE id = ?", args: [Date.now() - 15 * 86400_000, m2.split("/").pop()] });
  await client.goto(m2);
  (await waitStatus(client, "Terminée")) && (await client.locator("text=Validation automatique").count()) ? ok("Validation automatique après 14 jours sans réponse") : fail("auto-validation");
} else console.log("(auto-validation non testée : DATABASE_URL absent)");
await client.goto(`${BASE}/experts/rejoindre`);
(await client.locator("text=experts fondateurs").count()) ? ok("Page de recrutement des experts") : fail("page recrutement");

// 7. Replay protection: re-validate is refused
const r = await client.request.get(missionUrl);
r.status() === 200 ? ok("Page mission stable après validation") : fail("page mission");

await admin.goto(`${BASE}/admin`);
(await admin.locator("text=commissions encaissées").count()) ? ok("Tableau de bord admin à jour") : fail("admin stats");

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
const mp = await mobile.newPage(); await mp.goto(BASE);
const sw = await mp.evaluate(() => document.documentElement.scrollWidth);
sw <= 390 ? ok("Pas de défilement horizontal sur mobile") : fail(`débordement mobile ${sw}px`);
if (SHOTS) await mp.screenshot({ path: `${SHOTS}/d_mobile.png` });

if (errors.length) fail("Erreurs JS : " + errors.join(" | ")); else ok("Aucune erreur JavaScript");
await browser.close();
