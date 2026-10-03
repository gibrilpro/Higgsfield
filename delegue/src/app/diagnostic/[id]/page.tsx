import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { getDiagnostic } from "@/lib/diagnostic";
import { listApprovedExperts } from "@/lib/experts";
import { Avatar, Icon } from "@/components/ui";
import { eur } from "@/lib/catalog";

export const metadata = { title: "Votre diagnostic", robots: { index: false } };

export default async function DiagnosticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const diag = await getDiagnostic(id);
  if (!diag) notFound();
  const d = diag.result;
  const experts = (await listApprovedExperts(d.categorie)).slice(0, 3);
  const avg = Math.round((d.prix_min + d.prix_max) / 2);
  const missionHref = (expertId?: string) => `/missions/nouvelle?diagnostic=${diag.id}${expertId ? `&expert=${expertId}` : ""}`;
  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Votre diagnostic</div>
        <h1>{d.titre}</h1>
        <p className="quote">« {diag.request} »</p>
      </div>
      <div className="split">
        <div className="panel">
          <p>{d.resume}</p>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Comment ça fonctionne</div>
            <div className="flow">
              {d.etapes.map((s, i) => (
                <Fragment key={i}>
                  {i > 0 ? <div className="arrow"><Icon name="arrow" /></div> : null}
                  <div className={`node${i === 1 ? " ai" : ""}`}><span>{i === 0 ? "Déclencheur" : i === d.etapes.length - 1 ? "Résultat" : "IA"}</span>{s}</div>
                </Fragment>
              ))}
            </div>
          </div>
          <div className="big">
            <div><b>~{d.heures_gagnees_semaine} h</b><span>gagnées par semaine</span></div>
            <div><b>{d.prix_min}–{eur(d.prix_max * 100)}</b><span>installation, prix indicatif</span></div>
            <div><b>{d.delai_jours} j</b><span>délai moyen</span></div>
          </div>
          <div className="tools">{d.outils.map((t) => <span className="tool" key={t}>{t}</span>)}</div>
          <div className="row">
            <span className="src">{d.source === "ia" ? "Diagnostic généré par IA, à confirmer avec l'expert" : "Estimation à partir de solutions similaires, à confirmer avec l'expert"}</span>
            <div className="row">
              <Link className="btn ghost" href="/">Nouvelle demande</Link>
              <Link className="btn accent" href={missionHref()}>Lancer la mission · {eur(avg * 100)}</Link>
            </div>
          </div>
        </div>
        <aside className="panel">
          <h2 style={{ fontSize: 20 }}>Experts recommandés</h2>
          {experts.length ? experts.map((e) => (
            <div className="row" key={e.user_id} style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div className="who"><Avatar id={e.user_id} name={e.name} /><div><b>{e.name}</b><div className="tiny">{e.rate} €/h · {e.city}</div></div></div>
              <Link className="btn sm" href={missionHref(e.user_id)}>Choisir</Link>
            </div>
          )) : <p className="tiny">Aucun expert validé dans cette catégorie pour l&apos;instant. Lancez la mission : nous vous proposerons un expert disponible.</p>}
          <p className="note">Le prix final est fixé avant le paiement. L&apos;argent reste bloqué jusqu&apos;à ce que vous validiez la solution.</p>
        </aside>
      </div>
    </>
  );
}
