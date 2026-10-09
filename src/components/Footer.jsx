import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <div className="container">
        <p>{t('footer.disclaimer')}</p>
        <p>{t('footer.privacy')}</p>
        <p className="copy">© {new Date().getFullYear()} incpage</p>
      </div>
    </footer>
  );
}
