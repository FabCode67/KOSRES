export type PropertyCategory = "residential" | "commercial" | "agricultural" | "industrial"
export type OfferType = "sale" | "rent" | "short_stay"
export type District = "Kicukiro" | "Nyarugenge" | "Gasabo" | "Musanze" | "Rubavu" | "Muhanga" | "Kayonza" | "Rusizi" | "Bugesera"

export interface Property {
  id: string
  title: string
  description: string
  price: number
  priceUnit: "RWF" | "USD"
  priceFrequency?: "month" | "year" | null
  offerType: OfferType
  category: PropertyCategory
  propertyType: string
  district: District
  sector: string
  bedrooms?: number
  bathrooms?: number
  area?: number          // sqm
  images: string[]       // paths relative to /public
  featured: boolean
  createdAt: string      // ISO
}

// Seed data — uses the 6 images in /public/images
export const SEED_PROPERTIES: Property[] = [
  {
    id: "prop-001",
    title: "Elegant 3-Bedroom Apartment – Nyamirambo",
    description:
      "Bright, fully-finished apartment in a secure compound. Open-plan living, tiled floors, modern kitchen. Walking distance to shops and public transport.",
    price: 1500000,
    priceUnit: "RWF",
    priceFrequency: "month",
    offerType: "rent",
    category: "residential",
    propertyType: "Apartment",
    district: "Nyarugenge",
    sector: "Nyamirambo",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    images: [
      "/images/WhatsApp Image 2026-06-04 at 09.15.36.jpeg",
      "/images/WhatsApp Image 2026-06-04 at 09.15.37.jpeg",
    ],
    featured: true,
    createdAt: "2026-05-25T08:00:00Z",
  },
  {
    id: "prop-002",
    title: "Modern Villa with Garden – Kicukiro",
    description:
      "Spacious 5-bedroom villa set on a 600 sqm plot with a private garden, double garage and 24/7 security. Ideal for families seeking comfort and prestige.",
    price: 350000000,
    priceUnit: "RWF",
    priceFrequency: null,
    offerType: "sale",
    category: "residential",
    propertyType: "Villa",
    district: "Kicukiro",
    sector: "Niboye",
    bedrooms: 5,
    bathrooms: 4,
    area: 380,
    images: [
      "/images/WhatsApp Image 2026-06-04 at 09.15.38.jpeg",
      "/images/WhatsApp Image 2026-06-04 at 09.15.39.jpeg",
    ],
    featured: true,
    createdAt: "2026-05-21T10:00:00Z",
  },
  {
    id: "prop-003",
    title: "Commercial Office Space – Kigali CBD",
    description:
      "Grade-A open-plan office floor in the heart of Kigali City Centre. 250 sqm, raised floors, fibre-ready, panoramic city views. Parking included.",
    price: 3500000,
    priceUnit: "RWF",
    priceFrequency: "month",
    offerType: "rent",
    category: "commercial",
    propertyType: "Office",
    district: "Nyarugenge",
    sector: "Nyarugenge",
    area: 250,
    images: [
      "/images/WhatsApp Image 2026-06-04 at 09.15.40.jpeg",
    ],
    featured: false,
    createdAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "prop-004",
    title: "4-Bedroom Family Home – Gasabo",
    description:
      "Well-maintained bungalow on a quiet street in Remera. Tiled throughout, fitted kitchen, large compound, two en-suite bedrooms.",
    price: 65000000,
    priceUnit: "RWF",
    priceFrequency: null,
    offerType: "sale",
    category: "residential",
    propertyType: "Single Family Home",
    district: "Gasabo",
    sector: "Remera",
    bedrooms: 4,
    bathrooms: 3,
    area: 210,
    images: [
      "/images/WhatsApp Image 2026-06-04 at 09.15.41.jpeg",
      "/images/WhatsApp Image 2026-06-04 at 09.15.36.jpeg",
    ],
    featured: true,
    createdAt: "2026-05-28T07:00:00Z",
  },
  {
    id: "prop-005",
    title: "Investment Plot – Musanze",
    description:
      "Flat 600 sqm residential plot in a fast-growing Musanze neighbourhood. Title deed clean, no encumbrances. Easy access to tarmac road.",
    price: 12000000,
    priceUnit: "RWF",
    priceFrequency: null,
    offerType: "sale",
    category: "residential",
    propertyType: "Plot",
    district: "Musanze",
    sector: "Cyuve",
    area: 600,
    images: [
      "/images/WhatsApp Image 2026-06-04 at 09.15.39.jpeg",
    ],
    featured: false,
    createdAt: "2026-06-03T11:00:00Z",
  },
  {
    id: "prop-006",
    title: "Furnished Studio – Short Stay Kimihurura",
    description:
      "Stylish self-contained studio for short-term guests. WiFi, hot water, secured parking, daily/weekly/monthly rates. Perfect for business travellers.",
    price: 80000,
    priceUnit: "RWF",
    priceFrequency: "month",
    offerType: "short_stay",
    category: "residential",
    propertyType: "Apartment",
    district: "Gasabo",
    sector: "Kimihurura",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    images: [
      "/images/WhatsApp Image 2026-06-04 at 09.15.37.jpeg",
      "/images/WhatsApp Image 2026-06-04 at 09.15.38.jpeg",
    ],
    featured: false,
    createdAt: "2026-06-05T12:00:00Z",
  },
]
