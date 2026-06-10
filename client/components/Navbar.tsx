"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Menu, X, Phone, Mail, ChevronDown,
  TrendingUp, ShieldCheck, Home, Building2,
  Calculator, ClipboardList, Settings } from "lucide-react"

const services = [
  { label: "Invest in Kigali Real Estate", href: "/services/invest",               icon: TrendingUp   },
  { label: "Buy / Sell & Rent",            href: "/services/buy-sell-rent",        icon: Home         },
  { label: "Asset Valuation",              href: "/services/valuation",            icon: Calculator   },
  { label: "Property Due Diligence",       href: "/services/due-diligence",        icon: ShieldCheck  },
  { label: "Property Tax Consulting",      href: "/services/tax-consulting",       icon: ClipboardList},
  { label: "Property Management",          href: "/services/property-management",  icon: Settings     },
  { label: "Design & Construction",        href: "/#services",                     icon: Building2    },
]

const navLinks = [
  { label: "Properties", href: "/properties" },
  { label: "About",      href: "/#about"     },
  { label: "Contact",    href: "/#contact"   },
]

export default function Navbar() {
  const [open, setOpen]           = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-sm">
      {/* Top info bar */}
      <div className="flex justify-end gap-6 bg-[oklch(0.12_0.01_250)] px-4 py-1.5 text-xs text-white">
        <a href="tel:+250792871729" className="flex items-center gap-1.5 transition-colors hover:text-amber-300">
          <Phone size={11} /> +250 792 871 729
        </a>
        <a href="mailto:kosresltd@gmail.com" className="flex items-center gap-1.5 transition-colors hover:text-amber-300">
          <Mail size={11} /> kosresltd@gmail.com
        </a>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/kosres-logo.svg"
            alt="KOSRES LTD"
            width={200}
            height={60}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">

          {/* Services dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setServicesOpen(v => !v)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                servicesOpen ? "bg-[oklch(0.42_0.19_25)] text-white" : "text-foreground/80 hover:text-[oklch(0.42_0.19_25)] hover:bg-muted"
              }`}
            >
              Services
              <ChevronDown size={14} className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
            </button>

            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-border shadow-xl overflow-hidden z-50 animate-fade-in">
                <div className="p-2">
                  {services.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setServicesOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[oklch(0.97_0.005_80)] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-none group-hover:bg-[oklch(0.42_0.19_25)] transition-colors">
                        <Icon size={14} className="text-[oklch(0.42_0.19_25)] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">{label}</span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-3 bg-slate-50">
                  <Link href="/#services" onClick={() => setServicesOpen(false)}
                    className="text-xs text-[oklch(0.42_0.19_25)] font-semibold hover:underline">
                    View all services →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Other nav links */}
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 transition-colors hover:text-[oklch(0.42_0.19_25)] hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}

          <Link
            href="/admin"
            className="ml-2 rounded-lg bg-[oklch(0.42_0.19_25)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[oklch(0.36_0.18_25)]"
          >
            Admin Portal
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="rounded p-2 transition-colors hover:bg-muted md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col border-t border-border bg-white px-4 pb-4 md:hidden max-h-[80vh] overflow-y-auto">
          {/* Services section */}
          <div className="py-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 py-2">Services</p>
            {services.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-none">
                  <Icon size={13} className="text-[oklch(0.42_0.19_25)]" />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </Link>
            ))}
          </div>

          {/* Other links */}
          <div className="pt-2 flex flex-col gap-1">
            <Link href="/properties" onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-medium text-foreground/80 border-b border-border/30">
              Properties
            </Link>
            <Link href="/#about" onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-medium text-foreground/80 border-b border-border/30">
              About
            </Link>
            <Link href="/#contact" onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-medium text-foreground/80 border-b border-border/30">
              Contact
            </Link>
            <Link href="/admin" onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-[oklch(0.42_0.19_25)] py-2.5 text-center text-sm font-semibold text-white">
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
