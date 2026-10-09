// ===== CUSTOM (PAID) ADVERTISEMENTS =====
// Placements: 'header' | 'calculator-bottom' | 'results-middle' | 'sidebar' | 'footer'
// Dates are "YYYY-MM-DD"; leave "" for no limit. Editing this file requires a rebuild + redeploy.
export const customAds = [
  {
    enabled: true,
    title: 'Advertise With Us',
    description: 'Promote your business to our audience.',
    imageUrl: '',                          // e.g. 'https://yoursite.com/banner.jpg' (https only)
    destinationUrl: '',                    // e.g. 'https://client-website.com'
    callToAction: 'Contact Us',
    contactEmail: 'ads@example.com',       // <-- your email (used when destinationUrl is empty)
    placement: 'calculator-bottom',
    startDate: '',
    endDate: '',
  },
];

// Shown in the footer slot when no custom ad matches. Set enabled:false to hide.
export const defaultAdCard = {
  enabled: true,
  placement: 'footer',
  contactEmail: 'ads@example.com',
};
