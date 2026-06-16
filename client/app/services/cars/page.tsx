import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import { Car, Key, Taxi, ShoppingCart } from "lucide-react"

const ACCENT = "#1C3A6B"

const CAR_TYPE_GROUPS = [
  {
    groupLabel: "SEDAN / SALOON",
    items: ["Toyota Corolla","Toyota Camry","Honda Civic","Nissan Sunny","Mercedes C-Class","BMW 3 Series","Hyundai Elantra"],
  },
  {
    groupLabel: "SUV / 4x4",
    items: ["Toyota Land Cruiser","Toyota Prado","Toyota RAV4","Mitsubishi Pajero","Nissan Patrol","Land Rover Discovery","Ford Explorer","Hyundai Tucson"],
  },
  {
    groupLabel: "PICKUP / TRUCK",
    items: ["Toyota Hilux","Nissan Navara","Isuzu D-Max","Ford Ranger","Mitsubishi L200"],
  },
  {
    groupLabel: "VAN / MINIBUS",
    items: ["Toyota HiAce","Nissan Urvan","Mercedes Sprinter","Toyota Quantum"],
  },
  {
    groupLabel: "LUXURY",
    items: ["Mercedes E-Class","Mercedes S-Class","BMW 5 Series","BMW 7 Series","Audi A6","Lexus LX570"],
  },
  {
    groupLabel: "ELECTRIC / HYBRID",
    items: ["Toyota Prius","Nissan Leaf","BYD Atto","Tesla Model 3"],
  },
]

const highlights = [
  {
    icon: Key,
    title: "Car Rental",
    desc: "Daily, weekly and monthly car hire across Kigali and Rwanda. Self-drive or with a driver.",
  },
  {
    icon: ShoppingCart,
    title: "Car Sales",
    desc: "Buy and sell new or used vehicles. We connect buyers with verified sellers at fair market prices.",
  },
  {
    icon: Taxi,
    title: "Taxi & Transfer",
    desc: "Airport transfers, city rides, corporate transport and long-distance journeys across Rwanda.",
  },
  {
    icon: Car,
    title: "Fleet for Events",
    desc: "Wedding convoys, VIP transport and corporate event fleets — luxury vehicles for every occasion.",
  },
]

const rentalTypes = [
  "Self-Drive (Daily)","Self-Drive (Weekly)","Self-Drive (Monthly)",
  "With Driver (Daily)","With Driver (Weekly)","With Driver (Monthly)",
  "Airport Transfer","City Transfer","Long Distance Trip","Corporate Fleet","Wedding / Event",
]

const districts = [
  "Kicukiro","Nyarugenge","Gasabo","Musanze","Rubavu","Muhanga","Kayonza","Rusizi","Bugesera",
]

export default function CarsPage() {
  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Car Rent, Sell & Taxi Services"
      subtitle="Vehicle Services"
      breadcrumb="Cars"
      description="KOSRES LTD extends its one-stop service offering to include vehicle rental, car sales and reliable taxi & transfer services across Kigali and Rwanda. Whether you need a daily hire, a long-term lease, a trusted driver or are looking to buy or sell a vehicle, we connect you with the right solution at the best value."
    >
      {/* ── Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {highlights.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: ACCENT + "18" }}
            >
              <Icon size={18} style={{ color: ACCENT }} />
            </div>
            <h3 className="font-bold text-sm mb-1 text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* ── What we offer ── */}
      <div className="mb-14">
        <h2 className="text-xl font-black mb-5 text-slate-800">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "Short-term and long-term car rental",
            "Self-drive hire with comprehensive insurance",
            "Chauffeur-driven vehicle hire",
            "Airport pickup and drop-off transfers",
            "Corporate transport and fleet management",
            "Wedding and VIP event convoys",
            "Buying and selling new and used vehicles",
            "Vehicle sourcing and importation assistance",
            "Long-distance travel across Rwanda",
            "24/7 taxi and on-demand transport services",
            "Reliable, vetted and professional drivers",
            "Competitive daily, weekly and monthly rates",
          ].map(item => (
            <div
              key={item}
              className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm text-sm text-slate-700"
            >
              <span
                className="flex-none mt-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: ACCENT }}
              >
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── Request form ── */}
      <div className="max-w-5xl">
        <h2 className="text-xl font-black mb-6 text-slate-800">Submit Your Vehicle Request</h2>
        <ServiceRequestForm
          accentColor={ACCENT}
          serviceTitle="Car Rent, Sell & Taxi Services"
          waMessagePrefix="Hello KOSRES, I need a vehicle service."
          columnHeaders={[
            "Your Name","Email Address","Contact",
            "Service Type","Vehicle Type","Location","Request",
          ]}
          fields={[
            // ── Identity ──
            {
              name: "name",
              label: "Your Name",
              type: "text",
              required: true,
              placeholder: "Full name",
            },
            {
              name: "email",
              label: "Email Address",
              type: "email",
              required: true,
              placeholder: "your@email.com",
            },
            {
              name: "contact",
              label: "Contact / Phone",
              type: "tel",
              required: true,
              placeholder: "+250 7XX XXX XXX",
            },
            // ── Service fields ──
            {
              name: "serviceType",
              label: "Service Type",
              type: "select",
              required: true,
              options: rentalTypes,
            },
            {
              name: "vehicleType",
              label: "Vehicle Type",
              type: "grouped-select",
              required: true,
              groups: CAR_TYPE_GROUPS,
            },
            {
              name: "location",
              label: "Pickup Location",
              type: "select",
              required: true,
              options: ["Kigali International Airport", ...districts],
            },
            {
              name: "startDate",
              label: "Start Date",
              type: "text",
              placeholder: "e.g. 25 Jun 2026",
            },
            {
              name: "duration",
              label: "Duration / Details",
              type: "text",
              placeholder: "e.g. 3 days, or one-way Kigali → Musanze",
            },
            {
              name: "request",
              label: "Additional Request",
              type: "textarea",
              placeholder: "Any special requirements, number of passengers, preferred model…",
              colSpan: "full",
            },
          ]}
        />
      </div>
    </ServiceLayout>
  )
}
