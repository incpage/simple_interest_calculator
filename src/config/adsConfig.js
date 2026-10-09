// ===== GOOGLE ADSENSE CONFIGURATION =====
// 1. Paste YOUR publisher ID below (looks like "ca-pub-1234567890123456").
// 2. Create one ad unit per placement in AdSense and paste its numeric slot ID.
// 3. Set enabled: true for each placement you want.
// Placeholder values are never rendered as ads – nothing shows until real IDs are set.
export const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; // <-- PASTE YOUR PUBLISHER ID

const slot = (slotId, minHeight) => ({
  enabled: false,                 // <-- set true when ready
  clientId: PUBLISHER_ID,
  slotId,                         // <-- PASTE NUMERIC SLOT ID
  format: 'auto',
  responsive: true,
  minHeight,                      // reserved space (px) to avoid layout shift
});

export const adsConfig = {
  header: slot('0000000000', 90),
  'calculator-bottom': slot('0000000000', 250),
  'results-middle': slot('0000000000', 250),
  sidebar: slot('0000000000', 600),
  footer: slot('0000000000', 90),
};
