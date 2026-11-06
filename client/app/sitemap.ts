import type { MetadataRoute } from "next"
import { getProperties } from "@/lib/api"
import { slugify } from "@/lib/seo"

const SITE_URL = "https://www.kosres.com"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  let props: Awaited<ReturnType<typeof getProperties>>["data"] = []
  try { props = (await getProperties({ limit: 500 })).data } catch {}
  const listings: MetadataRoute.Sitemap = props.map((p) => ({
    url: `${SITE_URL}/properties/${p.id}`, lastModified: new Date(p.updatedAt || now), changeFrequency: "weekly", priority: 0.8,
  }))
  const areas = Array.from(new Set(props.flatMap((p) => [p.sector, p.district]).filter(Boolean).map((a) => slugify(a as string))))
  const areaPages: MetadataRoute.Sitemap = areas.map((a) => ({
    url: `${SITE_URL}/properties/area/${a}`, lastModified: now, changeFrequency: "daily", priority: 0.85,
  }))

  return [
    ...listings,
    ...areaPages,
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
