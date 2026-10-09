import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { adsConfig } from '../../config/adsConfig.js';

const validClient = (c) => /^ca-pub-\d{10,20}$/.test(c || '');
const validSlot = (s) => /^\d{6,20}$/.test(s || '') && !/^0+$/.test(s);

function loadAdSenseScript(clientId) {
  if (document.querySelector('script[data-adsense-loader]')) return; // load once
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.dataset.adsenseLoader = 'true';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  document.head.appendChild(s);
}

export default function GoogleAd({ placement, className = '' }) {
  const { t } = useTranslation();
  const cfg = adsConfig[placement];
  const active = !!cfg && cfg.enabled && validClient(cfg.clientId) && validSlot(cfg.slotId);
  const pushed = useRef(false);

  useEffect(() => {
    if (!active || pushed.current) return;
    pushed.current = true;
    loadAdSenseScript(cfg.clientId);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* blocked */ }
  }, [active, cfg]);

  if (!active) return null;
  return (
    <aside className={`ad no-print ${className}`} aria-label={t('ads.label')} style={{ minHeight: cfg.minHeight }}>
      <span className="ad-label">{t('ads.label')}</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: cfg.minHeight }}
        data-ad-client={cfg.clientId}
        data-ad-slot={cfg.slotId}
        data-ad-format={cfg.format}
        data-full-width-responsive={cfg.responsive ? 'true' : 'false'}
      />
    </aside>
  );
}
