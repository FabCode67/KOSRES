import type { Metadata } from "next"
import Navbar from "@/components/Navbar"
import StaffSection from "@/components/StaffSection"

export const metadata: Metadata = {
  title: "Our Team – Meet the KOSRES LTD Experts",
  description: "Meet the KOSRES LTD team — real estate agents, valuers, and property consultants serving Kigali and Rwanda.",
  keywords: ["KOSRES team", "Rwanda real estate agents", "Kigali property consultants", "KOSRES staff"],
  openGraph: {
    title:       "Our Team | KOSRES LTD",
    description: "Meet the real estate experts behind KOSRES LTD.",
    url:         "https://www.kosres.com/team",
  },
  alternates: { canonical: "https://www.kosres.com/team" },
}

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <div className="pt-36 min-h-screen bg-[oklch(0.97_0.005_80)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="mb-12 text-center">
            <p className="text-[oklch(0.42_0.19_25)] text-sm font-bold tracking-widest uppercase mb-2">Meet the Experts</p>
            <h1 className="text-4xl font-black text-slate-800 mb-3">Our Team</h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              The people behind KOSRES LTD — dedicated real estate professionals serving Kigali and Rwanda.
            </p>
          </div>
          <StaffSection />
        </div>
      </div>
    </>
  )
}
