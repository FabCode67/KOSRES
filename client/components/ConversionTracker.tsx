"use client"
import { useEffect } from "react"

declare global { interface Window { gtag?: (...a: unknown[]) => void } }

/**
 * Sends Google Analytics / Google Ads events for phone, WhatsApp and email clicks.
 * Mark these as conversions in GA4 (events: phone_click, whatsapp_click, email_click)
 * and import them into Google Ads. Optional env: NEXT_PUBLIC_GOOGLE_ADS_ID +
 * NEXT_PUBLIC_GOOGLE_ADS_LABEL_* to also fire Ads conversions directly.
 */
export default function ConversionTracker() {
  useEffect(() => {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
    const send = (event: string, label?: string) => {
      if (!window.gtag) return
      window.gtag("event", event, { page_path: window.location.pathname })
      if (adsId && label) window.gtag("event", "conversion", { send_to: `${adsId}/${label}` })
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a")
      const href = a?.getAttribute("href") || ""
      if (href.startsWith("tel:")) send("phone_click", process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_PHONE)
      else if (/wa\.me|whatsapp/i.test(href)) send("whatsapp_click", process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_WHATSAPP)
      else if (href.startsWith("mailto:")) send("email_click")
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])
  return null
}
