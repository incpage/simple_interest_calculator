import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import te from '../locales/te/translation.json';
import hi from '../locales/hi/translation.json';

// To add a language: create src/locales/<code>/translation.json, import it,
// then add it to RESOURCES and LANGUAGES (and to LOCALES in currencyFormatter.js).
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
];
const RESOURCES = { en: { translation: en }, te: { translation: te }, hi: { translation: hi } };
const KEY = 'ic.language';

const saved = () => {
  try {
    const v = localStorage.getItem(KEY);
    return LANGUAGES.some((l) => l.code === v) ? v : 'en';
  } catch { return 'en'; }
};

i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: saved(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem(KEY, lng); } catch { /* ignore */ }
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
});
if (typeof document !== 'undefined') document.documentElement.lang = i18n.language;

export default i18n;
