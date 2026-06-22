import { API_URL } from "@/lib/api"

// ── Partners ──────────────────────────────────────────────────────────
export type ApiPartner = {
  id: string
  name: string
  logo?: string
  website?: string
  description?: string
  category?: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export async function getPartners(all = false): Promise<ApiPartner[]> {
  const res = await fetch(`${API_URL}/partners${all ? "?all=true" : ""}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch partners")
  return res.json()
}

export async function createPartner(data: Partial<ApiPartner>): Promise<ApiPartner> {
  const res = await fetch(`${API_URL}/partners`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.message || "Failed to create partner") }
  return res.json()
}

export async function updatePartner(id: string, data: Partial<ApiPartner>): Promise<ApiPartner> {
  const res = await fetch(`${API_URL}/partners/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.message || "Failed to update partner") }
  return res.json()
}

export async function deletePartner(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/partners/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete partner")
}

export async function uploadPartnerLogo(id: string, file: File): Promise<ApiPartner> {
  const fd = new FormData(); fd.append("file", file)
  const res = await fetch(`${API_URL}/partners/${id}/logo`, { method: "POST", body: fd })
  if (!res.ok) throw new Error("Failed to upload logo")
  return res.json()
}
