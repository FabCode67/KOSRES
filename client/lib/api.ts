// API base URL
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

export type ApiServiceRequest = {
  id: string
  service: string
  name: string
  email?: string
  contact?: string
  data: Record<string, string>
  read: boolean
  createdAt: string
}

export type PaginatedProperties = {
  data: ApiProperty[]
  meta: { total: number; page: number; limit: number; pages: number }
}

export type PropertyQuery = {
  search?: string
  offerType?: string
  category?: string
  district?: string
  featured?: boolean
  page?: number
  limit?: number
  status?: string
}

// ── Properties ────────────────────────────────────────────────────────
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

export async function getAdminProperties(): Promise<ApiProperty[]> {
  const res = await fetch(`${API_URL}/properties?limit=500`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch admin properties")
  const json = await res.json()
  return Array.isArray(json) ? json : (json.data ?? [])
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

export async function getStats() {
  const res = await fetch(`${API_URL}/properties/admin/stats`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────
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

// ── Cache revalidation ────────────────────────────────────────────────
async function revalidateSite() {
  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    await fetch(`${base}/api/revalidate?secret=kosres_revalidate_2024`, {
      method: "POST",
    })
  } catch {}
}

// ── Property CRUD ─────────────────────────────────────────────────────
export async function createProperty(
  data: Partial<ApiProperty>,
  _token?: string
) {
  const res = await fetch(`${API_URL}/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message || body?.error || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }
  const result = await res.json()
  revalidateSite()
  return result
}

export async function updateProperty(
  id: string,
  data: Partial<ApiProperty>,
  _token?: string
) {
  const res = await fetch(`${API_URL}/properties/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message || body?.error || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }
  const result = await res.json()
  revalidateSite()
  return result
}

export async function deleteProperty(id: string, _token?: string) {
  const res = await fetch(`${API_URL}/properties/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message || "Failed to delete")
  }
  const result = await res.json()
  revalidateSite()
  return result
}

// ── Cloudinary ────────────────────────────────────────────────────────
export async function uploadImagesToCloudinary(
  files: File[],
  _token?: string
): Promise<string[]> {
  const sigRes = await fetch(`${API_URL}/upload/sign`)
  if (!sigRes.ok) throw new Error("Failed to get upload signature")
  const { timestamp, signature, folder, apiKey, cloudName } =
    await sigRes.json()
  const urls: string[] = []
  for (const file of files) {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("timestamp", String(timestamp))
    fd.append("signature", signature)
    fd.append("folder", folder)
    fd.append("api_key", apiKey)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: fd }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || "Upload failed")
    }
    urls.push((await res.json()).secure_url)
  }
  return urls
}

// ── Inquiries ─────────────────────────────────────────────────────────
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

export async function getInquiries() {
  const res = await fetch(`${API_URL}/inquiries`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch inquiries")
  return res.json()
}

// ── Service Requests ──────────────────────────────────────────────────
export async function submitServiceRequest(data: {
  service: string
  name: string
  email?: string
  contact?: string
  data: Record<string, string>
}): Promise<ApiServiceRequest> {
  const res = await fetch(`${API_URL}/service-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to submit request")
  return res.json()
}

export async function getServiceRequests(): Promise<ApiServiceRequest[]> {
  const res = await fetch(`${API_URL}/service-requests`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch service requests")
  return res.json()
}

export async function markServiceRequestRead(id: string) {
  const res = await fetch(`${API_URL}/service-requests/${id}/read`, {
    method: "PATCH",
  })
  if (!res.ok) throw new Error("Failed to mark read")
  return res.json()
}

export async function deleteServiceRequest(id: string) {
  const res = await fetch(`${API_URL}/service-requests/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete")
  return res.json()
}
