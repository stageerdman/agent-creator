/* agent-list.js: the home's pure rules, shared by the page and its tests.
 * Age and order both read createdAt, so they never disagree (00-roadmap.md, Phase 1). */

const MIN = 60e3, HOUR = 60 * MIN, DAY = 24 * HOUR, WEEK = 7 * DAY, MONTH = 30 * DAY, YEAR = 365 * DAY;

export const nameOf = a => ((a && a.draft && a.draft.name) || '').trim() || 'Untitled';
/* One plain line: markdown markers dropped (`**taxes**` reads taxes), links keep their words. */
export const plainLine = s => String(s || '')
  .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, '')
  .replace(/(\*\*|__|\*|_|~~|`+)(\S(?:.*?\S)?)\1/g, '$2')
  .replace(/\s+/g, ' ').trim();
export const descOf = a => plainLine(a && a.draft && a.draft.description);
export const isLearning = a => !!(a && a.draft && a.draft.status === 'learning');
const bornOf = a => Date.parse((a && (a.createdAt || a.updatedAt)) || '') || 0;

/* 'just now', '5 min', '3 h', '1 day', '2 days', '3 weeks', '4 months', '2 years'.
 * Whole numbers, rounded down. A future date (clock skew) is 'just now'. */
export function ageLabel(createdAt, now = Date.now()) {
  const t = typeof createdAt === 'number' ? createdAt : Date.parse(createdAt || '');
  const d = Number.isFinite(t) ? now - t : 0;
  const n = (unit, one, many) => { const k = Math.floor(d / unit); return `${k} ${k === 1 ? one : many}`; };
  if (d < MIN) return 'just now';
  if (d < HOUR) return `${Math.floor(d / MIN)} min`;
  if (d < DAY) return `${Math.floor(d / HOUR)} h`;
  if (d < WEEK) return n(DAY, 'day', 'days');
  if (d < MONTH) return n(WEEK, 'week', 'weeks');
  if (d < YEAR) return n(MONTH, 'month', 'months');
  return n(YEAR, 'year', 'years');
}

/* Newest first by createdAt; equal dates by id, so the order never flips. */
export function sortAgents(list) {
  return list.slice().sort((a, b) => (bornOf(b) - bornOf(a)) || String(a.id).localeCompare(String(b.id)));
}

/* Case- and accent-insensitive "contains" on name and description. Order kept. */
const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase();
export function filterAgents(list, query) {
  const q = fold(String(query || '').trim());
  if (!q) return list;
  return list.filter(a => fold(nameOf(a)).includes(q) || fold(descOf(a)).includes(q));
}
