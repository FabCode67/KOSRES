"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, List, Plus, MessageSquare,
  ClipboardList, BookOpen, Home, LogOut, Loader2, LogIn,
} from "lucide-react"
import { useState } from "react"
import { useAdmin } from "@/components/AdminContext"

const LOGO = "/images/kosres_logo_refined.png"

const navItems = [
  { label: "Dashboard",        href: "/admin",                  icon: LayoutDashboard },
  { label: "Properties",       href: "/admin/properties",       icon: List            },
  { label: "Add Property",     href: "/admin/add",              icon: Plus            },
  { label: "Publications",     href: "/admin/publications",     icon: BookOpen        },
  { label: "Inquiries",        href: "/admin/inquiries",        icon: MessageSquare   },
  { label: "Service Requests", href: "/admin/service-requests", icon: ClipboardList   },
]

function LoginScreen() {
  const { login } = useAdmin()
  const router    = useRouter()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const inp = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/40] placeholder:text-slate-300 transition-all"
  const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("")
    try { await login(email, password); router.push("/admin") }
    catch (err: any) { setError(err.message || "Invalid credentials") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.01_250)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-center mb-4">
          <Image src={LOGO} alt="KOSRES LTD" width={220} height={110} className="object-contain" />
        </div>
        <h2 className="text-base font-bold mb-6 text-slate-500 text-center tracking-wide">
          Admin Portal Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={lbl}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@kosres.rw" className={inp} />
          </div>
          <div>
            <label className={lbl}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className={inp} />
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { token, user, logout, loading, serviceRequests } = useAdmin()
  const pathname = usePathname()
  if (!token) return <LoginScreen />
  const unreadCount = serviceRequests?.filter(r => !r.read).length ?? 0

  return (
    <div className="min-h-screen flex bg-[oklch(0.97_0.005_80)]">
      <aside className="w-60 bg-[oklch(0.12_0.01_250)] text-white flex flex-col shrink-0 sticky top-0 h-screen">
        {/* Logo — white pill so logo reads on dark sidebar */}
        <div className="px-4 py-3 border-b border-white/10 flex flex-col items-center">
          <div className="bg-white rounded-xl px-2 py-1.5 w-full flex justify-center">
            <Image src={LOGO} alt="KOSRES LTD" width={150} height={76}
              className="h-14 w-auto object-contain" />
          </div>
          <p className="text-[10px] text-white/40 mt-2 capitalize">{user?.role ?? "admin"}</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            const badge    = label === "Service Requests" && unreadCount > 0 ? unreadCount : 0
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-[oklch(0.42_0.19_25)] text-white" : "text-white/70 hover:bg-white/10"
                }`}>
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="text-[10px] font-bold bg-[oklch(0.42_0.19_25)] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/40 truncate">{user?.email}</p>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
              <Home size={12} /> Website
            </Link>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors ml-auto">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          <div className="flex items-center gap-3">
            {loading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            {pathname === "/admin/properties" && (
              <Link href="/admin/add"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-[oklch(0.42_0.19_25)] text-white hover:bg-[oklch(0.36_0.18_25)] transition-colors">
                <Plus size={14} /> Add Property
              </Link>
            )}
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
