import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import { Search, FileSearch, AlertTriangle, Landmark } from "lucide-react"

const ACCENT = "#1A4731"

const PROPERTY_TYPE_GROUPS = [
  { groupLabel: "RESIDENTIAL", items: ["Flats", "Single Family Home", "Town House", "Duplex", "Villa", "G+1"] },
  { groupLabel: "COMMERCIAL",  items: ["Office", "Shop", "Showroom", "Hotel", "Guest House", "Bar & Restaurant", "Fuel Station", "Factory", "Distribution Center", "Commercial Land"] },
  { groupLabel: "AGRICULTURAL",items: ["Farmland", "Crop Plantation", "Green House"] },
  { groupLabel: "INDUSTRIAL",  items: ["Industrial Land", "Factory", "Warehouse", "Distribution Center"] },
]

const checks = [
  "Verify ownership and title documents",
  "Confirm seller's legal right to transfer ownership",
  "Assess quality and condition of buildings",
  "Determine whether market value matches purchase price",
  "Check for outstanding property taxes and utility bills",
  "Identify existing mortgages and encumbrances",
  "Review zoning regulations and caveats",
  "Verify accuracy of plot boundaries",
  "Assess potential resale value",
  "Check legal or physical issues affecting transferability",
]

const highlights = [
  { icon: Search,        title: "Thorough Investigation", desc: "Every aspect of the property's legal and physical status is examined before you commit." },
  { icon: FileSearch,    title: "Title Verification",     desc: "We confirm clean title, ownership chain and freedom from encumbrances." },
  { icon: AlertTriangle, title: "Risk Identification",    desc: "Uncover hidden liabilities, zoning issues and mortgages before they cost you." },
  { icon: Landmark,      title: "Market Value Check",     desc: "Verify that the asking price reflects the true current market value." },
]

export default function DueDiligencePage() {
  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Property Due Diligence"
      subtitle="Buyer Protection Services"
      breadcrumb="Property Due Diligence"
      description="KOSRES LTD helps property buyers determine the fair market value of a property, strengthen their negotiating position during transactions, and gain peace of mind when buying or selling real estate."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {highlights.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: ACCENT + "18" }}>
              <Icon size={18} style={{ color: ACCENT }} />
            </div>
            <h3 className="font-bold text-sm mb-1 text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-14">
        <h2 className="text-xl font-black mb-5 text-slate-800">What Our Due Diligence Covers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {checks.map(c => (
            <div key={c} className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm text-sm text-slate-700">
              <span className="flex-none mt-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ backgroundColor: ACCENT }}>✓</span>
              {c}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl">
        <h2 className="text-xl font-black mb-6 text-slate-800">Request Due Diligence</h2>
        <ServiceRequestForm
          accentColor={ACCENT}
          serviceTitle="Property Due Diligence"
          waMessagePrefix="Hello KOSRES, I need a property due diligence service."
          columnHeaders={["Your Name", "Email Address", "Contact", "Asset Type", "Purpose of Buy", "UPI", "Request"]}
          fields={[
            // ── Identity first ──
            { name: "name",         label: "Your Name",                         type: "text",           required: true, placeholder: "Full name" },
            { name: "email",        label: "Email Address",                     type: "email",          required: true, placeholder: "your@email.com" },
            { name: "contact",      label: "Contact",                           type: "tel",            required: true, placeholder: "+250 7XX XXX XXX" },
            // ── Service fields ──
            { name: "assetType",    label: "Asset Type",                        type: "grouped-select", required: true, groups: PROPERTY_TYPE_GROUPS },
            { name: "purposeOfBuy", label: "Purpose of Buy",                    type: "select",         required: true,
              options: ["Buy for Rent","Buy & Sale","Buy to Develop Residential House","Buy, Hold and Sell","Buy to Develop Commercial House","Buy to Develop Industrial House"] },
            { name: "upi",          label: "UPI",                               type: "text",           placeholder: "Type UPI" },
            { name: "request",      label: "Request for Property Due Diligence",type: "text",           placeholder: "Your request" },
          ]}
        />
      </div>
    </ServiceLayout>
  )
}
