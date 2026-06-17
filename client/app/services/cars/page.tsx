import ServiceLayout from "@/components/ServiceLayout"
import ServiceRequestForm from "@/components/ServiceRequestForm"
import { Car, Key, MapPin, Shield } from "lucide-react"

const ACCENT = "#1C2B4B"

const CAR_TYPES = [
  "Sedan","SUV","4x4 / Off-road","Pickup Truck",
  "Minibus / Van","Luxury / Executive","Bus / Coach",
  "Motorcycle / Moto-taxi",
]

const TAXI_SERVICES = [
  "Airport Transfer","City Ride","Inter-city Transfer",
  "Corporate / Business Ride","Wedding & Events",
  "Daily Driver (full day)","Weekly Hire",
]

const SALE_TYPES = [
  "New Car","Used / Second-hand","Imported (Japan/Belgium)",
  "Commercial Vehicle","Motorcycle",
]

const FUEL_TYPES = ["Petrol","Diesel","Hybrid","Electric"]
const DISTRICTS  = ["Kicukiro","Nyarugenge","Gasabo","Musanze","Rubavu","Muhanga","Kayonza","Rusizi","Bugesera"]

const highlights = [
  { icon: Car,    title: "Car Rentals",        desc: "Short-term and long-term vehicle hire for individuals, corporates and tourists across Rwanda." },
  { icon: Key,    title: "Buy & Sell Cars",    desc: "Find your perfect vehicle or list yours for sale — new, used and imported cars at fair market prices." },
  { icon: MapPin, title: "Taxi & Transfer",    desc: "Reliable, comfortable rides for airport transfers, city trips, inter-city travel and corporate bookings." },
  { icon: Shield, title: "Vetted & Insured",   desc: "All vehicles are vetted, properly insured and maintained to the highest standards for your safety." },
]

export default function CarsPage() {
  return (
    <ServiceLayout
      accentColor={ACCENT}
      title="Car Rent, Sell & Taxi Services"
      subtitle="Mobility Services"
      breadcrumb="Car Rent, Sell & Taxi"
      description="KOSRES LTD extends beyond real estate to provide comprehensive mobility solutions across Rwanda. Whether you need a vehicle for rent, want to buy or sell a car, or require a reliable taxi and transfer service — we have you covered with vetted, insured and professionally managed vehicles."
    >
      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {highlights.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: ACCENT + "18" }}>
              <Icon size={18} style={{ color: ACCENT }} />
            </div>
            <h3 className="font-bold text-sm mb-1 text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* ── Section 1: Car Rental ── */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <Car size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Service 1</p>
            <h2 className="text-xl font-black text-slate-800">Car Rental</h2>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Available Vehicle Types</p>
          <div className="flex flex-wrap gap-2">
            {CAR_TYPES.map(t => (
              <span key={t} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">{t}</span>
            ))}
          </div>
        </div>
        <div className="max-w-3xl">
          <ServiceRequestForm
            accentColor={ACCENT}
            serviceTitle="Car Rental"
            waMessagePrefix="Hello KOSRES, I'd like to rent a vehicle."
            columnHeaders={["Your Name","Email","Contact","Vehicle Type","Pickup Location","Duration"]}
            fields={[
              { name: "name",        label: "Your Name",          type: "text",    required: true, placeholder: "Full name" },
              { name: "email",       label: "Email Address",      type: "email",   placeholder: "your@email.com" },
              { name: "contact",     label: "Contact",            type: "tel",     required: true, placeholder: "+250 7XX XXX XXX" },
              { name: "vehicleType", label: "Vehicle Type",       type: "select",  required: true, options: CAR_TYPES },
              { name: "location",    label: "Pickup Location",    type: "select",  options: DISTRICTS },
              { name: "fuelType",    label: "Fuel Preference",    type: "select",  options: FUEL_TYPES },
              { name: "duration",    label: "Rental Duration",    type: "text",    placeholder: "e.g. 3 days, 1 week, 1 month" },
              { name: "request",     label: "Additional Details", type: "textarea",placeholder: "Dates, special requirements…", colSpan: "full" },
            ]}
          />
        </div>
      </div>

      {/* ── Section 2: Buy & Sell Cars ── */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#7B1113" }}>
            <Key size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Service 2</p>
            <h2 className="text-xl font-black text-slate-800">Buy & Sell Cars</h2>
          </div>
        </div>
        <div className="max-w-3xl">
          <ServiceRequestForm
            accentColor="#7B1113"
            serviceTitle="Car Buy & Sell"
            waMessagePrefix="Hello KOSRES, I'm interested in buying or selling a car."
            columnHeaders={["Your Name","Email","Contact","Intent","Vehicle Type","Budget"]}
            fields={[
              { name: "name",     label: "Your Name",             type: "text",    required: true, placeholder: "Full name" },
              { name: "email",    label: "Email Address",         type: "email",   placeholder: "your@email.com" },
              { name: "contact",  label: "Contact",               type: "tel",     required: true, placeholder: "+250 7XX XXX XXX" },
              { name: "intent",   label: "I want to",             type: "select",  required: true, options: ["Buy a Car","Sell my Car","Both — Buy & Sell"] },
              { name: "carType",  label: "Vehicle Type",          type: "select",  required: true, options: SALE_TYPES },
              { name: "fuelType", label: "Fuel Type",             type: "select",  options: FUEL_TYPES },
              { name: "budget",   label: "Budget / Price (RWF)",  type: "text",    placeholder: "e.g. 15,000,000 RWF" },
              { name: "request",  label: "Car Details / Notes",   type: "textarea",placeholder: "Make, model, year, mileage, condition…", colSpan: "full" },
            ]}
          />
        </div>
      </div>

      {/* ── Section 3: Taxi & Transfer ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1A4731" }}>
            <MapPin size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Service 3</p>
            <h2 className="text-xl font-black text-slate-800">Taxi & Transfer Services</h2>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Available Services</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TAXI_SERVICES.map(s => (
              <div key={s} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-sm text-xs font-medium text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ backgroundColor: "#1A4731" }} />{s}
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-3xl">
          <ServiceRequestForm
            accentColor="#1A4731"
            serviceTitle="Taxi & Transfer"
            waMessagePrefix="Hello KOSRES, I need a taxi or transfer service."
            columnHeaders={["Your Name","Email","Contact","Service Type","From","To"]}
            fields={[
              { name: "name",        label: "Your Name",         type: "text",    required: true, placeholder: "Full name" },
              { name: "email",       label: "Email Address",     type: "email",   placeholder: "your@email.com" },
              { name: "contact",     label: "Contact",           type: "tel",     required: true, placeholder: "+250 7XX XXX XXX" },
              { name: "serviceType", label: "Service Type",      type: "select",  required: true, options: TAXI_SERVICES },
              { name: "from",        label: "Pickup Point",      type: "text",    required: true, placeholder: "e.g. Kigali International Airport" },
              { name: "to",          label: "Destination",       type: "text",    required: true, placeholder: "e.g. Kimihurura, Kigali" },
              { name: "date",        label: "Date & Time",       type: "text",    placeholder: "e.g. 20 June 2026, 08:00" },
              { name: "passengers",  label: "No. of Passengers", type: "select",  options: ["1","2","3","4","5","6","7+"] },
              { name: "request",     label: "Additional Notes",  type: "textarea",placeholder: "Flight number, luggage, special requests…", colSpan: "full" },
            ]}
          />
        </div>
      </div>
    </ServiceLayout>
  )
}
