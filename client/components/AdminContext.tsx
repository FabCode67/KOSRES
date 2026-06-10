"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { login as apiLogin, getStats, getAdminProperties, getInquiries } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"

interface AdminUser { id: string; name: string; email: string; role: string }

interface AdminContextValue {
  token:         string | null
  user:          AdminUser | null
  stats:         any
  properties:    ApiProperty[]
  inquiries:     any[]
  loading:       boolean
  login:         (email: string, password: string) => Promise<void>
  logout:        () => void
  refresh:       () => void
  setProperties: React.Dispatch<React.SetStateAction<ApiProperty[]>>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token,      setToken]      = useState<string | null>(null)
  const [user,       setUser]       = useState<AdminUser | null>(null)
  const [stats,      setStats]      = useState<any>(null)
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [inquiries,  setInquiries]  = useState<any[]>([])
  const [loading,    setLoading]    = useState(false)
  const [ready,      setReady]      = useState(false)

  // Restore session
  useEffect(() => {
    const t = localStorage.getItem("kosres_token")
    const u = localStorage.getItem("kosres_user")
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    setReady(true)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [propsResult, statsResult, inqResult] = await Promise.allSettled([
      getAdminProperties(),
      getStats(),
      getInquiries(),
    ])
    if (propsResult.status === "fulfilled") setProperties(propsResult.value ?? [])
    else console.error("Properties:", propsResult.reason?.message)

    if (statsResult.status === "fulfilled") setStats(statsResult.value)
    else console.error("Stats:", statsResult.reason?.message)

    if (inqResult.status === "fulfilled") setInquiries(inqResult.value ?? [])
    else console.error("Inquiries:", inqResult.reason?.message)

    setLoading(false)
  }, [])

  // Fetch on ready — all endpoints are now public
  useEffect(() => { if (ready) fetchAll() }, [ready, fetchAll])

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    setToken(res.access_token)
    setUser(res.user)
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
      token, user, stats, properties, inquiries, loading,
      login, logout, refresh, setProperties,
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
