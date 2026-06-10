"use client"

import AdminShell     from "@/components/AdminShell"
import AdminDashboard from "@/components/AdminDashboard"
import { useAdmin }   from "@/components/AdminContext"
import { RefreshCw }  from "lucide-react"

export default function DashboardPage() {
  const { properties, stats, refresh } = useAdmin()

  return (
    <AdminShell title="Dashboard">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Live analytics across {properties.length} listing{properties.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <AdminDashboard properties={properties} stats={stats} />
    </AdminShell>
  )
}
