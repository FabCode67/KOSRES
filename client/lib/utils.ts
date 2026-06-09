import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number,
  unit: string,
  frequency?: string | null
): string {
  const formatted = new Intl.NumberFormat("en-RW").format(price)
  const freq = frequency ? `/${frequency}` : ""
  return `${formatted} ${unit}${freq}`
}

export const WHATSAPP_NUMBER = "250786684390"
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
