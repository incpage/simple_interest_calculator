import { describe, it, expect } from 'vitest';
import { calculateInterest, validateInputs } from '../src/utils/interestCalculator.js';
import { parseISODate, calendarDuration, weeksAndDays } from '../src/utils/dateCalculations.js';
import { formatCurrency } from '../src/utils/currencyFormatter.js';
import i18n from '../src/i18n/i18n.js';

// Convention for all tests: Interest = P x R/100 x Days/365 (days = end - start)
const calc = (principal, rate, from, to, opts) => calculateInterest({ principal, rate, rateType: 'annual', from, to }, opts);

describe('simple interest engine', () => {
  it('1. one year = 12000 interest, 112000 total', () => {
    const r = calc('100000', '12', '2025-01-01', '2026-01-01');
    expect(r.totalDays).toBe(365);
    expect(r.interest).toBe(12000);
    expect(r.total).toBe(112000);
    expect(r.monthlyInterest).toBe(1000);
  });
  it('2. one month (31 days)', () => {
    const r = calc('100000', '12', '2026-01-01', '2026-02-01');
    expect(r.totalDays).toBe(31);
    expect(r.interest).toBe(1019.18);
    expect(r.calendar).toEqual({ years: 0, months: 1, days: 0 });
  });
  it('3. one day', () => {
    const r = calc('100000', '12', '2026-01-01', '2026-01-02');
    expect(r.totalDays).toBe(1);
    expect(r.interest).toBe(32.88);
  });
  it('4. zero-day period gives zero interest and no segments', () => {
    const r = calc('100000', '12', '2026-01-01', '2026-01-01');
    expect(r.totalDays).toBe(0);
    expect(r.interest).toBe(0);
    expect(r.total).toBe(100000);
    expect(r.segments).toEqual([]);
  });
  it('5. leap-year range uses 366 elapsed days; basis is explicit, not silent', () => {
    const r365 = calc('100000', '12', '2024-01-01', '2025-01-01');
    expect(r365.totalDays).toBe(366);
    expect(r365.interest).toBe(12032.88);
    const r366 = calc('100000', '12', '2024-01-01', '2025-01-01', { basis: 366 });
    expect(r366.interest).toBe(12000);
  });
  it('6. multi-year range', () => {
    const r = calc('50000', '10', '2023-03-15', '2026-03-15');
    expect(r.totalDays).toBe(1096);
    expect(r.calendar).toEqual({ years: 3, months: 0, days: 0 });
  });
  it('7. partial calendar month is charged only for its days', () => {
    const r = calc('100000', '12', '2026-01-20', '2026-02-10');
    expect(r.segments.map((s) => s.days)).toEqual([12, 9]);
    expect(r.segments[0].interest).toBe(394.52);
  });
  it('7b. documented example 01 Jan - 15 Apr 2026', () => {
    const r = calc('100000', '12', '2026-01-01', '2026-04-15');
    expect(r.totalDays).toBe(104);
    expect(r.calendar).toEqual({ years: 0, months: 3, days: 14 });
    expect(r.weeks).toEqual({ weeks: 14, days: 6 });
  });
  it('8. start date later than end date is rejected', () => {
    const r = calc('1000', '5', '2026-05-01', '2026-04-01');
    expect(r.ok).toBe(false);
    expect(r.errors.to).toBe('toBeforeFrom');
  });
  it('9. zero interest rate', () => {
    const r = calc('1000', '0', '2026-01-01', '2026-06-01');
    expect(r.interest).toBe(0);
    expect(r.total).toBe(1000);
  });
  it('10. decimal principal and rate', () => {
    const r = calc('12345.67', '7.5', '2025-01-01', '2026-01-01');
    expect(r.interest).toBe(925.93);
    expect(r.total).toBe(13271.6);
  });
  it('11. invalid numeric inputs', () => {
    const base = { from: '2026-01-01', to: '2026-02-01' };
    expect(validateInputs({ ...base, principal: '', rate: '5' }).principal).toBe('principalRequired');
    expect(validateInputs({ ...base, principal: 'abc', rate: '5' }).principal).toBe('principalInvalid');
    expect(validateInputs({ ...base, principal: '1e999', rate: '5' }).principal).toBe('principalInvalid');
    expect(validateInputs({ ...base, principal: '0', rate: '5' }).principal).toBe('principalPositive');
    expect(validateInputs({ ...base, principal: '-5', rate: '5' }).principal).toBe('principalPositive');
    expect(validateInputs({ ...base, principal: '1e15', rate: '5' }).principal).toBe('principalTooLarge');
    expect(validateInputs({ ...base, principal: '10', rate: '' }).rate).toBe('rateRequired');
    expect(validateInputs({ ...base, principal: '10', rate: '-1' }).rate).toBe('rateNegative');
    expect(validateInputs({ ...base, principal: '10', rate: '5', from: '2026-02-30' }).from).toBe('fromInvalid');
    expect(validateInputs({ ...base, principal: '10', rate: '5', to: 'xx' }).to).toBe('toInvalid');
    expect(validateInputs({ ...base, principal: '10', rate: '5' }, 360).config).toBe('configInvalid');
  });
  it('12. month-by-month interest sums to total interest', () => {
    for (const [p, rt, a, b] of [
      ['100000', '12', '2026-01-01', '2026-04-15'],
      ['33333.33', '7.77', '2023-11-17', '2026-09-03'],
      ['999.99', '18.5', '2024-01-31', '2024-03-01'],
    ]) {
      const r = calc(p, rt, a, b);
      const sum = r.segments.reduce((s, x) => s + x.interest, 0);
      expect(Math.round(sum * 100) / 100).toBe(r.interest);
      expect(r.segments.reduce((s, x) => s + x.days, 0)).toBe(r.totalDays);
      expect(r.segments.at(-1).cumulative).toBe(r.interest);
    }
  });
});

