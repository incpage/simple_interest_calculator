import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone } from 'lucide-react';
import { customAds, defaultAdCard } from '../../config/customAdsConfig.js';
import { todayISO } from '../../utils/dateCalculations.js';

const isHttp = (u) => /^https?:\/\//i.test(u || '');
const inRange = (ad, today) => (!ad.startDate || today >= ad.startDate) && (!ad.endDate || today <= ad.endDate);

export default function CustomAd({ placement, className = '' }) {
  const { t } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);
  const today = todayISO();

  let ad = customAds.find((a) => a.enabled && a.placement === placement && inRange(a, today));
  let isDefault = false;
  if (!ad && defaultAdCard.enabled && defaultAdCard.placement === placement) {
    isDefault = true;
    ad = { title: t('ads.advertiseTitle'), description: t('ads.advertiseDesc'), callToAction: t('ads.contact'),
           contactEmail: defaultAdCard.contactEmail, imageUrl: '', destinationUrl: '' };
  }
  if (!ad) return null;

  const external = isHttp(ad.destinationUrl);
  const href = external ? ad.destinationUrl : ad.contactEmail ? `mailto:${ad.contactEmail}` : null;
  const showImg = isHttp(ad.imageUrl) && !imgFailed;

  return (
    <aside className={`ad custom-ad no-print ${className}`} aria-label={t('ads.label')}>
      <span className="ad-label">{t('ads.label')}</span>
      <div className="custom-ad-body">
        {showImg ? (
          <img src={ad.imageUrl} alt={ad.title} loading="lazy" onError={() => setImgFailed(true)} />
        ) : (
          <Megaphone aria-hidden="true" className="custom-ad-icon" />
        )}
        <div>
          <h3>{ad.title}</h3>
          <p>{ad.description}</p>
          {href && (
            <a className="btn btn-accent btn-sm" href={href}
               {...(external ? { target: '_blank', rel: 'noopener noreferrer sponsored' } : {})}>
              {ad.callToAction}
            </a>
          )}
          {!isDefault && ad.contactEmail && external && (
            <a className="ad-contact" href={`mailto:${ad.contactEmail}`}>{ad.contactEmail}</a>
          )}
        </div>
      </div>
    </aside>
  );
}
