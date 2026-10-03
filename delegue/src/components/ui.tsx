import type { ReactNode } from "react";

const PAL = [["#0B1220", "#3B4A66"], ["#0F766E", "#3CC7B5"], ["#2F5BD3", "#86A6FF"], ["#B4532A", "#E8912D"], ["#6D28D9", "#A78BFA"], ["#9F1239", "#FB7185"]];

export function Avatar({ id, name }: { id: string; name: string }) {
  const c = PAL[[...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % PAL.length];
  const initials = name.split(/\s+/).map((s) => s[0] ?? "").join("").slice(0, 2).toUpperCase();
  return <div className="av" aria-hidden="true" style={{ background: `linear-gradient(140deg, ${c[0]}, ${c[1]})` }}>{initials}</div>;
}

const ICONS = {
  check: <path d="M20 6 9 17l-5-5" />,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
};
export function Icon({ name, size = 16 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export function Flash({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const err = typeof sp.erreur === "string" ? sp.erreur : null;
  const ok = typeof sp.ok === "string" ? sp.ok : null;
  if (err) return <p className="alert err" role="alert">{err}</p>;
  if (ok) return <p className="alert ok" role="status">Enregistré.</p>;
  return null;
}

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
