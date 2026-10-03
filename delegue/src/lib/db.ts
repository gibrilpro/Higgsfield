import { createClient, type Client, type InValue } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { SOLUTIONS_SEED } from "./catalog";

const url = process.env.DATABASE_URL || "file:./data/delegue.db";
if (url.startsWith("file:")) mkdirSync("./data", { recursive: true });

const globalForDb = globalThis as unknown as { __db?: Client; __dbReady?: Promise<void> };
const client: Client =
  globalForDb.__db ?? createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
globalForDb.__db = client;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
    name TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('client','expert')),
    is_admin INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS experts (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL, city TEXT NOT NULL, bio TEXT NOT NULL, rate INTEGER NOT NULL,
    tools TEXT NOT NULL, skills TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    stripe_account_id TEXT, payouts_enabled INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS solutions (
    id TEXT PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
    price INTEGER NOT NULL, monthly INTEGER NOT NULL DEFAULT 0, days INTEGER NOT NULL,
    hours INTEGER NOT NULL, tools TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS diagnostics (
    id TEXT PRIMARY KEY, user_id TEXT, request TEXT NOT NULL, result TEXT NOT NULL,
    source TEXT NOT NULL, ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY, client_id TEXT NOT NULL REFERENCES users(id),
    expert_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, category TEXT NOT NULL,
    brief TEXT NOT NULL, amount_cents INTEGER NOT NULL, commission_cents INTEGER NOT NULL,
    status TEXT NOT NULL, diagnostic_id TEXT, solution_id TEXT,
    stripe_session_id TEXT, stripe_payment_intent TEXT, stripe_transfer_id TEXT, stripe_refund_id TEXT,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id), body TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_missions_client ON missions(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_missions_expert ON missions(expert_id)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_mission ON messages(mission_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_diag_ip ON diagnostics(ip_hash, created_at)`,
];

async function init() {
  await client.batch(SCHEMA, "write");
  const existing = await client.execute("SELECT COUNT(*) AS n FROM solutions");
  if (Number(existing.rows[0].n) === 0) {
    await client.batch(
      SOLUTIONS_SEED.map((s) => ({
        sql: `INSERT INTO solutions (id, category, title, description, price, monthly, days, hours, tools)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [s.id, s.category, s.title, s.description, s.price, s.monthly, s.days, s.hours, JSON.stringify(s.tools)],
      })),
      "write",
    );
  }
}

function ready() {
  globalForDb.__dbReady ??= init();
  return globalForDb.__dbReady;
}

export type Row = Record<string, unknown>;

export async function query<T = Row>(sql: string, args: InValue[] = []): Promise<T[]> {
  await ready();
  const res = await client.execute({ sql, args });
  return res.rows as unknown as T[];
}

export async function one<T = Row>(sql: string, args: InValue[] = []): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: InValue[] = []): Promise<number> {
  await ready();
  const res = await client.execute({ sql, args });
  return res.rowsAffected;
}

export const now = () => Date.now();
export const newId = () => crypto.randomUUID();
