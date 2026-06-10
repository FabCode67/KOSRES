import Navbar from "@/components/Navbar"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface ServiceLayoutProps {
  title: string
  subtitle: string
  description: string
  breadcrumb: string
  children: React.ReactNode
  accentColor?: string   // CSS color for hero + accents, default brand red
}

export default function ServiceLayout({
  title, subtitle, description, breadcrumb, children,
  accentColor = "#8B0000",
}: ServiceLayoutProps) {
  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-20" style={{ backgroundColor: accentColor }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-0 pt-12">
          {/* Breadcrumb */}
          <p className="flex items-center gap-1.5 text-xs text-white/50 mb-5">
            <Link href="/" className="hover:text-white/90 transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/#services" className="hover:text-white/90 transition-colors">Services</Link>
            <ChevronRight size={11} />
            <span className="text-white/80">{breadcrumb}</span>
          </p>

          <p className="text-amber-300 text-[11px] font-bold tracking-[0.22em] uppercase mb-3">{subtitle}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight max-w-3xl mb-4">
            {title}
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-2xl pb-12">{description}</p>
        </div>
      </section>

      {/* ── Content ── */}
      <main className="bg-[#f4f2ef] min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          {children}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#0d0f14] py-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} KOSRES LTD · Kigali One Stop Real Estate Service
      </footer>
    </>
  )
}
