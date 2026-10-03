import Link from "next/link";
import { signupAction } from "../actions";
import { Flash } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Créer un compte" };

export default async function Signup({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const role = sp.role === "expert" ? "expert" : "client";
  const q = (r: string) => `/inscription?role=${r}${sp.suite ? `&suite=${encodeURIComponent(sp.suite)}` : ""}`;
  return (
    <div className="auth panel">
      <h1 style={{ fontSize: 28 }}>{role === "expert" ? "Devenir expert délègue." : "Créer un compte entreprise"}</h1>
      <nav className="filters" aria-label="Type de compte" style={{ margin: 0 }}>
        <Link className="chip" href={q("client")} aria-current={role === "client"}>Je cherche une solution</Link>
        <Link className="chip" href={q("expert")} aria-current={role === "expert"}>Je suis expert IA</Link>
      </nav>
      <p className="tiny">{role === "expert" ? "Recevez des missions qualifiées et gardez 85 % de chaque mission. Votre profil est vérifié avant d'être visible." : "Commandez une solution, suivez l'installation et ne payez l'expert qu'à la validation."}</p>
      <Flash sp={sp} />
      <form className="stack" action={signupAction}>
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="suite" value={sp.suite ?? ""} />
        <div className="f"><label htmlFor="name">{role === "expert" ? "Prénom et nom" : "Nom ou entreprise"}</label><input id="name" name="name" required minLength={2} maxLength={60} autoComplete="name" /></div>
        <div className="f"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div className="f"><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" /><span className="tiny">8 caractères minimum.</span></div>
        <label className="tiny" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><input type="checkbox" name="cgu" required style={{ width: "auto", marginTop: 3 }} />J&apos;accepte les <Link href="/legal/cgu" target="_blank">conditions générales d&apos;utilisation</Link> et la <Link href="/legal/confidentialite" target="_blank">politique de confidentialité</Link>.</label>
        <SubmitButton pending="Création…">Créer mon compte</SubmitButton>
      </form>
      <p className="tiny">Déjà inscrit ? <Link href="/connexion">Se connecter</Link></p>
    </div>
  );
}
