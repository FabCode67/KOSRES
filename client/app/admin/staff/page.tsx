"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Plus, Edit2, Trash2, Loader2, Check,
  CloudUpload, X, AlertCircle, Users,
  GripVertical, Eye, EyeOff, Mail, Phone, Lock,
} from "lucide-react"
import AdminShell from "@/components/AdminShell"
import { useAdmin } from "@/components/AdminContext"
import {
  getStaff, createStaff, updateStaff,
  deleteStaff, uploadStaffPhoto,
} from "@/lib/api"
import type { ApiStaff } from "@/lib/api"

const DEPARTMENTS = [
  "Management",
  "Sales",
  "Valuation",
  "Property Management",
  "Legal & Due Diligence",
  "Finance",
  "Marketing",
  "Customer Service",
  "Other",
]

type Mode = "list" | "new" | "edit"
const EMPTY: Partial<ApiStaff> = {
  name: "", position: "", department: "Sales", bio: "",
  email: "", phone: "", active: true, order: 0,
}

export default function AdminStaffPage() {
  const { user, token } = useAdmin()
  const isAdmin = user?.role === "admin"

  const [staff,     setStaff]     = useState<ApiStaff[]>([])
  const [loading,   setLoading]   = useState(true)
  const [mode,      setMode]      = useState<Mode>("list")
  const [editing,   setEditing]   = useState<ApiStaff | null>(null)
  const [form,      setForm]      = useState<Partial<ApiStaff>>(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try { setStaff(await getStaff(true)) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm(EMPTY); setPhotoFile(null); setPhotoPreview("")
    setEditing(null); setError(""); setMode("new")
  }
  const openEdit = (s: ApiStaff) => {
    setForm({ ...s }); setPhotoFile(null)
    setPhotoPreview(s.photo || ""); setEditing(s); setError(""); setMode("edit")
  }

  const set = (k: keyof ApiStaff, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!form.name?.trim())     { setError("Staff name is required"); return }
    if (!form.position?.trim()) { setError("Position / job title is required"); return }
    setSaving(true); setError("")
    try {
      let member: ApiStaff
      if (editing) {
        member = await updateStaff(editing.id, form, token ?? undefined)
      } else {
        member = await createStaff(form, token ?? undefined)
      }
      if (photoFile) {
        setUploading(true)
        member = await uploadStaffPhoto(member.id, photoFile, token ?? undefined)
        setUploading(false)
      }
      await load(); setMode("list")
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try { await deleteStaff(id, token ?? undefined); setStaff(prev => prev.filter(s => s.id !== id)) } catch {}
    setDeleting(null)
  }

  const handleToggleActive = async (s: ApiStaff) => {
    try {
      const updated = await updateStaff(s.id, { active: !s.active }, token ?? undefined)
      setStaff(prev => prev.map(x => x.id === s.id ? updated : x))
    } catch {}
  }

  const inp = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)] placeholder:text-slate-300 transition-all"
  const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"

  // ── Read-only notice for non-admins ──
  const ReadOnlyBanner = !isAdmin && (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm mb-4">
      <Lock size={15} className="flex-none" /> Only admins can add, edit, or remove staff members. You have view-only access.
    </div>
  )

  // ── Form view ──
  if (mode === "new" || mode === "edit") {
    return (
      <AdminShell title={mode === "new" ? "Add Staff Member" : "Edit Staff Member"}>
        <div className="max-w-2xl space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} className="flex-none" /> {error}
            </div>
          )}

          {/* Name + Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Full Name <span className="text-red-400">*</span></label>
              <input value={form.name || ""} onChange={e => set("name", e.target.value)}
                className={inp} placeholder="e.g. Jean Claude Uwimana" />
            </div>
            <div>
              <label className={lbl}>Position <span className="text-red-400">*</span></label>
              <input value={form.position || ""} onChange={e => set("position", e.target.value)}
                className={inp} placeholder="e.g. Property Agent" />
            </div>
          </div>

          {/* Department + Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Department</label>
              <select value={form.department || ""} onChange={e => set("department", e.target.value)} className={inp}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Display Order</label>
              <input type="number" min={0} value={form.order ?? 0}
                onChange={e => set("order", Number(e.target.value))}
                className={inp} placeholder="0 = first" />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Email (optional)</label>
              <input type="email" value={form.email || ""} onChange={e => set("email", e.target.value)}
                className={inp} placeholder="jean@kosres.com" />
            </div>
            <div>
              <label className={lbl}>Phone (optional)</label>
              <input value={form.phone || ""} onChange={e => set("phone", e.target.value)}
                className={inp} placeholder="+250 7xx xxx xxx" />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className={lbl}>Bio (optional)</label>
            <textarea rows={3} value={form.bio || ""} onChange={e => set("bio", e.target.value)}
              className={`${inp} resize-none`} placeholder="Short professional bio…" />
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

          {/* Photo upload */}
          <div>
            <label className={lbl}>Profile Picture</label>
            <div className="space-y-3">
              {(photoPreview || form.photo) && (
                <div className="relative w-32 aspect-[4/5] rounded-xl overflow-hidden bg-white border border-slate-200">
                  <Image src={photoPreview || form.photo!} alt="Photo preview" fill className="object-cover" sizes="128px" />
                  <button
                    onClick={() => { setPhotoFile(null); setPhotoPreview(""); set("photo", undefined) }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                    <X size={11} />
                  </button>
                </div>
              )}
              <button type="button" onClick={() => photoRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[oklch(0.42_0.19_25)] text-sm text-slate-500 hover:text-[oklch(0.42_0.19_25)] transition-colors w-full justify-center">
                <CloudUpload size={16} />
                {photoPreview || form.photo ? "Replace photo" : "Upload profile picture (JPG, PNG)"}
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) }
                }} />
              <p className="text-xs text-slate-400">Recommended: portrait photo, 4:5 ratio (e.g. 800×1000px) so it fills the card cleanly on the website.</p>
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
                ? <><Loader2 size={14} className="animate-spin" />{uploading ? "Uploading photo…" : "Saving…"}</>
                : <><Check size={14} /> {mode === "new" ? "Add Staff Member" : "Save Changes"}</>
              }
            </button>
          </div>
        </div>
      </AdminShell>
    )
  }

  // ── List view ──
  return (
    <AdminShell title="Staff">
      <div className="space-y-4">
        {ReadOnlyBanner}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${staff.length} staff member${staff.length !== 1 ? "s" : ""} · ${staff.filter(s => s.active).length} active`}
          </p>
          {isAdmin && (
            <button onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[oklch(0.42_0.19_25)] text-white text-sm font-semibold hover:bg-[oklch(0.36_0.18_25)] transition-colors">
              <Plus size={14} /> Add Staff
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && staff.length === 0 && (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            <Users size={44} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold mb-2">No staff members yet</p>
            {isAdmin && (
              <button onClick={openNew} className="text-sm text-[oklch(0.42_0.19_25)] hover:underline">
                Add your first staff member →
              </button>
            )}
          </div>
        )}

        {!loading && staff.map(member => (
          <div key={member.id}
            className={`bg-white rounded-xl border shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow ${
              member.active ? "border-border" : "border-slate-200 opacity-60"
            }`}>

            <GripVertical size={16} className="text-slate-300 flex-none" />

            {/* Photo */}
            <div className="relative w-12 aspect-[4/5] rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex-none flex items-center justify-center">
              {member.photo ? (
                <Image src={member.photo} alt={member.name} fill className="object-cover" sizes="48px" />
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  {member.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-sm text-slate-800 truncate">{member.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  member.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {member.active ? "Active" : "Hidden"}
                </span>
              </div>
              <p className="text-xs text-slate-500">{member.position}{member.department ? ` · ${member.department}` : ""}</p>
              <div className="flex items-center gap-3 mt-1">
                {member.email && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1"><Mail size={10} />{member.email}</span>
                )}
                {member.phone && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1"><Phone size={10} />{member.phone}</span>
                )}
              </div>
            </div>

            {/* Order badge */}
            <div className="hidden sm:flex flex-col items-center text-slate-300 flex-none">
              <span className="text-[10px] font-bold uppercase">Order</span>
              <span className="text-lg font-black text-slate-400">{member.order}</span>
            </div>

            {/* Actions */}
            {isAdmin && (
              <div className="flex items-center gap-1 flex-none">
                <button onClick={() => handleToggleActive(member)}
                  title={member.active ? "Hide from website" : "Show on website"}
                  className={`p-1.5 rounded-lg transition-colors ${
                    member.active ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-muted"
                  }`}>
                  {member.active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => openEdit(member)} title="Edit"
                  className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(member.id)} disabled={deleting === member.id} title="Delete"
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600 disabled:opacity-40">
                  {deleting === member.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
