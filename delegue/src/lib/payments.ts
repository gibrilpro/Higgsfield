import "server-only";
import Stripe from "stripe";

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe non configuré");
  _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

export const appUrl = () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

export async function createCheckout(opts: { missionId: string; title: string; amountCents: number; email: string }) {
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: opts.email,
    line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: opts.amountCents, product_data: { name: `Mission délègue. : ${opts.title}` } } }],
    payment_intent_data: { transfer_group: opts.missionId, metadata: { mission_id: opts.missionId } },
    metadata: { mission_id: opts.missionId },
    success_url: `${appUrl()}/missions/${opts.missionId}?paiement=ok`,
    cancel_url: `${appUrl()}/missions/${opts.missionId}?paiement=annule`,
  });
  return { id: session.id, url: session.url };
}

/** Pays the expert their share, funded by the mission's own charge. */
export async function releaseFunds(opts: { missionId: string; paymentIntentId: string; destination: string; amountCents: number }) {
  const pi = await stripe().paymentIntents.retrieve(opts.paymentIntentId);
  const charge = typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id;
  const transfer = await stripe().transfers.create({
    amount: opts.amountCents,
    currency: "eur",
    destination: opts.destination,
    transfer_group: opts.missionId,
    ...(charge ? { source_transaction: charge } : {}),
  });
  return transfer.id;
}

export async function refund(paymentIntentId: string) {
  const r = await stripe().refunds.create({ payment_intent: paymentIntentId });
  return r.id;
}

export async function createConnectAccount(email: string) {
  const account = await stripe().accounts.create({
    type: "express",
    country: "FR",
    email,
    capabilities: { transfers: { requested: true } },
  });
  return account.id;
}

export async function onboardingLink(accountId: string) {
  const link = await stripe().accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${appUrl()}/expert/paiements?refresh=1`,
    return_url: `${appUrl()}/expert/paiements?retour=1`,
  });
  return link.url;
}

export async function accountPayoutsEnabled(accountId: string) {
  const a = await stripe().accounts.retrieve(accountId);
  return Boolean(a.payouts_enabled && a.capabilities?.transfers === "active");
}
