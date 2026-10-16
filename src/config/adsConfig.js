// ===== GOOGLE ADSENSE CONFIGURATION =====
// 1. Paste YOUR publisher ID below (looks like "ca-pub-1234567890123456").
// 2. Create one ad unit per placement in AdSense and paste its numeric slot ID.
// 3. Set enabled: true for each placement you want.
// Placeholder values are never rendered as ads – nothing shows until real IDs are set.
export const PUBLISHER_ID = 'ca-pub-1249143170747032'; // <-- PASTE YOUR PUBLISHER ID

const slot = (slotId, minHeight) => ({
  enabled: true,                 // <-- set true when ready
  clientId: PUBLISHER_ID,
  slotId,                         // <-- PASTE NUMERIC SLOT ID
  format: 'auto',
  responsive: true,
  minHeight,                      // reserved space (px) to avoid layout shift
});

export const adsConfig = {
  header: slot('2880470238', 90),
  'calculator-bottom': slot('2880470238', 250),
  'results-middle': slot('2880470238', 250),
  sidebar: slot('2880470238', 600),
  footer: slot('2880470238', 90),
};
