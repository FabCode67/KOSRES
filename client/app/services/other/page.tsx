"use client"

import { useState } from "react"
import ServiceLayout from "@/components/ServiceLayout"
import {
  PenTool, Hammer, Calculator, MapPin, Leaf,
  ChevronDown, ChevronRight, Send, Loader2, MessageCircle,
} from "lucide-react"
import { submitServiceRequest } from "@/lib/api"
import { whatsappLink } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/social-icons"

const ACCENT = "#2D4A1E"

// ── Service catalogue ────────────────────────────────────────────────
const OTHER_SERVICES = [
  {
    key:   "architectural",
    label: "Architectural Design",
    icon:  PenTool,
    color: "#7B1113",
    sub: [
      "Detailed architectural drawings for construction",
      "Building permit applications",
      "Site analysis and feasibility studies",
      "Interior design",
      "Renovation design",
      "Project coordination",
      "Construction supervision",
    ],
  },
  {
    key:   "construction",
    label: "Construction and Building Maintenance",
    icon:  Hammer,
    color: "#1B3A5C",
    sub: [
      "Construction of new house",
      "Building extensions and additions",
      "Renovation and remodeling works",
      "Project supervision",
      "Electrical and plumbing installations",
      "Roofing works",
      "Painting",
      "Structural repairs",
      "Preventive maintenance",
      "Facility management",
      "General building maintenance services",
    ],
  },
  {
    key:   "quantity",
    label: "Quantity Surveying Services",
    icon:  Calculator,
    color: "#3D2B1F",
    sub: [
      "Preparation of Bills of Quantities (BOQ)",
      "Cost estimation and budgeting",
      "Cost planning",
      "Tender documentation and evaluation",
      "Construction cost control",
      "Contract administration",
    ],
  },
  {
    key:   "land",
    label: "Land Surveying Services",
    icon:  MapPin,
    color: "#1C2B4B",
    sub: [
      "Cadastral and boundary surveys",
      "Land subdivision and consolidation",
      "Topographical surveys",
      "Engineering and construction surveys",
      "Building setting-out",
      "GIS and digital mapping",
      "Preparation of survey maps",
    ],
  },
  {
    key:   "eia",
    label: "Environmental Impact Assessment",
    icon:  Leaf,
    color: "#1A4731",
    sub: [
      "Environmental and social impact assessments",
      "Environmental screening and scoping",
      "Baseline studies",
      "Preparation of EIA reports",
      "Environmental risk assessments",
      "Environmental permitting and compliance support",
      "Environmental management plans",
      "Environmental monitoring and audits",
      "Stakeholder consultations",
      "Waste management planning",
      "Biodiversity assessments",
      "Sustainability advisory services",
    ],
  },
]

// Build the flat "specific service" list for the dropdown (grouped)
const SPECIFIC_SERVICES: { group: string; items: string[] }[] = OTHER_SERVICES.map(s => ({
  group: s.label,
  items: s.sub,
}))

