import { MAX_PRINCIPAL, MAX_RATE } from '../config/appConfig.js';
import { parseISODate, diffDays, calendarDuration, daysInMonth, weeksAndDays, splitByMonth } from './dateCalculations.js';

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function parseNumber(v) {
  const s = String(v ?? '').trim();
  if (s === '') return { empty: true };
  const n = Number(s);
  return Number.isFinite(n) ? { value: n } : { invalid: true };
}

/** Returns an object of error keys (translated in the UI). Empty object = valid. */
export function validateInputs({ principal, rate, ratePeriod = 'monthly', from, to }) {
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
  if (ratePeriod !== 'monthly' && ratePeriod !== 'yearly') errors.ratePeriod = 'ratePeriodInvalid';

  const a = parseISODate(from);
  const b = parseISODate(to);
  if (!a) errors.from = 'fromInvalid';
  if (!b) errors.to = 'toInvalid';
  if (a && b && b.t < a.t) errors.to = 'toBeforeFrom';
  return errors;
}

/** Pure calculation engine – independent of language, currency and UI. */
export function calculateInterest(input) {
  const errors = validateInputs(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const principal = Number(String(input.principal).trim());
  const rate = Number(String(input.rate).trim());
  const ratePeriod = input.ratePeriod ?? 'monthly';
  const monthlyRate = ratePeriod === 'yearly' ? rate / 12 : rate;
  const a = parseISODate(input.from);
  const b = parseISODate(input.to);
  const totalDays = diffDays(a, b);

  // Each calendar month's simple interest is prorated by the portion of that
  // month in the selected date range.
  let cumulativeInterest = 0;
  let previous = 0;
  const segments = splitByMonth(a, b).map((s) => {
    const segmentStart = parseISODate(s.start);
    const daysInSegmentMonth = daysInMonth(segmentStart.y, segmentStart.m);
    cumulativeInterest += (principal * monthlyRate * s.days) / (100 * daysInSegmentMonth);
    const cumulative = round2(cumulativeInterest);
    const segmentInterest = round2(cumulative - previous);
    previous = cumulative;
    return { ...s, interest: segmentInterest, cumulative };
  });
  const interest = previous;
  const monthlyInterest = round2((principal * monthlyRate) / 100);

  return {
    ok: true, principal, rate, ratePeriod, monthlyRate,
    from: input.from, to: input.to, totalDays,
    weeks: weeksAndDays(totalDays),
    calendar: calendarDuration(a, b),
    monthlyInterest, interest,
    total: round2(principal + interest),
    segments,
  };
}
