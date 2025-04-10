import type { ReactNode } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header brandName="testingdemo" />
      <Sidebar />
      <main className="pt-16 lg:pl-64">
        <div className="container mx-auto p-4 md:p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
