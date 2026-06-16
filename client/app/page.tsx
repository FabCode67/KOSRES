import Image from "next/image"
import Link from "next/link"
import {
  ShieldCheck, TrendingUp, Home, Building2,
  ClipboardList, Calculator, Settings,
  Phone, Mail, MapPin, ChevronRight, Star,
  Heart, Award, Trophy, Sparkles,
} from "lucide-react"
import Navbar              from "@/components/Navbar"
import HeroBanner          from "@/components/HeroBanner"
import PropertyCard        from "@/components/PropertyCard"
import PublicationsPreview from "@/components/PublicationsPreview"
import { getFeaturedProperties } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"

const services = [
  { icon: TrendingUp,    title: "Invest in Kigali Real Estate", href: "/services/invest",              desc: "Identify rewarding property opportunities tailored to your investment goals and budget across Rwanda." },
  { icon: ShieldCheck,   title: "Property Due Diligence",       href: "/services/due-diligence",       desc: "Verify ownership, title documents, zoning regulations, mortgages and full legal status before you buy." },
  { icon: Home,          title: "Buy / Sell & Rent",            href: "/services/buy-sell-rent",       desc: "Seamless residential, commercial, and short-stay property transactions across Kigali and Rwanda." },
  { icon: Building2,     title: "Design & Construction",        href: "/#contact",                     desc: "Expert architectural design, quantity surveying and project management for residential and commercial builds." },
  { icon: Calculator,    title: "Asset Valuation",              href: "/services/valuation",           desc: "Independent valuations for loans, sale/purchase, insurance, taxation, financial reporting and litigation." },
  { icon: ClipboardList, title: "Property Tax Consulting",      href: "/services/tax-consulting",      desc: "Assess liabilities, prepare declarations, file returns and optimise your property tax obligations." },
  { icon: Settings,      title: "Property Management",          href: "/services/property-management", desc: "Full-service management: tenant sourcing, rent collection, maintenance and financial reporting." },
]

const stats = [
  { value: "500+", label: "Properties Listed"      },
  { value: "10+",  label: "Years Experience"        },
  { value: "98%",  label: "Client Satisfaction"     },
  { value: "7",    label: "Services Under One Roof" },
]

const quickLinks = [
  { label: "Properties",    href: "/properties"                   },
  { label: "Publications",  href: "/publications"                 },
  { label: "Invest",        href: "/services/invest"              },
  { label: "Valuation",     href: "/services/valuation"           },
  { label: "Due Diligence", href: "/services/due-diligence"       },
  { label: "Management",    href: "/services/property-management" },
  { label: "Contact",       href: "/#contact"                     },
]

const whyChooseUs = [
  {
    icon: Heart,
    title: "Deeply committed to your goals",
    desc: "We are deeply committed to our client goals — your success is our success, and we go the extra mile to deliver results that matter.",
  },
  {
    icon: Award,
    title: "Affiliated with leading institutions",
    desc: "We are affiliated with real estate institutions, ensuring our services meet the highest professional and regulatory standards.",
  },
  {
    icon: Trophy,
    title: "Leading real estate experts in Kigali",
    desc: "We are the leading real estate expert in Kigali, with unmatched market knowledge and a proven track record across Rwanda.",
  },
  {
    icon: Sparkles,
    title: "Excellent, reliable & wow service",
    desc: "We provide excellent, reliable and wow service to our valued customers — every interaction is designed to exceed your expectations.",
  },
]

