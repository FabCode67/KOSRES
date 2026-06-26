import type { Metadata } from "next"
import ServiceLayout from "@/components/ServiceLayout"
import BuySellRentListings from "@/components/BuySellRentListings"
import { Home, Key, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Buy, Sell & Rent Property in Rwanda",
  description:
    "Buy, sell or rent residential, commercial and agricultural properties across Rwanda. KOSRES LTD connects buyers, sellers and tenants with professional support throughout every transaction.",
  keywords: [
    "buy property Rwanda", "sell house Kigali", "rent apartment Rwanda",
    "property for sale Kigali", "house for rent Rwanda", "commercial property sale Rwanda",
    "short stay apartment Kigali", "real estate agent Rwanda",
  ],
  openGraph: {
    title: "Buy, Sell & Rent Property in Rwanda | KOSRES LTD",
    description: "Browse properties for sale, rent and short stay across all 30 districts of Rwanda.",
    url: "https://www.kosres.rw/services/buy-sell-rent",
  },
  alternates: { canonical: "https://www.kosres.rw/services/buy-sell-rent" },
}

const ACCENT = "#7B1113"

const highlights = [
  { icon: Home,  title: "For Property Owners",  desc: "We help you secure qualified buyers and tenants quickly, ensuring smooth transactions and best market value." },
  { icon: Key,   title: "For Buyers & Renters", desc: "We connect you with suitable properties matching your budget, preferences and investment objectives." },
  { icon: Clock, title: "Short Stay",            desc: "Daily, weekly and monthly furnished options for business travellers and short-term guests across Kigali." },
]

export default function BuySellRentPage() {
  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Buy / Sell & Rent"
      subtitle="Property Transactions"
      breadcrumb="Buy / Sell & Rent"
      description="KOSRES LTD provides professional property buying, selling, and rental services designed to make real estate transactions simple, efficient, and rewarding. With extensive market knowledge, professional guidance, and commitment to client satisfaction, we serve as a trusted partner for residential, commercial, and investment properties across Rwanda."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {highlights.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: ACCENT + "15" }}>
              <Icon size={18} style={{ color: ACCENT }} />
            </div>
            <h3 className="font-bold text-sm mb-1 text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <BuySellRentListings accent={ACCENT} />
    </ServiceLayout>
  )
}
