"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/contexts/settings-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Define types for each section's settings
interface CheckoutSettings {
  guest_checkout_settings_on_off?: number
  checkout_page_on_off?: number
  recaptcha_settings_on_off?: number
  recaptcha_site_key?: string
  recaptcha_server_site_key?: string
  google_address_api_setting?: number
  delivery_service_canada_post?: number
  google_address_delivery_charges?: number
  popular_products_page?: number
  cart_on_off?: number
  group_items_setting_on_off?: number
  group_items_by_name?: string
  all_filters_on_off?: number
  store_locator_on_off?: number
  cart_abandoment_on_off?: number
  pre_authorization_on_off?: number
  brand_count_filter_on_off?: number
  cancel_order_setting?: number
  shop_page_on_off?: number
  delivery_menu_on_off?: number
  detail_page_setting?: number
  sendgrid_setting?: number
  sort_filters_on_off?: number
  savyour_on_off?: number
  otp_on_off?: number
  cash_on_off?: number
  draggable_cart_on_off?: number
  pickup_on_off?: number
  payment_type_on_off?: number
  coupon_on_off?: number
  order_summary_on_off?: number
  new_feature_section_on_off?: number
  new_cart_box_on_off?: number
  contact_us_email_address?: string
  contact_us_number?: string
  [key: string]: any
}

interface TitleSettings {
  search_on_off?: number
  title_img_on_off?: number
  title_section_on_off?: number
  title_img_height?: string
  title_bg_color?: string
  title_font_color?: string
  [key: string]: any
}

interface MenuSettings {
  menu_pagination_on_off?: number
  pagination_records_limit?: string
  new_detail_page_on_off?: number
  sales_filter_on_off?: number
  price_filter_on_off?: number
  city_wise_menu?: number
  banner_flasher_on_off?: number
  category_flasher_on_off?: number
  [key: string]: any
}

