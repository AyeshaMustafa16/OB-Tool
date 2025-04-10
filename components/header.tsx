"use client"

import type React from "react"

import { Menu, LogOut, RefreshCw } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSettings } from "@/contexts/settings-context"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { purgeCache } from "@/lib/purge-cache"

interface HeaderProps {
  brandName: string
  brandLogo?: string | null
}

export default function Header({ brandName, brandLogo }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { settings } = useSettings()
  const { toast } = useToast()
  const [isPurging, setIsPurging] = useState(false)

  // Update to check for exact header path
  const isHeaderPage = pathname === "/header"
  console.log("Current pathname:", pathname, "isHeaderPage:", isHeaderPage)

  const headerRef = useRef<HTMLDivElement>(null)
  const [isHeaderPageConfirmed, setIsHeaderPageConfirmed] = useState(isHeaderPage)
  const [fallbackLogo, setFallbackLogo] = useState<string | null>(null)

  // Use settings from context if available
  const displayName = settings.business_info?.name || brandName

  // Try multiple sources for the logo
  const logoFromSettings = settings.business_logo
  const logoFromProps = brandLogo

  // Get logo from cookie
  useEffect(() => {
    // Get logo from cookie on client side
    const getCookieLogo = () => {
      const logoFromCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("brandLogo="))
        ?.split("=")[1]

      if (logoFromCookie) {
        setFallbackLogo(decodeURIComponent(logoFromCookie))
      }
    }

    getCookieLogo()
  }, [])

  // Use the first available logo source
  const displayLogo = logoFromSettings || logoFromProps || fallbackLogo || "/placeholder.svg?height=50&width=150"

  console.log("Logo sources:", {
    logoFromSettings,
    logoFromProps,
    fallbackLogo,
    displayLogo,
  })

  // Function to handle purge cache
  const handlePurgeCache = async () => {
    if (isPurging) return

    try {
      setIsPurging(true)

      // Call the purgeCache function
      const result = await purgeCache()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          duration: 3000,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error purging cache:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPurging(false)
    }
  }

  // Update the API check to only consider exact header path
  useEffect(() => {
    const checkHeaderPage = async () => {
      try {
        // Only set isHeaderPageConfirmed if we're on the exact header path
        if (pathname === "/header") {
          setIsHeaderPageConfirmed(true)
          console.log("Header page confirmed via pathname check")
          return
        }

        // Fallback to API check if needed
        const response = await fetch("/api/check-header-page")
        const data = await response.json()
        console.log("Header page check response:", data)

        // Only consider it a header page if it's exactly "/header"
        if (data.pathname === "/header") {
          setIsHeaderPageConfirmed(true)
          console.log("Header page confirmed via API")
        }
      } catch (error) {
        console.error("Error checking header page:", error)
        // If API fails, rely on pathname check
        if (pathname === "/header") {
          setIsHeaderPageConfirmed(true)
        }
      }
    }

    checkHeaderPage()
  }, [pathname])

  // Add a more aggressive approach to prevent navigation on the header page
  useEffect(() => {
    if ((isHeaderPage || isHeaderPageConfirmed) && headerRef.current) {
      console.log("Applying header page navigation prevention")

      // Create an overlay div that captures all clicks
      const overlay = document.createElement("div")
      overlay.style.position = "absolute"
      overlay.style.top = "0"
      overlay.style.left = "0"
      overlay.style.width = "100%"
      overlay.style.height = "100%"
      overlay.style.zIndex = "1000"
      overlay.style.backgroundColor = "transparent"
      overlay.style.cursor = "default"

      // Add the overlay to the header
      headerRef.current.style.position = "relative"
      headerRef.current.appendChild(overlay)

      // Prevent all clicks on the overlay
      overlay.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log("Click intercepted by overlay")
        return false
      })

      // Disable all links in the header
      const links = headerRef.current.querySelectorAll("a")
      links.forEach((link) => {
        link.style.pointerEvents = "none"
        link.setAttribute("data-original-href", link.getAttribute("href") || "")
        link.setAttribute("href", "javascript:void(0)")
        link.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log("Link click prevented")
          return false
        })
      })

      // Return cleanup function
      return () => {
        if (headerRef.current) {
          headerRef.current.removeChild(overlay)
          links.forEach((link) => {
            link.style.pointerEvents = ""
            const originalHref = link.getAttribute("data-original-href")
            if (originalHref) {
              link.setAttribute("href", originalHref)
            }
          })
        }
      }
    }
  }, [isHeaderPage, isHeaderPageConfirmed])

  const handleLogout = async (e: React.MouseEvent) => {
    // If we're on the header page, prevent the default action
    if (isHeaderPage || isHeaderPageConfirmed) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      })

      if (response.ok) {
        // Clear client-side cookies
        document.cookie = "brandId=; path=/; max-age=0"
        document.cookie = "brandName=; path=/; max-age=0"
        document.cookie = "brandLogo=; path=/; max-age=0"

        // Force a hard navigation to ensure cookies are properly cleared
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Add a click handler to prevent navigation on the header page
  const handleHeaderClick = (e: React.MouseEvent) => {
    if (isHeaderPage || isHeaderPageConfirmed) {
      e.preventDefault()
      e.stopPropagation()
      console.log("Header click prevented")
    }
  }

  // Render the default header
  return (
    <header
      ref={headerRef}
      className="border-b bg-white shadow-sm fixed top-0 left-0 right-0 z-10"
      onClick={handleHeaderClick}
    >
      <div className="flex h-16 items-center px-6 ml-0 lg:ml-64">
        <div className="flex items-center gap-2">
          <div className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">{displayName}</h1>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
          <Button
            className="bg-[#ff6b8b] hover:bg-[#e05a79] text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg"
            onClick={handlePurgeCache}
            disabled={isPurging}
          >
            {isPurging ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Purging...
              </>
            ) : (
              "Purge Cache"
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0 overflow-hidden">
                {displayLogo ? (
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={displayLogo || "/placeholder.svg"}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error("Error loading brand logo:", displayLogo)
                        e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                      }}
                    />
                  </div>
                ) : (
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt={displayName} />
                    <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-lg border border-gray-100">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-lg font-medium text-gray-800">{displayName}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-lg hover:bg-gray-50 transition-colors py-2"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
