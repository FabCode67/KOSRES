"use client"

import { useState } from "react"
import { Check, Loader2, MessageCircle, Send } from "lucide-react"
import { whatsappLink } from "@/lib/utils"
import { submitServiceRequest } from "@/lib/api"

export interface FormField {
  name: string
  label: string
  type: "text" | "email" | "tel" | "select" | "grouped-select" | "textarea"
  options?: string[]
  groups?: { groupLabel: string; items: string[] }[]
  required?: boolean
  placeholder?: string
  colSpan?: "full" | "half"
}

interface ServiceRequestFormProps {
  serviceTitle:   string
  fields:         FormField[]
  waMessagePrefix?: string
  accentColor?:   string
  columnHeaders?: string[]   // kept for API compat but no longer rendered as a separate row
}

export default function ServiceRequestForm({
  serviceTitle, fields, waMessagePrefix, accentColor = "#8B0000",
}: ServiceRequestFormProps) {
  const [form,      setForm]      = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  const buildWaMessage = () => {
    const prefix  = waMessagePrefix || `Hello KOSRES, I'd like to request: ${serviceTitle}`
    const details = fields
      .filter(f => form[f.name])
      .map(f => `• ${f.label}: ${form[f.name]}`)
      .join("\n")
    return `${prefix}\n\n${details}`
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    fields.forEach(f => {
      if (f.required && !form[f.name]?.trim()) errs[f.name] = "This field is required"
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await submitServiceRequest({
        service: serviceTitle,
        name:    form.name    || form.yourName || "—",
        email:   form.email   || form.emailAddress || undefined,
        contact: form.contact || form.phone        || undefined,
        data:    form,
      })
    } catch { /* fail silently — WhatsApp always works */ }
    setLoading(false)
    setSubmitted(true)
  }

  const change = (name: string, value: string) => {
    setForm(p  => ({ ...p, [name]: value }))
    setErrors(p => ({ ...p, [name]: "" }))
  }

  // ── Shared styles ────────────────────────────────────────────────────
  const inputBase = [
    "w-full px-4 py-3 rounded-xl text-sm",
    "bg-white/10 border border-white/20 text-white",
    "placeholder:text-white/40",
    "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15",
    "transition-all duration-150 appearance-none",
  ].join(" ")
  const labelBase = "block text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1.5"

  // ── Success ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: accentColor }}>
        <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mx-auto mb-5">
          <Check size={30} className="text-white" strokeWidth={2.5} />
        </div>
        <h3 className="font-black text-xl text-white mb-2">Request Sent!</h3>
        <p className="text-white/65 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Our team will reach out within 24 hours. You can also continue on WhatsApp right now.
        </p>
        <a href={whatsappLink(buildWaMessage())} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white whatsapp-btn transition-opacity hover:opacity-90 shadow-lg">
          <MessageCircle size={16} /> Open WhatsApp Conversation
        </a>
        <button onClick={() => { setSubmitted(false); setForm({}); setErrors({}) }}
          className="block mx-auto mt-4 text-xs text-white/40 hover:text-white/70 transition-colors">
          Submit another request
        </button>
      </div>
    )
  }

  // ── Separate textarea / full-width fields from the two-column grid ───
  const gridFields = fields.filter(f => f.type !== "textarea" && f.colSpan !== "full")
  const fullFields = fields.filter(f => f.type === "textarea" || f.colSpan === "full")

  const renderInput = (field: FormField) => {
    const errClass = errors[field.name] ? "border-amber-400 ring-1 ring-amber-400/40" : ""

    if (field.type === "grouped-select") {
      return (
        <select
          required={field.required}
          value={form[field.name] || ""}
          onChange={e => change(field.name, e.target.value)}
          className={`${inputBase} cursor-pointer ${errClass}`}
        >
          <option value="" disabled style={{ background: accentColor }}>Select…</option>
          {field.groups?.map(group => (
            <optgroup
              key={group.groupLabel}
              label={`── ${group.groupLabel} ──`}
              style={{ background: accentColor, color: "#fff", fontWeight: "bold" }}
            >
              {group.items.map(item => (
                <option key={item} value={item}
                  style={{ background: accentColor, color: "#fff", fontWeight: "normal" }}>
                  {item}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      )
    }

    if (field.type === "select") {
      return (
        <select
          required={field.required}
          value={form[field.name] || ""}
          onChange={e => change(field.name, e.target.value)}
          className={`${inputBase} cursor-pointer ${errClass}`}
        >
          <option value="" disabled style={{ background: accentColor }}>Select…</option>
          {field.options?.map(o => (
            <option key={o} value={o} style={{ background: accentColor, color: "#fff" }}>{o}</option>
          ))}
        </select>
      )
    }

    if (field.type === "textarea") {
      return (
        <textarea
          rows={5}
          required={field.required}
          placeholder={field.placeholder}
          value={form[field.name] || ""}
          onChange={e => change(field.name, e.target.value)}
          className={`${inputBase} resize-none leading-relaxed ${errClass}`}
        />
      )
    }

    return (
      <input
        type={field.type}
        required={field.required}
        placeholder={field.placeholder}
        value={form[field.name] || ""}
        onChange={e => change(field.name, e.target.value)}
        className={`${inputBase} ${errClass}`}
      />
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl w-full" style={{ backgroundColor: accentColor }}>

      {/* Header */}
      <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-white/10">
        <span className="inline-block text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-1">
          {serviceTitle}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-white">Submit Your Request</h3>
        <p className="text-white/50 text-xs mt-1 leading-relaxed">
          Fill in the details below — we'll get back to you within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-4">

        {/* ── Responsive 2-column grid (1 col on mobile) ── */}
        {gridFields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gridFields.map(field => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className={labelBase}>
                  {field.label}
                  {field.required && <span className="text-amber-300 ml-0.5">*</span>}
                </label>
                {renderInput(field)}
                {errors[field.name] && (
                  <p className="text-[11px] text-amber-300 font-medium mt-0.5">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Full-width fields (textarea, request, etc.) ── */}
        {fullFields.map(field => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className={labelBase}>
              {field.label}
              {field.required && <span className="text-amber-300 ml-0.5">*</span>}
            </label>
            {renderInput(field)}
            {errors[field.name] && (
              <p className="text-[11px] text-amber-300 font-medium mt-0.5">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white font-bold text-sm disabled:opacity-60 transition-all hover:bg-white/90 shadow-sm"
            style={{ color: accentColor }}
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
              : <><Send size={14} /> Submit Request</>
            }
          </button>
          <a
            href={whatsappLink(buildWaMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl whatsapp-btn text-white font-bold text-sm transition-opacity hover:opacity-90"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        </div>

        <p className="text-[10px] text-white/30 text-center pt-1">
          Your information is kept confidential and used only to process your request.
        </p>
      </form>
    </div>
  )
}
