import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header.jsx';
import CalculatorForm from './components/CalculatorForm.jsx';
import ResultsSummary from './components/ResultsSummary.jsx';
import DurationDetails from './components/DurationDetails.jsx';
import MonthlyBreakdown from './components/MonthlyBreakdown.jsx';
import Footer from './components/Footer.jsx';
import GoogleAd from './components/ads/GoogleAd.jsx';
import CustomAd from './components/ads/CustomAd.jsx';
import usePreference from './hooks/usePreference.js';
import { calculateInterest } from './utils/interestCalculator.js';
import { todayISO } from './utils/dateCalculations.js';
import { DEFAULT_CURRENCY } from './config/appConfig.js';

const emptyForm = () => ({ principal: '', rate: '', ratePeriod: 'monthly', from: '', to: todayISO() });

// Google AdSense and custom ads are separate components, rendered side by side.
const Ads = ({ p, className }) => (
  <>
    <GoogleAd placement={p} className={className} />
    <CustomAd placement={p} className={className} />
  </>
);

export default function App() {
  const { t } = useTranslation();
  const [currency, setCurrency] = usePreference('ic.currency', DEFAULT_CURRENCY);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const calculate = () => {
    const r = calculateInterest(form);
    if (r.ok) { setErrors({}); setResult(r); }
    else { setErrors(r.errors); setResult(null); }
  };
  const reset = () => { setForm(emptyForm()); setErrors({}); setResult(null); };
  const sample = () => { setForm({ principal: '100000', rate: '1', ratePeriod: 'monthly', from: '2026-01-01', to: '2026-04-15' }); setErrors({}); setResult(null); };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header currency={currency} onCurrencyChange={setCurrency} />
      <div className="container no-print"><Ads p="header" /></div>
      <main id="main" className="container layout">
        <div className="content">
          <div className="intro no-print">
            <h1>{t('app.title')}</h1>
            <p>{t('app.tagline')}</p>
          </div>
          <div className="no-print">
            <CalculatorForm values={form} errors={errors} onChange={setForm}
                            onCalculate={calculate} onReset={reset} onSample={sample} />
          </div>
          <Ads p="calculator-bottom" />
          {result ? (
            <>
              <ResultsSummary result={result} currency={currency} onClear={() => setResult(null)} />
              <Ads p="results-middle" />
              <DurationDetails result={result} />
              <MonthlyBreakdown result={result} currency={currency} />
            </>
          ) : (
            <p className="empty card no-print">{t('results.empty')}</p>
          )}
        </div>
        <aside className="sidebar no-print"><Ads p="sidebar" /></aside>
      </main>
      <div className="container no-print"><Ads p="footer" /></div>
      <Footer />
    </>
  );
}
