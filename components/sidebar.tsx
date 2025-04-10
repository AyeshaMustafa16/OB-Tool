"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Layout,
  FileCode,
  Search,
  FileText,
  Palette,
  FootprintsIcon as FootprintIcon,
} from "lucide-react"

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  isNew?: boolean
  disabled?: boolean
}

function SidebarItem({ href, icon: Icon, children, isNew, disabled = false }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  // For disabled items, render a div instead of a link
  if (disabled) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all opacity-50 cursor-not-allowed",
          "text-gray-400",
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{children}</span>
        {isNew && (
          <span className="ml-auto text-xs font-medium bg-yellow-300 text-yellow-800 px-1.5 py-0.5 rounded-full">
            NEW
          </span>
        )}
      </div>
    )
  }
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
        isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
      {isNew && (
        <span className="ml-auto text-xs font-medium bg-yellow-300 text-yellow-800 px-1.5 py-0.5 rounded-full">
          NEW
        </span>
      )}
    </Link>
  )
}

function Sidebar() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Function to save sidebar settings
  const saveSidebarSettings = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Get the brand ID from cookies
      const brandId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("brandId="))
        ?.split("=")[1]

      if (!brandId) {
        throw new Error("No brand ID found")
      }

      // Create a sidebar config object with current state
      const sidebarConfig = {
        // Add sidebar configuration properties here
        items: [
          { id: "dashboard", path: "/home", active: true },
          { id: "header", path: "/header", active: false },
          { id: "theme_settings", path: "/home/theme-settings", active: false },
          // Add other sidebar items
        ],
        // Add additional sidebar settings as needed
      }

      // Prepare API endpoint URL - replace with your actual endpoint
      const url = "https://tossdown.site/api/save_sidebar_settings"

      // Prepare form data
      const formData = new URLSearchParams()
      formData.append("brand_id", brandId)
      formData.append("sidebar_settings", JSON.stringify(sidebarConfig))

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`)
      }

      setSaveSuccess(true)
      console.log("Sidebar settings saved successfully")

      // Reset success message after a few seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving sidebar settings:", error)
      setSaveError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-64 border-r bg-white h-screen fixed top-0 left-0 hidden lg:block overflow-y-auto z-10">
      <div className="py-6 flex flex-col h-full">
        <div className="px-3 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <nav className="space-y-1 px-3 flex-1 overflow-auto">
          <SidebarItem href="/home" icon={LayoutDashboard}>
            Dashboard
          </SidebarItem>
          <SidebarItem href="/header" icon={Layout}>
            Header
          </SidebarItem>
          <SidebarItem href="/home/theme-settings" icon={Palette}>
            Theme Settings
          </SidebarItem>
          <SidebarItem href="/home/sections" icon={Layout}>
            Home Sections
          </SidebarItem>
          <SidebarItem href="/search-result" icon={Search}>
            Search Result
          </SidebarItem>
          <SidebarItem href="/detail-page" icon={FileText}>
            Detail Page
          </SidebarItem>
          <SidebarItem href="/footer" icon={FootprintIcon}>
            Footer
          </SidebarItem>
          <SidebarItem href="/css" icon={FileCode}>
            CSS
          </SidebarItem>
        </nav>
      </div>
    </div>
  )
}

// Export the Sidebar component as the default export
export default Sidebar
