// All date maths is done on calendar dates using UTC timestamps,
// so the user's timezone / daylight saving can never cause off-by-one days.
const DAY_MS = 86400000;
const pad = (n) => String(n).padStart(2, '0');

export const make = (y, m, d) => ({ y, m, d, t: Date.UTC(y, m - 1, d) });
export const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Parse "YYYY-MM-DD" strictly. Returns null for anything invalid. */
export function parseISODate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (y < 1900 || y > 2200) return null;
  const p = make(y, m, d);
  const dt = new Date(p.t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return p;
}

export const toISO = (p) => `${p.y}-${pad(p.m)}-${pad(p.d)}`;
export const todayISO = () => {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

/** Elapsed days = end - start (no extra day added). */
export const diffDays = (a, b) => Math.round((b.t - a.t) / DAY_MS);

function addMonthsClamped(p, n) {
  const total = p.y * 12 + (p.m - 1) + n;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return make(y, m, Math.min(p.d, daysInMonth(y, m)));
}

/**
 * Calendar duration convention: a month is complete when the end day-of-month
 * >= start day-of-month. Remaining days are counted from the month anchor
 * (start date + whole months, clamped to month end, e.g. 31 Jan + 1 month = 28/29 Feb).
 */
export function calendarDuration(a, b) {
  let months = (b.y - a.y) * 12 + (b.m - a.m);
  if (b.d < a.d) months -= 1;
  months = Math.max(0, months);
  const anchor = addMonthsClamped(a, months);
  return { years: Math.floor(months / 12), months: months % 12, days: diffDays(anchor, b) };
}

export const weeksAndDays = (total) => ({ weeks: Math.floor(total / 7), days: total % 7 });

/** Split [start, end) at calendar-month boundaries. */
export function splitByMonth(a, b) {
  const out = [];
  let cur = a;
  while (cur.t < b.t) {
    const nextFirst = cur.m === 12 ? make(cur.y + 1, 1, 1) : make(cur.y, cur.m + 1, 1);
    const next = nextFirst.t < b.t ? nextFirst : b;
    out.push({ start: toISO(cur), end: toISO(next), days: diffDays(cur, next) });
    cur = next;
  }
  return out;
}
