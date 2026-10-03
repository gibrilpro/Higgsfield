import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { newId, now, one, run } from "./db";

const COOKIE = "delegue_session";
const SESSION_DAYS = 30;

export type User = { id: string; email: string; name: string; role: "client" | "expert"; is_admin: number };

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export async function createUser(email: string, password: string, name: string, role: "client" | "expert") {
  const id = newId();
  const isAdmin = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? 1 : 0;
  await run(
    "INSERT INTO users (id, email, password_hash, name, role, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, email, await hashPassword(password), name, role, isAdmin, now()],
  );
  return id;
}

export async function verifyLogin(email: string, password: string): Promise<string | null> {
  const u = await one<{ id: string; password_hash: string }>("SELECT id, password_hash FROM users WHERE email = ?", [email]);
  // Always run bcrypt to keep timing similar whether or not the account exists.
  const ok = await bcrypt.compare(password, u?.password_hash ?? "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva");
  return u && ok ? u.id : null;
}

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = now() + SESSION_DAYS * 86400_000;
  await run("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", [sha256(token), userId, expires]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token_hash = ?", [sha256(token)]);
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return one<User>(
    `SELECT u.id, u.email, u.name, u.role, u.is_admin FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
    [sha256(token), now()],
  );
}

export async function requireUser(next = "/missions"): Promise<User> {
  const u = await currentUser();
  if (!u) redirect(`/connexion?suite=${encodeURIComponent(next)}`);
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser("/admin");
  if (!u.is_admin) redirect("/");
  return u;
}

/** Only allow same-site relative redirects after login. */
export function safeNext(next: unknown, fallback = "/missions") {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
