"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  getStats, getAdminProperties,
  getInquiries, getServiceRequests,
} from "@/lib/api"
import type { ApiProperty, ApiServiceRequest } from "@/lib/api"

interface AdminContextValue {
  // Session info (from NextAuth)
  token:           string | null
  user:            { id: string; name: string; email: string; role: string } | null
  // App data
  stats:           any
  properties:      ApiProperty[]
  inquiries:       any[]
  serviceRequests: ApiServiceRequest[]
  loading:         boolean
  // Actions
  logout:          () => void
  refresh:         () => void
  setProperties:   React.Dispatch<React.SetStateAction<ApiProperty[]>>
  setServiceRequests: React.Dispatch<React.SetStateAction<ApiServiceRequest[]>>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const [stats,           setStats]           = useState<any>(null)
  const [properties,      setProperties]      = useState<ApiProperty[]>([])
  const [inquiries,       setInquiries]       = useState<any[]>([])
  const [serviceRequests, setServiceRequests] = useState<ApiServiceRequest[]>([])
  const [loading,         setLoading]         = useState(false)

  // Derived from NextAuth session
  const token = session?.user?.accessToken ?? null
  const user  = session?.user
    ? { id: session.user.id, name: session.user.name ?? "", email: session.user.email ?? "", role: (session.user as any).role }
    : null

  const fetchAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const results = await Promise.allSettled([
      getAdminProperties(),
      getStats(),
      getInquiries(),
      getServiceRequests(),
    ])

    if (results[0].status === "fulfilled") setProperties(results[0].value ?? [])
    if (results[1].status === "fulfilled") setStats(results[1].value)
    if (results[2].status === "fulfilled") setInquiries(results[2].value ?? [])
    if (results[3].status === "fulfilled") setServiceRequests(results[3].value ?? [])

    setLoading(false)
  }, [token])

  // Fetch data once authenticated
  useEffect(() => {
    if (status === "authenticated") fetchAll()
  }, [status, fetchAll])

  const logout = () => signOut({ callbackUrl: "/admin/login" })
  const refresh = useCallback(() => fetchAll(), [fetchAll])

  return (
    <AdminContext.Provider value={{
      token, user, stats, properties, inquiries, serviceRequests,
      loading, logout, refresh, setProperties, setServiceRequests,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider")
  return ctx
}
