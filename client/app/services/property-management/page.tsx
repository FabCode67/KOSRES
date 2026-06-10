import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import { Users, DollarSign, Wrench, BarChart3 } from "lucide-react"

const ACCENT = "#1C2B4B"

const ASSET_TYPE_GROUPS = [
  { groupLabel: "RESIDENTIAL",  items: ["Apartment Buildings"] },
  { groupLabel: "COMMERCIAL",   items: ["Office Buildings","Retail Shops","Shopping Malls","Hotels","Motels","Guest Houses","Fuel Stations","Bar & Restaurant"] },
  { groupLabel: "INDUSTRIAL",   items: ["Warehouses","Distribution Centers","Industrial Facilities","Factories"] },
  { groupLabel: "SPECIAL USE",  items: ["Religious Properties","Government-Owned Buildings","Hospitals and Healthcare Facilities","Schools and Educational Facilities"] },
]

const highlights = [
  { icon: Users,      title: "Tenant Management",    desc: "We source qualified tenants, manage relationships and resolve disputes professionally." },
  { icon: DollarSign, title: "Rental Income Growth", desc: "Continuous performance monitoring to maximise occupancy and rental returns." },
  { icon: Wrench,     title: "Property Maintenance", desc: "Proactive maintenance to keep your property in top condition and protect its value." },
  { icon: BarChart3,  title: "Financial Reporting",  desc: "Transparent budgeting, financial reporting and tax compliance management." },
]

export default function PropertyManagementPage() {
  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Property Management Services"
      subtitle="Full-Service Property Management"
      breadcrumb="Property Management"
      description="KOSRES LTD offers comprehensive property management services designed to protect your investment, maximize rental income, and enhance the long-term value of your property. Our proactive approach ensures properties are well-maintained and rental performance is continuously monitored to achieve sustainable income growth."
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

      <div className="max-w-5xl">
        <h2 className="text-xl font-black mb-6 text-slate-800">Request Property Management</h2>
        <ServiceRequestForm
          accentColor={ACCENT}
          serviceTitle="Property Management"
          waMessagePrefix="Hello KOSRES, I need property management services."
          columnHeaders={["Your Name", "Email Address", "Contact", "Management Service", "Asset Type", "UPI", "Request"]}
          fields={[
            // ── Identity first ──
            { name: "name",    label: "Your Name",     type: "text",  required: true, placeholder: "Full name" },
            { name: "email",   label: "Email Address", type: "email", required: true, placeholder: "your@email.com" },
            { name: "contact", label: "Contact",       type: "tel",   required: true, placeholder: "+250 7XX XXX XXX" },
            // ── Service fields ──
            { name: "managementService", label: "Select Property Management Services", type: "select", required: true,
              options: ["Tenant Sourcing","Rent Collection and Management","Lease Preparation and Administration","Property Maintenance and Repairs Coordination","Property Inspections and Condition Reporting","Tenant Relationship Management and Dispute Resolution","Service Charge and Utility Management","Property Marketing and Vacancy Management","Financial Reporting and Budget Management","Property Tax and Regulatory Compliance Support","Asset Performance Monitoring and Value Enhancement"] },
            { name: "assetType", label: "Select Asset Type", type: "grouped-select", required: true, groups: ASSET_TYPE_GROUPS },
            { name: "upi",     label: "UPI",     type: "text", placeholder: "Type UPI" },
            { name: "request", label: "Request", type: "text", placeholder: "Your request" },
          ]}
        />
      </div>
    </ServiceLayout>
  )
}
