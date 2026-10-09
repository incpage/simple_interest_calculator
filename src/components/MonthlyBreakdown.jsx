import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate, formatMonth, formatNumber } from '../utils/currencyFormatter.js';

export default function MonthlyBreakdown({ result, currency }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const lang = i18n.language;
  return (
    <section className="card">
      <div className="row-between">
        <h2>{t('breakdown.title')}</h2>
        <button type="button" className="btn btn-outline btn-sm" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? t('breakdown.hide') : t('breakdown.show')}
        </button>
      </div>
      {open && (result.segments.length === 0 ? (
        <p className="note">{t('results.zeroDays')}</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t('breakdown.month')}</th><th>{t('breakdown.start')}</th><th>{t('breakdown.end')}</th>
                <th className="num">{t('breakdown.days')}</th><th className="num">{t('breakdown.interest')}</th>
                <th className="num">{t('breakdown.cumulative')}</th>
              </tr>
            </thead>
            <tbody>
              {result.segments.map((s) => (
                <tr key={s.start}>
                  <td>{formatMonth(s.start, lang)}</td>
                  <td>{formatDate(s.start, lang)}</td>
                  <td>{formatDate(s.end, lang)}</td>
                  <td className="num">{formatNumber(s.days, lang, 0)}</td>
                  <td className="num">{formatCurrency(s.interest, currency, lang)}</td>
                  <td className="num">{formatCurrency(s.cumulative, currency, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
