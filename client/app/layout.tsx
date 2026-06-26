import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/SessionProvider"

const SITE_URL  = "https://www.kosres.rw"
const SITE_NAME = "KOSRES LTD"
const LOGO_URL  = `${SITE_URL}/images/kosres_logo_refined.png`

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  title: {
    default:  "KOSRES LTD – Kigali One Stop Real Estate Service | Buy, Sell & Rent Property in Rwanda",
    template: "%s | KOSRES LTD – Rwanda Real Estate",
  },
  description:
    "KOSRES LTD is Rwanda's leading one-stop real estate company. Buy, sell, rent & invest in residential and commercial properties across Kigali and all 30 districts. RDB regulated. Call +250 792 871 729.",
  keywords: [
    // Core brand
    "KOSRES LTD", "Kigali one stop real estate", "Rwanda real estate",
    // Services
    "buy property Kigali", "sell property Rwanda", "rent apartment Kigali",
    "property for sale Rwanda", "house for rent Kigali", "commercial property Rwanda",
    "real estate investment Kigali", "property management Rwanda",
    "asset valuation Rwanda", "property due diligence Kigali",
    "property tax consulting Rwanda", "car rental Kigali",
    // Locations
    "Gasabo real estate", "Kicukiro property", "Nyarugenge apartments",
    "Kimihurura houses", "Remera flats", "Gisozi property Rwanda",
    // Property types
    "apartments Kigali", "villas Rwanda", "offices for rent Kigali",
    "land for sale Rwanda", "short stay Kigali", "furnished apartments Rwanda",
    // Qualifiers
    "RDB regulated real estate", "licensed real estate agent Rwanda",
    "property consultant Kigali", "IPPV Rwanda",
  ],
  authors:   [{ name: "KOSRES LTD", url: SITE_URL }],
  creator:   "KOSRES LTD",
  publisher: "KOSRES LTD",

  // ── Robots ────────────────────────────────────────────────────────
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  // ── Canonical ─────────────────────────────────────────────────────
  alternates: { canonical: SITE_URL },

  // ── Open Graph ────────────────────────────────────────────────────
  openGraph: {
    type:        "website",
    locale:      "en_RW",
    url:         SITE_URL,
    siteName:    SITE_NAME,
    title:       "KOSRES LTD – Kigali One Stop Real Estate Service",
    description: "Buy, sell, rent & invest in Rwanda's finest properties. RDB regulated. All real estate services under one roof.",
    images: [
      {
        url:    LOGO_URL,
        width:  1200,
        height: 630,
        alt:    "KOSRES LTD – Kigali One Stop Real Estate Service",
      },
    ],
  },

  // ── Twitter / X ──────────────────────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    site:        "@KOSRESLTD",
    creator:     "@KOSRESLTD",
    title:       "KOSRES LTD – Kigali One Stop Real Estate Service",
    description: "Buy, sell, rent & invest in Rwanda's finest properties. All services under one roof.",
    images:      [LOGO_URL],
  },

  // ── Icons ────────────────────────────────────────────────────────
  icons: {
    icon:     [{ url: "/kosres-favicon.svg", type: "image/svg+xml" }],
    apple:    "/kosres-favicon.svg",
    shortcut: "/kosres-favicon.svg",
  },

  // ── Verification (add your codes when ready) ─────────────────────
  verification: {
    google: "ADD_YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
    // yandex: "...",
    // bing: "...",
  },

  // ── App-specific ─────────────────────────────────────────────────
  applicationName: SITE_NAME,
  category:        "real estate",
  classification:  "Real Estate Services",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        {/* Local Business schema — tells Google who, what and where KOSRES is */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "KOSRES LTD",
              "alternateName": "Kigali One Stop Real Estate Service",
              "description": "Rwanda's leading one-stop real estate company. Buy, sell, rent & invest in residential and commercial properties across Kigali and all 30 districts.",
              "url": SITE_URL,
              "logo": LOGO_URL,
              "image": LOGO_URL,
              "telephone": "+250792871729",
              "email": "kosresltd@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "BEATITUDE HOUSE, 4th Floor, KN87 Street",
                "addressLocality": "Kigali",
                "addressRegion": "Kigali City",
                "addressCountry": "RW",
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -1.9441,
                "longitude": 30.0619,
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
                  "opens": "08:00",
                  "closes": "17:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "09:00",
                  "closes": "13:00",
                },
              ],
              "sameAs": [
                "https://www.facebook.com/share/1Ng4AZUsex/",
                "https://www.instagram.com/kosres2026",
                "https://x.com/KOSRESLTD",
                "https://youtube.com/@kigalionestoprealestateservice",
                "https://www.tiktok.com/@kigali.one.stop.r",
              ],
              "areaServed": {
                "@type": "Country",
                "name": "Rwanda",
              },
              "knowsAbout": [
                "Real Estate Sales", "Property Rental", "Real Estate Investment",
                "Property Valuation", "Property Management", "Due Diligence",
                "Property Tax Consulting", "Land Surveying", "Environmental Impact Assessment",
              ],
            }),
          }}
        />
      </head>
      <body>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
