"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { LogIn, Loader2, AlertCircle } from "lucide-react"

// Inner component uses useSearchParams — must be inside Suspense
function LoginForm() {
  const router      = useRouter()
  const params      = useSearchParams()
  const callbackUrl = params.get("callbackUrl") ?? "/admin"

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const inp = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.42_0.19_25)/40] placeholder:text-slate-300 transition-all"
  const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={lbl}>Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@kosres.rw"
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Password</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inp}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">
          <AlertCircle size={13} className="flex-none" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[oklch(0.42_0.19_25)] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[oklch(0.36_0.18_25)] disabled:opacity-60 transition-colors"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
          : <><LogIn size={16} /> Sign In</>
        }
      </button>
    </form>
  )
}

// Outer page wraps LoginForm in Suspense (required by Next.js for useSearchParams)
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.12_0.01_250)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center mb-5">
          <Image
            src="/images/kosres_logo_refined.png"
            alt="KOSRES LTD"
            width={220}
            height={110}
            className="object-contain"
            priority
          />
        </div>

        <h2 className="text-base font-bold mb-6 text-slate-500 text-center tracking-wide">
          Admin Portal Sign In
        </h2>

        <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-slate-400 mt-5">
          KOSRES LTD · Admin Portal
        </p>
      </div>
    </div>
  )
}
