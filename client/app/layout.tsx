import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "KOSRES LTD – Kigali One Stop Real Estate Service",
  description:
    "Your trusted real estate advisor in Kigali. Buy, sell, rent, manage, and invest in Rwanda's finest properties. All services under one roof.",
  keywords: ["real estate", "Kigali", "Rwanda", "property", "buy", "sell", "rent", "investment"],
  authors: [{ name: "KOSRES LTD" }],
  icons: {
    icon: [
      { url: "/kosres-favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/kosres-favicon.svg",
    shortcut: "/kosres-favicon.svg",
  },
  openGraph: {
    title: "KOSRES LTD – Kigali One Stop Real Estate Service",
    description: "Your trusted real estate advisor in Rwanda. All services under one roof.",
    siteName: "KOSRES LTD",
    locale: "en_RW",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
