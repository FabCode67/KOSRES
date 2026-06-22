"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  Phone,
  Mail,
  TrendingUp,
  ShieldCheck,
  Home,
  LayoutGrid,
  Calculator,
  ClipboardList,
  Settings,
  Car,
} from "lucide-react"

const LOGO = "/images/kosres_logo_refined.png"

const services = [
  {
    label: "Invest",
    href: "/services/invest",
    icon: TrendingUp,
    color: "#7B1113",
  },
  {
    label: "Buy/Sell",
    href: "/services/buy-sell-rent",
    icon: Home,
    color: "#7B1113",
  },
  {
    label: "Valuation",
    href: "/services/valuation",
    icon: Calculator,
    color: "#1B3A5C",
  },
  {
    label: "Due Diligence",
    href: "/services/due-diligence",
    icon: ShieldCheck,
    color: "#1A4731",
  },
  {
    label: "Tax",
    href: "/services/tax-consulting",
    icon: ClipboardList,
    color: "#3D2B1F",
  },
  {
    label: "Management",
    href: "/services/property-management",
    icon: Settings,
    color: "#1C2B4B",
  },
  { label: "Cars", href: "/services/cars", icon: Car, color: "#1C3A6B" },
  {
    label: "Other Services",
    href: "/services/other",
    icon: LayoutGrid,
    color: "#2D4A1E",
  },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-white shadow-sm">
      {/* ── Top contact bar ── */}
      <div className="flex justify-end gap-6 bg-[oklch(0.12_0.01_250)] px-4 py-1.5 text-xs text-white">
        <a
          href="tel:+250792871729"
          className="flex items-center gap-1.5 transition-colors hover:text-amber-300"
        >
          <Phone size={11} /> +250 792 871 729
        </a>
        <a
          href="mailto:kosresltd@gmail.com"
          className="flex items-center gap-1.5 transition-colors hover:text-amber-300"
        >
          <Mail size={11} /> kosresltd@gmail.com
        </a>
      </div>

      {/* ── Row 1: Logo + main links ── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between border-b border-border/50 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Image
            src={LOGO}
            alt="KOSRES LTD"
            width={200}
            height={200}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/properties"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${pathname === "/properties" ? "bg-red-50 text-[oklch(0.42_0.19_25)]" : "text-slate-600 hover:bg-muted hover:text-[oklch(0.42_0.19_25)]"}`}
          >
            Properties
          </Link>
          <Link
            href="/publications"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${pathname.startsWith("/publications") ? "bg-red-50 text-[oklch(0.42_0.19_25)]" : "text-slate-600 hover:bg-muted hover:text-[oklch(0.42_0.19_25)]"}`}
          >
            Publications
          </Link>
          <Link
            href="/#about"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-muted hover:text-[oklch(0.42_0.19_25)]"
          >
            About
          </Link>
          <Link
            href="/#contact"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-muted hover:text-[oklch(0.42_0.19_25)]"
          >
            Contact
          </Link>
          <Link
            href="/admin"
            className="ml-2 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[oklch(0.36_0.18_25)]"
          >
            Admin
          </Link>
        </nav>

        <button
          className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Row 2: Services bar ── */}
      <div className="hidden border-b border-border/60 bg-[oklch(0.97_0.005_80)] md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-1.5">
            <span className="mr-2 shrink-0 text-[10px] font-bold tracking-widest whitespace-nowrap text-slate-400 uppercase">
              Our Services:
            </span>
            {services.map(({ label, href, icon: Icon, color }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive ? "text-white" : "text-slate-600 hover:text-white"
                  }`}
                  style={isActive ? { backgroundColor: color } : undefined}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        color
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        ""
                  }}
                >
                  <Icon size={13} /> {label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="max-h-[82vh] overflow-y-auto border-t border-border bg-white md:hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Our Services
            </p>
            <div className="grid grid-cols-2 gap-2">
              {services.map(({ label, href, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-slate-50 p-3 transition-colors hover:border-slate-300"
                >
                  <div
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-lg"
                    style={{ backgroundColor: color + "18" }}
                  >
                    <Icon size={13} style={{ color }} />
                  </div>
                  <span className="text-xs leading-tight font-semibold text-slate-700">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-1 border-t border-border px-4 py-3">
            {[
              { href: "/properties", label: "Properties" },
              { href: "/publications", label: "Publications" },
              { href: "/#about", label: "About" },
              { href: "/#contact", label: "Contact" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-lg bg-[oklch(0.42_0.19_25)] px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[oklch(0.36_0.18_25)]"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
