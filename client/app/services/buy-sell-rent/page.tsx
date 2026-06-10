import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import Link from "next/link"
import { Home, Key, Clock, ChevronRight } from "lucide-react"

const ACCENT = "#7B1113"

const PROPERTY_TYPE_GROUPS = [
  { groupLabel: "RESIDENTIAL", items: ["Flats", "Single Family Home", "Town House", "Duplex", "Villa", "G+1"] },
  { groupLabel: "COMMERCIAL",  items: ["Office", "Shop", "Showroom", "Hotel", "Guest House", "Bar & Restaurant", "Fuel Station", "Factory", "Distribution Center", "Commercial Land"] },
  { groupLabel: "AGRICULTURAL",items: ["Farmland", "Crop Plantation", "Green House"] },
  { groupLabel: "INDUSTRIAL",  items: ["Industrial Land", "Factory", "Warehouse", "Distribution Center"] },
]

const highlights = [
  { icon: Home,  title: "For Property Owners", desc: "We help you secure qualified buyers and tenants quickly, ensuring smooth transactions and best market value." },
  { icon: Key,   title: "For Buyers & Renters", desc: "We connect you with suitable properties matching your budget, preferences and investment objectives." },
  { icon: Clock, title: "Short Stay",           desc: "Daily, weekly and monthly furnished options for business travellers and short-term guests across Kigali." },
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

      <div className="mb-14 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4" style={{ backgroundColor: ACCENT }}>
        <div>
          <h2 className="text-xl font-black mb-1">Browse All Listings</h2>
          <p className="text-white/70 text-sm">View our full portfolio — for sale, for rent and short stay.</p>
        </div>
        <Link href="/properties"
          className="flex-none inline-flex items-center gap-2 bg-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap"
          style={{ color: ACCENT }}>
          View Properties <ChevronRight size={15} />
        </Link>
      </div>

      <div className="max-w-5xl">
        <h2 className="text-xl font-black mb-6 text-slate-800">Submit a Property Request</h2>
        <ServiceRequestForm
          accentColor={ACCENT}
          serviceTitle="Buy / Sell & Rent"
          waMessagePrefix="Hello KOSRES, I have a property enquiry."
          columnHeaders={["Your Name", "Email Address", "Contact", "Search Location", "Offer Type", "Property Type"]}
          fields={[
            // ── Identity first ──
            { name: "name",           label: "Your Name",             type: "text",           required: true, placeholder: "Full name" },
            { name: "email",          label: "Email Address",         type: "email",          required: true, placeholder: "your@email.com" },
            { name: "contact",        label: "Contact",               type: "tel",            required: true, placeholder: "+250 7XX XXX XXX" },
            // ── Service fields ──
            { name: "searchLocation", label: "Search Location",       type: "text",           required: true, placeholder: "District, Sector, Cell, Village" },
            { name: "offerType",      label: "Select Offer Type",     type: "select",         required: true,
              options: ["Rent","Sale","Buy","Short-term Rent"] },
            { name: "propertyType",   label: "Select Property Type",  type: "grouped-select", required: true, groups: PROPERTY_TYPE_GROUPS },
          ]}
        />
      </div>
    </ServiceLayout>
  )
}
