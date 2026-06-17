"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  Menu, X, Phone, Mail,
  TrendingUp, ShieldCheck, Home, Building2,
  Calculator, ClipboardList, Settings, Car,
} from "lucide-react"

const LOGO = "/images/kosres_logo_refined.png"

const services = [
  { label: "Invest",        href: "/services/invest",              icon: TrendingUp,    color: "#7B1113" },
  { label: "Buy/Sell",      href: "/services/buy-sell-rent",       icon: Home,          color: "#7B1113" },
  { label: "Valuation",     href: "/services/valuation",           icon: Calculator,    color: "#1B3A5C" },
  { label: "Due Diligence", href: "/services/due-diligence",       icon: ShieldCheck,   color: "#1A4731" },
  { label: "Tax",           href: "/services/tax-consulting",      icon: ClipboardList, color: "#3D2B1F" },
  { label: "Management",    href: "/services/property-management", icon: Settings,      color: "#1C2B4B" },
  { label: "Cars",          href: "/services/cars",                icon: Car,           color: "#1C3A6B" },
  { label: "Design",        href: "/#services",                    icon: Building2,     color: "#4A4A4A" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white shadow-sm border-b border-border">

      {/* ── Top contact bar ── */}
      <div className="bg-[oklch(0.12_0.01_250)] px-4 py-1.5 flex justify-end gap-6 text-xs text-white">
        <a href="tel:+250792871729"
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
          <Phone size={11} /> +250 792 871 729
        </a>
        <a href="mailto:kosresltd@gmail.com"
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
          <Mail size={11} /> kosresltd@gmail.com
        </a>
      </div>

      {/* ── Row 1: Logo + main links ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center justify-between border-b border-border/50">

        {/* Logo — full refined PNG */}
        <Link href="/" className="shrink-0">
          <Image
            src={LOGO}
            alt="KOSRES LTD"
            width={200}
            height={90}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/properties"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/properties"
                ? "text-[oklch(0.42_0.19_25)] bg-red-50"
                : "text-slate-600 hover:text-[oklch(0.42_0.19_25)] hover:bg-muted"
            }`}>
            Properties
          </Link>
          <Link href="/publications"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith("/publications")
                ? "text-[oklch(0.42_0.19_25)] bg-red-50"
                : "text-slate-600 hover:text-[oklch(0.42_0.19_25)] hover:bg-muted"
            }`}>
            Publications
          </Link>
          <Link href="/#about"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-[oklch(0.42_0.19_25)] hover:bg-muted transition-colors">
            About
          </Link>
          <Link href="/#contact"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-[oklch(0.42_0.19_25)] hover:bg-muted transition-colors">
            Contact
          </Link>
          <Link href="/admin"
            className="ml-2 px-4 py-1.5 rounded-lg bg-[oklch(0.42_0.19_25)] text-white text-sm font-semibold hover:bg-[oklch(0.36_0.18_25)] transition-colors">
            Admin
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Row 2: Services bar ── */}
      <div className="hidden md:block bg-[oklch(0.97_0.005_80)] border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-1 py-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 whitespace-nowrap shrink-0">
              Our Services:
            </span>
            {services.map(({ label, href, icon: Icon, color }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive ? "text-white" : "text-slate-600 hover:text-white"
                  }`}
                  style={isActive ? { backgroundColor: color } : undefined}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = color }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "" }}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden bg-white border-t border-border overflow-y-auto max-h-[82vh]">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Our Services</p>
            <div className="grid grid-cols-2 gap-2">
              {services.map(({ label, href, icon: Icon, color }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-slate-50 hover:border-slate-300 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-none"
                    style={{ backgroundColor: color + "18" }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border space-y-1">
            <Link href="/properties" onClick={() => setOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-muted transition-colors">
              Properties
            </Link>
            <Link href="/publications" onClick={() => setOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-muted transition-colors">
              Publications
            </Link>
            <Link href="/#about" onClick={() => setOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-muted transition-colors">
              About
            </Link>
            <Link href="/#contact" onClick={() => setOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-muted transition-colors">
              Contact
            </Link>
            <Link href="/admin" onClick={() => setOpen(false)}
              className="block mt-2 py-2.5 px-3 rounded-lg bg-[oklch(0.42_0.19_25)] text-white text-sm font-semibold text-center hover:bg-[oklch(0.36_0.18_25)] transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
