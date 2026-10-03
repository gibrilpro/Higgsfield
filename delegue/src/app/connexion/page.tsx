import Link from "next/link";
import { loginAction } from "../actions";
import { Flash } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Connexion" };

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <div className="auth panel">
      <h1 style={{ fontSize: 28 }}>Connexion</h1>
      <Flash sp={sp} />
      <form className="stack" action={loginAction}>
        <input type="hidden" name="suite" value={sp.suite ?? "/missions"} />
        <div className="f"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="f"><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <SubmitButton pending="Connexion…">Se connecter</SubmitButton>
      </form>
      <p className="tiny">Pas encore de compte ? <Link href={`/inscription${sp.suite ? `?suite=${encodeURIComponent(sp.suite)}` : ""}`}>Créer un compte</Link></p>
    </div>
  );
}
