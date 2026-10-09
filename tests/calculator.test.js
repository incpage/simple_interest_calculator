import { describe, it, expect } from 'vitest';
import { calculateInterest, validateInputs } from '../src/utils/interestCalculator.js';
import { parseISODate, calendarDuration, weeksAndDays } from '../src/utils/dateCalculations.js';
import { formatCurrency } from '../src/utils/currencyFormatter.js';
import i18n from '../src/i18n/i18n.js';

const calc = (principal, rate, from, to, ratePeriod = 'yearly') =>
  calculateInterest({ principal, rate, ratePeriod, from, to });

describe('simple interest engine', () => {
  it('1. one year = 12000 interest, 112000 total', () => {
    const r = calc('100000', '12', '2025-01-01', '2026-01-01');
    expect(r.totalDays).toBe(365);
    expect(r.interest).toBe(12000);
    expect(r.total).toBe(112000);
    expect(r.monthlyInterest).toBe(1000);
  });
  it('2. one month uses the monthly equivalent of the yearly rate', () => {
    const r = calc('100000', '12', '2026-01-01', '2026-02-01');
    expect(r.totalDays).toBe(31);
    expect(r.interest).toBe(1000);
    expect(r.calendar).toEqual({ years: 0, months: 1, days: 0 });
  });
  it('3. one day', () => {
    const r = calc('100000', '12', '2026-01-01', '2026-01-02');
    expect(r.totalDays).toBe(1);
    expect(r.interest).toBe(32.26);
  });
  it('4. zero-day period gives zero interest and no segments', () => {
    const r = calc('100000', '12', '2026-01-01', '2026-01-01');
    expect(r.totalDays).toBe(0);
    expect(r.interest).toBe(0);
    expect(r.total).toBe(100000);
    expect(r.segments).toEqual([]);
  });
  it('5. leap-year range accrues one monthly rate for each calendar month', () => {
    const r = calc('100000', '12', '2024-01-01', '2025-01-01');
    expect(r.totalDays).toBe(366);
    expect(r.interest).toBe(12000);
  });
  it('6. multi-year range', () => {
    const r = calc('50000', '10', '2023-03-15', '2026-03-15');
    expect(r.totalDays).toBe(1096);
    expect(r.calendar).toEqual({ years: 3, months: 0, days: 0 });
  });
  it('7. partial calendar month is charged only for its days', () => {
    const r = calc('100000', '12', '2026-01-20', '2026-02-10');
    expect(r.segments.map((s) => s.days)).toEqual([12, 9]);
    expect(r.segments[0].interest).toBe(387.1);
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
    expect(validateInputs({ ...base, principal: '10', rate: '5', ratePeriod: 'daily' }).ratePeriod).toBe('ratePeriodInvalid');
  });
  it('monthly rate is the default and yearly rates convert to an equivalent monthly rate', () => {
    const monthly = calculateInterest({
      principal: '100000', rate: '1', from: '2026-01-01', to: '2026-02-01',
    });
    const yearly = calc('100000', '12', '2026-01-01', '2026-02-01', 'yearly');
    expect(monthly.ok).toBe(true);
    expect(monthly.ratePeriod).toBe('monthly');
    expect(monthly.monthlyRate).toBe(1);
    expect(monthly.interest).toBe(1000);
    expect(yearly.interest).toBe(monthly.interest);
  });
  it('prorates a monthly rate by the actual number of days in a partial calendar month', () => {
    const r = calculateInterest({
      principal: '100000', rate: '1', from: '2026-01-01', to: '2026-01-16',
    });
    expect(r.interest).toBe(483.87);
    expect(r.monthlyInterest).toBe(1000);
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
