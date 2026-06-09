"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LayoutDashboard, Plus, List, Home,
  MapPin, Trash2, Eye, Check, LogIn, LogOut,
  MessageSquare, Loader2,
} from "lucide-react"
import {
  login, getStats, getProperties,
  updateProperty, deleteProperty, getInquiries,
} from "@/lib/api"
import type { ApiProperty } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import AddPropertyForm from "@/components/AddPropertyForm"

type Tab = "dashboard" | "list" | "add" | "inquiries"

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [user,  setUser]  = useState<{ name: string; email: string; role: string } | null>(null)

  const [loginEmail,    setLoginEmail]    = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError,    setLoginError]    = useState("")
  const [loginLoading,  setLoginLoading]  = useState(false)

  const [tab,        setTab]        = useState<Tab>("dashboard")
  const [stats,      setStats]      = useState<any>(null)
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [inquiries,  setInquiries]  = useState<any[]>([])
  const [loading,    setLoading]    = useState(false)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)

  // ── Restore session ──
  useEffect(() => {
    const t = localStorage.getItem("kosres_token")
    const u = localStorage.getItem("kosres_user")
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
  }, [])

  const fetchDashboard = useCallback(async (t: string) => {
    setLoading(true)
    try {
      const [s, p] = await Promise.all([getStats(t), getProperties({ limit: 100 })])
      setStats(s); setProperties(p.data)
    } catch { /* expired */ }
    setLoading(false)
  }, [])

  useEffect(() => { if (token) fetchDashboard(token) }, [token, fetchDashboard])

  const fetchInquiries = useCallback(async () => {
    if (!token) return
    setInquiries(await getInquiries(token))
  }, [token])

  useEffect(() => { if (tab === "inquiries") fetchInquiries() }, [tab, fetchInquiries])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginLoading(true); setLoginError("")
    try {
      const res = await login(loginEmail, loginPassword)
      setToken(res.access_token); setUser(res.user)
      localStorage.setItem("kosres_token", res.access_token)
      localStorage.setItem("kosres_user",  JSON.stringify(res.user))
    } catch (err: any) { setLoginError(err.message || "Invalid credentials") }
    setLoginLoading(false)
  }

  const handleLogout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem("kosres_token")
    localStorage.removeItem("kosres_user")
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    await deleteProperty(id, token)
    setDeleteId(null); fetchDashboard(token)
  }

  const handleToggleFeatured = async (p: ApiProperty) => {
    if (!token) return
    await updateProperty(p.id, { featured: !p.featured }, token)
    fetchDashboard(token)
  }

  const inp = "w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/40]"
  const lbl = "block text-xs font-semibold text-foreground/80 mb-1"

  // ── Login screen ──
  if (!token) {
    return (
      <div className="min-h-screen bg-[oklch(0.12_0.01_250)] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded bg-[oklch(0.42_0.19_25)] flex items-center justify-center text-white font-bold">K</div>
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>KOSRES LTD</p>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
          <h2 className="text-xl font-black mb-6">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={lbl}>Email</label>
              <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@kosres.rw" className={inp} />
            </div>
            <div>
              <label className={lbl}>Password</label>
              <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className={inp} />
            </div>
            {loginError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60 transition-colors">
              {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loginLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Admin shell ──
  const tabTitle: Record<Tab, string> = {
    dashboard: "Dashboard", list: "Properties", add: "Add Property", inquiries: "Inquiries",
  }

  return (
    <div className="min-h-screen flex bg-[oklch(0.97_0.005_80)]">
      {/* Sidebar */}
      <aside className="w-60 bg-[oklch(0.12_0.01_250)] text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[oklch(0.42_0.19_25)] flex items-center justify-center font-bold text-sm">K</div>
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>KOSRES LTD</p>
              <p className="text-xs text-white/50 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {([
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "list",      icon: List,            label: "Properties" },
            { id: "add",       icon: Plus,            label: "Add Property" },
            { id: "inquiries", icon: MessageSquare,   label: "Inquiries" },
          ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                tab === id ? "bg-[oklch(0.42_0.19_25)] text-white" : "text-white/70 hover:bg-white/10"
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/40 truncate">{user?.email}</p>
          <div className="flex gap-2">
            <Link href="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
              <Home size={12} /> Website
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors ml-auto">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold">{tabTitle[tab]}</h1>
          <div className="flex items-center gap-3">
            {loading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            {tab === "list" && (
              <button onClick={() => setTab("add")}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-[oklch(0.42_0.19_25)] text-white hover:bg-[oklch(0.36_0.18_25)] transition-colors">
                <Plus size={14} /> Add Property
              </button>
            )}
          </div>
        </div>

        <div className="p-8">

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total",      value: stats?.total    ?? "–", color: "bg-[oklch(0.42_0.19_25)]" },
                  { label: "For Sale",   value: stats?.forSale  ?? "–", color: "bg-[oklch(0.35_0.13_160)]" },
                  { label: "For Rent",   value: stats?.forRent  ?? "–", color: "bg-[oklch(0.5_0.15_260)]" },
                  { label: "Featured",   value: stats?.featured ?? "–", color: "bg-amber-500" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-border p-5 shadow-sm">
                    <div className={`w-10 h-10 ${s.color} rounded-lg mb-3`} />
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="font-bold mb-4">Recent Listings</h2>
                <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3">Property</th>
                        <th className="text-left px-4 py-3 hidden md:table-cell">District</th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">Offer</th>
                        <th className="text-left px-4 py-3">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.slice(0, 5).map(p => (
                        <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium truncate max-w-[200px]">{p.title}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.district}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              p.offerType === "sale" ? "bg-red-50 text-red-700"
                              : p.offerType === "rent" ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                            }`}>{p.offerType}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[oklch(0.42_0.19_25)]">
                            {formatPrice(p.price, p.priceUnit, p.priceFrequency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── LIST ── */}
          {tab === "list" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{properties.length} total</p>
              {properties.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-border shadow-sm flex items-start gap-4 p-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-none bg-muted">
                    {p.images[0] && <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="80px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {p.sector}, {p.district}
                    </p>
                    <p className="text-sm font-bold text-[oklch(0.42_0.19_25)] mt-1">
                      {formatPrice(p.price, p.priceUnit, p.priceFrequency)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-none">
                    <div className="flex items-center gap-1">
                      <Link href={`/properties/${p.id}`} target="_blank"
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" checked={p.featured} onChange={() => handleToggleFeatured(p)} className="accent-amber-500" />
                      Featured
                    </label>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>{p.status}</span>
                  </div>
                </div>
              ))}

              {deleteId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                    <h3 className="font-bold text-lg mb-2">Delete Property?</h3>
                    <p className="text-sm text-muted-foreground mb-5">This will permanently remove the listing.</p>
                    <div className="flex gap-3">
                      <button onClick={() => handleDelete(deleteId)}
                        className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">
                        Yes, Delete
                      </button>
                      <button onClick={() => setDeleteId(null)}
                        className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ADD PROPERTY (new wizard) ── */}
          {tab === "add" && token && (
            <AddPropertyForm
              token={token}
              onSuccess={() => { setTab("list"); if (token) fetchDashboard(token) }}
            />
          )}

          {/* ── INQUIRIES ── */}
          {tab === "inquiries" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{inquiries.length} total inquiries</p>
              {inquiries.map(inq => (
                <div key={inq.id} className="bg-white rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{inq.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{inq.email} · {inq.phone}</p>
                      <p className="text-sm mt-2 text-foreground/80">{inq.message}</p>
                    </div>
                    <div className="text-right flex-none">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{inq.channel}</span>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(inq.createdAt).toLocaleDateString()}</p>
                      {inq.property && (
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[150px] truncate">{inq.property.title}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No inquiries yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
