import type { Metadata } from "next"
import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import { Scale, FileText, Banknote, ShieldCheck } from "lucide-react"
import { RWANDA_DISTRICTS_BY_PROVINCE, PROPERTY_TYPE_GROUPS } from "@/lib/rwanda"

export const metadata: Metadata = {
  title: "Property & Asset Valuation Services in Rwanda",
  description: "Professional independent property and asset valuations in Rwanda by IPPV members. Accepted by banks, embassies, courts and government. Loans, insurance, tax, visa applications and more.",
  keywords: ["property valuation Rwanda","asset valuation Kigali","real estate appraisal Rwanda","valuation for loan Rwanda","property valuation for visa","IPPV Rwanda valuer","insurance valuation Rwanda","property tax valuation Kigali"],
  openGraph: {
    title:       "Property & Asset Valuation Rwanda | KOSRES LTD",
    description: "Professional independent valuations accepted by banks, embassies, courts and government agencies in Rwanda.",
    url:         "https://www.kosres.com/services/valuation",
  },
  alternates: { canonical: "https://www.kosres.com/services/valuation" },
}

const ACCENT = "#1B3A5C"
const highlights = [
  { icon: Scale,       title: "Independent & Credible",  desc: "Valuations conducted in accordance with recognized international professional standards." },
  { icon: Banknote,    title: "All Asset Classes",        desc: "Real estate, plant & machinery, vehicles, biological assets, equipment and other tangible assets." },
  { icon: FileText,    title: "Compliant Reports",        desc: "Reliable valuation reports accepted by banks, embassies, courts, government agencies and insurers." },
  { icon: ShieldCheck, title: "Trusted by Institutions",  desc: "Used for financial reporting, loan security, insurance, acquisition, taxation and dispute resolution." },
]

export default function ValuationPage() {
  return (
    <ServiceLayout accentColor={ACCENT} title="Asset Valuation Services" subtitle="Professional Valuations" breadcrumb="Asset Valuation"
      description="KOSRES LTD provides professional and independent asset valuation services to help individuals, businesses, financial institutions and government agencies make informed decisions.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {highlights.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: ACCENT + "18" }}><Icon size={18} style={{ color: ACCENT }} /></div>
            <h3 className="font-bold text-sm mb-1 text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-black mb-6 text-slate-800">Request a Valuation</h2>
      <ServiceRequestForm accentColor={ACCENT} serviceTitle="Asset Valuation" waMessagePrefix="Hello KOSRES, I need an asset valuation."
        fields={[
          { name:"name",             label:"Your Name",            type:"text",           required:true, placeholder:"Full name" },
          { name:"email",            label:"Email Address",        type:"email",          required:true, placeholder:"your@email.com" },
          { name:"contact",          label:"Contact",              type:"tel",            required:true, placeholder:"+250 7XX XXX XXX" },
          { name:"propertyType",     label:"Asset Type",           type:"grouped-select", required:true, groups:PROPERTY_TYPE_GROUPS },
          { name:"valuationPurpose", label:"Purpose of Valuation", type:"select",         required:true, options:["Loan Application","Buy & Sale","Bookkeeping","Expropriation","Insurance","Taxation","Visa Application"] },
          { name:"district",         label:"District / Location",  type:"grouped-select", groups:RWANDA_DISTRICTS_BY_PROVINCE },
          { name:"upi",              label:"UPI (if available)",   type:"text",           placeholder:"e.g. 1/05/01/01/0001" },
          { name:"request",          label:"Describe the property or asset", type:"textarea", required:true, placeholder:"Location, size, construction type, current use…", colSpan:"full" },
        ]}
      />
    </ServiceLayout>
  )
}
