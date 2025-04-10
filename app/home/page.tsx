"use client"

import { useEffect, useRef, useState } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Loader2, LayoutGrid, FileEdit, Palette, Menu, FileCode, Search, LayoutList, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Import the dynamic configuration
import "../dynamic"

export default function HomePage() {
  const { settings, refreshSettings, setActiveClass } = useSettings()
  const isFirstRender = useRef(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [apiErrors, setApiErrors] = useState<string[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      // Only set active class if this is the first render
      if (isFirstRender.current) {
        setActiveClass("home_sections")
        isFirstRender.current = false

        // Check if user is authenticated
        const brandId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("brandId="))
          ?.split("=")[1]

        setIsAuthenticated(!!brandId)

        // Only refresh settings if authenticated
        try {
          await refreshSettings()
          const now = new Date()
          setLastUpdateTime(now.toLocaleString())
        } catch (error) {
          console.error("Failed to refresh settings:", error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          setError("Failed to load settings. Please try logging in again.")

          // Check for CORS errors
          if (errorMessage.includes("CORS")) {
            setApiErrors((prev) => [...prev, errorMessage])
          }
        }
      }

      setIsLoading(false)
    }

    init()
  }, [refreshSettings, setActiveClass])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome to your customized website dashboard!</p>
            {lastUpdateTime && <p className="text-sm text-gray-400">Last updated: {lastUpdateTime}</p>}
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {apiErrors.length > 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">API Errors:</p>
              <ul className="list-disc pl-5">
                {apiErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>Website Sections</CardTitle>
                <CardDescription>Manage your website's main sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/header"
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Menu className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-center">Header</span>
                  </Link>
                  <Link
                    href="/home/sections"
                    className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <LayoutGrid className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-center">Home Sections</span>
                  </Link>
                  <Link
                    href="/search-result"
                    className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Search className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-center">Search Result</span>
                  </Link>
                  <Link
                    href="/detail-page"
                    className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <FileText className="h-8 w-8 text-amber-600 mb-2" />
                    <span className="text-sm font-medium text-center">Detail Page</span>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-xs text-gray-500">Configure the main sections of your website</p>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>Design & Appearance</CardTitle>
                <CardDescription>Customize your website's look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/home/theme-settings"
                    className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                  >
                    <Palette className="h-8 w-8 text-pink-600 mb-2" />
                    <span className="text-sm font-medium text-center">Theme Settings</span>
                  </Link>
                  <Link
                    href="/css"
                    className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <FileCode className="h-8 w-8 text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-center">CSS</span>
                  </Link>
                  <Link
                    href="/footer"
                    className="flex flex-col items-center justify-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <LayoutList className="h-8 w-8 text-teal-600 mb-2" />
                    <span className="text-sm font-medium text-center">Footer</span>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-xs text-gray-500">Customize colors, styles and layout</p>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Quick tips to set up your website</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm">
                      Configure your <strong>Header</strong> with navigation menus
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <span className="text-blue-600 text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm">
                      Set up <strong>Home Sections</strong> to display products and categories
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <span className="text-blue-600 text-xs font-bold">3</span>
                    </div>
                    <p className="text-sm">
                      Customize <strong>Theme Settings</strong> to match your brand
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <span className="text-blue-600 text-xs font-bold">4</span>
                    </div>
                    <p className="text-sm">
                      Configure <strong>Search Results</strong> and <strong>Detail Pages</strong>
                    </p>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-xs text-gray-500">Follow these steps to set up your website</p>
              </CardFooter>
            </Card>
          </div>

          <Card className="mt-4 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Latest changes to your website configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lastUpdateTime ? (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <FileEdit className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Settings Updated</p>
                        <p className="text-sm text-gray-500">
                          Your website settings were last updated on {lastUpdateTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <LayoutGrid className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Website Sections</p>
                        <p className="text-sm text-gray-500">Configure your website sections from the dashboard</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No recent updates available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
