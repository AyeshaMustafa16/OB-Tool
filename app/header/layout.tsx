import type React from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getBrandInfo } from "@/lib/auth"

export default async function HeaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/")
  }

  const brand = await getBrandInfo()
  const brandName = brand?.name || "Unknown"
  const brandLogo = brand?.logo || null

  console.log("Header layout rendered with:", { brandName, logoAvailable: !!brandLogo })

  return <div className="flex flex-col min-h-screen bg-gray-50">{children}</div>
}
