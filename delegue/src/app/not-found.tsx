import Link from "next/link";

export default function NotFound() {
  return <div className="empty" style={{ marginTop: 48 }}><p>Cette page n&apos;existe pas ou n&apos;est plus disponible.</p><Link className="btn" href="/">Retour à l&apos;accueil</Link></div>;
}
