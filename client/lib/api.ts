// API base URL
// NEXT_PUBLIC_ vars are inlined at build time. If the env var is missing at
// build time the fallback runs in the browser and we detect prod by hostname.
export const API_URL: string = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost")
  ) {
    return "https://kosres.onrender.com/api"
  }
  return "http://localhost:3001/api"
})()

export type ApiProperty = {
  id: string
  title: string
  description: string
  price: number
  priceUnit: "RWF" | "USD"
  priceFrequency: string | null
  offerType: "sale" | "rent" | "short_stay"
  category: "residential" | "commercial" | "agricultural" | "industrial"
  propertyType: string
  district: string
  sector: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  images: string[]
  featured: boolean
  status: "active" | "sold" | "rented" | "inactive"
  upi?: string
  createdAt: string
  updatedAt: string
}

export type PaginatedProperties = {
  data: ApiProperty[]
  meta: { total: number; page: number; limit: number; pages: number }
}
//good
export type PropertyQuery = {
  search?: string
  offerType?: string
  category?: string
  district?: string
  featured?: boolean
  page?: number
  limit?: number
}

// ── Properties ──
export async function getProperties(
  q: PropertyQuery = {}
): Promise<PaginatedProperties> {
  const params = new URLSearchParams()
  Object.entries(q).forEach(
    ([k, v]) => v !== undefined && params.set(k, String(v))
  )
  const res = await fetch(`${API_URL}/properties?${params}`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error("Failed to fetch properties")
  return res.json()
}

export async function getFeaturedProperties(): Promise<ApiProperty[]> {
  const res = await fetch(`${API_URL}/properties/featured`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error("Failed to fetch featured")
  return res.json()
}

export async function getProperty(id: string): Promise<ApiProperty> {
  const res = await fetch(`${API_URL}/properties/${id}`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error("Not found")
  return res.json()
}

export async function getStats(token: string) {
  const res = await fetch(`${API_URL}/properties/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Unauthorized")
  return res.json()
}

// ── Auth ──
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "Login failed")
  }
  return res.json() as Promise<{
    access_token: string
    user: { id: string; name: string; email: string; role: string }
  }>
}

// ── Admin CRUD ──
export async function createProperty(
  data: Partial<ApiProperty>,
  token: string
) {
  const res = await fetch(`${API_URL}/properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create")
  return res.json()
}

export async function updateProperty(
  id: string,
  data: Partial<ApiProperty>,
  token: string
) {
  const res = await fetch(`${API_URL}/properties/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update")
  return res.json()
}

export async function deleteProperty(id: string, token: string) {
  const res = await fetch(`${API_URL}/properties/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to delete")
  return res.json()
}

export async function submitInquiry(
  propertyId: string,
  data: {
    name: string
    email?: string
    phone?: string
    message: string
    channel?: string
  }
) {
  const res = await fetch(`${API_URL}/inquiries/property/${propertyId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to submit inquiry")
  return res.json()
}

export async function getInquiries(token: string) {
  const res = await fetch(`${API_URL}/inquiries`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch inquiries")
  return res.json()
}
