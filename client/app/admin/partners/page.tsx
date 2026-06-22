"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Plus, Edit2, Trash2, Loader2, Check,
  CloudUpload, X, AlertCircle, Globe,
  GripVertical, Eye, EyeOff,
} from "lucide-react"
import AdminShell from "@/components/AdminShell"
import {
  getPartners, createPartner, updatePartner,
  deletePartner, uploadPartnerLogo,
} from "@/lib/api"
import type { ApiPartner } from "@/lib/api"

const CATEGORIES = [
  "Financial Partner",
  "Legal Partner",
  "Technology Partner",
  "Real Estate Partner",
  "Government Partner",
  "Insurance Partner",
  "Construction Partner",
  "Other Partner",
]

type Mode = "list" | "new" | "edit"
const EMPTY: Partial<ApiPartner> = {
  name: "", category: "Financial Partner", website: "", description: "", active: true, order: 0,
}

export default function AdminPartnersPage() {
  const [partners,  setPartners]  = useState<ApiPartner[]>([])
  const [loading,   setLoading]   = useState(true)
  const [mode,      setMode]      = useState<Mode>("list")
  const [editing,   setEditing]   = useState<ApiPartner | null>(null)
  const [form,      setForm]      = useState<Partial<ApiPartner>>(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [logoFile,  setLogoFile]  = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try { setPartners(await getPartners(true)) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm(EMPTY); setLogoFile(null); setLogoPreview("")
    setEditing(null); setError(""); setMode("new")
  }
  const openEdit = (p: ApiPartner) => {
    setForm({ ...p }); setLogoFile(null)
    setLogoPreview(p.logo || ""); setEditing(p); setError(""); setMode("edit")
  }

  const set = (k: keyof ApiPartner, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!form.name?.trim()) { setError("Partner name is required"); return }
    setSaving(true); setError("")
    try {
      let partner: ApiPartner
      if (editing) {
        partner = await updatePartner(editing.id, form)
      } else {
        partner = await createPartner(form)
      }
      if (logoFile) {
        setUploading(true)
        partner = await uploadPartnerLogo(partner.id, logoFile)
        setUploading(false)
      }
      await load(); setMode("list")
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try { await deletePartner(id); setPartners(prev => prev.filter(p => p.id !== id)) } catch {}
    setDeleting(null)
  }

  const handleToggleActive = async (p: ApiPartner) => {
    try {
      const updated = await updatePartner(p.id, { active: !p.active })
      setPartners(prev => prev.map(x => x.id === p.id ? updated : x))
    } catch {}
  }

  const inp = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)] placeholder:text-slate-300 transition-all"
  const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"

  // ── Form view ──
  if (mode === "new" || mode === "edit") {
    return (
      <AdminShell title={mode === "new" ? "Add Partner" : "Edit Partner"}>
        <div className="max-w-2xl space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} className="flex-none" /> {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className={lbl}>Partner Name <span className="text-red-400">*</span></label>
            <input value={form.name || ""} onChange={e => set("name", e.target.value)}
              className={inp} placeholder="e.g. Equity Bank" />
          </div>

          {/* Category + Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Category</label>
              <select value={form.category || ""} onChange={e => set("category", e.target.value)} className={inp}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Display Order</label>
              <input type="number" min={0} value={form.order ?? 0}
                onChange={e => set("order", Number(e.target.value))}
                className={inp} placeholder="0 = first" />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className={lbl}>Website URL</label>
            <input type="url" value={form.website || ""} onChange={e => set("website", e.target.value)}
              className={inp} placeholder="https://equitybank.co.rw" />
          </div>

          {/* Description */}
          <div>
            <label className={lbl}>Description (optional)</label>
            <textarea rows={3} value={form.description || ""} onChange={e => set("description", e.target.value)}
              className={`${inp} resize-none`} placeholder="Brief description of the partnership…" />
          </div>

          {/* Active toggle */}
          <div>
            <label
              onClick={() => set("active", !form.active)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all w-fit ${
                form.active ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-slate-300"
              }`}>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${form.active ? "bg-green-400" : "bg-slate-200"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.active ? "left-4" : "left-0.5"}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {form.active ? "Active — shown on website" : "Inactive — hidden from website"}
              </span>
            </label>
          </div>

          {/* Logo upload */}
          <div>
            <label className={lbl}>Partner Logo</label>
            <div className="space-y-3">
              {(logoPreview || form.logo) && (
                <div className="relative w-40 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-2">
                  <Image src={logoPreview || form.logo!} alt="Logo preview" fill className="object-contain p-2" sizes="160px" />
                  <button
                    onClick={() => { setLogoFile(null); setLogoPreview(""); set("logo", undefined) }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                    <X size={11} />
                  </button>
                </div>
              )}
              <button type="button" onClick={() => logoRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[oklch(0.42_0.19_25)] text-sm text-slate-500 hover:text-[oklch(0.42_0.19_25)] transition-colors w-full justify-center">
                <CloudUpload size={16} />
                {logoPreview || form.logo ? "Replace logo" : "Upload logo (PNG, JPG, SVG)"}
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
                }} />
              <p className="text-xs text-slate-400">Recommended: transparent PNG or SVG, min 200×100px</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button onClick={() => setMode("list")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold text-sm hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60 transition-colors">
              {saving || uploading
                ? <><Loader2 size={14} className="animate-spin" />{uploading ? "Uploading logo…" : "Saving…"}</>
                : <><Check size={14} /> {mode === "new" ? "Add Partner" : "Save Changes"}</>
              }
            </button>
          </div>
        </div>
      </AdminShell>
    )
  }

  // ── List view ──
  return (
    <AdminShell title="Partners">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${partners.length} partner${partners.length !== 1 ? "s" : ""} · ${partners.filter(p => p.active).length} active`}
          </p>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[oklch(0.42_0.19_25)] text-white text-sm font-semibold hover:bg-[oklch(0.36_0.18_25)] transition-colors">
            <Plus size={14} /> Add Partner
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && partners.length === 0 && (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            <Globe size={44} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold mb-2">No partners yet</p>
            <button onClick={openNew} className="text-sm text-[oklch(0.42_0.19_25)] hover:underline">
              Add your first partner →
            </button>
          </div>
        )}

        {!loading && partners.map(partner => (
          <div key={partner.id}
            className={`bg-white rounded-xl border shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow ${
              partner.active ? "border-border" : "border-slate-200 opacity-60"
            }`}>

            {/* Drag handle (visual only) */}
            <GripVertical size={16} className="text-slate-300 flex-none" />

            {/* Logo */}
            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex-none flex items-center justify-center p-1">
              {partner.logo ? (
                <Image src={partner.logo} alt={partner.name} fill className="object-contain p-1" sizes="64px" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400 text-center leading-tight">
                  {partner.name.split(" ").map(w => w[0]).join("").slice(0, 3)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-sm text-slate-800 truncate">{partner.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  partner.active
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {partner.active ? "Active" : "Hidden"}
                </span>
              </div>
              {partner.category && (
                <p className="text-xs text-slate-400">{partner.category}</p>
              )}
              {partner.website && (
                <a href={partner.website} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[oklch(0.42_0.19_25)] hover:underline truncate block">
                  {partner.website}
                </a>
              )}
            </div>

            {/* Order badge */}
            <div className="hidden sm:flex flex-col items-center text-slate-300 flex-none">
              <span className="text-[10px] font-bold uppercase">Order</span>
              <span className="text-lg font-black text-slate-400">{partner.order}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-none">
              <button onClick={() => handleToggleActive(partner)}
                title={partner.active ? "Hide from website" : "Show on website"}
                className={`p-1.5 rounded-lg transition-colors ${
                  partner.active
                    ? "text-green-600 hover:bg-green-50"
                    : "text-slate-400 hover:bg-muted"
                }`}>
                {partner.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => openEdit(partner)} title="Edit"
                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(partner.id)} disabled={deleting === partner.id} title="Delete"
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600 disabled:opacity-40">
                {deleting === partner.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
