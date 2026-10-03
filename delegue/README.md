# délègue.

Marketplace qui relie les petites entreprises à des experts en automatisation et en IA.

- **Diagnostic IA gratuit** : l'entreprise décrit une tâche, l'IA (Claude) propose une solution, un prix indicatif et des experts.
- **Comptes** entreprises et experts, vérification des experts par l'administrateur.
- **Missions** : paiement bloqué (séquestre), acceptation, livraison, validation, litiges, messagerie.
- **Paiements** Stripe Connect : le client paie la plateforme, l'expert reçoit sa part (85 % par défaut) à la validation.
- **Mode démo** automatique tant que Stripe n'est pas configuré (aucun argent réel), et diagnostic par modèles tant que la clé IA n'est pas configurée.

## Lancer en local

```bash
cp .env.example .env.local   # puis remplir ADMIN_EMAIL au minimum
npm install
npm run dev                  # http://localhost:3000
```

Le compte créé avec l'adresse `ADMIN_EMAIL` a accès à `/admin` (validation des experts, litiges, statistiques).

## Mettre en ligne (Vercel + Turso)

1. **Base de données** : créer une base gratuite sur [turso.tech](https://turso.tech), puis récupérer son URL (`libsql://…`) et un jeton.
2. **Hébergement** : importer ce dossier sur [vercel.com](https://vercel.com) (racine du projet : `delegue`).
3. **Variables d'environnement** sur Vercel :
   | Variable | Valeur |
   |---|---|
   | `APP_URL` | l'adresse du site, ex. `https://delegue.fr` |
   | `DATABASE_URL` / `DATABASE_AUTH_TOKEN` | fournis par Turso |
   | `ADMIN_EMAIL` | ton e-mail |
   | `ANTHROPIC_API_KEY` | clé créée sur [platform.claude.com](https://platform.claude.com) (facultatif) |
   | `STRIPE_SECRET_KEY` | clé secrète Stripe (facultatif, sinon mode démo) |
   | `STRIPE_WEBHOOK_SECRET` | secret du webhook Stripe (voir ci-dessous) |
   | `COMMISSION_PERCENT` | `15` |
4. **Stripe** :
   - activer **Connect** (type de compte : Express) dans le tableau de bord Stripe ;
   - créer un webhook vers `https://<ton-domaine>/api/stripe/webhook` avec les événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`, puis copier son secret dans `STRIPE_WEBHOOK_SECRET` ;
   - commencer avec les **clés de test** (`sk_test_…`) et la carte `4242 4242 4242 4242` avant de passer en réel.
5. Compléter les champs `[entre crochets]` des pages `/legal/*` (identité, hébergeur, médiateur) et faire relire les CGU.

## Tests

```bash
# base vide + serveur de production sur le port 3100
rm -f data/test.db && npm run build
DATABASE_URL=file:./data/test.db ADMIN_EMAIL=admin@test.fr npx next start -p 3100 &
BASE=http://localhost:3100 npm run test:e2e
```

Le test parcourt tout le cycle en mode démo : inscription expert, validation admin, diagnostic, commande, paiement, acceptation, messages, livraison, validation, contrôles d'accès et affichage mobile.

## Structure

- `src/lib/` : base de données (`db.ts`), comptes et sessions (`auth.ts`), diagnostic IA (`diagnostic.ts`), missions et séquestre (`missions.ts`), Stripe (`payments.ts`), experts, catalogue.
- `src/app/actions.ts` : toutes les actions des formulaires (validées côté serveur).
- `src/app/` : pages (accueil, diagnostic, solutions, experts, missions, espace expert, admin, pages légales) et webhook Stripe.