export default async function HomePage() {
  let featuredProps: ApiProperty[] = []
  try { featuredProps = await getFeaturedProperties() } catch {}

  return (
    <>
      <Navbar />
      <HeroBanner />

      {/* ── STATS ── */}
      <section className="bg-[oklch(0.12_0.01_250)] py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 text-center sm:px-6 md:grid-cols-4">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-amber-400">{s.value}</p>
              <p className="mt-1 text-sm text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">Hand-picked for you</p>
            <h2 className="text-3xl font-black sm:text-4xl">Featured Properties</h2>
          </div>
          <Link href="/properties" className="hidden items-center gap-1 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline sm:inline-flex">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        {featuredProps.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProps.slice(0, 3).map(p => <PropertyCard key={p.id} property={p as any} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
            <p className="text-sm">No featured properties yet.</p>
            <Link href="/properties" className="mt-2 inline-block text-sm text-[oklch(0.42_0.19_25)] hover:underline">Browse all properties →</Link>
          </div>
        )}
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="bg-[oklch(0.97_0.005_80)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">Everything you need</p>
            <h2 className="text-3xl font-black sm:text-4xl">Our Services</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              KOSRES LTD is regulated by the Rwanda Development Board and the Institute of Real Property Valuers in Rwanda.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map(({ icon: Icon, title, href, desc }) => (
              <Link key={title} href={href} className="card-hover flex flex-col gap-3 rounded-xl border border-border bg-white p-5 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[oklch(0.97_0.03_25)] group-hover:bg-[oklch(0.42_0.19_25)] transition-colors">
                  <Icon size={20} className="text-[oklch(0.42_0.19_25)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm leading-snug font-bold group-hover:text-[oklch(0.42_0.19_25)] transition-colors">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
                <span className="mt-auto text-xs font-semibold text-[oklch(0.42_0.19_25)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PUBLICATIONS ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">Knowledge Hub</p>
            <h2 className="text-3xl font-black sm:text-4xl">Publications</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-md">
              Market reports, investment guides and real estate news from our experts.
            </p>
          </div>
          <Link href="/publications" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <PublicationsPreview />
      </section>

      {/* ── ABOUT / WHY CHOOSE US ── */}
      <section id="about" className="bg-[oklch(0.97_0.005_80)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* Top: image + intro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src="/images/WhatsApp Image 2026-06-04 at 09.15.39.jpeg" alt="KOSRES properties" fill className="object-cover" />
              </div>
              <div className="absolute -right-4 -bottom-4 rounded-xl bg-[oklch(0.42_0.19_25)] p-5 text-white shadow-xl">
                <Star size={22} className="mb-1 fill-amber-300 text-amber-300" />
                <p className="text-xl font-black">RDB</p>
                <p className="text-xs text-white/70">Regulated</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">Why Choose Us</p>
              <h2 className="mb-5 text-3xl leading-tight font-black sm:text-4xl">Rwanda's Most Trusted Real Estate Partner</h2>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                KOSRES LTD is a professional real estate consulting firm regulated by the Rwanda Development Board and the Institute of Real Property Valuers in Rwanda.
              </p>

              {/* Vision + Mission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-border">
                  <p className="text-xs font-bold text-[oklch(0.42_0.19_25)] uppercase tracking-wider mb-1">Vision</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">To be one of the best real estate service providers across Africa.</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-border">
                  <p className="text-xs font-bold text-[oklch(0.42_0.19_25)] uppercase tracking-wider mb-1">Mission</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Reliable, innovative real estate services powered by technology to achieve customers' financial goals.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us — 4 commitment cards */}
          <div>
            <p className="text-center text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase mb-8">
              What sets us apart
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyChooseUs.map(({ icon: Icon, title, desc }) => (
                <div key={title}
                  className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow group">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[oklch(0.42_0.19_25)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={22} className="text-white" />
                  </div>
                  {/* Title */}
                  <h3 className="font-black text-sm text-slate-800 leading-snug mb-2">
                    {title}
                  </h3>
                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Values row */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {["Accountability","Reliability","Honesty","Client-Focused","Excellence","Integrity"].map(v => (
                <span key={v}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-[oklch(0.42_0.19_25)]/8 text-[oklch(0.42_0.19_25)] border border-[oklch(0.42_0.19_25)]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.42_0.19_25)] flex-none" />
                  {v}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="bg-[oklch(0.12_0.01_250)] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold tracking-widest text-amber-400 uppercase">Get in Touch</p>
            <h2 className="text-3xl font-black sm:text-4xl">Book Your Consultation</h2>
          </div>
          <div className="grid gap-6 text-center sm:grid-cols-3">
            <a href="https://wa.me/250792871729?text=Hello%20KOSRES%2C%20I%27d%20like%20to%20book%20a%20consultation."
              target="_blank" rel="noopener noreferrer"
              className="whatsapp-btn flex flex-col items-center gap-3 rounded-xl p-7 transition-opacity hover:opacity-90">
              <Phone size={28} /><p className="font-bold">WhatsApp Us</p>
              <p className="text-sm text-white/80">+250 792 871 729</p>
            </a>
            <a href="mailto:kosresltd@gmail.com"
              className="flex flex-col items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-7 transition-colors hover:bg-white/20">
              <Mail size={28} /><p className="font-bold">Email Us</p>
              <p className="text-sm text-white/70">kosresltd@gmail.com</p>
            </a>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-7">
              <MapPin size={28} /><p className="font-bold">Find Us</p>
              <p className="text-center text-sm text-white/70">Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[oklch(0.08_0.01_250)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start gap-8 border-b border-white/10 pb-8 sm:flex-row sm:justify-between">
            <Image src="/kosres-logo.svg" alt="KOSRES LTD" width={180} height={54} className="h-11 w-auto brightness-0 invert opacity-70" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-2">
              {quickLinks.map(l => <a key={l.href} href={l.href} className="text-xs text-white/50 transition-colors hover:text-white">{l.label}</a>)}
            </div>
          </div>
          <p className="pt-6 text-center text-xs text-white/30">
            © {new Date().getFullYear()} KOSRES LTD · Kigali One Stop Real Estate Service · "All Services Under One Roof"
          </p>
        </div>
      </footer>
    </>
  )
}
