import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import { TrendingUp, Target, Shield, BarChart3 } from "lucide-react"

const ACCENT = "#7B1113"

const PROPERTY_TYPE_GROUPS = [
  { groupLabel: "RESIDENTIAL", items: ["Flats", "Single Family Home", "Town House", "Duplex", "Villa", "G+1"] },
  { groupLabel: "COMMERCIAL",  items: ["Office", "Shop", "Showroom", "Hotel", "Guest House", "Bar & Restaurant", "Fuel Station", "Factory", "Distribution Center", "Commercial Land"] },
  { groupLabel: "AGRICULTURAL",items: ["Farmland", "Crop Plantation", "Green House"] },
  { groupLabel: "INDUSTRIAL",  items: ["Industrial Land", "Factory", "Warehouse", "Distribution Center"] },
]

const highlights = [
  { icon: Target,     title: "Tailored Opportunities", desc: "We match properties precisely to your investment goals, budget and intended use." },
  { icon: Shield,     title: "Risk-Informed Decisions", desc: "Every recommendation is backed by market data, due diligence and valuation." },
  { icon: BarChart3,  title: "Across All Rwanda",       desc: "From Kigali's hottest districts to fast-growing secondary cities." },
  { icon: TrendingUp, title: "Maximum ROI Focus",       desc: "We identify opportunities aligned with your financial objectives for the best returns." },
]

export default function InvestPage() {
  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Invest in Kigali Real Estate / IKRE"
      subtitle="Investment Services"
      breadcrumb="Invest in Kigali Real Estate"
      description="Your gateway to discovering the most rewarding property investment opportunities in Rwanda, tailored to your unique investment goals and budget. At KOSRES LTD, we specialize in helping clients identify ideal real estate investment opportunities across Kigali and Rwanda."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {highlights.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: ACCENT + "15" }}>
              <Icon size={18} style={{ color: ACCENT }} />
            </div>
            <h3 className="font-bold text-sm mb-1 text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-5xl">
        <h2 className="text-xl font-black mb-6 text-slate-800">Find Your Investment Opportunity</h2>
        <ServiceRequestForm
          accentColor={ACCENT}
          serviceTitle="Invest in Kigali Real Estate"
          waMessagePrefix="Hello KOSRES, I'm interested in a real estate investment opportunity."
          columnHeaders={["Your Name", "Email Address", "Contact", "Investment Type", "Property Type", "Locations", "Price Range", "Request"]}
          fields={[
            // ── Identity first ──
            { name: "name",           label: "Your Name",       type: "text",           required: true, placeholder: "Full name" },
            { name: "email",          label: "Email Address",   type: "email",          required: true, placeholder: "your@email.com" },
            { name: "contact",        label: "Contact",         type: "tel",            required: true, placeholder: "+250 7XX XXX XXX" },
            // ── Service fields ──
            { name: "investmentType", label: "Investment Type", type: "select",         required: true,
              options: ["Buy Hold and Sell","Buy, Renovate and Resell","Buy to Rent","Green and Smart Properties","Developing Residential House","Developing Industrial House","Developing Commercial Space","Developing Affordable Housing"] },
            { name: "propertyType",   label: "Property Type",  type: "grouped-select", required: true, groups: PROPERTY_TYPE_GROUPS },
            { name: "district",       label: "Locations",      type: "select",         required: true,
              options: ["Kicukiro","Nyarugenge","Gasabo","Musanze","Rubavu","Muhanga","Kayonza","Rusizi","Gatsibo"] },
            { name: "priceRange",     label: "Price Range",    type: "text",           placeholder: "Type amount" },
            { name: "request",        label: "Request",        type: "text",           placeholder: "Your request" },
          ]}
        />
      </div>
    </ServiceLayout>
  )
}
