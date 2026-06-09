"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, Phone, Mail } from "lucide-react"

const navLinks = [
  { label: "Properties", href: "/properties" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex justify-end gap-6 bg-[oklch(0.12_0.01_250)] px-4 py-1.5 text-xs text-white">
        <a
          href="tel:+250786684390"
          className="flex items-center gap-1.5 transition-colors hover:text-amber-300"
        >
          <Phone size={11} /> +250 786 684 390
        </a>
        <a
          href="mailto:kosresltd@gmail.com"
          className="flex items-center gap-1.5 transition-colors hover:text-amber-300"
        >
          <Mail size={11} /> kosresltd@gmail.com
        </a>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[oklch(0.42_0.19_25)] text-sm leading-none font-bold text-white">
            K
          </div>
          <div>
            <div
              className="text-sm leading-tight font-bold text-[oklch(0.12_0.01_250)]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              KOSRES LTD
            </div>
            <div className="text-[10px] leading-tight text-muted-foreground">
              Kigali One Stop Real Estate
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-[oklch(0.42_0.19_25)]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="rounded bg-[oklch(0.42_0.19_25)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[oklch(0.36_0.18_25)]"
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
        <div className="flex flex-col gap-2 border-t border-border bg-white px-4 pb-4 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-border/50 py-2 text-sm font-medium text-foreground/80 transition-colors last:border-0 hover:text-[oklch(0.42_0.19_25)]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="mt-1 rounded bg-[oklch(0.42_0.19_25)] py-2.5 text-center text-sm font-medium text-white"
          >
            Admin Portal
          </Link>
        </div>
      )}
    </header>
  )
}
