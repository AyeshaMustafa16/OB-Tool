"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { fetchAllSettings } from "@/lib/api"
import { useRouter, usePathname } from "next/navigation"

// Define types for our settings
export interface BusinessInfo {
  id: string
  res_id: string
  name: string
  logo_image: string
  theme_settings: string
  web_theme: string
  mobile_theme: string
  [key: string]: any
}

export interface Settings {
  business_info: BusinessInfo | null
  theme_settings: any
  business_logo: string | null
  settings: any
  mobile_settings: any
  get_all_theme_settings: any
  products: any
  brands: any
  categories: any
  featured_categories: any
  featured_brands: any
  featured_products: any
  brandsName: any
  isLoading: boolean
  error: string | null
  use_theme_header?: boolean
  lastRefreshed?: Date
  apiStatus?: {
    success: boolean
    message: string
    timestamp: Date
  }
}

interface SettingsContextType {
  settings: Settings
  refreshSettings: () => Promise<void>
  setActiveClass: (className: string) => void
  activeClass: string | null
}

const defaultSettings: Settings = {
  business_info: null,
  theme_settings: null,
  business_logo: null,
  settings: null,
  mobile_settings: null,
  get_all_theme_settings: null,
  products: null,
  brands: null,
  categories: null,
  featured_categories: null,
  featured_brands: null,
  featured_products: null,
  brandsName: null,
  isLoading: false,
  error: null,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [activeClass, setActiveClass] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const fetchInProgress = useRef(false)
  const lastFetchTime = useRef<number>(0)
  const MIN_FETCH_INTERVAL = 5000 // 5 seconds minimum between fetches

  // Check if we're on the login page
  const isLoginPage = pathname === "/"

  // Function to check if user is logged in
  const checkLoggedIn = useCallback(() => {
    if (typeof window === "undefined") return false

    // Check cookies first
    const brandIdFromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("brandId="))
      ?.split("=")[1]

    // If not in cookies, check localStorage
    const brandIdFromStorage = typeof window !== "undefined" ? localStorage.getItem("brandId") : null

    return !!brandIdFromCookie || !!brandIdFromStorage
  }, [])

  // Function to get brandId from any source
  const getBrandId = useCallback(() => {
    if (typeof window === "undefined") return null

    // Check cookies first
    const brandIdFromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("brandId="))
      ?.split("=")[1]

    if (brandIdFromCookie) return brandIdFromCookie

    // If not in cookies, check localStorage
    const brandIdFromStorage = localStorage.getItem("brandId")

    // If found in localStorage but not in cookies, sync them
    if (brandIdFromStorage && !brandIdFromCookie) {
      document.cookie = `brandId=${brandIdFromStorage}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
    }

    return brandIdFromStorage
  }, [])

  // Function to load settings from localStorage
  const loadLocalSettings = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      const savedHeaderConfig = localStorage.getItem("headerConfig")
      if (savedHeaderConfig) {
        const parsedConfig = JSON.parse(savedHeaderConfig)

        // Update the settings with the saved header config
        setSettings((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            header: parsedConfig,
          },
          use_theme_header: true,
        }))

        console.log("Loaded header settings from localStorage")
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error)
    }
  }, [])

  // Update the refreshSettings function to be more resilient
  const refreshSettings = useCallback(async () => {
    // Skip refreshing settings on the login page
    if (isLoginPage) {
      console.log("Skipping settings refresh on login page")
      return
    }

    // Prevent concurrent requests
    if (fetchInProgress.current) {
      console.log("Settings refresh already in progress, skipping")
      return
    }

    // Enforce minimum time between fetches
    const now = Date.now()
    if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
      console.log(`Too soon to refresh settings. Last fetch was ${(now - lastFetchTime.current) / 1000}s ago.`)
      return
    }

    const isLoggedIn = checkLoggedIn()
    if (!isLoggedIn) {
      console.log("User not logged in, skipping settings refresh")

      // Update settings to indicate not logged in but don't redirect
      setSettings((prev) => ({
        ...prev,
        isLoading: false,
        error: "Not logged in",
        apiStatus: {
          success: false,
          message: "No brand ID found in cookies or localStorage",
          timestamp: new Date(),
        },
      }))

      // Load from localStorage as fallback
      loadLocalSettings()

      // Don't redirect from header page
      if (!isLoginPage && !pathname.startsWith("/header") && !pathname.startsWith("/home")) {
        console.log("Redirecting to login page due to missing brandId")
        router.push("/")
      }
      return
    }

    try {
      // Set flag to prevent concurrent requests
      fetchInProgress.current = true
      lastFetchTime.current = Date.now()

      // Only update loading state if we're actually going to make a request
      setSettings((prev) => ({ ...prev, isLoading: true, error: null }))

      // Get brand_id from cookies or localStorage
      const brandId = getBrandId()

      console.log("Refreshing settings with brandId:", brandId, "activeClass:", activeClass)

      if (!brandId) {
        console.log("No brand ID found, user may not be logged in")
        setSettings((prev) => ({
          ...prev,
          isLoading: false,
          error: null, // Don't set error on login page
          apiStatus: {
            success: false,
            message: "No brand ID found",
            timestamp: new Date(),
          },
        }))

        // Load from localStorage as fallback
        loadLocalSettings()
        return
      }

      // Store current activeClass to compare later
      const currentActiveClass = activeClass
      console.log("Fetching settings for activeClass:", currentActiveClass)

      console.log("Starting to fetch settings for activeClass:", currentActiveClass)
      const allSettings = await fetchAllSettings(brandId, currentActiveClass)
      console.log("Settings fetched successfully for activeClass:", currentActiveClass)

      // Check if activeClass has changed during the request
      if (currentActiveClass !== activeClass) {
        console.log("Active class changed during request, skipping state update")
        setSettings((prev) => ({
          ...prev,
          isLoading: false,
          apiStatus: {
            success: true,
            message: "Settings fetched but active class changed",
            timestamp: new Date(),
          },
        }))
        return
      }

      const { business_info: businessInfo, ...rest } = allSettings
      const updatedSettings = { ...rest, business_info: businessInfo }

      // Set business logo from business_info
      if (businessInfo?.logo_image) {
        console.log("Setting business logo from business_info:", businessInfo.logo_image)
        updatedSettings.business_logo = businessInfo.logo_image
      }

      if (businessInfo?.web_theme) {
        let parsedSettings
        try {
          parsedSettings =
            typeof businessInfo.web_theme === "string" ? JSON.parse(businessInfo.web_theme) : businessInfo.web_theme

          console.log("Parsed web_theme:", {
            hasHeader: !!parsedSettings.header,
            headerType: typeof parsedSettings.header,
          })

          // Ensure header has proper structure
          if (parsedSettings.header) {
            // Save header config to localStorage for offline use
            localStorage.setItem("headerConfig", JSON.stringify(parsedSettings.header))

            // Ensure nav is an array
            if (parsedSettings.header.nav && !Array.isArray(parsedSettings.header.nav)) {
              console.warn("Header nav is not an array, converting to array")
              parsedSettings.header.nav = Object.values(parsedSettings.header.nav)
            }

            // Ensure each bar has list as an array
            if (Array.isArray(parsedSettings.header.nav)) {
              parsedSettings.header.nav = parsedSettings.header.nav.map((bar: any) => {
                if (bar && bar.list && !Array.isArray(bar.list)) {
                  console.warn("Bar list is not an array, converting to array")
                  bar.list = Object.values(bar.list)
                }

                // Ensure each list has items as an array
                if (bar && Array.isArray(bar.list)) {
                  bar.list = bar.list.map((list: any) => {
                    if (list && list.items && !Array.isArray(list.items)) {
                      console.warn("List items is not an array, converting to array")
                      list.items = Object.values(list.items)
                    }
                    return list
                  })
                }

                return bar
              })
            }
          }
        } catch (e: any) {
          console.error("Error parsing web_theme:", e)
          updatedSettings.error = `Error parsing web_theme: ${e instanceof Error ? e.message : String(e)}`
        }
        if (parsedSettings) {
          updatedSettings.settings = parsedSettings
          // Add flag to use theme header if header settings exist
          if (parsedSettings.header) {
            updatedSettings.use_theme_header = true
          }
        }
      } else {
        console.warn("No web_theme found in business_info")

        // Load from localStorage as fallback
        loadLocalSettings()
      }

      // Get logo from cookies as a fallback
      const brandLogoCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("brandLogo="))
        ?.split("=")[1]

      if (brandLogoCookie && !updatedSettings.business_logo) {
        console.log("Using logo from cookie as fallback")
        try {
          updatedSettings.business_logo = decodeURIComponent(brandLogoCookie)
        } catch (e) {
          console.error("Error decoding logo cookie:", e)
          updatedSettings.business_logo = brandLogoCookie
        }
      }

      console.log("Settings updated:", {
        hasBusinessInfo: !!updatedSettings.business_info,
        hasLogo: !!updatedSettings.business_logo,
        hasHeader: !!updatedSettings.settings?.header,
        hasProducts: !!updatedSettings.products,
        hasCategories: !!updatedSettings.featured_categories,
        hasBrands: !!updatedSettings.featured_brands,
        activeClass: currentActiveClass,
      })

      // Special handling for home_sections to ensure we have all required data
      if (currentActiveClass === "home_sections") {
        console.log("Checking if all required data for home_sections is available")

        const hasAllRequiredData =
          !!updatedSettings.products && !!updatedSettings.featured_categories && !!updatedSettings.featured_brands

        if (!hasAllRequiredData) {
          console.log("Missing some required data for home_sections, data may be incomplete")
        } else {
          console.log("All required data for home_sections is available")
        }
      }

      setSettings({
        ...updatedSettings,
        isLoading: false,
        error: null,
        lastRefreshed: new Date(),
        apiStatus: {
          success: true,
          message: "Settings refreshed successfully",
          timestamp: new Date(),
        },
      })
    } catch (error) {
      console.error(`Error fetching settings for activeClass ${activeClass}:`, error)
      setSettings((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch settings",
        // Add these fallback values to prevent UI issues
        products: prev.products || { products: [] },
        featured_categories: prev.featured_categories || [],
        featured_brands: prev.featured_brands || [],
        featured_products: prev.featured_products || [],
        apiStatus: {
          success: false,
          message: error instanceof Error ? error.message : "Failed to fetch settings",
          timestamp: new Date(),
        },
      }))

      // Load from localStorage as fallback
      loadLocalSettings()
    } finally {
      fetchInProgress.current = false
    }
  }, [activeClass, checkLoggedIn, getBrandId, isLoginPage, loadLocalSettings, pathname, router])

  // Initialize settings when component mounts or activeClass changes
  useEffect(() => {
    // Skip initialization on login page
    if (isLoginPage) {
      console.log("Skipping settings initialization on login page")
      return
    }

    // Skip initialization on header page
    if (pathname.startsWith("/header")) {
      console.log("Skipping automatic settings initialization on header page")
      return
    }

    // Check if user is logged in
    const isLoggedIn = checkLoggedIn()
    if (!isLoggedIn) {
      console.log("User not logged in, skipping settings initialization")

      // Load from localStorage as fallback
      loadLocalSettings()

      // Only redirect if not already on login page and not on header page and not on home page
      if (!isLoginPage && !pathname.startsWith("/header") && !pathname.startsWith("/home")) {
        console.log("Redirecting to login page due to missing brandId")
        router.push("/")
      }
      return
    }

    // Only fetch on initial mount
    if (!isInitialized && !fetchInProgress.current) {
      console.log("Initializing settings, pathname:", pathname)
      refreshSettings().catch((err) => {
        console.error(`Failed to refresh settings for ${activeClass}:`, err)
      })
      setIsInitialized(true)
    }
  }, [activeClass, checkLoggedIn, isInitialized, isLoginPage, loadLocalSettings, pathname, refreshSettings, router])

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, activeClass, setActiveClass }}>
      {children}
    </SettingsContext.Provider>
  )
}

const logSettingsData = (settings: any, label: string) => {
  console.log(`${label} - Settings data state:`, {
    hasBusinessInfo: !!settings.business_info,
    hasProducts: !!settings.products,
    productCount: settings.products?.products?.length || 0,
    categoriesCount: settings.featured_categories?.length || 0,
    brandsCount: settings.featured_brands?.length || 0,
    featuredProductsCount: settings.featured_products?.length || 0,
    isLoading: settings.isLoading,
    error: settings.error,
  })
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
