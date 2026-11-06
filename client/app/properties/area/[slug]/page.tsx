import Link from "next/link"
import type { Metadata } from "next"
import { getProperties } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"
import { SITE_URL, slugify, seoTitle, formatPrice } from "@/lib/seo"

export const revalidate = 300
interface Props { params: Promise<{ slug: string }> }

async function load(slug: string) {
  const all = (await getProperties({ limit: 500 }).catch(() => ({ data: [] as ApiProperty[] }))).data
  const items = all.filter((p) => slugify(p.sector || "") === slug || slugify(p.district || "") === slug)
  const name = items.length
    ? (slugify(items[0].sector || "") === slug ? items[0].sector : items[0].district)
    : slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return { items, name }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { items, name } = await load(slug)
  const title = `Houses & Properties for Sale and Rent in ${name}, Rwanda`
  const description = `${items.length} verified residential houses, apartments, land and commercial properties in ${name}, Kigali, Rwanda. Browse listings with prices and photos from KOSRES LTD.`
  const url = `${SITE_URL}/properties/area/${slug}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url }, robots: items.length ? undefined : { index: false } }
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params
  const { items, name } = await load(slug)
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Residential houses &amp; properties in {name}</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Looking for a residential house, apartment or land in {name}, Kigali? KOSRES LTD lists verified properties for sale and rent in {name}
        and across Rwanda. Contact us on +250 792 871 729 to arrange a viewing.
      </p>
      {items.length === 0 ? (
        <p>No active listings in {name} right now. <Link href="/properties" className="underline">Browse all properties</Link>.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="border rounded-lg overflow-hidden">
              <Link href={`/properties/${p.id}`}>
                {p.images?.[0] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.images[0]} alt={seoTitle(p)} className="w-full h-48 object-cover" loading="lazy" />}
                <div className="p-4">
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="text-sm text-gray-600">{[p.sector, p.district].filter(Boolean).join(", ")}</p>
                  <p className="font-bold mt-1">{formatPrice(p)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
