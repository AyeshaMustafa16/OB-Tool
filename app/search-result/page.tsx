"use client"

import { useEffect, useState, useRef } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Loader2 } from "lucide-react"
import SearchResultSidebar from "@/components/search-result-sidebar"
import SearchResultPreview from "@/components/search-result-preview"

// Import the dynamic configuration
import "../dynamic"

export default function SearchResultPage() {
  const { settings, refreshSettings } = useSettings()
  const [isLoading, setIsLoading] = useState(true)
  const [cardConfig, setCardConfig] = useState<any>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Modify the setCardConfig function to prevent unnecessary re-renders
  // Add this after the state declarations:

  const cardConfigRef = useRef(cardConfig)

  // Add this debug function at the top of the component
  function debugSettings(settings: any) {
    console.log("DEBUG SETTINGS:", JSON.stringify(settings, null, 2))

    if (settings?.business_info?.web_theme) {
      console.log("business_info.web_theme exists")

      try {
        const webTheme =
          typeof settings.business_info.web_theme === "string"
            ? JSON.parse(settings.business_info.web_theme)
            : settings.business_info.web_theme

        console.log("web_theme keys:", Object.keys(webTheme))

        if (webTheme.card) {
          console.log("web_theme.card exists:", Object.keys(webTheme.card))

          if (webTheme.card.search_results) {
            console.log("web_theme.card.search_results exists:", Object.keys(webTheme.card.search_results))

            if (webTheme.card.search_results.settings) {
              console.log(
                "web_theme.card.search_results.settings exists:",
                Object.keys(webTheme.card.search_results.settings),
              )
            }

            if (webTheme.card.search_results.items) {
              console.log(
                "web_theme.card.search_results.items exists with count:",
                Object.keys(webTheme.card.search_results.items).length,
              )
            }
          }
        }
      } catch (e) {
        console.error("Error parsing web_theme for debugging:", e)
      }
    }

    if (settings?.settings?.web_theme) {
      console.log("settings.web_theme exists")

      try {
        if (settings.settings.web_theme.card) {
          console.log("settings.web_theme.card exists:", Object.keys(settings.settings.web_theme.card))

          if (settings.settings.web_theme.card.search_results) {
            console.log(
              "settings.web_theme.card.search_results exists:",
              Object.keys(settings.settings.web_theme.card.search_results),
            )
          }
        }
      } catch (e) {
        console.error("Error checking settings.web_theme structure:", e)
      }
    }
  }

  // Initialize settings only once
  useEffect(() => {
    if (!initialized) {
      const initializeSettings = async () => {
        try {
          await refreshSettings()
          console.log("Settings refreshed")
        } catch (error) {
          console.error("Error initializing settings:", error)
        } finally {
          setInitialized(true)
          setIsLoading(false)
        }
      }

      initializeSettings()
    }
  }, [refreshSettings, initialized])

  // Update the useEffect that processes settings
  useEffect(() => {
    if (!initialized) return

    console.log("Processing settings after initialization")
    debugSettings(settings)

    // First check if we have business_info with web_theme
    if (settings?.business_info?.web_theme) {
      try {
        console.log("Found web_theme in business_info, processing")

        // Parse web_theme if it's a string
        const webTheme =
          typeof settings.business_info.web_theme === "string"
            ? JSON.parse(settings.business_info.web_theme)
            : settings.business_info.web_theme

        // Check if card.search_results exists in web_theme
        if (webTheme.card && webTheme.card.search_results) {
          console.log("Found card.search_results in web_theme, using it")

          // Create a deep copy to ensure we don't modify the original data
          const apiConfig = JSON.parse(
            JSON.stringify({
              search_result: webTheme.card.search_results,
            }),
          )

          setCardConfig(apiConfig)
          console.log("Successfully processed API card config from web_theme.card.search_results")
          return // Exit early since we found what we needed
        }
      } catch (error) {
        console.error("Error processing web_theme from business_info:", error)
      }
    }

    // Check if we have web_theme settings in settings.settings
    if (settings?.settings?.web_theme?.card?.search_results) {
      try {
        console.log("Found card.search_results in settings.web_theme, processing")
        // Create a deep copy to ensure we don't modify the original data
        const apiConfig = JSON.parse(
          JSON.stringify({
            search_result: settings.settings.web_theme.card.search_results,
          }),
        )

        setCardConfig(apiConfig)
        console.log("Successfully processed API card config from settings.web_theme.card.search_results")
      } catch (error) {
        console.error("Error processing API card config from settings.web_theme.card.search_results:", error)
      }
    }
    // Fallback to card settings if web_theme is not available
    else if (settings?.settings?.card?.search_results) {
      try {
        console.log("Found search_results in card settings, processing")
        // Create a deep copy to ensure we don't modify the original data
        const apiConfig = JSON.parse(
          JSON.stringify({
            search_result: settings.settings.card.search_results,
          }),
        )

        setCardConfig(apiConfig)
        console.log("Successfully processed API card config from card.search_results")
      } catch (error) {
        console.error("Error processing API card config from card.search_results:", error)
      }
    } else {
      console.log("No search_results found in settings")
      setCardConfig(null)
    }
  }, [settings, initialized])

  // Update the handleSave function to preserve the entire web_theme structure
  // Replace the existing handleSave function with this implementation:

  const handleSave = async (updatedConfig: any) => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Get brandId and userId from localStorage
      const brandId = localStorage.getItem("brandId")
      const userId = localStorage.getItem("userId") || "0" // Default to "0" if not found

      if (!brandId) {
        throw new Error("Brand ID not found in localStorage. Please log in again.")
      }

      console.log("Starting save process with brandId:", brandId)

      // First, fetch the current web_theme to preserve all other settings
      const apiUrl = "https://tossdown.site/api" // Hardcoded API URL as requested

      console.log("Fetching current settings from:", `${apiUrl}/get_obw_settings`)

      const response = await fetch(`${apiUrl}/get_obw_settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `brand_id=${brandId}`,
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error fetching current settings:", errorText)
        throw new Error(`Failed to fetch current settings: ${response.status} - ${errorText.substring(0, 100)}`)
      }

      const currentSettings = await response.json()
      console.log("Successfully fetched current settings")

      // Parse the web_theme if it's a string
      let currentWebTheme = {}
      if (currentSettings.web_theme) {
        try {
          currentWebTheme =
            typeof currentSettings.web_theme === "string"
              ? JSON.parse(currentSettings.web_theme)
              : currentSettings.web_theme
          console.log("Successfully parsed current web_theme")
        } catch (e) {
          console.error("Error parsing current web_theme:", e)
          currentWebTheme = {}
        }
      }

      // Create a deep copy of the current web_theme
      const updatedWebTheme = JSON.parse(JSON.stringify(currentWebTheme))

      // Update only the card.search_results part
      if (!updatedWebTheme.card) {
        updatedWebTheme.card = {}
      }

      // Update the search_results with our new config
      updatedWebTheme.card.search_results = updatedConfig.search_result

      console.log("Preserving existing web_theme structure with updated card settings")

      // Convert the web_theme object directly to JSON (without wrapping it in another object)
      const jsonData = JSON.stringify(updatedWebTheme)
      console.log("Saving data with preserved structure to:", `${apiUrl}/saveRestaurantSettings`)

      // Prepare the query string with type as a separate parameter
      const queryString = `brand_id=${brandId}&user_id=${userId}&type=web_theme&data=${encodeURIComponent(jsonData)}`

      // Make the API call
      const saveResponse = await fetch(`${apiUrl}/saveRestaurantSettings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: queryString,
        cache: "no-store",
      })

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        console.error("Error saving settings:", errorText)
        throw new Error(`Failed to save settings: ${saveResponse.status} - ${errorText.substring(0, 100)}`)
      }

      // Get the response text
      const responseData = await saveResponse.text()
      console.log("API Response Text:", responseData)

      // Consider the request successful if we got a response
      setSaveSuccess(true)
      console.log("Settings saved successfully")

      // Show success message briefly before refreshing
      setTimeout(() => {
        // Set loading state with specific message before refresh
        setIsLoading(true)
        // Refresh the page to show the changes
        window.location.reload()
      }, 1000) // Wait 1 second to show success message before refreshing
    } catch (error) {
      console.error("Error saving configuration:", error)
      setSaveError(error instanceof Error ? error.message : "Unknown error occurred")
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    // Navigate back to the home page
    window.location.href = "/home"
  }

  // Update the loading state to show a specific message about card settings
  // Find the loading return statement and modify it:

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-600">Loading card settings...</p>
        </div>
      </div>
    )
  }

  // If no card config is found, show a message
  if (!cardConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">No Search Results Configuration Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find any search results configuration in your settings. Please contact support or go back to the
            home page.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Replace the setCardConfig function calls with this pattern:
  // Find where setCardConfig is called and replace with:

  const handleConfigChange = (newConfig: any) => {
    // Only update if the config has actually changed
    if (JSON.stringify(newConfig) !== JSON.stringify(cardConfigRef.current)) {
      cardConfigRef.current = newConfig
      setCardConfig(newConfig)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left sidebar - SearchResultSidebar component */}
      <div className="w-64 flex-shrink-0 overflow-y-auto">
        <SearchResultSidebar
          initialConfig={cardConfig}
          // Update the SearchResultSidebar component props:
          // Replace onConfigChange={setCardConfig} with:
          onConfigChange={handleConfigChange}
          onSave={handleSave}
          isSaving={isSaving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          onBack={handleBack}
        />
      </div>

      {/* Right side - Search Result Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 flex flex-col">
          {/* Top bar with brand name */}
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 z-10 py-2">
            <h1 className="text-xl font-medium">Search Results Preview</h1>
            <div className="flex items-center gap-2">
              <button className="flex items-center text-sm border rounded px-2 py-1 bg-white hover:bg-gray-50 transition-colors">
                <span className="mr-1">📱</span>
                Responsive
              </button>
              <button className="bg-[#ff6b8b] hover:bg-[#e05a79] text-white rounded px-3 py-1 text-sm transition-colors">
                Purge Cache
              </button>
            </div>
          </div>

          {/* Display the search result preview */}
          <div className="bg-white border rounded-md overflow-hidden shadow-sm">
            <SearchResultPreview config={cardConfig} />
          </div>
        </div>
      </div>
    </div>
  )
}
