"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useSettings } from "@/contexts/settings-context"
import { ChevronDown } from "lucide-react"
import { CardItemSettingsModal } from "./card-item-settings-modal"
import React from "react"

interface SearchResultSidebarProps {
  initialConfig: any
  onConfigChange: (config: any) => void
  onSave: (config: any) => Promise<void>
  isSaving: boolean
  saveError?: string | null
  saveSuccess?: boolean
  onBack: () => void
}

export default function SearchResultSidebar({
  initialConfig,
  onConfigChange,
  onSave,
  isSaving,
  saveError: propsSaveError,
  saveSuccess: propsSaveSuccess,
  onBack,
}: SearchResultSidebarProps) {
  const { settings } = useSettings()
  const [config, setConfig] = useState<any>(initialConfig)
  const [saveSuccess, setSaveSuccess] = useState(propsSaveSuccess || false)
  const [saveError, setSaveError] = useState<string | null>(propsSaveError || null)
  const [isSavingState, setIsSaving] = useState(isSaving)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cardItems, setCardItems] = useState<any[]>([])

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Debug function to log the actual config structure
  const debugConfig = (config: any) => {
    console.log("DEBUG CONFIG:", JSON.stringify(config, null, 2))
  }

  useEffect(() => {
    // Log the initialConfig to see its structure
    console.log("Initial Config:", initialConfig)
    debugConfig(initialConfig)

    if (initialConfig) {
      setConfig(initialConfig)

      // Extract card items from the config
      if (initialConfig.search_result?.items) {
        console.log("Found items in search_result:", initialConfig.search_result.items)
        const items = Object.entries(initialConfig.search_result.items).map(([key, value]) => ({
          key,
          ...(value as any),
        }))
        console.log("Extracted items:", items)
        setCardItems(items)
      } else {
        console.log("No items found in config, creating default items")
        // Create default items
        const defaultItems = [
          {
            key: "0",
            type: "image",
            settings: { image_on_off: "1", image_height: "200px", image_border_radius: "8px 8px 0 0" },
          },
          {
            key: "1",
            type: "name",
            settings: { name_on_off: "1", name_font_size: "16px", name_font_weight: "600", name_color: "#111827" },
          },
          {
            key: "2",
            type: "description",
            settings: { description_on_off: "0", description_font_size: "14px", description_color: "#6b7280" },
          },
          {
            key: "3",
            type: "price",
            settings: { price_on_off: "1", price_font_size: "16px", price_font_weight: "600", price_color: "#111827" },
          },
          {
            key: "4",
            type: "discounted_price",
            settings: {
              discounted_price_on_off: "1",
              discounted_price_font_size: "14px",
              discounted_price_color: "#9ca3af",
            },
          },
          {
            key: "5",
            type: "discount_percentage",
            settings: {
              discount_percentage_on_off: "1",
              discount_percentage_font_size: "12px",
              discount_percentage_color: "#ffffff",
              discount_percentage_bg_color: "#ef4444",
            },
          },
          {
            key: "6",
            type: "category",
            settings: { category_on_off: "0", category_font_size: "12px", category_color: "#6b7280" },
          },
          { key: "7", type: "brand", settings: { brand_on_off: "0", brand_font_size: "12px", brand_color: "#6b7280" } },
          {
            key: "8",
            type: "quantity",
            settings: { quantity_on_off: "0", quantity_font_size: "12px", quantity_color: "#6b7280" },
          },
          {
            key: "9",
            type: "weight",
            settings: { weight_on_off: "0", weight_font_size: "12px", weight_color: "#6b7280" },
          },
          { key: "10", type: "sku", settings: { sku_on_off: "0", sku_font_size: "12px", sku_color: "#6b7280" } },
          { key: "11", type: "note", settings: { note_on_off: "0", note_font_size: "12px", note_color: "#6b7280" } },
          {
            key: "12",
            type: "not_available",
            settings: { not_available_on_off: "1", not_available_font_size: "14px", not_available_color: "#ef4444" },
          },
          {
            key: "13",
            type: "counter",
            settings: { counter_on_off: "1", counter_button_color: "#4f46e5", counter_button_text_color: "#ffffff" },
          },
          {
            key: "14",
            type: "add_to_cart",
            settings: {
              add_to_cart_on_off: "1",
              add_to_cart_button_text: "ADD TO CART",
              add_to_cart_button_color: "#d97706",
            },
          },
          { key: "15", type: "wishlist", settings: { wishlist_on_off: "0", wishlist_icon_color: "#ef4444" } },
          {
            key: "16",
            type: "attributes",
            settings: { attributes_on_off: "0", attributes_font_size: "12px", attributes_color: "#6b7280" },
          },
        ]
        setCardItems(defaultItems)

        // Update the config with default items
        const newConfig = { ...initialConfig }
        if (!newConfig.search_result) {
          newConfig.search_result = { settings: {}, items: {} }
        }
        if (!newConfig.search_result.items) {
          newConfig.search_result.items = {}
        }

        defaultItems.forEach((item) => {
          newConfig.search_result.items[item.key] = {
            type: item.type,
            settings: { ...item.settings },
          }
        })

        setConfig(newConfig)
        onConfigChange(newConfig)
      }
    }
  }, [initialConfig, onConfigChange])

  useEffect(() => {
    if (initialConfig && (!config || JSON.stringify(initialConfig) !== JSON.stringify(config))) {
      console.log("Setting config from initialConfig")
      setConfig(JSON.parse(JSON.stringify(initialConfig)))

      // Extract card items from the config
      if (initialConfig.search_result?.items) {
        console.log("Found items in search_result:", initialConfig.search_result.items)
        const items = Object.entries(initialConfig.search_result.items).map(([key, value]) => ({
          key,
          ...(value as any),
        }))
        console.log("Extracted items:", items)
        setCardItems(items)
      } else {
        // Create default items
        const defaultItems = [
          {
            key: "0",
            type: "image",
            settings: { image_on_off: "1", image_height: "200px", image_border_radius: "8px 8px 0 0" },
          },
          {
            key: "1",
            type: "name",
            settings: { name_on_off: "1", name_font_size: "16px", name_font_weight: "600", name_color: "#111827" },
          },
          {
            key: "2",
            type: "description",
            settings: { description_on_off: "0", description_font_size: "14px", description_color: "#6b7280" },
          },
          {
            key: "3",
            type: "price",
            settings: { price_on_off: "1", price_font_size: "16px", price_font_weight: "600", price_color: "#111827" },
          },
          {
            key: "4",
            type: "discounted_price",
            settings: {
              discounted_price_on_off: "1",
              discounted_price_font_size: "14px",
              discounted_price_color: "#9ca3af",
            },
          },
          {
            key: "5",
            type: "discount_percentage",
            settings: {
              discount_percentage_on_off: "1",
              discount_percentage_font_size: "12px",
              discount_percentage_color: "#ffffff",
              discount_percentage_bg_color: "#ef4444",
            },
          },
          {
            key: "6",
            type: "category",
            settings: { category_on_off: "0", category_font_size: "12px", category_color: "#6b7280" },
          },
          { key: "7", type: "brand", settings: { brand_on_off: "0", brand_font_size: "12px", brand_color: "#6b7280" } },
          {
            key: "8",
            type: "quantity",
            settings: { quantity_on_off: "0", quantity_font_size: "12px", quantity_color: "#6b7280" },
          },
          {
            key: "9",
            type: "weight",
            settings: { weight_on_off: "0", weight_font_size: "12px", weight_color: "#6b7280" },
          },
          { key: "10", type: "sku", settings: { sku_on_off: "0", sku_font_size: "12px", sku_color: "#6b7280" } },
          { key: "11", type: "note", settings: { note_on_off: "0", note_font_size: "12px", note_color: "#6b7280" } },
          {
            key: "12",
            type: "not_available",
            settings: { not_available_on_off: "1", not_available_font_size: "14px", not_available_color: "#ef4444" },
          },
          {
            key: "13",
            type: "counter",
            settings: { counter_on_off: "1", counter_button_color: "#4f46e5", counter_button_text_color: "#ffffff" },
          },
          {
            key: "14",
            type: "add_to_cart",
            settings: {
              add_to_cart_on_off: "1",
              add_to_cart_button_text: "ADD TO CART",
              add_to_cart_button_color: "#d97706",
            },
          },
          { key: "15", type: "wishlist", settings: { wishlist_on_off: "0", wishlist_icon_color: "#ef4444" } },
          {
            key: "16",
            type: "attributes",
            settings: { attributes_on_off: "0", attributes_font_size: "12px", attributes_color: "#6b7280" },
          },
        ]
        setCardItems(defaultItems)

        // Update the config with default items
        const newConfig = { ...initialConfig }
        if (!newConfig.search_result) {
          newConfig.search_result = { settings: {}, items: {} }
        }
        if (!newConfig.search_result.items) {
          newConfig.search_result.items = {}
        }

        defaultItems.forEach((item) => {
          newConfig.search_result.items[item.key] = {
            type: item.type,
            settings: { ...item.settings },
          }
        })

        setConfig(newConfig)
        onConfigChange(newConfig)
      }
    }
  }, [initialConfig])

  // Remove or comment out the useEffect that checks for web_theme settings
  // This is now handled in the page component
  /*
  useEffect(() => {
    // First check web_theme settings
    if (settings?.settings?.web_theme?.search_result?.items) {
      console.log("Settings updated from web_theme context:", settings.settings.web_theme.search_result.items)
      const items = Object.entries(settings.settings.web_theme.search_result.items).map(([key, value]) => ({
        key,
        ...(value as any),
      }))
      setCardItems(items)
      setConfig(settings.settings.web_theme)
    }
    // Fallback to card settings
    else if (settings?.settings?.card?.search_result?.items) {
      console.log("Settings updated from card context:", settings.settings.card.search_result.items)
      const items = Object.entries(settings.settings.card.search_result.items).map(([key, value]) => ({
        key,
        ...(value as any),
      }))
      setCardItems(items)
      setConfig(settings.settings.card)
    }
  }, [settings?.settings?.web_theme, settings?.settings?.card])
  */

  useEffect(() => {
    if (propsSaveSuccess !== undefined) {
      setSaveSuccess(propsSaveSuccess)
    }
    if (propsSaveError !== undefined) {
      setSaveError(propsSaveError)
    }
    setIsSaving(isSaving)
  }, [propsSaveSuccess, propsSaveError, isSaving])

  const handleSave = async () => {
    await onSave(config)
  }

  const updateNestedConfig = (path: string, value: any) => {
    const pathParts = path.split(".")
    const newConfig = JSON.parse(JSON.stringify(config)) // Deep clone to avoid reference issues

    let current = newConfig
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {}
      }
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = value
    setConfig(newConfig)

    // Debounce the notification to parent to prevent immediate re-renders
    // that could cause the input to reset
    clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      onConfigChange(newConfig)
    }, 300)
  }

  // Update the handleOpenModal function to ensure we're passing the complete item with its settings
  const handleOpenModal = (item: any) => {
    console.log("Opening modal for item:", item)

    // Find the item in the actual config to ensure we're getting the latest data
    let configItem
    if (config.search_result?.items && config.search_result.items[item.key]) {
      configItem = config.search_result.items[item.key]
    }

    // Use the item from config if available, otherwise use the passed item
    const itemToEdit = {
      key: item.key,
      type: item.type,
      settings: configItem ? { ...configItem.settings } : { ...item.settings },
    }

    console.log("Item being passed to modal:", itemToEdit)
    setSelectedItem(itemToEdit)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handleItemSave = (newSettings: any) => {
    if (selectedItem) {
      // Find the item in cardItems
      const itemIndex = cardItems.findIndex((item) => item.key === selectedItem.key)

      if (itemIndex !== -1) {
        // Update the item in cardItems
        const updatedItems = [...cardItems]
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          settings: { ...newSettings }, // Use spread to create a new object
        }
        setCardItems(updatedItems)

        // Update the config
        const newConfig = { ...config }
        if (newConfig.search_result?.items) {
          newConfig.search_result.items[selectedItem.key] = {
            type: selectedItem.type,
            settings: { ...newSettings }, // Use spread to create a new object
          }
        }

        setConfig(newConfig)
        onConfigChange(newConfig)
      }
    }
  }

  // Function to get display name for item type
  const getDisplayName = (type: string) => {
    if (type === "name") return "Product Name"
    else if (type === "discounted_price") return "Discounted Price"
    else if (type === "discount_percentage") return "Discounted Percentage"
    else if (type === "not_available") return "Not Available"
    else if (type === "add_to_cart") return "Add to Cart"
    else return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="w-64 border-r bg-gray-50 overflow-y-auto">
      <div className="p-4">
        <Button
          variant="destructive"
          size="sm"
          className="mb-4 rounded-md px-4 py-1 h-auto bg-[#e1416f] hover:bg-[#c02e53] flex items-center"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {saveSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">Search result settings saved successfully.</AlertDescription>
          </Alert>
        )}
        {saveError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{saveError}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-3">
          <Accordion type="single" collapsible>
            <AccordionItem value="search_results">
              <AccordionTrigger className="capitalize">
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">Search Results</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-4 py-2">
                  <Label htmlFor="cardsToShow">Cards to show</Label>
                  <select
                    id="cardsToShow"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config?.search_result?.settings?.cards_to_show || "4"}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.cards_to_show", e.target.value)
                    }}
                  >
                    <option value="3">Row 4 cards</option>
                    <option value="4">Row 3 cards</option>
                    <option value="6">Row 2 cards</option>
                    <option value="12">Row 1 cards</option>
                  </select>
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="cardBackgroundColor">Card Background Color</Label>
                  <Input
                    type="text"
                    id="cardBackgroundColor"
                    placeholder="Color Code"
                    value={config?.search_result?.settings?.card_bg_color || ""}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.card_bg_color", e.target.value)
                    }}
                  />
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="cardBorder">Card Border</Label>
                  <Input
                    type="text"
                    id="cardBorder"
                    placeholder="1px solid,dashed #color"
                    value={config?.search_result?.settings?.card_border || ""}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.card_border", e.target.value)
                    }}
                  />
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="cardShadow">Card Shadow</Label>
                  <Input
                    type="text"
                    id="cardShadow"
                    placeholder="Color Code"
                    value={config?.search_result?.settings?.card_shadow || ""}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.card_shadow", e.target.value)
                    }}
                  />
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="cameraIcon">Camera Icon</Label>
                  <select
                    id="cameraIcon"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config?.search_result?.settings?.show_camera_icon || "0"}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.show_camera_icon", e.target.value)
                    }}
                  >
                    <option value="0">OFF</option>
                    <option value="1">ON</option>
                  </select>
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="zoomImage">Zoom Image</Label>
                  <select
                    id="zoomImage"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config?.search_result?.settings?.zoom_image || "0"}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.zoom_image", e.target.value)
                    }}
                  >
                    <option value="0">OFF</option>
                    <option value="1">ON</option>
                  </select>
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="eyePopup">Eye Popup</Label>
                  <select
                    id="eyePopup"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config?.search_result?.settings?.eye_popup_on_off || "0"}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.eye_popup_on_off", e.target.value)
                    }}
                  >
                    <option value="0">OFF</option>
                    <option value="1">ON</option>
                  </select>
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="detailPage">Detail Page</Label>
                  <select
                    id="detailPage"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config?.search_result?.settings?.detail_page_on_off || "1"}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.detail_page_on_off", e.target.value)
                    }}
                  >
                    <option value="0">OFF</option>
                    <option value="1">ON</option>
                  </select>
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="optionSets">Option Sets</Label>
                  <select
                    id="optionSets"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config?.search_result?.settings?.optionset_on_off || "0"}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.optionset_on_off", e.target.value)
                    }}
                  >
                    <option value="0">OFF</option>
                    <option value="1">ON</option>
                  </select>
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="categoryStyle">Category Style</Label>
                  <select
                    id="categoryStyle"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config?.search_result?.settings?.category_style || "style_1"}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.category_style", e.target.value)
                    }}
                  >
                    <option value="style_1">Default</option>
                    <option value="style_2">Style 2</option>
                  </select>
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="productCode">Product Code</Label>
                  <select
                    id="productCode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config?.search_result?.settings?.product_code || "0"}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.product_code", e.target.value)
                    }}
                  >
                    <option value="0">OFF</option>
                    <option value="1">ON</option>
                  </select>
                </div>
                <div className="grid gap-4 py-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    type="text"
                    id="domain"
                    placeholder="domain to redirect"
                    value={config?.search_result?.settings?.domain || ""}
                    onChange={(e) => {
                      updateNestedConfig("search_result.settings.domain", e.target.value)
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="card_items">
              <AccordionTrigger className="capitalize">
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">Card Items</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1">
                {/* Debug info */}
                {cardItems.length === 0 && (
                  <div className="text-sm text-gray-500 italic">No card items found. Check console for details.</div>
                )}

                {/* Render card items */}
                {cardItems.map((item) => (
                  <Accordion type="single" collapsible key={item.key} className="border-b">
                    <AccordionItem value={`item-${item.key}`} className="border-0">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <span className="text-sm font-medium">{getDisplayName(item.type)}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-2">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            className="bg-[#e1416f] hover:bg-[#c02e53] text-white w-24"
                            onClick={() => handleOpenModal(item)}
                          >
                            Open
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="pt-4">
            <Button
              className="w-full bg-[#e1416f] hover:bg-[#c02e53] text-white font-medium py-2 rounded-md transition-colors"
              onClick={handleSave}
              disabled={isSavingState}
            >
              {isSavingState ? "Saving..." : "SAVE"}
            </Button>
          </div>
        </div>
      </div>
      {selectedItem && (
        <CardItemSettingsModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleItemSave}
        />
      )}
    </div>
  )
}
