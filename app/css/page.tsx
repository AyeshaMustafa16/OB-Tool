"use client"

import { useState, useEffect, useRef } from "react"
import { useSettings } from "@/contexts/settings-context"
import { RichTextEditor } from "@/components/rich-text-editor"
import Sidebar from "@/components/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { purgeCache } from "@/lib/purge-cache"

export default function CssPage() {
  const { settings, refreshSettings } = useSettings()
  const [customCss, setCustomCss] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialized = useRef(false)

  // CSS placeholders
  const cssPlaceholders = [
    { name: "/* Primary Color */", description: "Main brand color" },
    { name: "/* Secondary Color */", description: "Secondary brand color" },
    { name: "/* Font Family */", description: "Main font family" },
    { name: "/* Header Styles */", description: "Styles for the header section" },
    { name: "/* Footer Styles */", description: "Styles for the footer section" },
    { name: "/* Card Styles */", description: "Styles for product cards" },
  ]

  useEffect(() => {
    // Disable navigation in the header
    const disableNavigation = () => {
      const headerLinks = document.querySelectorAll("header a")
      headerLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault()
        })
      })
    }

    // Call once when component mounts
    disableNavigation()

    // Set up a mutation observer to handle dynamically added elements
    const observer = new MutationObserver(disableNavigation)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const loadCssSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if we have settings and they're loaded
        if (settings?.business_info && !initialized.current) {
          const webTheme = settings.settings || {}

          // First try to get business_style from web_theme
          if (webTheme.business_style) {
            setCustomCss(decodeHtml(webTheme.business_style.style))
          } else {
            // Fall back to custom_css
            setCustomCss(webTheme.custom_css || "")
          }

          initialized.current = true
        }
      } catch (err) {
        console.error("Error loading CSS settings:", err)
        setError("Failed to load CSS settings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCssSettings()
  }, [settings])

  const handleSaveCss = async (content: string) => {
    try {
      setError(null)

      // Get brand ID from localStorage
      const brandId = localStorage.getItem("brandId")

      if (!brandId) {
        throw new Error("No brand ID found in localStorage")
      }

      // Get current settings
      const response = await fetch("https://tossdown.site/api/get_obw_settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ brand_id: brandId }).toString(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`)
      }

      const responseText = await response.text()
      const currentSettings = JSON.parse(responseText)

      // Parse web_theme
      let webTheme = {}
      if (currentSettings.web_theme) {
        webTheme =
          typeof currentSettings.web_theme === "string"
            ? JSON.parse(currentSettings.web_theme)
            : currentSettings.web_theme
      }

      // Update both business_style and custom_css for compatibility
      webTheme.business_style.style = content

      // Save updated settings
      const saveResponse = await fetch("https://tossdown.site/api/saveRestaurantSettings", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          brand_id: brandId,
          user_id: 0,
          data: JSON.stringify(webTheme),
          type: "web_theme",
        }).toString(),
      })

      if (!saveResponse.ok) {
        throw new Error(`Failed to save settings: ${saveResponse.status}`)
      }

      // Update local state
      setCustomCss(content)

      // Refresh settings to get the latest data
      await refreshSettings()
    } catch (error) {
      console.error("Error saving custom CSS:", error)
      throw error
    }
  }

  // Add a function to handle the purge cache action
  const handlePurgeCache = async () => {
    try {
      setError(null)
      setIsLoading(true)

      await purgeCache()

      // Reload the page to reflect changes
      window.location.reload()
    } catch (error) {
      console.error("Error purging cache:", error)
      setError("An error occurred while purging cache. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Update the top bar button to use the handlePurgeCache function
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <div className="border-b bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">{settings?.business_info?.name || "testingdemo"}</h1>
        <button
          onClick={handlePurgeCache}
          className="bg-[#ff6b8b] hover:bg-[#e05a79] text-white rounded px-3 py-1 text-sm transition-colors"
        >
          Purge Cache
        </button>
      </div>

      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-6 ml-64">
          <h1 className="text-2xl font-bold mb-6">Custom CSS Editor</h1>

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-[500px] w-full" />
            </div>
          ) : (
            <RichTextEditor
              initialValue={customCss}
              onSave={handleSaveCss}
              title="Global CSS"
              editorType="css"
              placeholders={cssPlaceholders}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function decodeHtml(html) {
  var txt = document.createElement("textarea")
  txt.innerHTML = html
  return txt.value
}