// ── Component ─────────────────────────────────────────────────────────
export default function OtherServicesPage() {
  const [selectedService,  setSelectedService]  = useState("")
  const [selectedSpecific, setSelectedSpecific] = useState("")
  const [expandedKey,      setExpandedKey]      = useState<string | null>(null)

  const [form,    setForm]    = useState({ name: "", contact: "", email: "", address: "", upi: "", request: "" })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")

  const toggle = (key: string) => setExpandedKey(prev => prev === key ? null : key)

  const handleServiceSelect = (label: string) => {
    setSelectedService(label)
    setSelectedSpecific("")
    setExpandedKey(OTHER_SERVICES.find(s => s.label === label)?.key ?? null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim())    { setError("Name is required."); return }
    if (!form.contact.trim()) { setError("Contact is required."); return }
    if (!selectedService)     { setError("Please select a service."); return }
    setSending(true); setError("")
    try {
      await submitServiceRequest({
        service: `Other Services — ${selectedService}`,
        name:    form.name,
        email:   form.email   || undefined,
        contact: form.contact,
        data: {
          service:         selectedService,
          specificService: selectedSpecific,
          address:         form.address,
          upi:             form.upi,
          request:         form.request,
        },
      })
      setSent(true)
    } catch { setError("Something went wrong. Please try WhatsApp.") }
    setSending(false)
  }

  const waMessage = `Hello KOSRES, I need:\n\n📋 *${selectedService || "Other Service"}*\n${selectedSpecific ? `   ↳ ${selectedSpecific}\n` : ""}
Name: ${form.name || "..."}\nContact: ${form.contact || "..."}\n${form.upi ? `UPI: ${form.upi}\n` : ""}${form.address ? `Address: ${form.address}\n` : ""}\n${form.request}`

  const inp  = "w-full px-4 py-2.5 text-sm border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
  const lbl  = "block text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1.5"
  const selCls = `${inp} cursor-pointer appearance-none`

  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Other Services"
      subtitle="Additional Services"
      breadcrumb="Other Services"
      description="KOSRES LTD offers other services, including house design and construction permit application, construction of new houses and maintenance of existing buildings, construction cost management / quantity surveying services, land surveying, and environmental impact assessment."
    >

      {/* ── Services catalogue — accordion ── */}
      <div className="mb-14">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
          What's included
        </p>
        <div className="space-y-3">
          {OTHER_SERVICES.map(({ key, label, icon: Icon, color, sub }) => (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggle(key)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-none"
                  style={{ backgroundColor: color + "15" }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <span className="flex-1 font-bold text-sm text-slate-800">{label}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${expandedKey === key ? "rotate-180" : ""}`}
                />
              </button>
              {expandedKey === key && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {sub.map(item => (
                      <button
                        key={item}
                        onClick={() => { handleServiceSelect(label); setSelectedSpecific(item) }}
                        className={`flex items-center gap-2 text-left px-3 py-2 rounded-xl text-xs transition-all ${
                          selectedSpecific === item && selectedService === label
                            ? "font-bold text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        style={selectedSpecific === item && selectedService === label
                          ? { backgroundColor: color }
                          : undefined
                        }
                      >
                        <ChevronRight size={11} className="flex-none opacity-50" />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Request Form ── */}
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: ACCENT }}>

        {/* Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-white/10">
          <span className="text-amber-300 text-[10px] font-bold tracking-widest uppercase">
            Other Services
          </span>
          <h2 className="text-xl font-black text-white mt-0.5">Submit Your Request</h2>
          <p className="text-white/50 text-xs mt-1">
            Select a service above or use the dropdowns below — we'll respond within 24 hours.
          </p>
        </div>

        {sent ? (
          <div className="px-8 py-12 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={28} />
            </div>
            <h3 className="text-xl font-black mb-2">Request Sent!</h3>
            <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
              Our team will reach out within 24 hours about your <strong className="text-white">{selectedService}</strong> request.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer"
                className="whatsapp-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm">
                <WhatsAppIcon size={16} /> Also chat on WhatsApp
              </a>
              <button onClick={() => { setSent(false); setForm({ name: "", contact: "", email: "", address: "", upi: "", request: "" }); setSelectedService(""); setSelectedSpecific("") }}
                className="px-6 py-3 rounded-xl bg-white/15 font-semibold text-sm hover:bg-white/25 transition-colors">
                Send another request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-5">

            {/* ── Row 1: Contact details ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={lbl}>Your Name <span className="text-amber-300">*</span></label>
                <input type="text" required placeholder="Full name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Contact <span className="text-amber-300">*</span></label>
                <input type="tel" required placeholder="+250 7XX XXX XXX" value={form.contact}
                  onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" placeholder="your@email.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Address</label>
                <input type="text" placeholder="Your address" value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inp} />
              </div>
            </div>

            {/* ── Row 2: Service selectors + UPI ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Other Service */}
              <div>
                <label className={lbl}>Other Service <span className="text-amber-300">*</span></label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={e => handleServiceSelect(e.target.value)}
                    className={selCls}
                  >
                    <option value="" style={{ background: ACCENT }}>Select other service</option>
                    {OTHER_SERVICES.map(s => (
                      <option key={s.key} value={s.label} style={{ background: ACCENT }}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                </div>
              </div>

              {/* Specific Service */}
              <div>
                <label className={lbl}>Select Specific Service</label>
                <div className="relative">
                  <select
                    value={selectedSpecific}
                    onChange={e => setSelectedSpecific(e.target.value)}
                    className={selCls}
                    disabled={!selectedService}
                  >
                    <option value="" style={{ background: ACCENT }}>Select specific service</option>
                    {selectedService && SPECIFIC_SERVICES
                      .find(g => g.group === selectedService)
                      ?.items.map(item => (
                        <option key={item} value={item} style={{ background: ACCENT }}>{item}</option>
                      ))
                    }
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                </div>
              </div>

              {/* UPI */}
              <div>
                <label className={lbl}>UPI (if applicable)</label>
                <input type="text" placeholder="e.g. 1/05/01/01/0001" value={form.upi}
                  onChange={e => setForm(f => ({ ...f, upi: e.target.value }))} className={inp} />
              </div>

              {/* Request other services — small textarea in the grid */}
              <div>
                <label className={lbl}>Request Other Services</label>
                <input type="text" placeholder="Any other service needed?" value={form.request}
                  onChange={e => setForm(f => ({ ...f, request: e.target.value }))} className={inp} />
              </div>
            </div>

            {/* ── Full-width request textarea ── */}
            <div>
              <label className={lbl}>Describe Your Request</label>
              <textarea rows={5} value={form.request}
                onChange={e => setForm(f => ({ ...f, request: e.target.value }))}
                placeholder="Provide full details about what you need — location, scope of work, timeline, budget, any existing drawings or permits, and any other relevant information…"
                className={`${inp} resize-none leading-relaxed`}
              />
            </div>

            {error && (
              <p className="text-amber-300 text-xs font-semibold bg-white/10 px-3 py-2 rounded-lg">⚠ {error}</p>
            )}

            {/* ── Actions ── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
              <button type="submit" disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white font-bold text-sm disabled:opacity-60 hover:bg-white/90 transition-colors"
                style={{ color: ACCENT }}>
                {sending
                  ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                  : <><Send size={14} /> Submit Request</>
                }
              </button>
              <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl whatsapp-btn text-white font-bold text-sm hover:opacity-90 transition-opacity">
                <WhatsAppIcon size={15} /> WhatsApp
              </a>
            </div>
            <p className="text-center text-[10px] text-white/30">
              Your information is kept confidential and used only to process your request.
            </p>
          </form>
        )}
      </div>

    </ServiceLayout>
  )
}
