import Link from "next/link";
import { diagnoseAction } from "./actions";
import { Flash, Icon } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { query } from "@/lib/db";
import { eur } from "@/lib/catalog";
import { listApprovedExperts } from "@/lib/experts";
import { ExpertCard } from "./experts/ExpertCard";

export const dynamic = "force-dynamic";

const EXAMPLES = [
  "Je passe 2 h par jour à répondre aux mêmes questions sur Instagram",
  "Mes clients m'appellent pour prendre rendez-vous pendant que je travaille",
  "Faire mes devis me prend toutes mes soirées",
  "Je n'ai pas le temps de répondre aux avis Google",
];

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const solutions = await query<{ id: string; category: string; title: string; description: string; price: number; monthly: number }>("SELECT id, category, title, description, price, monthly FROM solutions WHERE active = 1 LIMIT 3");
  const experts = (await listApprovedExperts()).slice(0, 3);
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Automatisation & IA pour les indépendants</div>
          <h1>Confiez vos tâches répétitives à l&apos;IA. <em>Un expert l&apos;installe pour vous.</em></h1>
          <p className="lede">Décrivez ce qui vous fait perdre du temps. Nous vous proposons une solution concrète, son prix, et un expert vérifié pour la mettre en place dans votre entreprise.</p>
          <div className="trust">
            <span><Icon name="lock" />Paiement bloqué jusqu&apos;à la validation</span>
            <span><Icon name="shield" />Experts vérifiés</span>
            <span><Icon name="clock" />Installé en quelques jours</span>
          </div>
        </div>
        <form className="diag" action={diagnoseAction}>
          <Flash sp={sp} />
          <label htmlFor="besoin">Quelle tâche vous fait perdre du temps ?</label>
          <textarea id="besoin" name="besoin" required minLength={10} maxLength={1500} placeholder="Ex. : je passe mes soirées à répondre aux messages de mes clients…" aria-describedby="besoin-aide" />
          <details>
            <summary className="tiny" style={{ cursor: "pointer" }}>Voir des exemples</summary>
            <ul className="tiny" style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {EXAMPLES.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </details>
          <div className="foot">
            <span className="tiny" id="besoin-aide">Diagnostic gratuit et sans inscription.</span>
            <SubmitButton className="btn accent" pending="Analyse en cours…"><Icon name="spark" />Trouver ma solution</SubmitButton>
          </div>
        </form>
      </section>

      <section className="block">
        <div className="sec-head"><div><h2>Comment ça marche</h2><p>Trois étapes, sans jargon technique.</p></div></div>
        <div className="steps3">
          {[
            ["1", "Décrivez votre problème", "L'IA le transforme en besoin clair : la solution, les outils, le temps gagné et le prix indicatif."],
            ["2", "Choisissez un expert", "Comparez les experts spécialisés dans votre besoin. Votre paiement est bloqué en sécurité."],
            ["3", "Gagnez du temps", "L'expert installe et teste la solution avec vous. Il est payé quand vous validez."],
          ].map(([n, t, d]) => (
            <div className="step" key={n}><span className="n">Étape {n}</span><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="sec-head">
          <div><h2>Solutions prêtes à installer</h2><p>Prix indicatif connu à l&apos;avance. Un expert l&apos;adapte à votre entreprise.</p></div>
          <Link className="btn sm" href="/solutions">Toutes les solutions</Link>
        </div>
        <div className="grid">
          {solutions.map((s) => (
            <article className="card" key={s.id}>
              <span className="cat">{s.category}</span>
              <h3>{s.title}</h3>
              <p className="desc">{s.description}</p>
              <div className="row">
                <div className="price">{eur(s.price * 100)}{s.monthly ? <small> + {s.monthly} €/mois</small> : null}</div>
                <Link className="btn sm primary" href={`/missions/nouvelle?solution=${s.id}`}>Choisir</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="sec-head">
          <div><h2>Des experts vérifiés</h2><p>Chaque expert est validé par notre équipe avant d&apos;être visible.</p></div>
          <Link className="btn sm" href="/inscription?role=expert">Devenir expert</Link>
        </div>
        {experts.length ? (
          <div className="grid">{experts.map((e) => <ExpertCard key={e.user_id} e={e} />)}</div>
        ) : (
          <div className="empty"><p>Les premiers experts sont en cours de validation.</p><Link className="btn" href="/inscription?role=expert">Vous êtes expert IA ? Rejoignez-nous</Link></div>
        )}
      </section>
    </>
  );
}
