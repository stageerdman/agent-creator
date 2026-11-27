// A score an AI wrote, made safe: a number clamped to 0..max and rounded,
// or null when it isn't a number at all (so the caller can reject it).
export function scoreIn(value, max = 100) {
  const number = typeof value === "string" ? Number(value) : value;
  if (typeof number !== "number" || !Number.isFinite(number)) return null;
  return Math.round(Math.min(max, Math.max(0, number)));
}

export const reasonOf = (value) => (typeof value === "string" ? value.trim() : "");
