import Image from "next/image"
import Link from "next/link"
import {
  ShieldCheck,
  TrendingUp,
  Home,
  LayoutGrid,
  ClipboardList,
  Calculator,
  Settings,
  Car,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Star,
  Heart,
  Award,
  Trophy,
  Sparkles,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import HeroBanner from "@/components/HeroBanner"
import PropertyCard from "@/components/PropertyCard"
import PublicationsPreview from "@/components/PublicationsPreview"
import PartnersSection from "@/components/PartnersSection"
import StaffSection from "@/components/StaffSection"
import { getFeaturedProperties } from "@/lib/api"
import type { ApiProperty } from "@/lib/api"

const services = [
  {
    icon: TrendingUp,
    title: "Invest in Kigali Real Estate",
    href: "/services/invest",
    desc: "Identify rewarding property opportunities tailored to your investment goals and budget across Rwanda.",
  },
  {
    icon: ShieldCheck,
    title: "Property Due Diligence",
    href: "/services/due-diligence",
    desc: "Verify ownership, title documents, zoning regulations, mortgages and full legal status before you buy.",
  },
  {
    icon: Home,
    title: "Buy / Sell & Rent",
    href: "/services/buy-sell-rent",
    desc: "Seamless residential, commercial, and short-stay property transactions across Kigali and Rwanda.",
  },
  {
    icon: Calculator,
    title: "Asset Valuation",
    href: "/services/valuation",
    desc: "Independent valuations for loans, sale/purchase, insurance, taxation, financial reporting and litigation.",
  },
  {
    icon: ClipboardList,
    title: "Property Tax Consulting",
    href: "/services/tax-consulting",
    desc: "Assess liabilities, prepare declarations, file returns and optimise your property tax obligations.",
  },
  {
    icon: Settings,
    title: "Property Management",
    href: "/services/property-management",
    desc: "Full-service management: tenant sourcing, rent collection, maintenance and financial reporting.",
  },
  {
    icon: Car,
    title: "Car Rent, Sell & Taxi",
    href: "/services/cars",
    desc: "Vehicle hire, car buying & selling, airport transfers, city rides and corporate taxi services across Rwanda.",
  },
  {
    icon: LayoutGrid,
    title: "Other Services",
    href: "/services/other",
    desc: "Architectural design, construction, quantity surveying, land surveying and environmental impact assessment.",
  },
]

const stats = [
  { value: "500+", label: "Properties Listed" },
  { value: "10+", label: "Years Experience" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "8", label: "Services Under One Roof" },
]

const quickLinks = [
  { label: "Properties", href: "/properties" },
  { label: "Publications", href: "/publications" },
  { label: "Team", href: "/team" },
  { label: "Invest", href: "/services/invest" },
  { label: "Cars", href: "/services/cars" },
  { label: "Valuation", href: "/services/valuation" },
  { label: "Management", href: "/services/property-management" },
  { label: "Contact", href: "/#contact" },
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
  try {
    featuredProps = await getFeaturedProperties()
  } catch {}

  return (
    <>
      <Navbar />
      <HeroBanner />

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
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
              Hand-picked for you
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">
              Featured Properties
            </h2>
          </div>
          <Link
            href="/properties"
            className="hidden items-center gap-1 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline sm:inline-flex"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>
        {featuredProps.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProps.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p as any} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <p className="text-sm">No featured properties yet.</p>
            <Link
              href="/properties"
              className="mt-2 inline-block text-sm text-[oklch(0.42_0.19_25)] hover:underline"
            >
              Browse all properties →
            </Link>
          </div>
        )}
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="bg-[oklch(0.97_0.005_80)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
              Everything you need
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">Our Services</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              KOSRES LTD is regulated by the Rwanda Development Board and the
              Institute of Real Property Valuers in Rwanda — all services under
              one roof.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map(({ icon: Icon, title, href, desc }) => (
              <Link
                key={title}
                href={href}
                className="card-hover group flex flex-col gap-3 rounded-xl border border-border bg-white p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[oklch(0.97_0.03_25)] transition-colors group-hover:bg-[oklch(0.42_0.19_25)]">
                  <Icon
                    size={20}
                    className="text-[oklch(0.42_0.19_25)] transition-colors group-hover:text-white"
                  />
                </div>
                <h3 className="text-sm leading-snug font-bold transition-colors group-hover:text-[oklch(0.42_0.19_25)]">
                  {title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
                <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-[oklch(0.42_0.19_25)] opacity-0 transition-opacity group-hover:opacity-100">
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
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
              Knowledge Hub
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">Publications</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Market reports, investment guides and real estate news from our
              experts.
            </p>
          </div>
          <Link
            href="/publications"
            className="hidden items-center gap-1 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline sm:inline-flex"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <PublicationsPreview />
      </section>

      {/* ── ABOUT / WHY CHOOSE US ── */}
      <section id="about" className="bg-[oklch(0.97_0.005_80)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="/images/WhatsApp Image 2026-06-04 at 09.15.39.jpeg"
                  alt="KOSRES properties"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -right-4 -bottom-4 rounded-xl bg-[oklch(0.42_0.19_25)] p-5 text-white shadow-xl">
                <Star
                  size={22}
                  className="mb-1 fill-amber-300 text-amber-300"
                />
                <p className="text-xl font-black">RDB</p>
                <p className="text-xs text-white/70">Regulated</p>
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
                Why Choose Us
              </p>
              <h2 className="mb-5 text-3xl leading-tight font-black sm:text-4xl">
                Rwanda's Most Trusted Real Estate Partner
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                KOSRES LTD is a professional real estate consulting firm
                regulated by the Rwanda Development Board and the Institute of
                Real Property Valuers in Rwanda.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-white p-4">
                  <p className="mb-1 text-xs font-bold tracking-wider text-[oklch(0.42_0.19_25)] uppercase">
                    Vision
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    To be one of the best real estate service providers across
                    Africa.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4">
                  <p className="mb-1 text-xs font-bold tracking-wider text-[oklch(0.42_0.19_25)] uppercase">
                    Mission
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Reliable, innovative real estate services powered by
                    technology to achieve customers' financial goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-8 text-center text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
              What sets us apart
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {whyChooseUs.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.42_0.19_25)] transition-transform group-hover:scale-110">
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="mb-2 text-sm leading-snug font-black text-slate-800">
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {[
                "Accountability",
                "Reliability",
                "Honesty",
                "Client-Focused",
                "Excellence",
                "Integrity",
              ].map((v) => (
                <span
                  key={v}
                  className="flex items-center gap-2 rounded-full border border-[oklch(0.42_0.19_25)]/20 bg-[oklch(0.42_0.19_25)]/8 px-4 py-2 text-sm font-semibold text-[oklch(0.42_0.19_25)]"
                >
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-[oklch(0.42_0.19_25)]" />
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="border-t border-border bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
                Meet the Experts
              </p>
              <h2 className="text-3xl font-black sm:text-4xl">Our Team</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                The dedicated professionals behind KOSRES LTD.
              </p>
            </div>
            <Link
              href="/team"
              className="hidden items-center gap-1 text-sm font-semibold text-[oklch(0.42_0.19_25)] hover:underline sm:inline-flex"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <StaffSection />
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="border-t border-border bg-[oklch(0.97_0.005_80)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
              Trusted Partners
            </p>
            <h2 className="text-3xl font-black text-slate-800">Our Partners</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We collaborate with leading financial and institutional partners
              to deliver the best real estate solutions to our clients.
            </p>
          </div>
          <PartnersSection />
        </div>
      </section>

      {/* ── SOCIAL MEDIA ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold tracking-widest text-[oklch(0.42_0.19_25)] uppercase">
              Follow Us
            </p>
            <h2 className="text-3xl font-black text-slate-800">
              Stay Connected
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Follow KOSRES LTD on social media for the latest property
              listings, market insights and real estate news.
            </p>
          </div>

          {/* 6 platforms — 2 cols mobile, 3 tablet, 6 desktop */}
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {/* WhatsApp */}
            <a
              href="https://wa.me/250781209709"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#25D366] hover:shadow-lg"
              style={{ backgroundColor: "#f0fdf4" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: "#25D366" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">WhatsApp</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  +250 781 209 709
                </p>
                <p
                  className="mt-1 text-[10px] font-semibold"
                  style={{ color: "#25D366" }}
                >
                  Chat →
                </p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/kosres2026?igsh=MTNyMGY0dDVpamdlZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#E1306C] hover:shadow-lg"
              style={{ backgroundColor: "#fff0f5" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{
                  background:
                    "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">Instagram</p>
                <p className="mt-0.5 text-[10px] text-slate-500">@kosres2026</p>
                <p
                  className="mt-1 text-[10px] font-semibold"
                  style={{ color: "#E1306C" }}
                >
                  Follow →
                </p>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1Ng4AZUsex/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2] hover:shadow-lg"
              style={{ backgroundColor: "#eff6ff" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: "#1877F2" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">Facebook</p>
                <p className="mt-0.5 text-[10px] text-slate-500">KOSRES LTD</p>
                <p
                  className="mt-1 text-[10px] font-semibold"
                  style={{ color: "#1877F2" }}
                >
                  Like →
                </p>
              </div>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@kigali.one.stop.r"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#010101] hover:shadow-lg"
              style={{ backgroundColor: "#f8f8f8" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: "#010101" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">TikTok</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  @kigali.one.stop.r
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-700">
                  Follow →
                </p>
              </div>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@kigalionestoprealestateservice?si=OoB431_iEcjpPbCL"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF0000] hover:shadow-lg"
              style={{ backgroundColor: "#fff5f5" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: "#FF0000" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">YouTube</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  @kigalionestop
                </p>
                <p
                  className="mt-1 text-[10px] font-semibold"
                  style={{ color: "#FF0000" }}
                >
                  Subscribe →
                </p>
              </div>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/KOSRESLTD"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#000000] hover:shadow-lg"
              style={{ backgroundColor: "#f0f0f0" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: "#000000" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">X (Twitter)</p>
                <p className="mt-0.5 text-[10px] text-slate-500">@KOSRESLTD</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-700">
                  Follow →
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section
        id="contact"
        className="bg-[oklch(0.12_0.01_250)] py-20 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold tracking-widest text-amber-400 uppercase">
              Get in Touch
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">
              Book Your Consultation
            </h2>
          </div>
          <div className="grid gap-5 text-center sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="https://wa.me/250781209709?text=Hello%20KOSRES%2C%20I%27d%20like%20to%20book%20a%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn flex flex-col items-center gap-3 rounded-2xl p-7 transition-opacity hover:opacity-90"
            >
              <Phone size={28} />
              <p className="font-bold">WhatsApp Us</p>
              <p className="text-sm text-white/80">+250 781 209 709</p>
            </a>
            <a
              href="mailto:kosresltd@gmail.com"
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-7 transition-colors hover:bg-white/20"
            >
              <Mail size={28} />
              <p className="font-bold">Email Us</p>
              <p className="text-sm text-white/70">kosresltd@gmail.com</p>
            </a>
            <a
              href="https://maps.google.com/?q=Beatitude+House+Hotel+Okapi+KN87+Street+Kigali"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-7 transition-colors hover:bg-white/20"
            >
              <MapPin size={28} />
              <p className="font-bold">Visit Our Office</p>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-amber-300">
                  BEATITUDE HOUSE
                </p>
                <p className="text-xs text-white/70">Opposite Hotel Okapi</p>
                <p className="text-xs text-white/70">4th Floor, KN87 Street</p>
                <p className="text-xs text-white/70">Kigali, Rwanda</p>
                <p className="mt-1.5 text-[11px] font-semibold text-amber-300/80">
                  Get directions →
                </p>
              </div>
            </a>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-7">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
              >
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
              </svg>
              <p className="font-bold">Office Hours</p>
              <div className="space-y-1">
                <p className="text-xs text-white/70">Mon – Fri: 8:00 – 17:00</p>
                <p className="text-xs text-white/70">Saturday: 9:00 – 13:00</p>
                <p className="text-xs text-white/40">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[oklch(0.08_0.01_250)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start gap-8 border-b border-white/10 pb-8 sm:flex-row sm:justify-between">
            <Image
              src="/images/kosres_logo_refined.png"
              alt="KOSRES LTD"
              width={140}
              height={90}
              className="h-14 w-auto object-cover"
            />
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 sm:grid-cols-3">
              {quickLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-xs text-white/50 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <p className="pt-6 text-center text-xs text-white/30">
            © {new Date().getFullYear()} KOSRES LTD · Kigali One Stop Real
            Estate Service · "All Services Under One Roof"
          </p>
        </div>
      </footer>
    </>
  )
}
