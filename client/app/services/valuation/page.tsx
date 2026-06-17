import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import { Scale, FileText, Banknote, ShieldCheck } from "lucide-react"

const ACCENT = "#1B3A5C"

const PROPERTY_TYPE_GROUPS = [
  { groupLabel: "RESIDENTIAL", items: ["Flats","Single Family Home","Town House","Duplex","Villa","G+1"] },
  { groupLabel: "COMMERCIAL",  items: ["Office","Shop","Showroom","Hotel","Guest House","Bar & Restaurant","Fuel Station","Factory","Distribution Center","Commercial Land"] },
  { groupLabel: "AGRICULTURAL",items: ["Farmland","Crop Plantation","Green House"] },
  { groupLabel: "INDUSTRIAL",  items: ["Industrial Land","Factory","Warehouse","Distribution Center"] },
]

const highlights = [
  { icon: Scale,       title: "Independent & Credible",  desc: "Valuations conducted in accordance with recognized international professional standards." },
  { icon: Banknote,    title: "All Asset Classes",        desc: "Real estate, plant & machinery, vehicles, equipment, infrastructure and other tangible assets." },
  { icon: FileText,    title: "Compliant Reports",        desc: "Reliable valuation reports accepted by banks, courts, government agencies and insurers." },
  { icon: ShieldCheck, title: "Trusted by Institutions",  desc: "Used for financial reporting, loan security, insurance, acquisition, taxation and dispute resolution." },
]

export default function ValuationPage() {
  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Asset Valuation Services"
      subtitle="Professional Valuations"
      breadcrumb="Asset Valuation"
      description="KOSRES LTD provides professional and independent asset valuation services to help individuals, businesses, financial institutions and government agencies make informed decisions. Our valuations are conducted in accordance with recognized professional standards and tailored to meet specific client needs."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
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

      <h2 className="text-xl font-black mb-6 text-slate-800">Request a Valuation</h2>
      <ServiceRequestForm
        accentColor={ACCENT}
        serviceTitle="Asset Valuation"
        waMessagePrefix="Hello KOSRES, I need an asset valuation."
        fields={[
          { name: "name",             label: "Your Name",            type: "text",           required: true, placeholder: "Full name" },
          { name: "email",            label: "Email Address",        type: "email",          required: true, placeholder: "your@email.com" },
          { name: "contact",          label: "Contact",              type: "tel",            required: true, placeholder: "+250 7XX XXX XXX" },
          { name: "propertyType",     label: "Property Type",        type: "grouped-select", required: true, groups: PROPERTY_TYPE_GROUPS },
          { name: "valuationPurpose", label: "Purpose of Valuation", type: "select",         required: true,
            options: ["Loan Application","Buy & Sale","Bookkeeping","Expropriation","Insurance","Taxation"] },
          { name: "district",         label: "Location (District)",  type: "select",
            options: ["Kicukiro","Nyarugenge","Gasabo","Musanze","Rubavu","Muhanga","Kayonza","Rusizi","Bugesera"] },
          { name: "upi",              label: "UPI (if available)",   type: "text",           placeholder: "e.g. 1/05/01/01/0001" },
          { name: "request",          label: "Describe the property or asset", type: "textarea", required: true,
            placeholder: "Provide details about the property or asset to be valued — location, size, construction type, current use and any other relevant information…", colSpan: "full" },
        ]}
      />
    </ServiceLayout>
  )
}
