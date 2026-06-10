"use client"

import { useRouter }   from "next/navigation"
import AdminShell      from "@/components/AdminShell"
import AddPropertyForm from "@/components/AddPropertyForm"
import { useAdmin }    from "@/components/AdminContext"

export default function AddPropertyPage() {
  const { refresh } = useAdmin()
  const router = useRouter()

  const handleSuccess = () => {
    refresh()
    router.push("/admin/properties")
  }

  return (
    <AdminShell title="Add Property">
      {/* token passed as empty string — auth disabled */}
      <AddPropertyForm token="" onSuccess={handleSuccess} />
    </AdminShell>
  )
}
