import type { MissionStatus } from "@/lib/missions";

export const statusClass = (s: MissionStatus) =>
  s === "completed" ? "s-ok" : s === "delivered" || s === "awaiting_payment" ? "s-wait" : s === "disputed" || s === "cancelled" || s === "refunded" ? "s-bad" : "s-go";
