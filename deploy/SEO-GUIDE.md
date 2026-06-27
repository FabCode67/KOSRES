# KOSRES.COM — SEO & DNS Setup Guide
# Domain: kosres.com (Namecheap)

## ════════════════════════════════════════════
## STEP 1 — Namecheap DNS Configuration
## ════════════════════════════════════════════

Login → https://ap.www.namecheap.com
→ Domain List → kosres.com → Manage → Advanced DNS

### Delete all existing records, then add:

| Type  | Host | Value                    | TTL  |
|-------|------|--------------------------|------|
| A     | @    | YOUR_HETZNER_IP          | Auto |
| A     | www  | YOUR_HETZNER_IP          | Auto |
| CNAME | api  | kosres.com               | Auto |

### Email (optional — for admin@kosres.com)
| Type | Host | Value | Priority |
|------|------|-------|----------|
| MX   | @    | mail.kosres.com | 10 |

→ Click "Save All Changes"
→ Wait 5–30 minutes for DNS propagation
→ Check at: https://dnschecker.org/#A/kosres.com


## ════════════════════════════════════════════
## STEP 2 — Google Search Console Setup
## ════════════════════════════════════════════

### 2a. Add your property
1. Go to https://search.google.com/search-console
2. Click "Add property"
3. Choose "Domain" type → enter: kosres.com
4. Google gives you a TXT record to add

### 2b. Add the TXT record in Namecheap
| Type | Host | Value                    |
|------|------|--------------------------|
| TXT  | @    | google-site-verification=XXXX |

→ Save in Namecheap
→ Go back to Search Console → Verify

### 2c. Update layout.tsx with your verification code
In C:\Users\ericn\Documents\KOSRES\client\app\layout.tsx:
  verification: {
    google: "YOUR_ACTUAL_CODE_HERE",   ← replace this
  }

### 2d. Submit sitemap
In Search Console → Sitemaps → Add:
  https://www.kosres.com/sitemap.xml
→ Submit

### 2e. Request indexing for key pages
In Search Console → URL Inspection:
  https://www.kosres.com
  https://www.kosres.com/properties
  https://www.kosres.com/services/buy-sell-rent
→ "Request Indexing" for each


## ════════════════════════════════════════════
## STEP 3 — Google Business Profile
## ════════════════════════════════════════════

1. Go to https://business.google.com
2. Sign in with your Google account
3. Add business:
   - Business name: KOSRES LTD
   - Category: Real Estate Agency
   - Phone: +250 792 871 729
   - Website: https://www.kosres.com
   - Address: BEATITUDE HOUSE, 4th Floor, KN87 Street, Kigali, Rwanda
4. Verify by phone or postcard
5. Add:
   - Photos (logo, office, properties)
   - Business hours (Mon-Fri 8-17, Sat 9-13)
   - Services list
   - Description

This is critical — Google Business Profile listings appear above regular search results!


## ════════════════════════════════════════════
## STEP 4 — Bing Webmaster Tools (free extra traffic)
## ════════════════════════════════════════════

1. Go to https://www.bing.com/webmasters
2. Add site: https://www.kosres.com
3. Import from Google Search Console (easiest)
4. Submit sitemap: https://www.kosres.com/sitemap.xml


## ════════════════════════════════════════════
## STEP 5 — On-page SEO Checklist
## ════════════════════════════════════════════

Already done in your codebase ✅:
  ✅ Unique title tags on every page
  ✅ Meta descriptions on every page
  ✅ Canonical URLs pointing to kosres.com
  ✅ Open Graph tags (Facebook/WhatsApp previews)
  ✅ Twitter/X card tags
  ✅ Local Business JSON-LD schema
  ✅ sitemap.xml (auto-generated at /sitemap.xml)
  ✅ robots.txt (auto-generated at /robots.txt)
  ✅ H1 tags on every page
  ✅ Image alt tags
  ✅ Mobile-responsive design
  ✅ Fast loading (Next.js SSR + image optimization)

Still to do:
  □ Add Google verification code to layout.tsx
  □ Submit sitemap to Google Search Console
  □ Create Google Business Profile
  □ Add at least 5 real property listings with images
  □ Add at least 2 publications/blog posts


## ════════════════════════════════════════════
## STEP 6 — Track Your Rankings (free tools)
## ════════════════════════════════════════════

Google Search Console  → https://search.google.com/search-console
  - See which keywords you rank for
  - See which pages get clicks
  - Fix crawl errors

Google Analytics       → https://analytics.google.com
  - See how many visitors come to your site
  - See where they come from

To add Google Analytics, add this to layout.tsx head:
  <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />

PageSpeed Insights     → https://pagespeed.web.dev
  - Check your site speed score
  - Fix performance issues


## ════════════════════════════════════════════
## STEP 7 — Content Strategy for Rwanda SEO
## ════════════════════════════════════════════

Write publications/blog posts targeting these keywords:

High-priority (people search these):
  "houses for sale in Kigali"
  "apartments for rent Kigali 2026"
  "real estate investment Rwanda"
  "property prices Kigali"
  "how to buy property in Rwanda"

Medium-priority:
  "Kimihurura apartments"
  "Nyarutarama houses"
  "Remera flats for rent"
  "Kicukiro real estate"
  "commercial property Kigali CBD"

Post 1 article per month minimum.
Each article: 500+ words, include local district names.


## ════════════════════════════════════════════
## EXPECTED TIMELINE
## ════════════════════════════════════════════

Week 1:   Site live on kosres.com, sitemap submitted
Week 2-4: Google starts crawling and indexing pages
Month 2:  First rankings appear for brand name searches
Month 3:  Ranking for local keywords (e.g. "KOSRES LTD")
Month 6:  Ranking for competitive keywords with content
