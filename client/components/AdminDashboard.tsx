"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Home, Star, MessageSquare, Activity,
  TrendingUp, TrendingDown, MapPin,
} from "lucide-react"
import type { ApiProperty } from "@/lib/api"
import { formatPriceCompact, formatPrice } from "@/lib/utils"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts"

// ── Types ──────────────────────────────────────────────────────────────
interface Props {
  properties: ApiProperty[]
  stats: {
    total: number; active: number; featured: number
    forSale: number; forRent: number; shortStay: number
  } | null
  inquiries?: any[]
}

// ── Constants ──────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"]

const CAT_COLORS: Record<string, string> = {
  residential:  "#C8102E",
  commercial:   "#1B3A5C",
  agricultural: "#2E7D32",
  industrial:   "#6A1B9A",
}
const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  active:   { bg: "bg-emerald-50", text: "text-emerald-700", bar: "#2E7D32" },
  sold:     { bg: "bg-slate-100",  text: "text-slate-600",   bar: "#64748b" },
  rented:   { bg: "bg-blue-50",    text: "text-blue-700",    bar: "#1877F2" },
  inactive: { bg: "bg-red-50",     text: "text-red-600",     bar: "#C8102E" },
}
const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "#25D366", instagram: "#dd2a7b",
  facebook: "#1877F2", website:   "#C8102E", other: "#888",
}

// ── Custom tooltip ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2.5 shadow-lg text-xs min-w-[100px]">
      {label && <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color || p.fill }} />
            <span className="text-slate-600">{p.name}</span>
          </span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, iconBg, iconColor, trend, trendLabel,
}: {
  label: string; value: string | number; sub: string
  icon: React.ElementType; iconBg: string; iconColor: string
  trend?: "up" | "down" | null; trendLabel?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && trendLabel && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trend === "up"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}>
            {trend === "up"
              ? <TrendingUp size={10} />
              : <TrendingDown size={10} />
            }
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-slate-800 leading-none tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-slate-600 mt-1.5">{label}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────
function Empty({ msg = "No data yet" }: { msg?: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-slate-400">{msg}</div>
  )
}

