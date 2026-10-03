import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { currentUser } from "@/lib/auth";
import { logoutAction } from "./actions";
import { stripeEnabled } from "@/lib/payments";

export const metadata: Metadata = {
  title: { default: "délègue. — Confiez vos tâches répétitives à l'IA", template: "%s · délègue." },
  description: "Décrivez ce qui vous fait perdre du temps : délègue. vous propose une solution d'automatisation avec l'IA et un expert vérifié pour l'installer.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;700;800&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap" />
      </head>
      <body>
        <header className="nav">
          <div className="in">
            <Link href="/" className="logo" aria-label="délègue., accueil">délègue<i>.</i></Link>
            <nav className="links" aria-label="Navigation principale">
              <Link href="/solutions">Solutions</Link>
              <Link href="/experts">Experts</Link>
              {user ? <Link href="/missions">Mes missions</Link> : null}
              {user?.role === "expert" ? <Link href="/expert/profil">Mon profil expert</Link> : null}
              {user?.is_admin ? <Link href="/admin">Administration</Link> : null}
              {!user ? <Link href="/experts/rejoindre">Devenir expert</Link> : null}
            </nav>
            <div className="navright">
              {user ? (
                <form action={logoutAction}><button className="btn sm ghost" type="submit">Se déconnecter</button></form>
              ) : (
                <>
                  <Link className="btn sm ghost" href="/connexion">Se connecter</Link>
                  <Link className="btn sm primary" href="/inscription">Créer un compte</Link>
                </>
              )}
            </div>
          </div>
        </header>
        {!stripeEnabled() ? <p className="wrap tiny" style={{ paddingTop: 10 }}>Mode démo : les paiements sont simulés, aucun argent réel n&apos;est débité.</p> : null}
        <main className="wrap">{children}</main>
        <div className="wrap">
          <footer className="site">
            <span>© {new Date().getFullYear()} délègue.</span>
            <nav aria-label="Informations légales">
              <Link href="/legal/mentions">Mentions légales</Link>
              <Link href="/legal/cgu">CGU</Link>
              <Link href="/legal/confidentialite">Confidentialité</Link>
            </nav>
          </footer>
        </div>
      </body>
    </html>
  );
}
