import { AdminProvider } from "@/components/AdminContext"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>
}
