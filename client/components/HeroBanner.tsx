"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

const SLIDES = [
  {
    src:     "/images/WhatsApp Image 2026-06-04 at 09.15.38.jpeg",
    heading: "Your Trusted Real Estate Advisor",
    sub:     "in a Land of Thousand Opportunities",
    cta:     "Browse Properties",
    href:    "/properties",
  },
  {
    src:     "/images/WhatsApp Image 2026-06-04 at 09.15.39.jpeg",
    heading: "Find Your Dream Home in Kigali",
    sub:     "Residential, commercial & investment properties across Rwanda",
    cta:     "Invest in Kigali",
    href:    "/services/invest",
  },
  {
    src:     "/images/WhatsApp Image 2026-06-04 at 09.15.41.jpeg",
    heading: "Professional Real Estate Services",
    sub:     "Valuation · Due Diligence · Property Management · Tax Consulting",
    cta:     "Our Services",
    href:    "/#services",
  },
  {
    src:     "/images/WhatsApp Image 2026-06-04 at 09.15.36.jpeg",
    heading: "Buy, Sell & Rent with Confidence",
    sub:     "Trusted by hundreds of clients across Kigali and Rwanda",
    cta:     "Buy / Sell & Rent",
    href:    "/services/buy-sell-rent",
  },
  {
    src:     "/images/WhatsApp Image 2026-06-04 at 09.15.40.jpeg",
    heading: "Commercial Real Estate Experts",
    sub:     "Offices, retail spaces, hotels and industrial properties",
    cta:     "View Listings",
    href:    "/properties",
  },
  {
    src:     "/images/WhatsApp Image 2026-06-04 at 09.15.37.jpeg",
    heading: "Asset Valuation You Can Trust",
    sub:     "Independent, certified valuations for loans, insurance and taxation",
    cta:     "Get a Valuation",
    href:    "/services/valuation",
  },
]

const INTERVAL = 5000   // ms between auto-slides
const TRANSITION = 700  // ms for the CSS transition

export default function HeroBanner() {
  const [current,  setCurrent]  = useState(0)
  const [prev,     setPrev]     = useState<number | null>(null)
  const [entering, setEntering] = useState(false)   // slide animating in
  const [dir,      setDir]      = useState<"next"|"prev">("next")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const total = SLIDES.length

  const go = useCallback((idx: number, direction: "next" | "prev") => {
    setPrev(current)
    setDir(direction)
    setEntering(true)
    setCurrent(idx)
    // clear prev after transition
    setTimeout(() => { setPrev(null); setEntering(false) }, TRANSITION)
  }, [current])

  const goNext = useCallback(() => go((current + 1) % total, "next"), [current, go, total])
  const goPrev = useCallback(() => go((current - 1 + total) % total, "prev"), [current, go, total])
  const goTo   = useCallback((i: number) => go(i, i > current ? "next" : "prev"), [current, go])

  // Auto-play
  useEffect(() => {
    timerRef.current = setTimeout(goNext, INTERVAL)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, goNext])

  // Pause on hover
  const pause  = () => { if (timerRef.current) clearTimeout(timerRef.current) }
  const resume = () => { timerRef.current = setTimeout(goNext, INTERVAL) }

  const slide = SLIDES[current]
  const prevSlide = prev !== null ? SLIDES[prev] : null

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "calc(100vh - 124px)", minHeight: 480 }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* ── Previous slide (fading/sliding out) ── */}
      {prevSlide && (
        <div
          key={`prev-${prev}`}
          className="absolute inset-0 z-0"
          style={{
            animation: `slide-out-${dir} ${TRANSITION}ms ease forwards`,
          }}
        >
          <Image src={prevSlide.src} alt="" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      )}

      {/* ── Current slide (fading/sliding in) ── */}
      <div
        key={`curr-${current}`}
        className="absolute inset-0 z-10"
        style={{
          animation: entering
            ? `slide-in-${dir} ${TRANSITION}ms ease forwards`
            : "none",
        }}
      >
        <Image
          src={slide.src}
          alt={slide.heading}
          fill priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
      </div>

      {/* ── Content ── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
        <div key={current} className="max-w-4xl animate-fade-up">
          {/* Eyebrow */}
          <p className="text-amber-300 text-xs sm:text-sm font-bold tracking-[0.25em] uppercase mb-4">
            KOSRES LTD · Kigali One Stop Real Estate Service
          </p>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-4 drop-shadow-lg">
            {slide.heading}
          </h1>

          {/* Subheading */}
          <p className="text-white/80 text-base sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            {slide.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={slide.href}
              className="inline-flex items-center gap-2 bg-[oklch(0.42_0.19_25)] hover:bg-[oklch(0.36_0.18_25)] text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg text-sm sm:text-base">
              {slide.href.includes("properties") && <Search size={17} />}
              {slide.cta}
            </Link>
            <Link href="/properties"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm sm:text-base">
              View All Properties
            </Link>
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 h-2.5 bg-white"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-0.5 bg-white/10">
        <div
          key={current}
          className="h-full bg-[oklch(0.42_0.19_25)]"
          style={{
            animation: `progress ${INTERVAL}ms linear forwards`,
          }}
        />
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-6 right-6 z-30 text-white/60 text-xs font-semibold tabular-nums">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

      {/* ── Keyframe animations (injected inline) ── */}
      <style>{`
        @keyframes slide-in-next {
          from { transform: translateX(6%); opacity: 0; }
          to   { transform: translateX(0);  opacity: 1; }
        }
        @keyframes slide-out-next {
          from { transform: translateX(0);   opacity: 1; }
          to   { transform: translateX(-6%); opacity: 0; }
        }
        @keyframes slide-in-prev {
          from { transform: translateX(-6%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes slide-out-prev {
          from { transform: translateX(0);  opacity: 1; }
          to   { transform: translateX(6%); opacity: 0; }
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  )
}