export default function ThemeSettings() {
  const { settings, refreshSettings } = useSettings()
  const { toast } = useToast()
  const router = useRouter()

  // Separate state for each tab section
  const [checkoutSettings, setCheckoutSettings] = useState<CheckoutSettings>({})
  const [titleSettings, setTitleSettings] = useState<TitleSettings>({})
  const [menuSettings, setMenuSettings] = useState<MenuSettings>({})

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("checkout")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [isLoadingBrands, setIsLoadingBrands] = useState(false)

  // Load settings from API response and distribute to appropriate state objects
  useEffect(() => {
    if (settings?.business_info?.web_theme) {
      try {
        const webTheme =
          typeof settings.business_info.web_theme === "string"
            ? JSON.parse(settings.business_info.web_theme)
            : settings.business_info.web_theme

        if (webTheme.theme_setting) {
          console.log("Theme settings loaded:", webTheme.theme_setting)

          // Normalize settings (convert booleans to 0/1)
          const normalizedSettings = Object.entries(webTheme.theme_setting).reduce((acc, [key, value]) => {
            if (typeof value === "boolean") {
              acc[key] = value ? 1 : 0
            } else {
              acc[key] = value
            }
            return acc
          }, {})

          // Distribute settings to appropriate state objects
          const checkout: CheckoutSettings = {}
          const title: TitleSettings = {}
          const menu: MenuSettings = {}

          // Checkout settings
          const checkoutKeys = [
            "guest_checkout_settings_on_off",
            "checkout_page_on_off",
            "recaptcha_settings_on_off",
            "recaptcha_site_key",
            "recaptcha_server_site_key",
            "google_address_api_setting",
            "delivery_service_canada_post",
            "google_address_delivery_charges",
            "popular_products_page",
            "cart_on_off",
            "group_items_setting_on_off",
            "group_items_by_name",
            "all_filters_on_off",
            "store_locator_on_off",
            "cart_abandoment_on_off",
            "pre_authorization_on_off",
            "brand_count_filter_on_off",
            "cancel_order_setting",
            "shop_page_on_off",
            "delivery_menu_on_off",
            "detail_page_setting",
            "sendgrid_setting",
            "sort_filters_on_off",
            "savyour_on_off",
            "otp_on_off",
            "cash_on_off",
            "draggable_cart_on_off",
            "pickup_on_off",
            "payment_type_on_off",
            "coupon_on_off",
            "order_summary_on_off",
            "new_feature_section_on_off",
            "new_cart_box_on_off",
            "contact_us_email_address",
            "contact_us_number",
          ]

          // Title settings
          const titleKeys = [
            "search_on_off",
            "title_img_on_off",
            "title_section_on_off",
            "title_img_height",
            "title_bg_color",
            "title_font_color",
          ]

          // Menu settings
          const menuKeys = [
            "menu_pagination_on_off",
            "pagination_records_limit",
            "new_detail_page_on_off",
            "sales_filter_on_off",
            "price_filter_on_off",
            "city_wise_menu",
            "banner_flasher_on_off",
            "category_flasher_on_off",
          ]

          // Distribute settings to appropriate objects
          Object.keys(normalizedSettings).forEach((key) => {
            if (checkoutKeys.includes(key)) {
              checkout[key] = normalizedSettings[key]
            } else if (titleKeys.includes(key)) {
              title[key] = normalizedSettings[key]
            } else if (menuKeys.includes(key)) {
              menu[key] = normalizedSettings[key]
            }
          })

          // Update state for each section
          setCheckoutSettings(checkout)
          setTitleSettings(title)
          setMenuSettings(menu)
        } else {
          console.log("No theme_setting found in web_theme, using empty objects")
          setCheckoutSettings({})
          setTitleSettings({})
          setMenuSettings({})
        }
      } catch (error) {
        console.error("Error parsing web_theme:", error)
        setCheckoutSettings({})
        setTitleSettings({})
        setMenuSettings({})
      }
    }
    setIsLoading(false)
  }, [settings])

  // Fetch brands when the tab changes to theme_update
  useEffect(() => {
    if (activeTab === "theme_update") {
      fetchBrands()
    }
  }, [activeTab])

  const fetchBrands = async () => {
    setIsLoadingBrands(true)
    try {
      const response = await fetch("https://tossdown.site/api/getBrandName", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch brands: ${response.status}`)
      }

      const responseText = await response.text()
      if (!responseText) {
        console.warn("Empty response received when fetching brands")
        setBrands([])
        return
      }

      try {
        const data = JSON.parse(responseText)
        console.log("Brands loaded:", data)
        setBrands(data || [])
      } catch (error) {
        console.error("Failed to parse brands response as JSON:", responseText)
        toast({
          title: "Error",
          description: "Failed to parse brands data",
          variant: "destructive",
        })
        setBrands([])
      }
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast({
        title: "Error",
        description: "Failed to load brands",
        variant: "destructive",
      })
      setBrands([])
    } finally {
      setIsLoadingBrands(false)
    }
  }

  // Handle toggle changes for each section
  const handleCheckoutToggleChange = (key: string, checked: boolean) => {
    console.log(`Checkout toggle changed for ${key}:`, checked)
    setCheckoutSettings((prev) => ({
      ...prev,
      [key]: checked ? 1 : 0,
    }))
  }

  const handleTitleToggleChange = (key: string, checked: boolean) => {
    console.log(`Title toggle changed for ${key}:`, checked)
    setTitleSettings((prev) => ({
      ...prev,
      [key]: checked ? 1 : 0,
    }))
  }

  const handleMenuToggleChange = (key: string, checked: boolean) => {
    console.log(`Menu toggle changed for ${key}:`, checked)
    setMenuSettings((prev) => ({
      ...prev,
      [key]: checked ? 1 : 0,
    }))
  }

  // Handle input changes for each section
  const handleCheckoutInputChange = (key: string, value: string) => {
    setCheckoutSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleTitleInputChange = (key: string, value: string) => {
    setTitleSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleMenuInputChange = (key: string, value: string) => {
    setMenuSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrandId(e.target.value)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get the current brandId from localStorage
      const brandId = localStorage.getItem("brandId")

      if (!brandId) {
        throw new Error("No brand ID found in localStorage")
      }

      // If we're in the theme_update tab and a brand is selected, use the addTheme functionality
      if (activeTab === "theme_update" && selectedBrandId) {
        console.log("Updating theme from selected brand:", selectedBrandId, "to current brand:", brandId)
        await updateThemeFromSelectedBrand(brandId, selectedBrandId)
      } else {
        // Otherwise, use the regular save functionality
        console.log("Saving theme settings for brand:", brandId)
        await saveThemeSettings(brandId)
      }

      toast({
        title: "Success",
        description: "Theme settings saved successfully",
        variant: "default",
      })

      // Show loading toast while refreshing
      toast({
        title: "Refreshing",
        description: "Reloading page to show your changes...",
        variant: "default",
      })

      // Wait a moment to ensure the server has processed the changes
      setTimeout(async () => {
        try {
          // Show refresh loading state
          setIsRefreshing(true)

          // First refresh the settings context
          await refreshSettings()

          // Then reload the page to show the changes
          router.refresh()

          // For a complete refresh, you can also use window.location.reload()
          // This is more aggressive but ensures everything is fresh
          window.location.reload()
        } catch (error) {
          console.error("Error refreshing after save:", error)
          setIsRefreshing(false)
          toast({
            title: "Warning",
            description: "Settings saved but you may need to refresh to see changes",
            variant: "default",
          })
        }
      }, 1500) // Wait 1.5 seconds before refreshing
    } catch (error) {
      console.error("Error saving theme settings:", error)
      toast({
        title: "Error",
        description: `Failed to save theme settings: ${error.message}`,
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  const updateThemeFromSelectedBrand = async (currentBrandId: string, selectedBrandId: string) => {
    // First, get the settings of the selected brand
    const response = await fetch("https://tossdown.site/api/get_obw_settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        brand_id: selectedBrandId,
      }).toString(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch selected brand settings: ${response.status}`)
    }

    // Safely parse the response
    const responseText = await response.text()
    if (!responseText) {
      throw new Error("Empty response received from API")
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (error) {
      console.error("Failed to parse response as JSON:", responseText)
      throw new Error("Invalid JSON response from API")
    }

    // Save the selected brand's theme to the current brand
    const saveResponse = await fetch("https://tossdown.site/api/saveRestaurantSettings", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        brand_id: currentBrandId,
        data: data.web_theme,
        mobile_theme: data.mobile_theme,
        theme: "1",
      }).toString(),
    })

    if (!saveResponse.ok) {
      throw new Error(`Failed to update theme: ${saveResponse.status}`)
    }

    // Don't try to parse the response as JSON if it's not needed
    // Just return success
    return { success: true }
  }

  const saveThemeSettings = async (brandId: string) => {
    // Get the current settings
    const response = await fetch("https://tossdown.site/api/get_obw_settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        brand_id: brandId,
      }).toString(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`)
    }

    // Safely parse the response
    const responseText = await response.text()
    if (!responseText) {
      throw new Error("Empty response received from API")
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (error) {
      console.error("Failed to parse response as JSON:", responseText)
      throw new Error("Invalid JSON response from API")
    }

    // Parse the web_theme
    let webTheme = {}
    if (data.web_theme) {
      try {
        webTheme = typeof data.web_theme === "string" ? JSON.parse(data.web_theme) : data.web_theme
      } catch (error) {
        console.error("Error parsing web_theme:", error)
        // Continue with empty webTheme object
      }
    }

    // Combine all settings into one object
    const combinedThemeSettings = {
      ...checkoutSettings,
      ...titleSettings,
      ...menuSettings,
    }

    // Update the theme_setting in web_theme
    webTheme = {
      ...webTheme,
      theme_setting: combinedThemeSettings,
    }

    console.log("Saving combined theme settings:", combinedThemeSettings)

    // Save the updated settings
    const saveResponse = await fetch("https://tossdown.site/api/saveRestaurantSettings", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        brand_id: brandId,
        user_id: "0",
        data: JSON.stringify(webTheme),
      }).toString(),
    })

    if (!saveResponse.ok) {
      throw new Error(`Failed to save settings: ${saveResponse.status}`)
    }

    // Don't try to parse the response as JSON if it's not needed
    // Just return success
    return { success: true }
  }

  if (isLoading) {
    return <div className="p-8">Loading theme settings...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Theme Settings</h1>
        <p className="text-muted-foreground mt-2">Customize your website settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 w-full justify-start">
          <TabsTrigger value="checkout" className="bg-gray-300 mr-5">
            Checkout
          </TabsTrigger>
          <TabsTrigger value="title" className="bg-gray-300 mr-5">
            Title
          </TabsTrigger>
          <TabsTrigger value="menu" className="bg-gray-300 mr-5">
            Menu
          </TabsTrigger>
          <TabsTrigger value="theme_update" className="bg-gray-300">
            Update Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkout">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="guest_checkout_settings_on_off">Guest Checkout</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="guest_checkout_settings_on_off"
                      checked={checkoutSettings.guest_checkout_settings_on_off === 1}
                      onCheckedChange={(checked) =>
                        handleCheckoutToggleChange("guest_checkout_settings_on_off", checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout_page_on_off">Checkout Pages ON/OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="checkout_page_on_off"
                      checked={checkoutSettings.checkout_page_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("checkout_page_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recaptcha_settings_on_off">ReCAPTCHA ON/OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recaptcha_settings_on_off"
                      checked={checkoutSettings.recaptcha_settings_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("recaptcha_settings_on_off", checked)}
                    />
                  </div>
                  {checkoutSettings.recaptcha_settings_on_off === 1 && (
                    <div className="mt-2 space-y-2">
                      <Input
                        id="recaptcha_site_key"
                        placeholder="Site Key"
                        value={checkoutSettings.recaptcha_site_key || ""}
                        onChange={(e) => handleCheckoutInputChange("recaptcha_site_key", e.target.value)}
                      />
                      <Input
                        id="recaptcha_server_site_key"
                        placeholder="Server Site Key"
                        value={checkoutSettings.recaptcha_server_site_key || ""}
                        onChange={(e) => handleCheckoutInputChange("recaptcha_server_site_key", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_address_api_setting">Google Address API On Off</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="google_address_api_setting"
                      checked={checkoutSettings.google_address_api_setting === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("google_address_api_setting", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="delivery_service_canada_post">Delivery Service Canada Post</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="delivery_service_canada_post"
                      checked={checkoutSettings.delivery_service_canada_post === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("delivery_service_canada_post", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_address_delivery_charges">Google Address Delivery Charges</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="google_address_delivery_charges"
                      checked={checkoutSettings.google_address_delivery_charges === 1}
                      onCheckedChange={(checked) =>
                        handleCheckoutToggleChange("google_address_delivery_charges", checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="popular_products_page">Popular Products Menu Page</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="popular_products_page"
                      checked={checkoutSettings.popular_products_page === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("popular_products_page", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cart_on_off">Cart on/off</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cart_on_off"
                      checked={checkoutSettings.cart_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("cart_on_off", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="group_items_setting_on_off">Group Items By Attribute</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="group_items_setting_on_off"
                      checked={checkoutSettings.group_items_setting_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("group_items_setting_on_off", checked)}
                    />
                  </div>
                  {checkoutSettings.group_items_setting_on_off === 1 && (
                    <div className="mt-2">
                      <Input
                        id="group_items_by_name"
                        className="w-20"
                        value={checkoutSettings.group_items_by_name || ""}
                        onChange={(e) => handleCheckoutInputChange("group_items_by_name", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="all_filters_on_off">All Filters OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="all_filters_on_off"
                      checked={checkoutSettings.all_filters_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("all_filters_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_locator_on_off">Store Locator</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="store_locator_on_off"
                      checked={checkoutSettings.store_locator_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("store_locator_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cart_abandoment_on_off">Cart Abandonment</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cart_abandoment_on_off"
                      checked={checkoutSettings.cart_abandoment_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("cart_abandoment_on_off", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="pre_authorization_on_off">Pre Authorization</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pre_authorization_on_off"
                      checked={checkoutSettings.pre_authorization_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("pre_authorization_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_count_filter_on_off">Brands Count Filter</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="brand_count_filter_on_off"
                      checked={checkoutSettings.brand_count_filter_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("brand_count_filter_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancel_order_setting">Cancel Order ON/OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cancel_order_setting"
                      checked={checkoutSettings.cancel_order_setting === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("cancel_order_setting", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop_page_on_off">Shop/Menu page url</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shop_page_on_off"
                      checked={checkoutSettings.shop_page_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("shop_page_on_off", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="delivery_menu_on_off">Delivery Menu ON/OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="delivery_menu_on_off"
                      checked={checkoutSettings.delivery_menu_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("delivery_menu_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail_page_setting">Product Detail Page</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="detail_page_setting"
                      checked={checkoutSettings.detail_page_setting === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("detail_page_setting", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sendgrid_setting">SendGrid Setting</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendgrid_setting"
                      checked={checkoutSettings.sendgrid_setting === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("sendgrid_setting", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_filters_on_off">Sort Filter ON/OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sort_filters_on_off"
                      checked={checkoutSettings.sort_filters_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("sort_filters_on_off", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="savyour_on_off">Savyour Settings</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="savyour_on_off"
                      checked={checkoutSettings.savyour_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("savyour_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp_on_off">OTP Settings</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="otp_on_off"
                      checked={checkoutSettings.otp_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("otp_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cash_on_off">Cash ON/OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cash_on_off"
                      checked={checkoutSettings.cash_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("cash_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="draggable_cart_on_off">Draggable Cart</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="draggable_cart_on_off"
                      checked={checkoutSettings.draggable_cart_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("draggable_cart_on_off", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="pickup_on_off">Pickup Time ON/OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pickup_on_off"
                      checked={checkoutSettings.pickup_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("pickup_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_type_on_off">Payment Type ON/OFF</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="payment_type_on_off"
                      checked={checkoutSettings.payment_type_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("payment_type_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon_on_off">Coupon ON</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="coupon_on_off"
                      checked={checkoutSettings.coupon_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("coupon_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_summary_on_off">Order Summary ON</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="order_summary_on_off"
                      checked={checkoutSettings.order_summary_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("order_summary_on_off", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="new_feature_section_on_off">New Feature Section</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="new_feature_section_on_off"
                      checked={checkoutSettings.new_feature_section_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("new_feature_section_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_cart_box_on_off">New Card Box</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="new_cart_box_on_off"
                      checked={checkoutSettings.new_cart_box_on_off === 1}
                      onCheckedChange={(checked) => handleCheckoutToggleChange("new_cart_box_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_us_email_address">Contact Us Email</Label>
                  <Input
                    id="contact_us_email_address"
                    type="email"
                    value={checkoutSettings.contact_us_email_address || ""}
                    onChange={(e) => handleCheckoutInputChange("contact_us_email_address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_us_number">Contact Us Phone Number</Label>
                  <Input
                    id="contact_us_number"
                    type="text"
                    value={checkoutSettings.contact_us_number || ""}
                    onChange={(e) => handleCheckoutInputChange("contact_us_number", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="title">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="search_on_off"
                      checked={titleSettings.search_on_off === 1}
                      onCheckedChange={(checked) => handleTitleToggleChange("search_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title Background Image</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="title_img_on_off"
                      checked={titleSettings.title_img_on_off === 1}
                      onCheckedChange={(checked) => handleTitleToggleChange("title_img_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title Page Section</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="title_section_on_off"
                      checked={titleSettings.title_section_on_off === 1}
                      onCheckedChange={(checked) => handleTitleToggleChange("title_section_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title Background Image Height</Label>
                  <Input
                    id="title_img_height"
                    value={titleSettings.title_img_height || ""}
                    onChange={(e) => handleTitleInputChange("title_img_height", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                <div className="space-y-2">
                  <Label>Title Background Color</Label>
                  <Input
                    id="title_bg_color"
                    value={titleSettings.title_bg_color || ""}
                    onChange={(e) => handleTitleInputChange("title_bg_color", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title Font Color</Label>
                  <Input
                    id="title_font_color"
                    value={titleSettings.title_font_color || ""}
                    onChange={(e) => handleTitleInputChange("title_font_color", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Choose Title Background Image</Label>
                  <Input
                    id="title_img"
                    type="file"
                    onChange={(e) => {
                      // Handle file upload
                      console.log("File selected:", e.target.files?.[0])
                      // You would need to implement file upload functionality here
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <Label>Menu Pagination</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="menu_pagination_on_off"
                      checked={menuSettings.menu_pagination_on_off === 1}
                      onCheckedChange={(checked) => handleMenuToggleChange("menu_pagination_on_off", checked)}
                    />
                  </div>
                  {menuSettings.menu_pagination_on_off === 1 && (
                    <div className="mt-2">
                      <Input
                        id="pagination_records_limit"
                        className="w-20"
                        value={menuSettings.pagination_records_limit || ""}
                        onChange={(e) => handleMenuInputChange("pagination_records_limit", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>New Detail Page</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="new_detail_page_on_off"
                      checked={menuSettings.new_detail_page_on_off === 1}
                      onCheckedChange={(checked) => handleMenuToggleChange("new_detail_page_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sales Count Filter</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sales_filter_on_off"
                      checked={menuSettings.sales_filter_on_off === 1}
                      onCheckedChange={(checked) => handleMenuToggleChange("sales_filter_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Price Range Filter</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="price_filter_on_off"
                      checked={menuSettings.price_filter_on_off === 1}
                      onCheckedChange={(checked) => handleMenuToggleChange("price_filter_on_off", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                <div className="space-y-2">
                  <Label>City Wise Menu</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="city_wise_menu"
                      checked={menuSettings.city_wise_menu === 1}
                      onCheckedChange={(checked) => handleMenuToggleChange("city_wise_menu", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Banner Flasher Settings</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="banner_flasher_on_off"
                      checked={menuSettings.banner_flasher_on_off === 1}
                      onCheckedChange={(checked) => handleMenuToggleChange("banner_flasher_on_off", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category Flasher Settings</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="category_flasher_on_off"
                      checked={menuSettings.category_flasher_on_off === 1}
                      onCheckedChange={(checked) => handleMenuToggleChange("category_flasher_on_off", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme_update">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <Label>Select Brand Name</Label>
                  {isLoadingBrands ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <span>Loading brands...</span>
                    </div>
                  ) : (
                    <select
                      id="brand_id"
                      name="bid"
                      value={selectedBrandId}
                      onChange={handleBrandChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a brand</option>
                      {brands.map((brand) => (
                        <option key={brand.brand_id} value={brand.brand_id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {selectedBrandId && (
                    <p className="text-sm text-muted-foreground mt-2">
                      This will copy all theme settings from the selected brand to your current brand.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-center">
        <Button
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-2"
          onClick={handleSave}
          disabled={isSaving || (activeTab === "theme_update" && !selectedBrandId)}
        >
          {isSaving ? "Saving..." : "Save Theme Settings"}
        </Button>
      </div>
      {isRefreshing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Loading theme settings...</p>
          </div>
        </div>
      )}
    </div>
  )
}
