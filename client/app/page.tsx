import Image from "next/image"
import Link from "next/link"
import {
  Search, ShieldCheck, TrendingUp, Home, Building2,
  ClipboardList, Calculator, Settings, Phone, Mail,
  MapPin, ChevronRight, Star,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import PropertyCard from "@/components/PropertyCard"
import { SEED_PROPERTIES } from "@/lib/properties"

const featuredProps = SEED_PROPERTIES.filter((p) => p.featured).slice(0, 3)

const services = [
  { icon: TrendingUp,    title: "Invest in Kigali Real Estate", desc: "Identify rewarding property opportunities tailored to your investment goals and budget across Rwanda." },
  { icon: ShieldCheck,   title: "Property Due Diligence",       desc: "Verify ownership, title documents, zoning regulations, mortgages and full legal status before you buy." },
  { icon: Home,          title: "Buy / Sell & Rent",            desc: "Seamless residential, commercial, and short-stay property transactions across Kigali and Rwanda." },
  { icon: Building2,     title: "Design & Construction",        desc: "Expert architectural design, quantity surveying and project management for residential and commercial builds." },
  { icon: Calculator,    title: "Asset Valuation",              desc: "Independent valuations for loans, sale/purchase, insurance, taxation, financial reporting and litigation." },
  { icon: ClipboardList, title: "Property Tax Consulting",      desc: "Assess liabilities, prepare declarations, file returns and optimise your property tax obligations." },
  { icon: Settings,      title: "Property Management",         desc: "Full-service management: tenant sourcing, rent collection, maintenance and financial reporting." },
]

const stats = [
  { value: "500+", label: "Properties Listed"     },
  { value: "10+",  label: "Years Experience"       },
  { value: "98%",  label: "Client Satisfaction"    },
  { value: "7",    label: "Services Under One Roof"},
]

const quickLinks = [
  { label: "Properties", href: "/properties" },
  { label: "Services",   href: "/#services"  },
  { label: "About",      href: "/#about"     },
  { label: "Contact",    href: "/#contact"   },
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative flex min-h-[92vh] items-center pt-20">
        <Image
          src="/images/WhatsApp Image 2026-06-04 at 09.15.38.jpeg"
          alt="Kigali skyline"
          fill priority
          className="object-cover"
        />
        <div className="hero-gradient absolute inset-0" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="animate-fade-up max-w-2xl">
            {/* Full logo — inverted white for hero */}
            <div className="mb-8">
              <Image
                src="/kosres-logo.svg"
                alt="KOSRES LTD"
                width={260}
                height={78}
                className="h-14 w-auto brightness-0 invert"
              />
            </div>

            <h1 className="mb-6 text-4xl leading-[1.1] font-black text-white sm:text-5xl lg:text-6xl">
              Your Trusted Real Estate Advisor in a Land of{" "}
              <span className="gold-text">Thousand Opportunities</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-white/80">
              Connecting you with your dream property — buy, sell, rent, invest,
              manage and value real estate across Rwanda. All services under one roof.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/properties"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[oklch(0.42_0.19_25)] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[oklch(0.36_0.18_25)]">
                <Search size={17} /> Browse Properties
              </Link>
              <Link href="/#contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/15 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25">
                Book a Consultation <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[oklch(0.12_0.01_250)] py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 text-center sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
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
          <Link href="/properties"
            className="hidden items-center gap-1 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline sm:inline-flex">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProps.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/properties"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline">
            View all properties <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="bg-[oklch(0.97_0.005_80)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">Everything you need</p>
            <h2 className="text-3xl font-black sm:text-4xl">Our Services</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              KOSRES LTD is regulated by the Rwanda Development Board and the Institute of Real Property Valuers in Rwanda — delivering excellence under one roof.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover flex flex-col gap-3 rounded-xl border border-border bg-white p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[oklch(0.97_0.03_25)]">
                  <Icon size={20} className="text-[oklch(0.42_0.19_25)]" />
                </div>
                <h3 className="text-sm leading-snug font-bold">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2">
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
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            KOSRES LTD is a professional real estate consulting firm regulated by the Rwanda Development Board and the Institute of Real Property Valuers in Rwanda. We pride ourselves on delivering excellent services under one roof.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {["Accountability", "Reliability", "Honesty", "Client-Focused"].map((v) => (
              <div key={v} className="flex items-center gap-2 text-sm font-medium">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.42_0.19_25)] text-xs font-bold text-white">✓</span>
                {v}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-border bg-muted p-4">
            <p className="text-xs text-muted-foreground italic">
              "To be one of the best real estate service providers across Africa — delivering reliable and innovative services powered by technology to achieve customers' financial goals."
            </p>
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
              <Phone size={28} />
              <p className="font-bold">WhatsApp Us</p>
              <p className="text-sm text-white/80">+250 792 871 729</p>
            </a>
            <a href="mailto:kosresltd@gmail.com"
              className="flex flex-col items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-7 transition-colors hover:bg-white/20">
              <Mail size={28} />
              <p className="font-bold">Email Us</p>
              <p className="text-sm text-white/70">kosresltd@gmail.com</p>
            </a>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-7">
              <MapPin size={28} />
              <p className="font-bold">Find Us</p>
              <p className="text-center text-sm text-white/70">Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[oklch(0.08_0.01_250)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 border-b border-white/10 pb-8 sm:flex-row sm:justify-between">
            {/* Full logo only — no separate icon */}
            <Image
              src="/kosres-logo.svg"
              alt="KOSRES LTD"
              width={180}
              height={54}
              className="h-11 w-auto brightness-0 invert opacity-70"
            />
            {/* Quick links */}
            <nav className="flex flex-wrap justify-center gap-5 text-xs text-white/50">
              {quickLinks.map(l => (
                <a key={l.href} href={l.href} className="transition-colors hover:text-white">{l.label}</a>
              ))}
            </nav>
          </div>
          <p className="pt-6 text-center text-xs text-white/30">
            © {new Date().getFullYear()} KOSRES LTD · Kigali One Stop Real Estate Service · "All Services Under One Roof"
          </p>
        </div>
      </footer>
    </>
  )
}
