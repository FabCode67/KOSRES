"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Plus, Edit2, Trash2, Eye, Globe, FileText,
  Upload, X, Check, Loader2, CloudUpload,
  BookOpen, Download, AlertCircle,
} from "lucide-react"
import AdminShell from "@/components/AdminShell"
import {
  getPublications, createPublication, updatePublication,
  deletePublication, togglePublishPublication,
  uploadPublicationCover, uploadPublicationDocument,
} from "@/lib/api"
import type { ApiPublication } from "@/lib/api"

const CATEGORIES = ["Market Report","News","Guide","Investment Tips","Legal Update","Company Update","Other"]

type Mode = "list" | "new" | "edit"

const EMPTY: Partial<ApiPublication> = {
  title: "", excerpt: "", body: "", category: "", author: "KOSRES LTD",
  featured: false, status: "draft",
}

export default function AdminPublicationsPage() {
  const [pubs,    setPubs]    = useState<ApiPublication[]>([])
  const [loading, setLoading] = useState(true)
  const [mode,    setMode]    = useState<Mode>("list")
  const [editing, setEditing] = useState<ApiPublication | null>(null)
  const [form,    setForm]    = useState<Partial<ApiPublication>>(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")
  const [deleting,setDeleting]= useState<string|null>(null)

  // File upload states
  const [coverFile,    setCoverFile]    = useState<File|null>(null)
  const [coverPreview, setCoverPreview] = useState<string>("")
  const [docFile,      setDocFile]      = useState<File|null>(null)
  const [uploading,    setUploading]    = useState(false)

  const coverRef = useRef<HTMLInputElement>(null)
  const docRef   = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try { setPubs(await getPublications(true)) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm(EMPTY); setCoverFile(null); setCoverPreview(""); setDocFile(null)
    setEditing(null); setError(""); setMode("new")
  }
  const openEdit = (p: ApiPublication) => {
    setForm({ ...p }); setCoverFile(null)
    setCoverPreview(p.coverImage || ""); setDocFile(null)
    setEditing(p); setError(""); setMode("edit")
  }

  const set = (k: keyof ApiPublication, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!form.title?.trim()) { setError("Title is required"); return }
    if (!form.excerpt?.trim()) { setError("Excerpt is required"); return }
    if (!form.body?.trim()) { setError("Body content is required"); return }
    setSaving(true); setError("")
    try {
      let pub: ApiPublication
      if (editing) {
        pub = await updatePublication(editing.id, form)
      } else {
        pub = await createPublication(form)
      }

      // Upload cover image if selected
      if (coverFile) {
        setUploading(true)
        pub = await uploadPublicationCover(pub.id, coverFile)
        setUploading(false)
      }
      // Upload document if selected
      if (docFile) {
        setUploading(true)
        pub = await uploadPublicationDocument(pub.id, docFile)
        setUploading(false)
      }

      await load()
      setMode("list")
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try { await deletePublication(id); setPubs(prev => prev.filter(p => p.id !== id)) } catch {}
    setDeleting(null)
  }

  const handleToggle = async (id: string) => {
    try {
      const updated = await togglePublishPublication(id)
      setPubs(prev => prev.map(p => p.id === id ? updated : p))
    } catch {}
  }

  const inp = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/30] focus:border-[oklch(0.42_0.19_25)] placeholder:text-slate-300 transition-all"
  const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"

  // ── Form view ──
  if (mode === "new" || mode === "edit") {
    return (
      <AdminShell title={mode === "new" ? "New Publication" : "Edit Publication"}>
        <div className="max-w-3xl space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} className="flex-none" />{error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className={lbl}>Title <span className="text-red-400">*</span></label>
            <input value={form.title||""} onChange={e => set("title", e.target.value)}
              className={inp} placeholder="Publication title…" />
          </div>

          {/* Excerpt */}
          <div>
            <label className={lbl}>Excerpt / Summary <span className="text-red-400">*</span></label>
            <textarea rows={3} value={form.excerpt||""} onChange={e => set("excerpt", e.target.value)}
              className={`${inp} resize-none`} placeholder="Short summary shown on cards…" />
          </div>

          {/* Body */}
          <div>
            <label className={lbl}>Full Content <span className="text-red-400">*</span></label>
            <textarea rows={12} value={form.body||""} onChange={e => set("body", e.target.value)}
              className={`${inp} resize-y font-mono text-xs`}
              placeholder="Write the full article content here…" />
            <p className="text-xs text-slate-400 mt-1">Plain text or markdown. Paragraphs separated by blank lines.</p>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Category</label>
              <select value={form.category||""} onChange={e => set("category", e.target.value)} className={inp}>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Author</label>
              <input value={form.author||""} onChange={e => set("author", e.target.value)}
                className={inp} placeholder="KOSRES LTD" />
            </div>
          </div>

          {/* Status + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Status</label>
              <select value={form.status||"draft"} onChange={e => set("status", e.target.value)} className={inp}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label
                onClick={() => set("featured", !form.featured)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.featured ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${form.featured ? "bg-amber-400" : "bg-slate-200"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.featured ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Featured</span>
              </label>
            </div>
          </div>

          {/* Cover image upload */}
          <div>
            <label className={lbl}>Cover Image</label>
            <div className="space-y-3">
              {(coverPreview || form.coverImage) && (
                <div className="relative w-full aspect-[16/6] rounded-xl overflow-hidden bg-slate-100">
                  <Image src={coverPreview || form.coverImage!} alt="" fill className="object-cover" sizes="700px" />
                  <button onClick={() => { setCoverFile(null); setCoverPreview(""); set("coverImage", undefined) }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
              <button type="button" onClick={() => coverRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[oklch(0.42_0.19_25)] text-sm text-slate-500 hover:text-[oklch(0.42_0.19_25)] transition-colors w-full justify-center">
                <CloudUpload size={16} /> {coverPreview || form.coverImage ? "Replace image" : "Upload cover image"}
              </button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) }
                }} />
            </div>
          </div>

          {/* Document upload */}
          <div>
            <label className={lbl}>PDF Document (optional)</label>
            {(form.documentUrl || docFile) && (
              <div className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl px-4 py-3 mb-2">
                <FileText size={16} className="text-red-600 flex-none" />
                <span className="text-sm text-slate-700 flex-1 truncate">
                  {docFile ? docFile.name : form.documentName}
                </span>
                <button onClick={() => { setDocFile(null); if (!editing) { set("documentUrl", undefined); set("documentName", undefined) } }}
                  className="text-slate-400 hover:text-red-600 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}
            <button type="button" onClick={() => docRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[oklch(0.42_0.19_25)] text-sm text-slate-500 hover:text-[oklch(0.42_0.19_25)] transition-colors w-full justify-center">
              <Upload size={16} /> {form.documentUrl || docFile ? "Replace PDF" : "Upload PDF document"}
            </button>
            <input ref={docRef} type="file" accept=".pdf" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setDocFile(f) }} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button onClick={() => setMode("list")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold text-sm hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60 transition-colors">
              {(saving || uploading)
                ? <><Loader2 size={14} className="animate-spin" />{uploading ? "Uploading…" : "Saving…"}</>
                : <><Check size={14} /> {mode === "new" ? "Publish" : "Save Changes"}</>
              }
            </button>
          </div>
        </div>
      </AdminShell>
    )
  }

  // ── List view ──
  return (
    <AdminShell title="Publications">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${pubs.length} total · ${pubs.filter(p=>p.status==="published").length} published`}
          </p>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[oklch(0.42_0.19_25)] text-white text-sm font-semibold hover:bg-[oklch(0.36_0.18_25)] transition-colors">
            <Plus size={14} /> New Publication
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && pubs.map(pub => (
          <div key={pub.id}
            className={`bg-white rounded-xl border shadow-sm flex items-start gap-4 p-4 hover:shadow-md transition-shadow ${!pub.featured ? "border-border" : "border-amber-300"}`}>

            {/* Thumbnail */}
            <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-none bg-gradient-to-br from-[oklch(0.42_0.19_25)] to-[oklch(0.12_0.01_250)] shrink-0">
              {pub.coverImage
                ? <Image src={pub.coverImage} alt={pub.title} fill className="object-cover" sizes="96px" />
                : <div className="w-full h-full flex items-center justify-center"><BookOpen size={20} className="text-white/40" /></div>
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pub.status === "published" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                }`}>{pub.status}</span>
                {pub.category && <span className="text-[10px] text-slate-500">{pub.category}</span>}
                {pub.featured && <span className="text-[10px] text-amber-600 font-bold">⭐ Featured</span>}
                {pub.documentUrl && <span className="flex items-center gap-1 text-[10px] text-slate-400"><Download size={9} /> PDF</span>}
              </div>
              <p className="font-semibold text-sm text-slate-800 truncate">{pub.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{pub.excerpt}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {new Date(pub.createdAt).toLocaleDateString("en-RW", { day:"numeric", month:"short", year:"numeric" })}
                {pub.author && ` · ${pub.author}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-none">
              <button onClick={() => handleToggle(pub.id)} title={pub.status === "published" ? "Unpublish" : "Publish"}
                className={`p-1.5 rounded-lg transition-colors ${
                  pub.status === "published"
                    ? "text-green-600 hover:bg-green-50"
                    : "text-slate-400 hover:bg-muted"
                }`}>
                <Globe size={14} />
              </button>
              <button onClick={() => openEdit(pub)} title="Edit"
                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600">
                <Edit2 size={14} />
              </button>
              <Link href={`/publications/${pub.id}`} target="_blank" title="View"
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Eye size={14} />
              </Link>
              <button onClick={() => handleDelete(pub.id)} disabled={deleting === pub.id} title="Delete"
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600 disabled:opacity-40">
                {deleting === pub.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          </div>
        ))}

        {!loading && pubs.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen size={44} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold mb-2">No publications yet</p>
            <button onClick={openNew} className="text-sm text-[oklch(0.42_0.19_25)] hover:underline">
              Write your first publication →
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
