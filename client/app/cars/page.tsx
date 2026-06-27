import type { Metadata } from "next"
import CarsClient from "./CarsClient"

export const metadata: Metadata = {
  title: "Car Rental, Buy & Sell, Taxi Services in Rwanda",
  description: "Rent, buy or sell cars in Kigali Rwanda. Toyota, KIA, BMW, Tesla, BYD and more. Airport transfers, city rides, corporate taxi services. KOSRES LTD mobility services.",
  keywords: ["car rental Kigali","cars for sale Rwanda","buy car Kigali","sell car Rwanda","taxi Kigali","airport transfer Rwanda","Toyota rental Kigali","car hire Rwanda","corporate taxi Kigali","SUV rental Rwanda","electric car Rwanda"],
  openGraph: {
    title:       "Car Rental, Buy & Sell, Taxi in Rwanda | KOSRES LTD",
    description: "Rent, buy or sell cars in Kigali. 14+ brands available. Airport transfers & corporate taxi services.",
    url:         "https://www.kosres.com/cars",
  },
  alternates: { canonical: "https://www.kosres.com/cars" },
}

export default function CarsPage() {
  return <CarsClient />
}
