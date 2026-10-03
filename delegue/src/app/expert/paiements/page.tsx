import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getExpert } from "@/lib/experts";
import { stripeEnabled } from "@/lib/payments";
import { refreshPayoutsAction, stripeConnectAction } from "../../actions";
import { Flash, PageHead } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Mes paiements" };

export default async function Payouts({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const u = await requireUser("/expert/paiements");
  const e = await getExpert(u.id);
  if (sp.retour && e?.stripe_account_id && !e.payouts_enabled) {
    // Back from Stripe onboarding: refresh the account status once.
    return (
      <div className="panel" style={{ maxWidth: 640, marginTop: 36 }}>
        <h1 style={{ fontSize: 26 }}>Vérification de votre compte</h1>
        <form action={refreshPayoutsAction}><SubmitButton pending="Vérification…">Vérifier mon statut de paiement</SubmitButton></form>
      </div>
    );
  }
  return (
    <>
      <PageHead eyebrow="Espace expert" title="Recevoir mes paiements">Vos gains sont versés sur votre compte bancaire via Stripe, le prestataire de paiement de la plateforme.</PageHead>
      <div className="panel" style={{ maxWidth: 720 }}>
        <Flash sp={sp} />
        {!e ? <p className="desc">Complétez d&apos;abord <Link href="/expert/profil">votre profil d&apos;expert</Link>.</p> : !stripeEnabled() ? (
          <p className="note">Mode démo : les paiements réels ne sont pas encore activés sur la plateforme. Les missions validées sont marquées comme payées sans transfert d&apos;argent.</p>
        ) : e.payouts_enabled ? (
          <p className="alert ok">Vos paiements sont activés. Votre part de chaque mission validée est versée automatiquement.</p>
        ) : (<>
          <p className="desc">Pour recevoir votre part ({"85 %"} de chaque mission), vérifiez votre identité et ajoutez votre IBAN auprès de Stripe. Cela prend environ 5 minutes. Un statut d&apos;indépendant (SIRET) est nécessaire.</p>
          <form action={stripeConnectAction}><SubmitButton className="btn accent" pending="Redirection vers Stripe…">{e.stripe_account_id ? "Reprendre la vérification" : "Activer mes paiements"}</SubmitButton></form>
          {e.stripe_account_id ? <form action={refreshPayoutsAction}><SubmitButton className="btn ghost" pending="Vérification…">J&apos;ai terminé, vérifier mon statut</SubmitButton></form> : null}
        </>)}
      </div>
    </>
  );
}
