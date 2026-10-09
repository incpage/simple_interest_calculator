import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Download, Printer, X } from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../utils/currencyFormatter.js';

export default function ResultsSummary({ result, currency, onClear }) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const lang = i18n.language;
  const money = (v) => formatCurrency(v, currency, lang);
  const num = (v) => formatNumber(v, lang);
  const days = t('results.daysValue', { n: formatNumber(result.totalDays, lang, 0) });
  const rateUnit = result.ratePeriod === 'yearly' ? t('results.ratePeriodYearly') : t('results.ratePeriodMonthly');
  const formula = `${t('results.rateValue', { rate: num(result.rate), period: rateUnit })} · ${t('results.monthlyRate')}: ${num(result.monthlyRate)}%`;

  const lines = [
    t('app.title'),
    `${t('results.start')}: ${formatDate(result.from, lang)}`,
    `${t('results.end')}: ${formatDate(result.to, lang)}`,
    `${t('results.principal')}: ${money(result.principal)}`,
    `${t('results.rate')}: ${t('results.rateValue', { rate: num(result.rate), period: rateUnit })}`,
    `${t('results.monthly')}: ${money(result.monthlyInterest)}`,
    `${t('results.totalDays')}: ${days}`,
    `${t('results.interest')}: ${money(result.interest)}`,
    `${t('results.payable')}: ${money(result.total)}`,
    formula,
    t('results.notBinding'),
  ];
  const text = lines.join('\n');

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* clipboard unavailable */ }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'interest-calculation.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    [t('results.principal'), money(result.principal)],
    [t('results.rate'), t('results.rateValue', { rate: num(result.rate), period: rateUnit })],
    [t('results.monthly'), money(result.monthlyInterest), t('results.monthlyHelp')],
    [t('results.interest'), money(result.interest)],
  ];
  const breakdown = [
    [t('results.principal'), money(result.principal)],
    [t('results.rate'), t('results.rateValue', { rate: num(result.rate), period: rateUnit })],
    [t('results.monthly'), money(result.monthlyInterest)],
    [t('results.totalDays'), days],
    [t('results.interest'), money(result.interest)],
    [t('results.payable'), money(result.total)],
  ];

  return (
    <section className="results" aria-live="polite">
      <div className="row-between">
        <h2>{t('results.title')}</h2>
        <div className="actions no-print">
          <button type="button" className="btn btn-outline btn-sm" onClick={copy}>
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? t('results.copied') : t('results.copy')}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={download}><Download size={16} aria-hidden="true" />{t('results.download')}</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={16} aria-hidden="true" />{t('results.print')}</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}><X size={16} aria-hidden="true" />{t('results.clear')}</button>
        </div>
      </div>

      <div className="cards">
        {cards.map(([label, value, hint]) => (
          <div className="stat" key={label} title={hint}>
            <span>{label}</span><strong>{value}</strong>
          </div>
        ))}
        <div className="stat stat-final">
          <span>{t('results.finalAmount')}</span><strong>{money(result.total)}</strong>
        </div>
      </div>

      {result.totalDays === 0 && <p className="note">{t('results.zeroDays')}</p>}

      <div className="card">
        <h3>{t('results.breakdownTitle')}</h3>
        <dl className="rows">
          {breakdown.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>
      </div>

      <div className="card">
        <h3>{t('results.formulaTitle')}</h3>
        <p className="formula">{t('results.formulaGeneric')}</p>
        <p className="formula formula-values">{formula}</p>
        <p className="note">{t('results.monthlyCalculationNote')}</p>
      </div>

      <div className="card final-summary">
        <h3>{t('results.summaryTitle')}</h3>
        <div className="final-grid">
          <div><span>{t('results.principal')}</span><strong>{money(result.principal)}</strong></div>
          <div><span>{t('results.interest')}</span><strong>{money(result.interest)}</strong></div>
          <div className="payable"><span>{t('results.payable')}</span><strong>{money(result.total)}</strong></div>
        </div>
        <p className="note">{t('results.notBinding')}</p>
      </div>
    </section>
  );
}
