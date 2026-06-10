import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price with proper thousand separators and currency display.
 * RWF: 1,500,000 RWF/month
 * USD: $1,500/month
 */
export function formatPrice(
  price: number,
  unit: string,
  frequency?: string | null
): string {
  const freq = frequency ? `/${frequency}` : ""

  if (unit === "USD") {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
    return `${formatted}${freq}`
  }

  // RWF — no decimal, space separator style
  const formatted = new Intl.NumberFormat("en-RW", {
    maximumFractionDigits: 0,
  }).format(price)
  return `${formatted} RWF${freq}`
}

/**
 * Compact price for cards: 1.5M RWF, 350M RWF, $2,500
 */
export function formatPriceCompact(
  price: number,
  unit: string,
  frequency?: string | null
): string {
  const freq = frequency ? `/${frequency}` : ""

  if (unit === "USD") {
    if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1).replace(/\.0$/, "")}M${freq}`
    if (price >= 1_000)     return `$${(price / 1_000).toFixed(0)}K${freq}`
    return `$${price}${freq}`
  }

  // RWF compact
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B RWF${freq}`
  if (price >= 1_000_000)     return `${(price / 1_000_000).toFixed(1).replace(/\.0$/, "")}M RWF${freq}`
  if (price >= 1_000)         return `${(price / 1_000).toFixed(0)}K RWF${freq}`
  return `${price} RWF${freq}`
}

export const WHATSAPP_NUMBER = "250792871729"
export const INSTAGRAM_HANDLE = "kosresltd"
export const FACEBOOK_PAGE = "kosresltd"

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
export function instagramLink() {
  return `https://instagram.com/${INSTAGRAM_HANDLE}`
}
export function facebookLink() {
  return `https://facebook.com/${FACEBOOK_PAGE}`
}
