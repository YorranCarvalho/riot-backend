export function normalizeRole(teamPosition?: string, lane?: string) {
  return teamPosition || lane || "UNKNOWN";
}