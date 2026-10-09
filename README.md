# Interest Calculator (incpage)

Multilingual (English / తెలుగు / हिन्दी) simple-interest calculator built with React + Vite.
All calculations run in the browser. No backend, no tracking, no calculation history stored.

## 1. Install Node.js
Install Node.js **18 or newer** (LTS) from https://nodejs.org, then check: `node -v && npm -v`.

## 2. Commands
```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:5173
npm test             # run automated tests (Vitest)
npm run build        # production build -> dist/
npm run preview      # preview the production build
```

## 3. Calculation rules
- `Interest = Principal × Rate/100 × Days/365`; `Total = Principal + Interest`
- `Monthly interest = Principal × Rate ÷ (100 × 12)`
- `Days = End date − Start date` (no extra day added). Dates are handled as UTC calendar dates, so timezones never shift a day.
- Calendar duration: a month is complete when end day ≥ start day; leftover days are counted from the month anchor (start + whole months, clamped to month end).
- Month-by-month table splits the range at calendar-month boundaries. Segment interest = difference of rounded cumulative interest, so segments always sum exactly to the total.
- Rounding: full precision internally, rounded to 2 decimals for results.
- Changing currency or language **never** converts amounts or changes calculations.

## 4. Settings (`src/config/appConfig.js`)
| Setting | How |
|---|---|
| Day-count convention | `DAY_COUNT_BASIS = 365` → change to `366`, rebuild. Shown in the UI and used everywhere. |
| Default currency | `DEFAULT_CURRENCY = 'INR'` → `'USD'` |
| Limits | `MAX_PRINCIPAL`, `MAX_RATE` |

## 5. Add a new language
1. Copy `src/locales/en/translation.json` to `src/locales/<code>/translation.json` and translate.
2. In `src/i18n/i18n.js` import it, add to `RESOURCES` and `LANGUAGES`.
3. In `src/utils/currencyFormatter.js` add `<code>: '<locale>'` to `LOCALES` (e.g. `ta: 'ta-IN'`).

## 6. Google AdSense (`src/config/adsConfig.js`)
1. Get your AdSense account approved and add your site in AdSense.
2. Paste your publisher ID into `PUBLISHER_ID` (`ca-pub-…`). The default `ca-pub-XXXXXXXXXXXXXXXX` is a **placeholder**.
3. Create an ad unit per placement; paste its numeric ID into `slot('<SLOT_ID>', height)` and set `enabled: true`.
   Placements: `header`, `calculator-bottom`, `results-middle`, `sidebar` (desktop only), `footer`.
4. Rebuild and deploy. Nothing renders (and no script loads) until valid IDs are set and `enabled` is true.
5. Add your `ads.txt` to `public/ads.txt` (AdSense gives you the line), and show a consent banner (CMP) if you serve users in the EEA/UK.
The script is injected once; ads are never placed inside inputs and space is reserved to avoid layout shift.

## 7. Custom (paid) ads (`src/config/customAdsConfig.js`)
Each entry in `customAds`:
```js
{
  enabled: true,                         // true/false to show/hide
  title: 'Sri Lakshmi Tailors',          // title
  description: 'Custom stitching in Hyderabad.', // description
  imageUrl: 'https://yoursite.com/ad.jpg', // image (https); "" = text-only card
  destinationUrl: 'https://client.com',  // opens in new tab; "" = use mailto
  callToAction: 'Visit Website',         // button text
  contactEmail: 'ads@yourdomain.com',    // mailto contact
  placement: 'results-middle',           // header | calculator-bottom | results-middle | sidebar | footer
  startDate: '2026-11-01',               // "" = no start limit
  endDate: '2026-11-30',                 // "" = no end limit
}
```
- **Add a second ad:** add another object to the array (use another placement, or the first match in the same placement is shown).
- **Remove safely:** set `enabled: false` (or delete the object). The footer falls back to the “Advertise With Us” card in `defaultAdCard`; set its `enabled: false` to hide it.
- **When a business pays:** copy their details into a new object, set dates for the paid period, rebuild, redeploy.
- Ads are labelled “Advertisement” (translated).
- **Important:** this is a local config file – changes need a code edit, rebuild and redeploy. It is *not* a web dashboard. A no-code dashboard would need a backend API + database, admin authentication, image upload storage, and the site fetching ads from that API.

## 8. Deploy to Nginx
```bash
npm ci && npm run build
sudo mkdir -p /var/www/interest-calculator && sudo cp -r dist /var/www/interest-calculator/
sudo cp nginx.conf /etc/nginx/sites-available/interest-calculator   # edit server_name
sudo ln -s /etc/nginx/sites-available/interest-calculator /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
`nginx.conf` includes `try_files … /index.html` so refreshes never 404.

**Custom domain:** point an `A` record (and `www`) to your server IP, then set `server_name` in `nginx.conf`.
**HTTPS:** `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d example.com -d www.example.com`

## 9. Privacy
Principal, rate and dates never leave the browser. Only language and currency preferences are saved in localStorage.

## 10. Test status
`npm test` → 17 tests passing; `npm run build` succeeds (verified when this package was generated).
