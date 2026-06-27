import type { Metadata } from "next"
import PropertiesClient from "./PropertiesClient"

export const metadata: Metadata = {
  title: "Properties for Sale, Rent & Short Stay in Rwanda",
  description: "Browse 500+ verified properties for sale, rent and short stay across Kigali and all 30 districts of Rwanda. Apartments, villas, offices, land and commercial spaces. KOSRES LTD – RDB regulated.",
  keywords: ["properties for sale Kigali","apartments for rent Rwanda","houses for sale Kigali","commercial property Rwanda","land for sale Rwanda","short stay Kigali","furnished apartments Kigali","offices for rent Rwanda","real estate listings Rwanda"],
  openGraph: {
    title:       "Properties for Sale & Rent in Rwanda | KOSRES LTD",
    description: "Browse 500+ verified properties across Rwanda — residential, commercial, agricultural, industrial.",
    url:         "https://www.kosres.com/properties",
  },
  alternates: { canonical: "https://www.kosres.com/properties" },
}

export default function PropertiesPage() {
  return <PropertiesClient />
}
