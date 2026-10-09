import { DAY_COUNT_BASIS, MAX_PRINCIPAL, MAX_RATE } from '../config/appConfig.js';
import { parseISODate, diffDays, calendarDuration, weeksAndDays, splitByMonth } from './dateCalculations.js';

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Interest = Principal x Rate/100 x Days/basis  (full precision, unrounded). */
export const interestFor = (principal, rate, days, basis = DAY_COUNT_BASIS) =>
  (principal * rate * days) / (100 * basis);

function parseNumber(v) {
  const s = String(v ?? '').trim();
  if (s === '') return { empty: true };
  const n = Number(s);
  return Number.isFinite(n) ? { value: n } : { invalid: true };
}

/** Returns an object of error keys (translated in the UI). Empty object = valid. */
export function validateInputs({ principal, rate, from, to }, basis = DAY_COUNT_BASIS) {
  const errors = {};
  const p = parseNumber(principal);
  if (p.empty) errors.principal = 'principalRequired';
  else if (p.invalid) errors.principal = 'principalInvalid';
  else if (p.value <= 0) errors.principal = 'principalPositive';
  else if (p.value > MAX_PRINCIPAL) errors.principal = 'principalTooLarge';

  const r = parseNumber(rate);
  if (r.empty) errors.rate = 'rateRequired';
  else if (r.invalid) errors.rate = 'rateInvalid';
  else if (r.value < 0) errors.rate = 'rateNegative';
  else if (r.value > MAX_RATE) errors.rate = 'rateTooLarge';

  const a = parseISODate(from);
  const b = parseISODate(to);
  if (!a) errors.from = 'fromInvalid';
  if (!b) errors.to = 'toInvalid';
  if (a && b && b.t < a.t) errors.to = 'toBeforeFrom';
  if (basis !== 365 && basis !== 366) errors.config = 'configInvalid';
  return errors;
}

/** Pure calculation engine – independent of language, currency and UI. */
export function calculateInterest(input, { basis = DAY_COUNT_BASIS } = {}) {
  const errors = validateInputs(input, basis);
  if (Object.keys(errors).length) return { ok: false, errors };

  const principal = Number(String(input.principal).trim());
  const rate = Number(String(input.rate).trim());
  const a = parseISODate(input.from);
  const b = parseISODate(input.to);
  const totalDays = diffDays(a, b);

  const interest = round2(interestFor(principal, rate, totalDays, basis));
  const monthlyInterest = round2((principal * rate) / (100 * 12));

  // Segment interest = difference of rounded cumulative values, so the sum
  // of all segments always equals the total interest exactly.
  let cumulativeDays = 0;
  let previous = 0;
  const segments = splitByMonth(a, b).map((s) => {
    cumulativeDays += s.days;
    const cumulative = round2(interestFor(principal, rate, cumulativeDays, basis));
    const segmentInterest = round2(cumulative - previous);
    previous = cumulative;
    return { ...s, interest: segmentInterest, cumulative };
  });

  return {
    ok: true, principal, rate, basis,
    from: input.from, to: input.to, totalDays,
    weeks: weeksAndDays(totalDays),
    calendar: calendarDuration(a, b),
    monthlyInterest, interest,
    total: round2(principal + interest),
    segments,
  };
}
