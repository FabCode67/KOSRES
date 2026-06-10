import { notFound } from "next/navigation"
import PropertyDetailClient from "./PropertyDetailClient"
import { getProperty, getProperties } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"

interface Props {
  params: Promise<{ id: string }>
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

  return <PropertyDetailClient property={property} related={related} />
}
