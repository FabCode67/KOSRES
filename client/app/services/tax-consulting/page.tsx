import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import { Receipt, Calculator, FileCheck, Scale } from "lucide-react"

const ACCENT = "#3D2B1F"

const PROPERTY_TYPE_GROUPS = [
  { groupLabel: "RESIDENTIAL", items: ["Flats", "Single Family Home", "Town House", "Duplex", "Villa", "G+1"] },
  { groupLabel: "COMMERCIAL",  items: ["Office", "Shop", "Showroom", "Hotel", "Guest House", "Bar & Restaurant", "Fuel Station", "Factory", "Distribution Center", "Commercial Land"] },
  { groupLabel: "AGRICULTURAL",items: ["Farmland", "Crop Plantation", "Green House"] },
  { groupLabel: "INDUSTRIAL",  items: ["Industrial Land", "Factory", "Warehouse", "Distribution Center"] },
]

const highlights = [
  { icon: Receipt,    title: "Full Compliance",     desc: "We ensure all your property tax obligations are met accurately and on time." },
  { icon: Calculator, title: "Liability Assessment", desc: "Precise calculation of your taxable amounts across all property types." },
  { icon: FileCheck,  title: "Declaration Filing",  desc: "We prepare and file your property tax declarations with the relevant authorities." },
  { icon: Scale,      title: "Dispute Resolution",  desc: "Expert guidance on appeals, disputes and documentation requirements." },
]

export default function TaxConsultingPage() {
  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Property Tax Consulting"
      subtitle="Tax Advisory Services"
      breadcrumb="Property Tax Consulting"
      description="KOSRES LTD assists property owners in identifying applicable property taxes, assessing outstanding tax liabilities, determining taxable amounts, preparing and filing property tax declarations, and ensuring timely payment of property taxes."
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
        <h2 className="text-xl font-black mb-6 text-slate-800">Request Tax Consulting</h2>
        <ServiceRequestForm
          accentColor={ACCENT}
          serviceTitle="Property Tax Consulting"
          waMessagePrefix="Hello KOSRES, I need property tax consulting services."
          columnHeaders={["Your Name", "Email Address", "Contact", "Asset Type", "Type of Property Tax", "UPI", "Request"]}
          fields={[
            // ── Identity first ──
            { name: "name",    label: "Your Name",     type: "text",  required: true, placeholder: "Full name" },
            { name: "email",   label: "Email Address", type: "email", required: true, placeholder: "your@email.com" },
            { name: "contact", label: "Contact",       type: "tel",   required: true, placeholder: "+250 7XX XXX XXX" },
            // ── Service fields ──
            { name: "assetType", label: "Asset Type",                    type: "grouped-select", required: true, groups: PROPERTY_TYPE_GROUPS },
            { name: "taxType",   label: "Select Type of Property Tax",   type: "select",         required: true,
              options: ["Immovable Property Tax","Tax on Sale of Immovable Property","Rental Income Tax","Land Lease or Lease Fees"] },
            { name: "upi",     label: "UPI",                             type: "text",            placeholder: "Type UPI" },
            { name: "request", label: "Request for Property Tax Consulting", type: "text",        placeholder: "Your request" },
          ]}
        />
      </div>
    </ServiceLayout>
  )
}
