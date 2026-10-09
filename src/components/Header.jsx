import { useTranslation } from 'react-i18next';
import { Globe, Coins } from 'lucide-react';
import { LANGUAGES } from '../i18n/i18n.js';
import { SUPPORTED_CURRENCIES } from '../utils/currencyFormatter.js';

export default function Header({ currency, onCurrencyChange }) {
  const { t, i18n } = useTranslation();
  return (
    <header className="site-header no-print">
      <div className="container header-inner">
        <img className="logo" src="/logo.jpeg" alt="incpage" width="168" height="56" />
        <div className="header-controls">
          <label className="select-wrap">
            <Globe size={16} aria-hidden="true" />
            <span className="sr-only">{t('header.language')}</span>
            <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </label>
          <label className="select-wrap">
            <Coins size={16} aria-hidden="true" />
            <span className="sr-only">{t('header.currency')}</span>
            <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)}>
              {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
