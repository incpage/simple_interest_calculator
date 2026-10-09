export const SUPPORTED_CURRENCIES = ['INR', 'USD'];

const LOCALES = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };

/** USD with English uses US grouping (1,000,000); everything else follows the UI language. */
export const localeFor = (lang = 'en', currency = 'INR') =>
  lang === 'en' && currency === 'USD' ? 'en-US' : LOCALES[lang] || 'en-IN';

export const formatCurrency = (value, currency = 'INR', lang = 'en') => {
  const v = Number.isFinite(value) ? value : 0; // never show NaN/Infinity
  return new Intl.NumberFormat(localeFor(lang, currency), {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(v);
};

export const formatNumber = (value, lang = 'en', max = 4) =>
  new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: max }).format(Number.isFinite(value) ? value : 0);

const utc = (iso) => new Date(`${iso}T00:00:00Z`);

export const formatDate = (iso, lang = 'en') =>
  new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'long', timeZone: 'UTC' }).format(utc(iso));

export const formatMonth = (iso, lang = 'en') =>
  new Intl.DateTimeFormat(localeFor(lang), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utc(iso));
