import { notFound } from "next/navigation"
import type { Metadata } from "next"
import PropertyDetailClient from "./PropertyDetailClient"
import { getProperty, getProperties } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"
import { SITE_URL, seoTitle, seoDescription, listingJsonLd } from "@/lib/seo"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const p = await getProperty(id)
    const title = seoTitle(p)
    const description = seoDescription(p)
    const url = `${SITE_URL}/properties/${p.id}`
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title, description, url, type: "website", images: p.images?.[0] ? [{ url: p.images[0] }] : undefined },
      twitter: { card: "summary_large_image", title, description, images: p.images?.[0] ? [p.images[0]] : undefined },
    }
  } catch {
    return { title: "Property not found" }
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params

  let property: ApiProperty
  try {
    property = await getProperty(id)
  } catch {
    notFound()
  }

  // Fetch related (same category, exclude this one)
  let related: ApiProperty[] = []
  try {
    const res = await getProperties({ category: property.category, limit: 4 })
    related = res.data.filter((p) => p.id !== property.id).slice(0, 3)
  } catch {}

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd(property)) }} />
      <PropertyDetailClient property={property} related={related} />
    </>
  )
}