describe('date helpers', () => {
  it('month-end convention', () => {
    expect(calendarDuration(parseISODate('2026-01-31'), parseISODate('2026-02-28'))).toEqual({ years: 0, months: 0, days: 28 });
    expect(calendarDuration(parseISODate('2024-02-29'), parseISODate('2025-02-28'))).toEqual({ years: 0, months: 11, days: 30 });
  });
  it('weeks', () => expect(weeksAndDays(104)).toEqual({ weeks: 14, days: 6 }));
});

describe('currency formatting', () => {
  it('13. INR and USD', () => {
    expect(formatCurrency(100000, 'INR', 'en')).toBe('₹1,00,000.00');
    expect(formatCurrency(100000, 'USD', 'en')).toBe('$100,000.00');
    expect(formatCurrency(NaN, 'INR', 'en')).toBe('₹0.00');
  });
});

describe('language independence', () => {
  it('14. switching language never changes calculated values', async () => {
    await i18n.changeLanguage('en');
    const before = calc('100000', '12', '2026-01-01', '2026-04-15');
    const enTitle = i18n.t('app.title');
    for (const lng of ['te', 'hi', 'en']) {
      await i18n.changeLanguage(lng);
      expect(calc('100000', '12', '2026-01-01', '2026-04-15')).toEqual(before);
    }
    await i18n.changeLanguage('te');
    expect(i18n.t('app.title')).not.toBe(enTitle);
  });
});

describe('monthly rate (default)', () => {
  const m = (p, r, a, b) => calculateInterest({ principal: p, rate: r, rateType: 'monthly', from: a, to: b });
  it('100 at 2% per month for 1 month = 2', () => {
    const r = m('100', '2', '2026-01-01', '2026-02-01');
    expect(r.interest).toBe(2);
    expect(r.total).toBe(102);
    expect(r.monthlyInterest).toBe(2);
  });
  it('30 days counts as one month of interest', () => {
    expect(m('100', '2', '2026-01-01', '2026-01-31').interest).toBe(2);
    expect(m('100', '2', '2026-01-01', '2026-01-16').interest).toBe(1);
  });
  it('3 months 14 days', () => {
    expect(m('100000', '2', '2026-01-01', '2026-04-15').interest).toBe(6933.33);
  });
  it('monthly is the default when rateType is omitted', () => {
    const r = calculateInterest({ principal: '100', rate: '2', from: '2026-01-01', to: '2026-02-01' });
    expect(r.rateType).toBe('monthly');
    expect(r.interest).toBe(2);
  });
  it('annual 24% shows the same 2.00 monthly interest on 100', () => {
    expect(calc('100', '24', '2026-01-01', '2026-02-01').monthlyInterest).toBe(2);
  });
  it('segments sum to total in monthly mode', () => {
    const r = m('12345.67', '1.75', '2025-11-17', '2026-09-03');
    expect(Math.round(r.segments.reduce((s, x) => s + x.interest, 0) * 100) / 100).toBe(r.interest);
  });
  it('rejects an unknown rate type', () => {
    expect(calculateInterest({ principal: '1', rate: '1', rateType: 'weekly', from: '2026-01-01', to: '2026-02-01' }).ok).toBe(false);
  });
});
