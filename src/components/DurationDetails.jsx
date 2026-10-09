import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '../utils/currencyFormatter.js';

export default function DurationDetails({ result }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const n = (v) => formatNumber(v, lang, 0);
  const rows = [
    [t('results.start'), formatDate(result.from, lang)],
    [t('results.end'), formatDate(result.to, lang)],
    [t('results.totalDays'), t('results.daysValue', { n: n(result.totalDays) })],
    [t('results.weeks'), t('results.weeksValue', { weeks: n(result.weeks.weeks), days: n(result.weeks.days) })],
    [t('results.calendar'), t('results.calendarValue', { years: n(result.calendar.years), months: n(result.calendar.months), days: n(result.calendar.days) })],
  ];
  return (
    <section className="card">
      <h2>{t('results.durationTitle')}</h2>
      <dl className="rows">
        {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
    </section>
  );
}
