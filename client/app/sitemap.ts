import type { MetadataRoute } from "next"

const SITE_URL = "https://www.kosres.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    // ── Core pages ────────────────────────────────────────────────
    { url: `${SITE_URL}`,                          lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/properties`,               lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${SITE_URL}/cars`,                     lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/publications`,             lastModified: now, changeFrequency: "weekly",  priority: 0.7 },

    // ── Service pages ─────────────────────────────────────────────
    { url: `${SITE_URL}/services/buy-sell-rent`,      lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/services/invest`,             lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/services/valuation`,          lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/services/due-diligence`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/services/property-management`,lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/services/tax-consulting`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/services/cars`,               lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/services/other`,              lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ]
}
