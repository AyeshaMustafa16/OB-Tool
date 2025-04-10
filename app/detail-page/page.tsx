"use client"

import { useState, useEffect, useRef } from "react"
import { useSettings } from "@/contexts/settings-context"
import { RichTextEditor } from "@/components/rich-text-editor"
import Sidebar from "@/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { purgeCache } from "@/lib/purge-cache"
import { useToast } from "@/hooks/use-toast"

export default function DetailPage() {
  const { settings } = useSettings() // Remove refreshSettings to prevent loops
  const [detailHtml, setDetailHtml] = useState<string>("")
  const [detailCss, setDetailCss] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialized = useRef(false)
  const settingsLoaded = useRef(false)
  const { toast } = useToast()

  // Detail page placeholders
  const detailPlaceholders = [
    { name: "{{product_name}}", description: "Product name" },
    { name: "{{product_price}}", description: "Product price" },
    { name: "{{product_description}}", description: "Product description" },
    { name: "{{product_image}}", description: "Product image" },
    { name: "{{product_category}}", description: "Product category" },
    { name: "{{product_brand}}", description: "Product brand" },
    { name: "{{product_sku}}", description: "Product SKU" },
    { name: "{{product_rating}}", description: "Product rating" },
    { name: "{{product_availability}}", description: "Product availability" },
    { name: "{{related_products}}", description: "Related products" },
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

  // Only load settings once when they become available
  useEffect(() => {
    // Skip if already initialized or if settings aren't loaded yet
    if (initialized.current || !settings?.business_info || settingsLoaded.current) {
      return
    }

    const loadDetailPageSettings = async () => {
      try {
        console.log("Loading detail page settings from settings")
        setIsLoading(true)
        setError(null)

        const webTheme = settings.settings || {}

        // Extract detail page HTML and CSS from web_theme
        const detailSettings = webTheme.detail_page || {}
        setDetailHtml(decodeHtml(detailSettings.detail_page_editor || ""))
        setDetailCss(detailSettings.css || "")

        initialized.current = true
        settingsLoaded.current = true
      } catch (err) {
        console.error("Error loading detail page settings:", err)
        setError("Failed to load detail page settings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadDetailPageSettings()
  }, [settings])

  const handleSaveHtml = async (content: string) => {
    try {
      setError(null)

      // Get brand ID from localStorage instead of cookies
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

      // Update only the detail_page.html part
      webTheme.detail_page = {
        ...(webTheme.detail_page || {}),
        detail_page_editor: content,
      }

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
      setDetailHtml(content)

      // Manually refresh the page after saving
      window.location.reload()
    } catch (error) {
      console.error("Error saving detail page HTML:", error)
      throw error
    }
  }

  const handleSaveCss = async (content: string) => {
    try {
      setError(null)

      // Get brand ID from localStorage instead of cookies
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

      // Update only the detail_page.css part
      webTheme.detail_page = {
        ...(webTheme.detail_page || {}),
        css: content,
      }

      // Save updated settings
      const saveResponse = await fetch("https://tossdown.site/api/obw_settings_api", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          brand_id: brandId,
          web_theme: JSON.stringify(webTheme),
          type: "web_theme",
        }).toString(),
      })

      if (!saveResponse.ok) {
        throw new Error(`Failed to save settings: ${saveResponse.status}`)
      }

      // Update local state
      setDetailCss(content)

      // Manually refresh the page after saving
      window.location.reload()
    } catch (error) {
      console.error("Error saving detail page CSS:", error)
      throw error
    }
  }

  // Add a function to handle the purge cache action
  const handlePurgeCache = async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Show a loading toast
      toast({
        title: "Purging cache...",
        description: "Please wait while we refresh all data.",
      })

      const result = await purgeCache()

      if (result.success) {
        // Show success toast
        toast({
          title: "Success!",
          description: result.message,
          variant: "success",
        })

        // Reload the page after a short delay to allow the toast to be seen
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        // Show error toast
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
        setError(result.message)
      }
    } catch (error) {
      console.error("Error purging cache:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Show error toast
      toast({
        title: "Error",
        description: `Failed to purge cache: ${errorMessage}`,
        variant: "destructive",
      })

      setError(`An error occurred while purging cache: ${errorMessage}`)
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
          <h1 className="text-2xl font-bold mb-6">Detail Page Editor</h1>

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
            <Tabs defaultValue="html">
              <TabsList className="mb-4">
                <TabsTrigger value="html">HTML Editor</TabsTrigger>
                <TabsTrigger value="css">CSS Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="html">
                <RichTextEditor
                  initialValue={detailHtml}
                  onSave={handleSaveHtml}
                  title="Detail Page HTML"
                  editorType="html"
                  placeholders={detailPlaceholders}
                />
              </TabsContent>

              <TabsContent value="css">
                <RichTextEditor
                  initialValue={detailCss}
                  onSave={handleSaveCss}
                  title="Detail Page CSS"
                  editorType="css"
                />
              </TabsContent>

              <TabsContent value="preview">
                <div className="border rounded-md p-4 bg-white">
                  <style dangerouslySetInnerHTML={{ __html: detailCss }} />
                  <div className="detail-page-preview" dangerouslySetInnerHTML={{ __html: detailHtml }} />
                </div>
              </TabsContent>
            </Tabs>
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
