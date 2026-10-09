import { useTranslation } from 'react-i18next';
import { Info, Calculator, RotateCcw, FlaskConical } from 'lucide-react';
import { parseISODate } from '../utils/dateCalculations.js';
import { formatDate } from '../utils/currencyFormatter.js';

function Field({ id, label, help, error, preview, children }) {
  const { t } = useTranslation();
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        <Info size={15} className="info" aria-hidden="true" title={help} />
      </label>
      {children}
      <p id={`${id}-help`} className="help">{help}</p>
      {preview && <p className="preview">{preview}</p>}
      {error && <p id={`${id}-err`} className="error" role="alert">{t(`errors.${error}`)}</p>}
    </div>
  );
}

export default function CalculatorForm({ values, errors, onChange, onCalculate, onReset, onSample }) {
  const { t, i18n } = useTranslation();
  const set = (k) => (e) => onChange({ ...values, [k]: e.target.value });
  const aria = (id, err) => ({
    'aria-invalid': !!err,
    'aria-describedby': `${id}-help${err ? ` ${id}-err` : ''}`,
  });
  const preview = (iso) => (parseISODate(iso) ? formatDate(iso, i18n.language) : '');

  return (
    <form className="card" noValidate onSubmit={(e) => { e.preventDefault(); onCalculate(); }}>
      <h2>{t('form.heading')}</h2>
      <div className="grid-2">
        <Field id="principal" label={t('form.principal')} help={t('form.principalHelp')} error={errors.principal}>
          <input id="principal" type="text" inputMode="decimal" autoComplete="off" placeholder="100000"
                 value={values.principal} onChange={set('principal')} {...aria('principal', errors.principal)} />
        </Field>
        <Field id="rate" label={t('form.rate')} help={t('form.rateHelp')} error={errors.rate || errors.ratePeriod}>
          <select id="ratePeriod" value={values.ratePeriod} onChange={set('ratePeriod')}
                  aria-label={t('form.ratePeriod')} {...aria('rate', errors.rate || errors.ratePeriod)}>
            <option value="monthly">{t('form.monthly')}</option>
            <option value="yearly">{t('form.yearly')}</option>
          </select>
          <input id="rate" type="text" inputMode="decimal" autoComplete="off"
                 placeholder={values.ratePeriod === 'yearly' ? '12' : '1'}
                 value={values.rate} onChange={set('rate')} {...aria('rate', errors.rate || errors.ratePeriod)} />
        </Field>
        <Field id="from" label={t('form.from')} help={t('form.fromHelp')} error={errors.from} preview={preview(values.from)}>
          <input id="from" type="date" value={values.from} onChange={set('from')} {...aria('from', errors.from)} />
        </Field>
        <Field id="to" label={t('form.to')} help={t('form.toHelp')} error={errors.to} preview={preview(values.to)}>
          <input id="to" type="date" value={values.to} min={values.from || undefined} onChange={set('to')} {...aria('to', errors.to)} />
        </Field>
      </div>
      <p className="note">{t('form.currencyNote')}</p>
      <div className="actions">
        <button type="submit" className="btn btn-primary"><Calculator size={18} aria-hidden="true" />{t('form.calculate')}</button>
        <button type="button" className="btn btn-outline" onClick={onReset}><RotateCcw size={18} aria-hidden="true" />{t('form.reset')}</button>
        <button type="button" className="btn btn-ghost" onClick={onSample}><FlaskConical size={18} aria-hidden="true" />{t('form.sample')}</button>
      </div>
    </form>
  );
}