// ── Main component ─────────────────────────────────────────────────────
export default function AdminDashboard({ properties, stats, inquiries = [] }: Props) {
  const now = new Date()

  // ── Derived metrics ──────────────────────────────────────────────────
  const total     = properties.length
  const active    = properties.filter(p => p.status === "active").length
  const sold      = properties.filter(p => p.status === "sold").length
  const rented    = properties.filter(p => p.status === "rented").length
  const featured  = properties.filter(p => p.featured).length
  const liveRate  = total ? Math.round(active / total * 100) : 0

  // Avg price of active sale listings (RWF only)
  const salePrices = properties
    .filter(p => p.offerType === "sale" && p.status === "active" && p.priceUnit === "RWF")
    .map(p => Number(p.price))
  const avgSalePrice = salePrices.length
    ? Math.round(salePrices.reduce((a, b) => a + b, 0) / salePrices.length)
    : 0

  // Avg rent (RWF/month only)
  const rentPrices = properties
    .filter(p => p.offerType === "rent" && p.priceUnit === "RWF" && p.priceFrequency === "month")
    .map(p => Number(p.price))
  const avgRentPrice = rentPrices.length
    ? Math.round(rentPrices.reduce((a, b) => a + b, 0) / rentPrices.length)
    : 0

  // ── Monthly new listings — last 6 months ────────────────────────────
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const newCount = properties.filter(p => {
        const pd = new Date(p.createdAt)
        return `${pd.getFullYear()}-${pd.getMonth()}` === key
      }).length
      // Cumulative up to this month
      const cumulative = properties.filter(p => {
        const pd = new Date(p.createdAt)
        const pk = `${pd.getFullYear()}-${pd.getMonth()}`
        // Compare year-month lexicographically
        return pd <= new Date(d.getFullYear(), d.getMonth() + 1, 0)
      }).length
      return { month: MONTHS[d.getMonth()], new: newCount, total: cumulative }
    })
  }, [properties])

  // ── Offer type ───────────────────────────────────────────────────────
  const offerData = useMemo(() => [
    { name: "For Sale",   value: properties.filter(p => p.offerType === "sale").length,       color: "#C8102E" },
    { name: "For Rent",   value: properties.filter(p => p.offerType === "rent").length,       color: "#1B5E20" },
    { name: "Short Stay", value: properties.filter(p => p.offerType === "short_stay").length, color: "#E65100" },
  ], [properties])

  // ── Category breakdown ───────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    properties.forEach(p => { map[p.category] = (map[p.category] || 0) + 1 })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: CAT_COLORS[name] || "#888",
        pct: total ? Math.round(value / total * 100) : 0,
      }))
  }, [properties, total])

  // ── Property type breakdown (top 8) ─────────────────────────────────
  const propTypeData = useMemo(() => {
    const map: Record<string, number> = {}
    properties.forEach(p => { map[p.propertyType] = (map[p.propertyType] || 0) + 1 })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([type, count]) => ({ type, count }))
  }, [properties])

  // ── Status breakdown ─────────────────────────────────────────────────
  const statusData = useMemo(() => {
    const map: Record<string, number> = {}
    properties.forEach(p => { map[p.status] = (map[p.status] || 0) + 1 })
    return Object.entries(map).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: STATUS_COLORS[status]?.bar || "#888",
    }))
  }, [properties])

  // ── District distribution ────────────────────────────────────────────
  const districtData = useMemo(() => {
    const map: Record<string, number> = {}
    properties.forEach(p => { map[p.district] = (map[p.district] || 0) + 1 })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([district, count]) => ({ district, count }))
  }, [properties])

  // ── Avg price per district (sale, RWF) ───────────────────────────────
  const districtAvgPrice = useMemo(() => {
    const map: Record<string, number[]> = {}
    properties
      .filter(p => p.offerType === "sale" && p.priceUnit === "RWF")
      .forEach(p => {
        if (!map[p.district]) map[p.district] = []
        map[p.district].push(Number(p.price))
      })
    return Object.entries(map)
      .map(([district, prices]) => ({
        district,
        avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6)
  }, [properties])

  // ── Sale price buckets (RWF) ─────────────────────────────────────────
  const priceData = useMemo(() => {
    const buckets = [
      { label: "<10M",     min: 0,      max: 10e6     },
      { label: "10–50M",  min: 10e6,   max: 50e6     },
      { label: "50–100M", min: 50e6,   max: 100e6    },
      { label: "100–300M",min: 100e6,  max: 300e6    },
      { label: "300M+",   min: 300e6,  max: Infinity  },
    ]
    return buckets.map(b => ({
      label: b.label,
      sale: properties.filter(p =>
        p.offerType === "sale" && p.priceUnit === "RWF" &&
        Number(p.price) >= b.min && Number(p.price) < b.max
      ).length,
      rent: properties.filter(p =>
        p.offerType === "rent" && p.priceUnit === "RWF" &&
        Number(p.price) >= b.min / 200 && Number(p.price) < b.max / 200
      ).length,
    }))
  }, [properties])

  // ── Inquiries by channel ─────────────────────────────────────────────
  const channelData = useMemo(() => {
    const map: Record<string, number> = {}
    inquiries.forEach((inq: any) => {
      const ch = (inq.channel || "other").toLowerCase()
      map[ch] = (map[ch] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, count]) => ({
        channel: ch.charAt(0).toUpperCase() + ch.slice(1),
        count,
        color: CHANNEL_COLORS[ch] || "#888",
        pct: inquiries.length ? Math.round(count / inquiries.length * 100) : 0,
      }))
  }, [inquiries])

  // ── Inquiries over time (last 6 months) ──────────────────────────────
  const inquiryTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const count = inquiries.filter((inq: any) => {
        const id = new Date(inq.createdAt)
        return `${id.getFullYear()}-${id.getMonth()}` === key
      }).length
      return { month: MONTHS[d.getMonth()], count }
    })
  }, [inquiries])

  // ── Recent listings ──────────────────────────────────────────────────
  const recentProps = useMemo(() =>
    [...properties]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [properties]
  )

  // ── Styles ────────────────────────────────────────────────────────────
  const card      = "bg-white rounded-xl border border-border p-5 shadow-sm"
  const cardTitle = "text-sm font-semibold text-slate-700 mb-4"
  const sectionHd = "text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3"

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Row 1: KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total listings" value={total}
          sub={`${active} active · ${sold + rented} closed`}
          icon={Home} iconBg="bg-red-50" iconColor="text-red-600"
          trend={total > 0 ? "up" : null} trendLabel={`${liveRate}% live`}
        />
        <StatCard
          label="Avg sale price" value={avgSalePrice > 0 ? formatPriceCompact(avgSalePrice, "RWF", null) : "–"}
          sub={`${salePrices.length} active sale listings`}
          icon={TrendingUp} iconBg="bg-purple-50" iconColor="text-purple-600"
        />
        <StatCard
          label="Avg rent / month" value={avgRentPrice > 0 ? formatPriceCompact(avgRentPrice, "RWF", "month") : "–"}
          sub={`${rentPrices.length} rental listings`}
          icon={Activity} iconBg="bg-green-50" iconColor="text-green-700"
        />
        <StatCard
          label="Featured" value={featured}
          sub={`${inquiries.length} total inquiries`}
          icon={Star} iconBg="bg-amber-50" iconColor="text-amber-600"
          trend={inquiries.length > 0 ? "up" : null}
          trendLabel={`${inquiries.length} inq.`}
        />
      </div>

      {/* ── Row 2: Monthly listings trend + Offer type ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Monthly new listings */}
        <div className={`${card} lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <p className={cardTitle.replace("mb-4","")}>New listings — last 6 months</p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#C8102E] inline-block rounded" />New</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-300 inline-block rounded" />Cumulative</span>
            </div>
          </div>
          {monthlyData.every(d => d.new === 0 && d.total === 0)
            ? <Empty msg="No listings added yet" />
            : (
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={monthlyData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="new" name="New" stroke="#C8102E" strokeWidth={2.5}
                    dot={{ fill: "#C8102E", r: 4, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="total" name="Cumulative" stroke="#cbd5e1" strokeWidth={1.5}
                    strokeDasharray="4 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Offer type */}
        <div className={card}>
          <p className={cardTitle}>By offer type</p>
          {offerData.every(d => d.value === 0)
            ? <Empty />
            : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={offerData} layout="vertical"
                    margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false} tickLine={false} width={74} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,.03)" }} />
                    <Bar dataKey="value" name="Listings" radius={[0, 4, 4, 0]} barSize={16}>
                      {offerData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 pt-3 border-t border-border">
                  {offerData.map(o => (
                    <div key={o.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-none"
                        style={{ background: o.color }} />
                      <span className="text-xs text-slate-600 flex-1">{o.name}</span>
                      <span className="text-xs font-bold text-slate-700">{o.value}</span>
                      <span className="text-[10px] text-slate-400 w-8 text-right">
                        {total ? Math.round(o.value / total * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </div>
      </div>

      {/* ── Row 3: Category + Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Category doughnut */}
        <div className={card}>
          <p className={cardTitle}>Category breakdown</p>
          {categoryData.length === 0
            ? <Empty />
            : (
              <div className="flex items-center gap-6">
                <div style={{ width: 150, height: 150, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" cx="50%" cy="50%"
                        innerRadius={44} outerRadius={68} paddingAngle={3}>
                        {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {categoryData.map(c => (
                    <div key={c.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c.color }} />
                          {c.name}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {c.value} <span className="font-normal text-slate-400">({c.pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${c.pct}%`, background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>

        {/* Status breakdown */}
        <div className={card}>
          <p className={cardTitle}>Listing status</p>
          {statusData.length === 0
            ? <Empty />
            : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={statusData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false}
                      tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,.03)" }} />
                    <Bar dataKey="count" name="Listings" radius={[4, 4, 0, 0]} barSize={32}>
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border">
                  {statusData.map(s => {
                    const style = STATUS_COLORS[s.status.toLowerCase()] || STATUS_COLORS.inactive
                    return (
                      <span key={s.status}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                        {s.status}: {s.count}
                      </span>
                    )
                  })}
                </div>
              </>
            )
          }
        </div>
      </div>

      {/* ── Row 4: District count + Avg price per district ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* District listing count */}
        <div className={card}>
          <p className={cardTitle}>Listings by district</p>
          {districtData.length === 0
            ? <Empty />
            : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={districtData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="district" tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false}
                    tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,.03)" }} />
                  <Bar dataKey="count" name="Listings" fill="#C8102E" radius={[4, 4, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Avg sale price per district */}
        <div className={card}>
          <p className={cardTitle}>Avg sale price by district (RWF)</p>
          {districtAvgPrice.length === 0
            ? <Empty msg="No sale listings yet" />
            : (
              <div className="space-y-3">
                {districtAvgPrice.map((d, i) => {
                  const max = districtAvgPrice[0].avg
                  const pct = Math.round(d.avg / max * 100)
                  return (
                    <div key={d.district}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin size={11} className="text-slate-400" /> {d.district}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {formatPriceCompact(d.avg, "RWF", null)}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: i === 0 ? "#C8102E" : i === 1 ? "#E65100" : "#1B3A5C",
                          }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* ── Row 5: Price distribution + Property type breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Price buckets */}
        <div className={card}>
          <p className={cardTitle}>Sale price distribution (RWF)</p>
          {priceData.every(d => d.sale === 0)
            ? <Empty msg="No sale listings yet" />
            : (
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={priceData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false}
                    tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,.03)" }} />
                  <Bar dataKey="sale" name="For Sale" fill="#C8102E" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Property type bar */}
        <div className={card}>
          <p className={cardTitle}>Top property types</p>
          {propTypeData.length === 0
            ? <Empty />
            : (
              <div className="space-y-2.5">
                {propTypeData.map((t, i) => {
                  const max = propTypeData[0].count
                  return (
                    <div key={t.type} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 w-32 truncate flex-none">{t.type}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.round(t.count / max * 100)}%`, background: "#C8102E" }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-5 text-right flex-none">{t.count}</span>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* ── Row 6: Inquiry trend + Channel breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Inquiry trend */}
        <div className={`${card} lg:col-span-2`}>
          <p className={cardTitle}>Inquiries — last 6 months</p>
          {inquiryTrend.every(d => d.count === 0)
            ? <Empty msg="No inquiries received yet" />
            : (
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={inquiryTrend} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false}
                    tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,.03)" }} />
                  <Bar dataKey="count" name="Inquiries" fill="#1B3A5C" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Channel breakdown */}
        <div className={card}>
          <p className={cardTitle}>By channel</p>
          {channelData.length === 0
            ? (
              <div className="py-4 text-center">
                <MessageSquare size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400">No inquiries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {channelData.map(c => (
                  <div key={c.channel}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c.color }} />
                        {c.channel}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {c.count} <span className="font-normal text-slate-400">({c.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-slate-400 pt-2 border-t border-border">
                  {inquiries.length} total inquiri{inquiries.length !== 1 ? "es" : "y"}
                </p>
              </div>
            )
          }
        </div>
      </div>

      {/* ── Row 7: Recent listings ── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <p className={cardTitle.replace("mb-4","")}>Recent listings</p>
          <Link href="/admin/properties"
            className="text-xs text-[oklch(0.42_0.19_25)] hover:underline font-medium">
            View all →
          </Link>
        </div>

        {recentProps.length === 0
          ? <Empty msg="No listings yet" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["","Property","District","Offer","Price","Status","Added"].map((h, i) => (
                      <th key={i} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-2.5 pr-4 last:pr-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentProps.map(p => (
                    <tr key={p.id}
                      className="border-b border-border/50 last:border-0 hover:bg-slate-50 transition-colors group">
                      {/* Thumbnail */}
                      <td className="py-2.5 pr-3 w-10">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex-none">
                          {p.images[0]
                            ? <Image src={p.images[0]} alt="" width={36} height={36} className="object-cover w-full h-full" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">—</div>
                          }
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 max-w-[160px]">
                        <Link href={`/properties/${p.id}`} target="_blank"
                          className="font-medium text-slate-800 truncate block group-hover:text-[oklch(0.42_0.19_25)] transition-colors text-xs">
                          {p.title}
                        </Link>
                        <span className="text-[10px] text-slate-400">{p.propertyType}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-slate-500">{p.district}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          p.offerType === "sale"       ? "bg-red-50 text-red-700"
                          : p.offerType === "rent"     ? "bg-green-50 text-green-700"
                          : "bg-orange-50 text-orange-700"
                        }`}>{p.offerType}</span>
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-[oklch(0.42_0.19_25)]">
                          {formatPriceCompact(Number(p.price), p.priceUnit, p.priceFrequency)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          STATUS_COLORS[p.status]?.bg ?? "bg-slate-100"
                        } ${STATUS_COLORS[p.status]?.text ?? "text-slate-600"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("en-RW", {
                          day: "numeric", month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

    </div>
  )
}
