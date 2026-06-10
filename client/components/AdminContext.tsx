"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  login as apiLogin, getStats, getAdminProperties,
  getInquiries, getServiceRequests,
} from "@/lib/api"
import type { ApiProperty, ApiServiceRequest } from "@/lib/api"

interface AdminUser { id: string; name: string; email: string; role: string }

interface AdminContextValue {
  token:           string | null
  user:            AdminUser | null
  stats:           any
  properties:      ApiProperty[]
  inquiries:       any[]
  serviceRequests: ApiServiceRequest[]
  loading:         boolean
  login:           (email: string, password: string) => Promise<void>
  logout:          () => void
  refresh:         () => void
  setProperties:   React.Dispatch<React.SetStateAction<ApiProperty[]>>
  setServiceRequests: React.Dispatch<React.SetStateAction<ApiServiceRequest[]>>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token,           setToken]           = useState<string | null>(null)
  const [user,            setUser]            = useState<AdminUser | null>(null)
  const [stats,           setStats]           = useState<any>(null)
  const [properties,      setProperties]      = useState<ApiProperty[]>([])
  const [inquiries,       setInquiries]       = useState<any[]>([])
  const [serviceRequests, setServiceRequests] = useState<ApiServiceRequest[]>([])
  const [loading,         setLoading]         = useState(false)
  const [ready,           setReady]           = useState(false)

  useEffect(() => {
    const t = localStorage.getItem("kosres_token")
    const u = localStorage.getItem("kosres_user")
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    setReady(true)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const results = await Promise.allSettled([
      getAdminProperties(),
      getStats(),
      getInquiries(),
      getServiceRequests(),
    ])

    if (results[0].status === "fulfilled") setProperties(results[0].value ?? [])
    else console.error("Properties:", (results[0] as any).reason?.message)

    if (results[1].status === "fulfilled") setStats(results[1].value)
    else console.error("Stats:", (results[1] as any).reason?.message)

    if (results[2].status === "fulfilled") setInquiries(results[2].value ?? [])
    else console.error("Inquiries:", (results[2] as any).reason?.message)

    if (results[3].status === "fulfilled") setServiceRequests(results[3].value ?? [])
    else console.error("Service requests:", (results[3] as any).reason?.message)

    setLoading(false)
  }, [])

  useEffect(() => { if (ready) fetchAll() }, [ready, fetchAll])

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    setToken(res.access_token); setUser(res.user)
    localStorage.setItem("kosres_token", res.access_token)
    localStorage.setItem("kosres_user",  JSON.stringify(res.user))
  }

  const logout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem("kosres_token")
    localStorage.removeItem("kosres_user")
  }

  const refresh = useCallback(() => fetchAll(), [fetchAll])

  if (!ready) return null

  return (
    <AdminContext.Provider value={{
      token, user, stats, properties, inquiries, serviceRequests,
      loading, login, logout, refresh, setProperties, setServiceRequests,
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
