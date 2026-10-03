import "server-only";
import { now, one, query, run } from "./db";

export type Expert = {
  user_id: string; name: string; title: string; city: string; bio: string; rate: number;
  tools: string[]; skills: string[]; status: "pending" | "approved" | "rejected";
  stripe_account_id: string | null; payouts_enabled: number; missions_done: number;
};

type Raw = Omit<Expert, "tools" | "skills"> & { tools: string; skills: string };
const parse = (r: Raw): Expert => ({ ...r, tools: JSON.parse(r.tools), skills: JSON.parse(r.skills), missions_done: Number(r.missions_done ?? 0) });

const SELECT = `SELECT x.*, u.name,
  (SELECT COUNT(*) FROM missions m WHERE m.expert_id = x.user_id AND m.status = 'completed') AS missions_done
  FROM experts x JOIN users u ON u.id = x.user_id`;

export async function listApprovedExperts(skill?: string) {
  const rows = (await query<Raw>(`${SELECT} WHERE x.status = 'approved' ORDER BY missions_done DESC, x.created_at ASC`)).map(parse);
  return skill ? rows.filter((e) => e.skills.includes(skill)) : rows;
}

export async function getExpert(userId: string) {
  const r = await one<Raw>(`${SELECT} WHERE x.user_id = ?`, [userId]);
  return r ? parse(r) : null;
}

export async function listExpertsByStatus(status: Expert["status"]) {
  return (await query<Raw>(`${SELECT} WHERE x.status = ? ORDER BY x.created_at ASC`, [status])).map(parse);
}

export async function upsertExpertProfile(userId: string, p: { title: string; city: string; bio: string; rate: number; tools: string[]; skills: string[] }) {
  const existing = await one("SELECT user_id FROM experts WHERE user_id = ?", [userId]);
  const args = [p.title, p.city, p.bio, p.rate, JSON.stringify(p.tools), JSON.stringify(p.skills)];
  if (existing) await run("UPDATE experts SET title = ?, city = ?, bio = ?, rate = ?, tools = ?, skills = ? WHERE user_id = ?", [...args, userId]);
  else await run("INSERT INTO experts (title, city, bio, rate, tools, skills, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [...args, userId, now()]);
}

export async function setExpertStatus(userId: string, status: Expert["status"]) {
  await run("UPDATE experts SET status = ? WHERE user_id = ?", [status, userId]);
}
