"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Loader2 } from "lucide-react"
import type { HeaderConfig } from "@/lib/header-types"
import HeaderTheme from "@/components/header-theme"
import HeaderSidebar from "@/components/header-sidebar"
import { v4 as uuidv4 } from "uuid"

// Import the dynamic configuration
import "../dynamic"

// Update the correctHeaderConfig to use the exact JSON structure from the API
const correctHeaderConfig: HeaderConfig = {
  ticker: {
    header_ticker_on_off: false, // Ticker is OFF
    sticky_ticker: false,
    ticker_bg_color: "#fde6c6",
    ticker_font_color: "#000000",
    header_ticker_text: '"Fast & free delivery. You can place your order from 10:00AM to 9:45PM"',
  },
  nav: [
    // First bar remains unchanged
    {
      id: "bar-0",
      show_bar: true,
      sticky_header: false,
      transparent_header: false,
      container: true,
      active_link: false,
      height: "auto",
      border_top: "",
      border_bottom: "",
      margin: "0px 0px 0px 0px",
      padding: "20px 0 0px",
      bar_background_color: "#4e2e0b", // Brown background color from JSON
      list: [
        {
          id: "list-0",
          position: "left",
          items: [
            {
              id: "item-0",
              type: "logo",
              icon: "",
              name: "",
              color: "#ffffff",
              route: "/",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 0px 0px 0px",
              font_size: "127px", // Logo width from JSON
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
          ],
        },
        {
          id: "list-1",
          position: "center",
          items: [
            {
              id: "item-0",
              type: "search",
              icon: "",
              name: "",
              color: "",
              route: "",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 0px 0px 0px",
              font_size: "",
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "",
              target_blank: false,
              sub_link: false,
              // Search specific properties
              search_border_bottom: true,
              search_placeholder: "Search items here.....",
              search_width: "560px",
            },
            {
              id: "item-2",
              type: "location",
              icon: "",
              name: "Nearest Branch",
              color: "#ffe4af",
              route: "",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 0px 0px 0px",
              font_size: "",
              border: "",
              border_left: "",
              extra_class: "d-none",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
              current_location: true,
            },
          ],
        },
        {
          id: "list-2",
          position: "right",
          items: [
            {
              id: "item-0",
              type: "login_signup",
              icon: '<i class="fa fa-user" style="color: #ffffff; font-weight: 400; padding: 13px 14px 13px 14px; background-color: #df772e; border-radius: 30px;"></i>',
              name: "",
              color: "#ffffff",
              route: "/signup",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 0px 0px 0px",
              font_size: "",
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
            {
              id: "item-2",
              type: "link",
              icon: '<i class="fa fa-heart" style="color: #ffffff;font-weight: 400;padding: 13px 13px 13px 13px;background-color: #df772e;border-radius: 30px;position: relative;"></i>',
              name: "",
              color: "#ffffff",
              route: "/show/wishlist",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 0px 0px 0px",
              font_size: "",
              border: "",
              border_left: "",
              extra_class: "d-none",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
            {
              id: "item-3",
              type: "cart",
              icon: '<i class="fas fa-shopping-basket" style="font-size: 16px;color: #ffffff;font-weight: 400;padding: 13px 12px 13px 12px;background-color: #df772e;border-radius: 30px;"></i>',
              name: "",
              color: "#ffffff",
              route: "/show/cart",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 0px 0px 0px",
              font_size: "",
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "",
              target_blank: false,
              sub_link: false,
              show_price: true,
              cart_price_label_color: "#ffe4af",
              cart_count_bg_color: "#ffe4af",
              cart_count_top: "-3px",
              cart_count_right: "0px",
            },
          ],
        },
      ],
    },
    // Second bar with updated sublinks for CAKES and FROZEN
    {
      id: "bar-1",
      show_bar: true,
      sticky_header: false,
      transparent_header: false,
      container: true,
      active_link: false,
      height: "auto",
      border_top: "",
      border_bottom: "",
      margin: "0px 0px 0px 0px",
      padding: "0px 0px 0px 0px",
      bar_background_color: "#4e2e0b", // Brown background color from JSON
      list: [
        {
          id: "list-0",
          position: "left",
          items: [
            {
              id: "item-0",
              type: "link",
              icon: "",
              name: "",
              color: "",
              route: "",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 0px 0px 0px",
              font_size: "120px", // Logo width from JSON
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
          ],
        },
        {
          id: "list-1",
          position: "center",
          items: [
            {
              id: "item-0",
              type: "link",
              icon: "",
              name: "SHOP",
              color: "#ffe4af",
              route: "/shop",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 18px 0px 0px",
              font_size: "12.22px",
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
            {
              id: "item-1",
              type: "link",
              icon: "",
              name: "BAKERY",
              color: "#ffe4af",
              route: "",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 18px",
              font_size: "12.22px",
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: true,
              // Using the exact JSON structure from the API
              sub_settings: {
                "0": {
                  sub_link_icon: null,
                  sub_link_label: "Breads",
                  sub_link_route: "/menu/breads",
                },
                "1": {
                  sub_link_icon: null,
                  sub_link_label: "Brownie",
                  sub_link_route: "/menu/brownie",
                },
                "2": {
                  sub_link_icon: null,
                  sub_link_label: "Burger Buns",
                  sub_link_route: "/menu/burger-buns",
                },
                "3": {
                  sub_link_icon: null,
                  sub_link_label: "Premium Croissant",
                  sub_link_route: "/menu/premium-croissant",
                },
                "4": {
                  sub_link_icon: null,
                  sub_link_label: "Muffins",
                  sub_link_route: "/menu/muffins",
                },
                "5": {
                  sub_link_icon: null,
                  sub_link_label: "Tortilla Wraps",
                  sub_link_route: "/menu/tortilla-wraps",
                },
                "7": {
                  sub_link_icon: null,
                  sub_link_label: "Cake Rusk",
                  sub_link_route: "/menu/cake-rusk",
                },
                "8": {
                  sub_link_icon: null,
                  sub_link_label: "Rusks & Baqar Khani",
                  sub_link_route: "/menu/rusks-baqar-khani",
                },
                "9": {
                  sub_link_icon: null,
                  sub_link_label: "Biscuits",
                  sub_link_route: "/menu/biscuits",
                },
              },
            },
            {
              id: "item-2",
              type: "link",
              icon: "",
              name: "CAKES",
              color: "#ffe4af",
              route: "",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 18px",
              font_size: "12.22px",
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: true,
              // Updated with actual data from screenshot
              sub_settings: {
                "0": {
                  sub_link_icon: null,
                  sub_link_label: "Cakes",
                  sub_link_route: "/menu/cakes",
                },
                "1": {
                  sub_link_icon: null,
                  sub_link_label: "Pastries",
                  sub_link_route: "/menu/pastries",
                },
              },
            },
            {
              id: "item-3",
              type: "link",
              icon: "",
              name: "FROZEN",
              color: "#ffe4af",
              route: "",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 18px",
              font_size: "12.22px",
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: true,
              // Updated with actual data from screenshot
              sub_settings: {
                "0": {
                  sub_link_icon: null,
                  sub_link_label: "Frozen Paratha",
                  sub_link_route: "/menu/frozen-paratha",
                },
                "1": {
                  sub_link_icon: null,
                  sub_link_label: "Ready To Cook",
                  sub_link_route: "/menu/ready-to-cook",
                },
              },
            },
            {
              id: "item-4",
              type: "link",
              icon: "",
              name: "LOCATIONS",
              color: "#ffe4af",
              route: "/locations",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 18px",
              font_size: "12.22px",
              border: "",
              border_left: "",
              extra_class: "",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
            {
              id: "item-5",
              type: "link",
              icon: "",
              name: "DOWNLOAD APP",
              color: "#ffe4af",
              route: "/download-app",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 18px",
              font_size: "12.22px",
              border: "",
              border_left: "",
              extra_class: "d-none",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
            {
              id: "item-7",
              type: "link",
              icon: "",
              name: "CONTACT",
              color: "#ffe4af",
              route: "/contact-us",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 0px 0px 18px",
              font_size: "12.22px",
              border: "",
              border_left: "",
              extra_class: "d-none",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
            {
              id: "item-9",
              type: "link",
              icon: "",
              name: "SWEETS",
              color: "#ffe4af",
              route: "/shop/sweets",
              background_color: "",
              border_radius: "",
              margin: "0px 0px 0px 0px",
              padding: "0px 18px",
              font_size: "12.22PX",
              border: "",
              border_left: "",
              extra_class: "d-none",
              extra_attribute: "",
              font_weight: "400",
              target_blank: false,
              sub_link: false,
            },
          ],
        },
      ],
    },
  ],
}

export default function HeaderPage() {
  const { settings, refreshSettings, setActiveClass } = useSettings()
  const [isLoading, setIsLoading] = useState(true)
  const isFirstMount = useRef(true)
  const [isSaving, setIsSaving] = useState(false)
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  // Add a more aggressive approach to prevent navigation
  useEffect(() => {
    // Disable all navigation on this page
    const disableNavigation = () => {
      console.log("Setting up navigation prevention for header page")

      // Override history methods but don't completely break them
      const originalPushState = window.history.pushState
      const originalReplaceState = window.history.replaceState

      window.history.pushState = function () {
        console.log("pushState intercepted but allowed")
        return originalPushState.apply(this, arguments as any)
      }

      window.history.replaceState = function () {
        console.log("replaceState intercepted but allowed")
        return originalReplaceState.apply(this, arguments as any)
      }

      // Return cleanup function
      return () => {
        console.log("Cleaning up navigation prevention")
        window.history.pushState = originalPushState
        window.history.replaceState = originalReplaceState
      }
    }

    // Call the function to disable navigation
    const cleanup = disableNavigation()

    return cleanup
  }, [])

  useEffect(() => {
    const initializeSettings = async () => {
      setIsLoading(true)
      try {
        // Only set active class and refreshSettings on first mount
        if (isFirstMount.current) {
          setActiveClass("header")
          isFirstMount.current = false
          await refreshSettings()
        }
      } catch (error) {
        console.error("Error initializing settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSettings()
  }, [refreshSettings, setActiveClass])

  // Let's also fix the useEffect in the HeaderPage component that initializes headerConfig
  // to ensure it doesn't cause unnecessary re-renders

  // With this version that uses a ref to track if we've processed this config before:
  const processedHeaderRef = useRef<string | null>(null)

  useEffect(() => {
    // Only process if settings.settings?.header exists and is different from what we've processed before
    const headerConfigString = settings.settings?.header ? JSON.stringify(settings.settings.header) : null

    if (headerConfigString !== processedHeaderRef.current) {
      processedHeaderRef.current = headerConfigString

      if (settings.settings?.header) {
        console.log("Using API header config")

        try {
          // Create a deep copy to ensure we don't modify the original data
          const apiConfig = JSON.parse(JSON.stringify(settings.settings.header))

          // Process API boolean values to convert "0"/"1" strings to boolean values for UI components
          if (apiConfig.ticker) {
            // Ensure all ticker properties have default values
            apiConfig.ticker.ticker_bg_color = apiConfig.ticker.ticker_bg_color || "#fde6c6"
            apiConfig.ticker.ticker_font_color = apiConfig.ticker.ticker_font_color || "#000000"
            apiConfig.ticker.header_ticker_text = apiConfig.ticker.header_ticker_text || ""

            // Convert string values to boolean for UI components
            apiConfig.ticker.header_ticker_on_off =
              apiConfig.ticker.header_ticker_on_off === "1" ||
              apiConfig.ticker.header_ticker_on_off === 1 ||
              apiConfig.ticker.header_ticker_on_off === true

            // Handle both sticky_ticker and sticky_ticker_on_off
            if ("sticky_ticker_on_off" in apiConfig.ticker) {
              apiConfig.ticker.sticky_ticker =
                apiConfig.ticker.sticky_ticker_on_off === "1" ||
                apiConfig.ticker.sticky_ticker_on_off === 1 ||
                apiConfig.ticker.sticky_ticker_on_off === true
            } else if ("sticky_ticker" in apiConfig.ticker) {
              apiConfig.ticker.sticky_ticker =
                apiConfig.ticker.sticky_ticker === "1" ||
                apiConfig.ticker.sticky_ticker === 1 ||
                apiConfig.ticker.sticky_ticker === true
            } else {
              // Ensure sticky_ticker has a default value if neither property exists
              apiConfig.ticker.sticky_ticker = false
            }
          }

          // Process nav bars
          if (apiConfig.nav && Array.isArray(apiConfig.nav)) {
            apiConfig.nav = apiConfig.nav.map((bar: any) => {
              // Ensure bar has default values for all properties
              bar.height = bar.height || "auto"
              bar.border_top = bar.border_top || ""
              bar.border_bottom = bar.border_bottom || ""
              bar.margin = bar.margin || "0px 0px 0px 0px"
              bar.padding = bar.padding || "0px 0px 0px 0px"
              bar.bar_background_color = bar.bar_background_color || "#ffffff"

              // Ensure bar has an id
              if (!bar.id) {
                bar.id = `bar-${uuidv4()}`
              }

              // Handle both bar_on_off and show_bar
              if ("bar_on_off" in bar) {
                bar.show_bar = bar.bar_on_off === "1" || bar.bar_on_off === 1 || bar.bar_on_off === true
              }

              // Handle both sticky_header_on_off and sticky_header
              if ("sticky_header_on_off" in bar) {
                bar.sticky_header =
                  bar.sticky_header_on_off === "1" ||
                  bar.sticky_header_on_off === 1 ||
                  bar.sticky_header_on_off === true
              } else if ("sticky_header" in bar) {
                bar.sticky_header = bar.sticky_header === "1" || bar.sticky_header === 1 || bar.sticky_header === true
              }

              // Handle both fixed_header_on_off/transparent_header_on_off and transparent_header
              if ("fixed_header_on_off" in bar) {
                bar.transparent_header =
                  bar.fixed_header_on_off === "1" || bar.fixed_header_on_off === 1 || bar.fixed_header_on_off === true
              } else if ("transparent_header_on_off" in bar) {
                bar.transparent_header =
                  bar.transparent_header_on_off === "1" ||
                  bar.transparent_header_on_off === 1 ||
                  bar.transparent_header_on_off === true
              } else if ("transparent_header" in bar) {
                bar.transparent_header =
                  bar.transparent_header === "1" || bar.transparent_header === 1 || bar.transparent_header === true
              }

              // Handle both container_on_off and container
              if ("container_on_off" in bar) {
                bar.container =
                  bar.container_on_off === "1" || bar.container_on_off === 1 || bar.container_on_off === true
              } else if ("container" in bar) {
                bar.container = bar.container === "1" || bar.container === 1 || bar.container === true
              }

              // Handle both active_class_on_off and active_link
              if ("active_class_on_off" in bar) {
                bar.active_link =
                  bar.active_class_on_off === "1" || bar.active_class_on_off === 1 || bar.active_class_on_off === true
              } else if ("active_link" in bar) {
                bar.active_link = bar.active_link === "1" || bar.active_link === 1 || bar.active_link === true
              }

              if (bar.list && Array.isArray(bar.list)) {
                bar.list = bar.list.map((list: any) => {
                  // Ensure list has an id
                  if (!list.id) {
                    list.id = `list-${uuidv4()}`
                  }

                  // Ensure list.settings exists
                  if (!list.settings) {
                    list.settings = {}
                  }

                  // Sync list position properties
                  if (list.position && !list.settings.list_position) {
                    list.settings.list_position = list.position
                  } else if (list.settings.list_position && !list.position) {
                    list.position = list.settings.list_position
                  }

                  // Process items - handle the case where items is an object, not an array
                  if (list.items) {
                    // Convert items object to array if needed
                    if (!Array.isArray(list.items) && typeof list.items === "object") {
                      const itemsArray = Object.entries(list.items).map(([key, value]: [string, any]) => {
                        const item = value
                        if (!item.id) {
                          item.id = `item-${key}`
                        }

                        // Process item boolean values
                        if ("target_blank" in item) {
                          item.target_blank =
                            item.target_blank === "1" || item.target_blank === 1 || item.target_blank === true
                        }

                        if ("sub_link" in item) {
                          item.sub_link = item.sub_link === "1" || item.sub_link === 1 || item.sub_link === true
                        }

                        if (item.setting && "link_target_blank_on_off" in item.setting) {
                          if (!("target_blank" in item)) {
                            item.target_blank =
                              item.setting.link_target_blank_on_off === "1" ||
                              item.setting.link_target_blank_on_off === 1 ||
                              item.setting.link_target_blank_on_off === true
                          }
                        }

                        // Ensure item has a name property from setting.item_label if available
                        if (item.setting && item.setting.item_label && !item.name) {
                          item.name = item.setting.item_label
                        } else if (item.name && item.setting && !item.setting.item_label) {
                          item.setting.item_label = item.name
                        }

                        // Process sub-links
                        if (item.sub_settings && typeof item.sub_settings === "object") {
                          // Handle both array and object formats
                          if (!Array.isArray(item.sub_settings)) {
                            Object.values(item.sub_settings).forEach((subLink: any) => {
                              if (subLink && "inner_sub_link_on_off" in subLink) {
                                subLink.inner_sub_link_on_off =
                                  subLink.inner_sub_link_on_off === "1" ||
                                  subLink.inner_sub_link_on_off === 1 ||
                                  subLink.inner_sub_link_on_off === true
                              }
                            })
                          } else {
                            item.sub_settings.forEach((subLink: any) => {
                              if (subLink && "inner_sub_link_on_off" in subLink) {
                                subLink.inner_sub_link_on_off =
                                  subLink.inner_sub_link_on_off === "1" ||
                                  subLink.inner_sub_link_on_off === 1 ||
                                  subLink.inner_sub_link_on_off === true
                              }
                            })
                          }
                        }

                        return item
                      })

                      list.items = itemsArray
                    } else if (Array.isArray(list.items)) {
                      // Process array items
                      list.items = list.items.map((item: any) => {
                        if (!item.id) {
                          item.id = `item-${uuidv4()}`
                        }

                        // Process item boolean values
                        if ("target_blank" in item) {
                          item.target_blank =
                            item.target_blank === "1" || item.target_blank === 1 || item.target_blank === true
                        }

                        if ("sub_link" in item) {
                          item.sub_link = item.sub_link === "1" || item.sub_link === 1 || item.sub_link === true
                        }

                        if (item.setting && "link_target_blank_on_off" in item.setting) {
                          if (!("target_blank" in item)) {
                            item.target_blank =
                              item.setting.link_target_blank_on_off === "1" ||
                              item.setting.link_target_blank_on_off === 1 ||
                              item.setting.link_target_blank_on_off === true
                          }
                        }

                        // Ensure item has a name property from setting.item_label if available
                        if (item.setting && item.setting.item_label && !item.name) {
                          item.name = item.setting.item_label
                        } else if (item.name && item.setting && !item.setting.item_label) {
                          item.setting.item_label = item.name
                        }

                        return item
                      })
                    }
                  }

                  return list
                })
              }

              return bar
            })
          }

          setHeaderConfig(apiConfig)
          console.log("Processed API header config successfully")
        } catch (error) {
          console.error("Error processing API header config:", error)
          // Use the correct header config as fallback on error
          setHeaderConfig(correctHeaderConfig)
        }
      } else {
        console.log("No header config found in API, using default")
        // Use the correct header config as fallback
        setHeaderConfig(correctHeaderConfig)
      }
    }
  }, [settings.settings?.header])

  const brandName = settings.business_info?.name || "testingdemo"
  const brandLogo = settings.business_logo || "/placeholder.svg?height=80&width=80"

  // Update the handleSave function to use the most recent headerConfig

  // Replace the handleSave function with this updated version:
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!headerConfig) return

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Use the correct brand ID as specified
      const brandId = "441"
      const userId = localStorage.getItem("userId") || "0" // Default to "0" if not found

      console.log("Saving with brandId:", brandId, "userId:", userId)

      // Step 1: First retrieve the current settings using the correct API endpoint
      console.log("Retrieving current settings...")

      try {
        // Use the correct API endpoint and method (POST instead of GET)
        const getSettingsResponse = await fetch("https://tossdown.site/api/get_obw_settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `brand_id=${brandId}`,
          cache: "no-store",
        })

        if (!getSettingsResponse.ok) {
          const errorText = await getSettingsResponse.text()
          console.error("Failed to retrieve settings:", errorText)
          throw new Error(
            `Failed to retrieve current settings: ${getSettingsResponse.status} - ${errorText.substring(0, 100)}`,
          )
        }

        // Get the response text first
        const responseText = await getSettingsResponse.text()
        console.log("API Response Text:", responseText)

        // Parse the response text as JSON
        const responseData = JSON.parse(responseText)

        // Extract the web_theme property which is a string
        if (!responseData.web_theme) {
          throw new Error("web_theme property not found in the response")
        }

        // Parse the web_theme string as JSON
        let webTheme
        try {
          webTheme =
            typeof responseData.web_theme === "string" ? JSON.parse(responseData.web_theme) : responseData.web_theme
        } catch (parseError) {
          console.error("Error parsing web_theme:", parseError)
          throw new Error("Failed to parse web_theme as JSON")
        }

        console.log("Successfully parsed web_theme")

        // Convert the headerConfig to the expected format with "0"/"1" strings
        const formattedHeaderConfig = formatHeaderConfigForAPI(headerConfig)

        // Update only the header portion of the web_theme object
        webTheme.header = formattedHeaderConfig

        console.log("Updated header in web_theme")

        // Prepare the data to send back to the API - send the entire web_theme object
        const dataToSend = webTheme

        // Convert the data object to JSON
        const jsonData = JSON.stringify(dataToSend)

        // Prepare the query string
        const queryString = `brand_id=${brandId}&user_id=${userId}&data=${encodeURIComponent(jsonData)}`

        console.log("Saving updated settings...")

        try {
          const saveResponse = await fetch("https://tossdown.site/api/saveRestaurantSettings", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: queryString,
            cache: "no-store",
          })

          // Get the response text
          const saveResponseData = await saveResponse.text()
          console.log("Save API Response Text:", saveResponseData)

          if (!saveResponse.ok) {
            throw new Error(`Save failed with status: ${saveResponse.status} - ${saveResponseData.substring(0, 100)}`)
          }

          // Always consider the request successful if we got a response
          setSaveSuccess(true)
          console.log("Settings saved successfully")

          // Refresh settings to get the updated data
          if (refreshSettings) {
            try {
              await refreshSettings()
              console.log("Settings refreshed successfully")
            } catch (refreshError) {
              console.error("Error refreshing settings:", refreshError)
              // Don't throw here, we still consider the save successful
            }
          }

          // Try to parse as JSON just for logging purposes
          try {
            const jsonResponse = JSON.parse(saveResponseData)
            console.log("Parsed API Response:", jsonResponse)
          } catch (parseError) {
            console.log("Response is not valid JSON, but save is considered successful")
          }
        } catch (saveError) {
          console.error("Error during save request:", saveError)
          throw new Error(`Error saving settings: ${saveError.message}`)
        }
      } catch (getSettingsError) {
        console.error("Error during get settings request:", getSettingsError)
        setSaveError(`Failed to retrieve current settings: ${getSettingsError.message}`)
      }
    } catch (error) {
      console.error("Error saving configuration:", error)
      setSaveError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  // Add this new function to format the header config for the API
  const formatHeaderConfigForAPI = (config: HeaderConfig) => {
    const formattedConfig = JSON.parse(JSON.stringify(config)) // Deep clone

    // Format ticker section
    if (formattedConfig.ticker) {
      formattedConfig.ticker.header_ticker_on_off = formattedConfig.ticker.header_ticker_on_off ? "1" : "0"
      formattedConfig.ticker.sticky_ticker = formattedConfig.ticker.sticky_ticker ? "1" : "0"
      // Ensure sticky_ticker_on_off is also set if it exists
      if ("sticky_ticker_on_off" in formattedConfig.ticker) {
        formattedConfig.ticker.sticky_ticker_on_off = formattedConfig.ticker.sticky_ticker ? "1" : "0"
      }
    }

    // Format nav bars
    if (formattedConfig.nav && Array.isArray(formattedConfig.nav)) {
      formattedConfig.nav = formattedConfig.nav.map((bar: any) => {
        // Convert boolean values to "0"/"1" strings
        bar.show_bar = bar.show_bar ? "1" : "0"
        bar.sticky_header = bar.sticky_header ? "1" : "0"
        bar.transparent_header = bar.transparent_header ? "1" : "0"
        bar.container = bar.container ? "1" : "0"
        bar.active_link = bar.active_link ? "1" : "0"

        // Also set bar_on_off for compatibility
        bar.bar_on_off = bar.show_bar

        // Process lists
        if (bar.list && Array.isArray(bar.list)) {
          bar.list = bar.list.map((list: any) => {
            // Process items
            if (list.items && Array.isArray(list.items)) {
              list.items = list.items.map((item: any) => {
                // Convert boolean values to "0"/"1" strings
                item.target_blank = item.target_blank ? "1" : "0"
                item.sub_link = item.sub_link ? "1" : "0"

                // For cart items
                if (item.type === "cart" && item.show_price !== undefined) {
                  item.show_price = item.show_price ? "1" : "0"
                }

                // For location items
                if (item.type === "location" && item.current_location !== undefined) {
                  item.current_location = item.current_location ? "1" : "0"
                }

                // For search items
                if (item.type === "search" && item.search_border_bottom !== undefined) {
                  item.search_border_bottom = item.search_border_bottom ? "1" : "0"
                }

                return item
              })
            }
            return list
          })
        }

        return bar
      })
    }

    return formattedConfig
  }

  // Function to map values from UI changes to API structure
  function mapValuesToApiStructure(apiStructure: any, uiChanges: any) {
    // Map ticker section
    if (apiStructure.ticker && uiChanges.ticker) {
      // Map header_ticker_on_off
      if (uiChanges.ticker.header_ticker_on_off !== undefined) {
        apiStructure.ticker.header_ticker_on_off = uiChanges.ticker.header_ticker_on_off ? "1" : "0"
      }

      // Map sticky_ticker
      if (uiChanges.ticker.sticky_ticker !== undefined) {
        if ("sticky_ticker_on_off" in apiStructure.ticker) {
          apiStructure.ticker.sticky_ticker_on_off = uiChanges.ticker.sticky_ticker ? "1" : "0"
        } else if ("sticky_ticker" in apiStructure.ticker) {
          apiStructure.ticker.sticky_ticker = uiChanges.ticker.sticky_ticker ? "1" : "0"
        }
      }

      // Map colors and text
      if (uiChanges.ticker.ticker_bg_color !== undefined) {
        apiStructure.ticker.ticker_bg_color = uiChanges.ticker.ticker_bg_color
      }

      if (uiChanges.ticker.ticker_font_color !== undefined) {
        apiStructure.ticker.ticker_font_color = uiChanges.ticker.ticker_font_color
      }

      if (uiChanges.ticker.header_ticker_text !== undefined) {
        apiStructure.ticker.header_ticker_text = uiChanges.ticker.header_ticker_text
      }
    }

    // Map nav bars
    if (apiStructure.nav && uiChanges.nav && Array.isArray(apiStructure.nav) && Array.isArray(uiChanges.nav)) {
      for (let i = 0; i < Math.min(apiStructure.nav.length, uiChanges.nav.length); i++) {
        mapBarValues(apiStructure.nav[i], uiChanges.nav[i])
      }
    }
  }

  // Function to map bar values
  function mapBarValues(apiBar: any, uiBar: any) {
    // Map show_bar to bar_on_off
    if (uiBar.show_bar !== undefined) {
      apiBar.bar_on_off = uiBar.show_bar ? "1" : "0"
    }

    // Map background color
    if (uiBar.bar_background_color !== undefined) {
      apiBar.bar_background_color = uiBar.bar_background_color
    }

    // Map container
    if (uiBar.container !== undefined) {
      if ("container_on_off" in apiBar) {
        apiBar.container_on_off = uiBar.container ? "1" : "0"
      } else if ("container" in apiBar) {
        apiBar.container = uiBar.container ? "1" : "0"
      }
    }

    // Map padding
    if (uiBar.padding !== undefined) {
      if ("bar_padding" in apiBar) {
        apiBar.bar_padding = uiBar.padding
      } else {
        apiBar.padding = uiBar.padding
      }
    }

    // Map active link
    if (uiBar.active_link !== undefined) {
      if ("active_class_on_off" in apiBar) {
        apiBar.active_class_on_off = uiBar.active_link ? "1" : "0"
      } else {
        apiBar.active_link = uiBar.active_link ? "1" : "0"
      }
    }

    // Map sticky header
    if (uiBar.sticky_header !== undefined) {
      if ("sticky_header_on_off" in apiBar) {
        apiBar.sticky_header_on_off = uiBar.sticky_header ? "1" : "0"
      } else {
        apiBar.sticky_header = uiBar.sticky_header ? "1" : "0"
      }
    }

    // Map transparent header
    if (uiBar.transparent_header !== undefined) {
      if ("fixed_header_on_off" in apiBar) {
        apiBar.fixed_header_on_off = uiBar.transparent_header ? "1" : "0"
      } else if ("transparent_header_on_off" in apiBar) {
        apiBar.transparent_header_on_off = uiBar.transparent_header ? "1" : "0"
      } else {
        apiBar.transparent_header = uiBar.transparent_header ? "1" : "0"
      }
    }

    // Map lists
    if (apiBar.list && uiBar.list && Array.isArray(apiBar.list) && Array.isArray(uiBar.list)) {
      for (let i = 0; i < Math.min(apiBar.list.length, uiBar.list.length); i++) {
        mapListValues(apiBar.list[i], uiBar.list[i])
      }
    }
  }

  function mapListValues(apiList: any, uiList: any) {
    if (!apiList.settings) {
      apiList.settings = {}
    }

    if (uiList.position !== undefined) {
      apiList.position = uiList.position
      apiList.settings.list_position = uiList.position
    }

    if (apiList.items && uiList.items) {
      if (Array.isArray(apiList.items) && Array.isArray(uiList.items)) {
        apiList.items = uiList.items.map((uiItem: any, index: number) => {
          const apiItem = apiList.items[index] || {}
          mapItemValues(apiItem, uiItem)
          return apiItem
        })
      } else if (!Array.isArray(apiList.items) && !Array.isArray(uiList.items)) {
        const apiKeys = Object.keys(apiList.items)
        for (const key of apiKeys) {
          if (uiList.items[key]) {
            mapItemValues(apiList.items[key], uiList.items[key])
          }
        }
      }
    }
  }
  // Function to map item values
  function mapItemValues(apiItem: any, uiItem: any) {
    // Map type
    if (uiItem.type !== undefined) {
      apiItem.type = uiItem.type
    }

    // Ensure setting exists
    if (!apiItem.setting) {
      apiItem.setting = {}
    }

    if (uiItem.name !== undefined || (uiItem.setting && uiItem.setting.item_label !== undefined)) {
      const newName = uiItem.name ?? uiItem.setting.item_label

      apiItem.name = newName
      apiItem.setting.item_label = newName
    }
    // Map color
    if (uiItem.color !== undefined) {
      if ("item_label_color" in apiItem.setting) {
        apiItem.setting.item_label_color = uiItem.color
      }
      apiItem.color = uiItem.color
    }

    // Map route
    if (uiItem.route !== undefined || (uiItem.setting && uiItem.setting.item_route !== undefined)) {
      const newRoute = uiItem.route ?? uiItem.setting.item_route

      if ("item_route" in apiItem.setting) {
        apiItem.setting.item_route = newRoute
      }
      apiItem.route = newRoute
    }
    // Map font size
    if (uiItem.font_size !== undefined) {
      if ("link_font_size" in apiItem.setting) {
        apiItem.setting.link_font_size = uiItem.font_size
      }
      apiItem.font_size = uiItem.font_size

      // For logo type, also update logo_width
      if (uiItem.type === "logo" && "logo_width" in apiItem.setting) {
        apiItem.setting.logo_width = uiItem.font_size
      }
    }

    // Map padding
    if (uiItem.padding !== undefined) {
      if ("link_padding" in apiItem.setting) {
        apiItem.setting.link_padding = uiItem.padding
      }
      apiItem.padding = uiItem.padding
    }

    // Map margin
    if (uiItem.margin !== undefined) {
      if ("link_margin" in apiItem.setting) {
        apiItem.setting.link_margin = uiItem.margin
      }
      apiItem.margin = uiItem.margin
    }

    // Map background color
    if (uiItem.background_color !== undefined) {
      if ("item_bg_color" in apiItem.setting) {
        apiItem.setting.item_bg_color = uiItem.background_color
      }
      apiItem.background_color = uiItem.background_color
    }

    // Map border radius
    if (uiItem.border_radius !== undefined) {
      if ("item_border_radius" in apiItem.setting) {
        apiItem.setting.item_border_radius = uiItem.border_radius
      }
      apiItem.border_radius = uiItem.border_radius
    }

    // Map border
    if (uiItem.border !== undefined) {
      if ("link_border" in apiItem.setting) {
        apiItem.setting.link_border = uiItem.border
      }
      apiItem.border = uiItem.border
    }

    // Map border left
    if (uiItem.border_left !== undefined) {
      if ("link_border_left" in apiItem.setting) {
        apiItem.setting.link_border_left = uiItem.border_left
      }
      apiItem.border_left = uiItem.border_left
    }

    // Map font weight
    if (uiItem.font_weight !== undefined) {
      if ("link_font_weight" in apiItem.setting) {
        apiItem.setting.link_font_weight = uiItem.font_weight
      }
      apiItem.font_weight = uiItem.font_weight
    }

    // Map target blank
    if (uiItem.target_blank !== undefined) {
      if ("link_target_blank_on_off" in apiItem.setting) {
        apiItem.setting.link_target_blank_on_off = uiItem.target_blank ? "1" : "0"
      }
      apiItem.target_blank = uiItem.target_blank ? "1" : "0"
    }

    // Map extra class
    if (uiItem.extra_class !== undefined) {
      if ("link_extra_class" in apiItem.setting) {
        apiItem.setting.link_extra_class = uiItem.extra_class
      }
      apiItem.extra_class = uiItem.extra_class
    }

    // Map extra attribute
    if (uiItem.extra_attribute !== undefined) {
      if ("link_extra_attribute" in apiItem.setting) {
        apiItem.setting.link_extra_attribute = uiItem.extra_attribute
      }
      apiItem.extra_attribute = uiItem.extra_attribute
    }

    // Map icon
    if (uiItem.icon !== undefined) {
      if (uiItem.type === "cart" && "cart_icon" in apiItem.setting) {
        apiItem.setting.cart_icon = uiItem.icon
      } else if (uiItem.type === "login_signup" && "login_icon" in apiItem.setting) {
        apiItem.setting.login_icon = uiItem.icon
      } else if (uiItem.type === "link" && "link_icon" in apiItem.setting) {
        apiItem.setting.link_icon = uiItem.icon
      }
      apiItem.icon = uiItem.icon
    }

    // Map type-specific properties
    switch (uiItem.type) {
      case "search":
        if (uiItem.search_placeholder !== undefined) {
          apiItem.setting.search_placeholder = uiItem.search_placeholder
          apiItem.search_placeholder = uiItem.search_placeholder
        }
        if (uiItem.search_width !== undefined) {
          apiItem.setting.search_width = uiItem.search_width
          apiItem.search_width = uiItem.search_width
        }
        if (uiItem.search_border_bottom !== undefined) {
          apiItem.setting.search_border_bottom = uiItem.search_border_bottom ? "1" : "0"
          apiItem.search_border_bottom = uiItem.search_border_bottom
        }
        break

      case "cart":
        if (uiItem.show_price !== undefined) {
          apiItem.setting.show_price_on_off = uiItem.show_price ? "1" : "0"
          apiItem.show_price = uiItem.show_price
        }
        if (uiItem.cart_price_label_color !== undefined) {
          apiItem.setting.cart_price_label_color = uiItem.cart_price_label_color
          apiItem.cart_price_label_color = uiItem.cart_price_label_color
        }
        if (uiItem.cart_count_bg_color !== undefined) {
          apiItem.setting.cart_count_bg_color = uiItem.cart_count_bg_color
          apiItem.cart_count_bg_color = uiItem.cart_count_bg_color
        }
        if (uiItem.cart_count_top !== undefined) {
          apiItem.setting.cart_count_top = uiItem.cart_count_top
          apiItem.cart_count_top = uiItem.cart_count_top
        }
        if (uiItem.cart_count_right !== undefined) {
          apiItem.setting.cart_count_right = uiItem.cart_count_right
          apiItem.cart_count_right = uiItem.cart_count_right
        }
        break

      case "location":
        if (uiItem.current_location !== undefined) {
          apiItem.setting.current_location = uiItem.current_location ? "1" : "0"
          apiItem.current_location = uiItem.current_location
        }
        break
    }

    // Map sub_link
    if (uiItem.sub_link !== undefined) {
      apiItem.sub_link = uiItem.sub_link ? "1" : "0"

      // Map sub_settings
      if (uiItem.sub_link && uiItem.sub_settings) {
        // Preserve the original sub_settings structure
        if (!apiItem.sub_settings) {
          apiItem.sub_settings = {}
        }

        // Handle object format
        if (!Array.isArray(uiItem.sub_settings) && !Array.isArray(apiItem.sub_settings)) {
          const allKeys = new Set([...Object.keys(uiItem.sub_settings), ...Object.keys(apiItem.sub_settings || {})])

          for (const key of allKeys) {
            if (uiItem.sub_settings[key]) {
              if (!apiItem.sub_settings[key]) {
                apiItem.sub_settings[key] = {}
              }

              const uiSubLink = uiItem.sub_settings[key]
              const apiSubLink = apiItem.sub_settings[key]

              if (uiSubLink.sub_link_label !== undefined) {
                apiSubLink.sub_link_label = uiSubLink.sub_link_label
              }

              if (uiSubLink.sub_link_route !== undefined) {
                apiSubLink.sub_link_route = uiSubLink.sub_link_route
              }

              if (uiSubLink.sub_link_icon !== undefined) {
                apiSubLink.sub_link_icon = uiSubLink.sub_link_icon
              }

              // Handle inner sub-links
              if (uiSubLink.inner_sub_link_on_off !== undefined) {
                apiSubLink.inner_sub_link_on_off = uiSubLink.inner_sub_link_on_off ? "1" : "0"

                // Map inner sub-settings
                if (uiSubLink.inner_sub_settings) {
                  if (!apiSubLink.inner_sub_settings) {
                    apiSubLink.inner_sub_settings = {}
                  }

                  const innerAllKeys = new Set([
                    ...Object.keys(uiSubLink.inner_sub_settings),
                    ...Object.keys(apiSubLink.inner_sub_settings || {}),
                  ])

                  for (const innerKey of innerAllKeys) {
                    if (uiSubLink.inner_sub_settings[innerKey]) {
                      if (!apiSubLink.inner_sub_settings[innerKey]) {
                        apiSubLink.inner_sub_settings[innerKey] = {}
                      }

                      const uiInnerSubLink = uiSubLink.inner_sub_settings[innerKey]
                      const apiInnerSubLink = apiSubLink.inner_sub_settings[innerKey]

                      if (uiInnerSubLink.inner_sub_link_label !== undefined) {
                        apiInnerSubLink.inner_sub_link_label = uiInnerSubLink.inner_sub_link_label
                      }

                      if (uiInnerSubLink.inner_sub_link_route !== undefined) {
                        apiInnerSubLink.inner_sub_link_route = uiInnerSubLink.inner_sub_link_route
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Map custom HTML
    if (uiItem.sl_custom_html !== undefined) {
      apiItem.sl_custom_html = uiItem.sl_custom_html
    }

    // Map custom sub-link
    if (uiItem.custom_sub_link !== undefined) {
      apiItem.custom_sub_link = uiItem.custom_sub_link ? "1" : "0"
    }
  }

  // Prevent any navigation when clicking on elements
  const handlePreventNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  if (isLoading || settings.isLoading || !headerConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-600">Loading header settings...</p>
        </div>
      </div>
    )
  }

  // Update bar properties
  const updateBarProperty = (barId: string, property: string, value: any) => {
    console.log(`Updating bar ${barId} property ${property} to:`, value)

    setHeaderConfig((prevConfig) => {
      if (!prevConfig) return prevConfig

      const updatedNav = prevConfig.nav.map((bar) => {
        if (bar.id === barId) {
          // Create a new bar object with the updated property
          const updatedBar = { ...bar, [property]: value }

          // Handle related properties for API compatibility
          if (property === "show_bar" && "bar_on_off" in bar) {
            updatedBar.bar_on_off = value
          } else if (property === "bar_on_off" && !("show_bar" in updatedBar)) {
            updatedBar.show_bar = value
          }

          if (property === "sticky_header" && "sticky_header_on_off" in bar) {
            updatedBar.sticky_header_on_off = value
          } else if (property === "sticky_header_on_off" && !("sticky_header" in updatedBar)) {
            updatedBar.sticky_header = value
          }

          if (property === "transparent_header") {
            if ("fixed_header_on_off" in bar) updatedBar.fixed_header_on_off = value
            if ("transparent_header_on_off" in bar) updatedBar.transparent_header_on_off = value
          } else if (
            (property === "fixed_header_on_off" || property === "transparent_header_on_off") &&
            !("transparent_header" in updatedBar)
          ) {
            updatedBar.transparent_header = value
          }

          if (property === "container" && "container_on_off" in bar) {
            updatedBar.container_on_off = value
          } else if (property === "container_on_off" && !("container" in updatedBar)) {
            updatedBar.container = value
          }

          if (property === "active_link" && "active_class_on_off" in bar) {
            updatedBar.active_class_on_off = value
          } else if (property === "active_class_on_off" && !("active_link" in updatedBar)) {
            updatedBar.active_link = value
          }

          return updatedBar
        }
        return bar
      })

      return {
        ...prevConfig,
        nav: updatedNav,
      }
    })
  }

  // Update ticker properties
  const updateTickerProperty = (property: string, value: any) => {
    console.log(`Updating ticker property ${property} to:`, value)

    setHeaderConfig((prevConfig) => {
      if (!prevConfig) return prevConfig

      const updatedTicker = { ...prevConfig.ticker, [property]: value }

      // Handle related properties for API compatibility
      if (property === "header_ticker_on_off" && "header_ticker_on_off" in prevConfig.ticker) {
        updatedTicker.header_ticker_on_off = value
      }

      if (property === "sticky_ticker") {
        if ("sticky_ticker_on_off" in prevConfig.ticker) {
          updatedTicker.sticky_ticker_on_off = value
        }
      } else if (property === "sticky_ticker_on_off" && !("sticky_ticker" in updatedTicker)) {
        updatedTicker.sticky_ticker = value
      }

      return {
        ...prevConfig,
        ticker: updatedTicker,
      }
    })
  }

  return (
    <div ref={pageRef} className="flex h-screen">
      {/* Left sidebar - HeaderSidebar component */}
      <HeaderSidebar
        initialConfig={headerConfig}
        onConfigChange={setHeaderConfig}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        refreshSettings={refreshSettings}
        updateBarProperty={updateBarProperty}
        updateTickerProperty={updateTickerProperty}
      />

      {/* Right side - Header display */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-4 flex flex-col h-full">
          {/* Top bar with brand name */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-medium">{brandName}</h1>
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

          {/* Display the actual header from settings */}
          <div className="bg-white border rounded-md overflow-hidden shadow-sm flex-1">
            <HeaderTheme brandLogo={brandLogo} brandName={brandName} isPreview={true} headerConfig={headerConfig} />
          </div>
        </div>
      </div>
    </div>
  )
}
