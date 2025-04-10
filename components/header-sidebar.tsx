"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChevronRight, Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { HeaderConfig, BarConfig, ListConfig, ItemConfig } from "@/lib/header-types"

interface HeaderSidebarProps {
  initialConfig: HeaderConfig
  onConfigChange: (config: HeaderConfig) => void
  onSave: (e: React.MouseEvent) => void
  isSaving: boolean
  refreshSettings?: () => Promise<void>
  saveError?: string | null
  saveSuccess?: boolean
}

export default function HeaderSidebar({
  initialConfig,
  onConfigChange,
  onSave,
  isSaving,
  saveError: propsSaveError,
  saveSuccess: propsSaveSuccess,
}: HeaderSidebarProps) {
  // In the useState initialization, ensure expandedSections has all required properties
  const [expandedSections, setExpandedSections] = useState<{
    ticker: boolean
    bars: Record<string, boolean>
    lists: Record<string, boolean>
    items: Record<string, boolean>
    subLinks: Record<string, boolean>
    innerSubLinks: Record<string, boolean>
  }>({
    ticker: false,
    bars: {},
    lists: {},
    items: {},
    subLinks: {},
    innerSubLinks: {},
  })

  // Also ensure the config state is properly initialized
  const [config, setConfig] = useState<HeaderConfig>(
    initialConfig || {
      ticker: {
        header_ticker_on_off: false,
        sticky_ticker: false,
        ticker_bg_color: "#fde6c6",
        ticker_font_color: "#000000",
        header_ticker_text: "",
      },
      nav: [],
    },
  )
  const [saveSuccess, setSaveSuccess] = useState(propsSaveSuccess || false)
  const [saveError, setSaveError] = useState<string | null>(propsSaveError || null)
  const [isSavingState, setIsSaving] = useState(isSaving)

  // Update state when props change
  useEffect(() => {
    if (propsSaveSuccess !== undefined) {
      setSaveSuccess(propsSaveSuccess)
    }
    if (propsSaveError !== undefined) {
      setSaveError(propsSaveError)
    }
    setIsSaving(isSaving)
  }, [propsSaveSuccess, propsSaveError, isSaving])

  // Toggle section expansion
  const toggleSection = (section: string, id?: string) => {
    if (section === "ticker") {
      setExpandedSections((prev) => ({
        ...prev,
        ticker: !prev.ticker,
      }))
    } else if (section === "bar" && id) {
      setExpandedSections((prev) => ({
        ...prev,
        bars: {
          ...prev.bars,
          [id]: !prev.bars[id],
        },
      }))
    } else if (section === "list" && id) {
      setExpandedSections((prev) => ({
        ...prev,
        lists: {
          ...prev.lists,
          [id]: !prev.lists[id],
        },
      }))
    } else if (section === "item" && id) {
      setExpandedSections((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [id]: !prev.items[id],
        },
      }))
    }
  }

  // Update ticker properties
  const updateTickerProperty = (property: string, value: any) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      ticker: {
        ...prevConfig.ticker,
        [property]: value,
      },
    }))
  }

  // Update bar properties
  const updateBarProperty = (barId: string, property: string, value: any) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      nav: prevConfig.nav.map((bar) => (bar.id === barId ? { ...bar, [property]: value } : bar)),
    }))
  }

  // Update list properties
  const updateListProperty = (barId: string, listId: string, property: string, value: any) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      nav: prevConfig.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: bar.list.map((list) => (list.id === listId ? { ...list, [property]: value } : list)),
            }
          : bar,
      ),
    }))
  }

  // Improve the updateItemProperty function to handle nested structures better
  const updateItemProperty = (barId: string, listId: string, itemId: string, property: string, value: any) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      nav: prevConfig.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: bar.list.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      items: Array.isArray(list.items)
                        ? list.items.map((item) =>
                            item.id === itemId
                              ? {
                                  ...item,
                                  [property]: value,
                                  // Also update setting property if it should be synchronized
                                  ...(property === "name" && item.setting
                                    ? { setting: { ...item.setting, item_label: value } }
                                    : {}),
                                  ...(property === "color" && item.setting
                                    ? { setting: { ...item.setting, item_label_color: value } }
                                    : {}),
                                  ...(property === "route" && item.setting
                                    ? { setting: { ...item.setting, item_route: value } }
                                    : {}),
                                  ...(property === "font_size" && item.setting
                                    ? { setting: { ...item.setting, link_font_size: value } }
                                    : {}),
                                }
                              : item,
                          )
                        : Object.fromEntries(
                            Object.entries(list.items).map(([key, item]) =>
                              item.id === itemId
                                ? [
                                    key,
                                    {
                                      ...item,
                                      [property]: value,
                                      // Also update setting property if it should be synchronized
                                      ...(property === "name" && item.setting
                                        ? { setting: { ...item.setting, item_label: value } }
                                        : {}),
                                      ...(property === "color" && item.setting
                                        ? { setting: { ...item.setting, item_label_color: value } }
                                        : {}),
                                      ...(property === "route" && item.setting
                                        ? { setting: { ...item.setting, item_route: value } }
                                        : {}),
                                      ...(property === "font_size" && item.setting
                                        ? { setting: { ...item.setting, link_font_size: value } }
                                        : {}),
                                    },
                                  ]
                                : [key, item],
                            ),
                          ),
                    }
                  : list,
              ),
            }
          : bar,
      ),
    }))
  }

  // Also update the updateItem function to set both direct properties and nested setting properties
  const updateItem = (barId: string, listId: string, itemId: string, newProps: Partial<ItemConfig>) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      nav: prevConfig.nav.map((bar) => {
        if (bar.id !== barId) return bar

        return {
          ...bar,
          list: bar.list.map((list) => {
            if (list.id !== listId) return list

            return {
              ...list,
              items: Array.isArray(list.items)
                ? list.items.map((item) => {
                    if (item.id !== itemId) return item

                    // Create a deep copy of the item
                    const updatedItem = { ...item, ...newProps }

                    // Synchronize with setting properties
                    if (updatedItem.setting) {
                      if (newProps.name) updatedItem.setting.item_label = newProps.name
                      if (newProps.color) updatedItem.setting.item_label_color = newProps.color
                      if (newProps.route) updatedItem.setting.item_route = newProps.route
                      if (newProps.font_size) updatedItem.setting.link_font_size = newProps.font_size
                      if (newProps.background_color) updatedItem.setting.item_bg_color = newProps.background_color
                      if (newProps.padding) updatedItem.setting.link_padding = newProps.padding
                      if (newProps.margin) updatedItem.setting.link_margin = newProps.margin
                      // Handle boolean properties
                      if ("target_blank" in newProps) {
                        updatedItem.setting.link_target_blank_on_off = newProps.target_blank ? "1" : "0"
                      }
                    }

                    return updatedItem
                  })
                : Object.fromEntries(
                    Object.entries(list.items).map(([key, item]) => {
                      if (item.id !== itemId) return [key, item]

                      // Create a deep copy of the item
                      const updatedItem = { ...item, ...newProps }

                      // Synchronize with setting properties
                      if (updatedItem.setting) {
                        if (newProps.name) updatedItem.setting.item_label = newProps.name
                        if (newProps.color) updatedItem.setting.item_label_color = newProps.color
                        if (newProps.route) updatedItem.setting.item_route = newProps.route
                        if (newProps.font_size) updatedItem.setting.link_font_size = newProps.font_size
                        if (newProps.background_color) updatedItem.setting.item_bg_color = newProps.background_color
                        if (newProps.padding) updatedItem.setting.link_padding = newProps.padding
                        if (newProps.margin) updatedItem.setting.link_margin = newProps.margin
                        // Handle boolean properties
                        if ("target_blank" in newProps) {
                          updatedItem.setting.link_target_blank_on_off = newProps.target_blank ? "1" : "0"
                        }
                      }

                      return [key, updatedItem]
                    }),
                  ),
            }
          }),
        }
      }),
    }))
  }

  // Add a new bar
  const addBar = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Generate a unique ID for the new bar
    const newBarId = `bar-${uuidv4()}`
    const newBar = {
      id: newBarId,
      show_bar: true,
      sticky_header: false,
      transparent_header: false,
      container: true,
      active_link: false,
      height: "80px",
      border_top: "",
      border_bottom: "",
      margin: "0px 0px 0px 0px",
      padding: "0px 0px 0px 0px",
      bar_background_color: "#ffffff",
      list: [
        {
          id: `list-${uuidv4()}`,
          position: "left" as const,
          items: [],
        },
      ],
    }

    setConfig({
      ...config,
      nav: [...config.nav, newBar],
    })

    // Expand the new bar
    setExpandedSections((prev) => ({
      ...prev,
      bars: {
        ...prev.bars,
        [newBarId]: true,
      },
    }))
  }

  // Remove a bar
  const removeBar = (barId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setConfig({
      ...config,
      nav: config.nav.filter((bar) => bar.id !== barId),
    })

    // Remove the bar from expanded sections
    setExpandedSections((prev) => {
      const { [barId]: _, ...restBars } = prev.bars
      return {
        ...prev,
        bars: restBars,
      }
    })
  }

  // Add a new list to a bar
  const addList = (barId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const bar = config.nav.find((b) => b.id === barId)
    if (!bar) return

    // Generate a unique ID for the new list
    const newListId = `list-${uuidv4()}`
    const newList = {
      id: newListId,
      settings: {
        list_position: "left",
      },
      items: [],
    }

    setConfig({
      ...config,
      nav: config.nav.map((b) => (b.id === barId ? { ...b, list: [...b.list, newList] } : b)),
    })

    // Expand the new list
    setExpandedSections((prev) => ({
      ...prev,
      lists: {
        ...prev.lists,
        [newListId]: true,
      },
    }))
  }

  // Remove a list from a bar
  const removeList = (barId: string, listId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setConfig({
      ...config,
      nav: config.nav.map((bar) =>
        bar.id === barId ? { ...bar, list: bar.list.filter((list) => list.id !== listId) } : bar,
      ),
    })

    // Remove the list from expanded sections
    setExpandedSections((prev) => {
      const { [listId]: _, ...restLists } = prev.lists
      return {
        ...prev,
        lists: restLists,
      }
    })
  }

  // Add a new item to a list
  const addItem = (barId: string, listId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const bar = config.nav.find((b) => b.id === barId)
    if (!bar) return

    const list = bar.list.find((l) => l.id === listId)
    if (!list) return

    // Generate a unique ID for the new item
    const newItemId = `item-${uuidv4()}`

    // Default item settings
    const newItem = {
      id: newItemId,
      type: "link" as const,
      icon: "",
      name: "New Item",
      color: "#000000",
      route: "#",
      background_color: "",
      border_radius: "",
      margin: "0px 0px 0px 0px",
      padding: "0px 0px 0px 0px",
      font_size: "14px",
      border: "",
      border_left: "",
      extra_class: "",
      extra_attribute: "",
      font_weight: "400",
      target_blank: false,
      sub_link: false,
      setting: {
        item_label: "New Item",
        item_label_color: "#000000",
        item_route: "#",
        link_font_size: "14px",
        link_font_weight: "400",
        background_color: "",
        // Logo specific settings
        logo_link: "",
        logo_width: "127px",
        logo_margin: "0px 0px 0px 0px",
        logo_padding: "0px 0px 0px 0px",
        logo_bg_color: "",
        logo_border: "0px solid transparent",
      },
    }

    setConfig({
      ...config,
      nav: config.nav.map((b) =>
        b.id === barId
          ? {
              ...b,
              list: b.list.map((l) => (l.id === listId ? { ...l, items: [...l.items, newItem] } : l)),
            }
          : b,
      ),
    })

    // Expand the new item
    setExpandedSections((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [newItemId]: true,
      },
    }))
  }

  // Remove an item from a list
  const removeItem = (barId: string, listId: string, itemId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setConfig({
      ...config,
      nav: config.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: bar.list.map((list) =>
                list.id === listId ? { ...list, items: list.items.filter((item) => item.id !== itemId) } : list,
              ),
            }
          : bar,
      ),
    })

    // Remove the item from expanded sections
    setExpandedSections((prev) => {
      const { [itemId]: _, ...restItems } = prev.items
      return {
        ...prev,
        items: restItems,
      }
    })
  }

  // Update the useEffect that initializes config from initialConfig
  const initialConfigRef = useRef<HeaderConfig | null>(null)

  useEffect(() => {
    // Only update if initialConfig is different from what we've seen before
    // and is not null/undefined
    if (
      initialConfig &&
      (!initialConfigRef.current || JSON.stringify(initialConfigRef.current) !== JSON.stringify(initialConfig))
    ) {
      console.log("Updating sidebar config from API data")
      // Store the current initialConfig for future comparison
      initialConfigRef.current = JSON.parse(JSON.stringify(initialConfig))

      // Create a deep copy of the initialConfig to avoid modifying the original
      const processedConfig = JSON.parse(JSON.stringify(initialConfig))

      // Process the ticker properties - preserve original API keys
      if (processedConfig.ticker) {
        // Convert string values to boolean but keep original properties
        processedConfig.ticker.header_ticker_on_off =
          processedConfig.ticker.header_ticker_on_off === true ||
          processedConfig.ticker.header_ticker_on_off === "1" ||
          processedConfig.ticker.header_ticker_on_off === 1

        // Handle both sticky_ticker and sticky_ticker_on_off
        if ("sticky_ticker_on_off" in processedConfig.ticker) {
          processedConfig.ticker.sticky_ticker_on_off =
            processedConfig.ticker.sticky_ticker_on_off === true ||
            processedConfig.ticker.sticky_ticker_on_off === "1" ||
            processedConfig.ticker.sticky_ticker_on_off === 1

          // Also set sticky_ticker for UI consistency
          processedConfig.ticker.sticky_ticker = processedConfig.ticker.sticky_ticker_on_off
        } else if ("sticky_ticker" in processedConfig.ticker) {
          processedConfig.ticker.sticky_ticker =
            processedConfig.ticker.sticky_ticker === true ||
            processedConfig.ticker.sticky_ticker === "1" ||
            processedConfig.ticker.sticky_ticker === 1
        }
      }

      // Process nav bars - preserve original API keys
      if (processedConfig.nav && Array.isArray(processedConfig.nav)) {
        processedConfig.nav.forEach((bar: any) => {
          if (bar) {
            // Handle both bar_on_off and show_bar
            if ("bar_on_off" in bar) {
              bar.bar_on_off = bar.bar_on_off === true || bar.bar_on_off === "1" || bar.bar_on_off === 1
              // Also set show_bar for UI consistency
              bar.show_bar = bar.bar_on_off
            } else if ("show_bar" in bar) {
              bar.show_bar = bar.show_bar === true || bar.show_bar === "1" || bar.show_bar === 1
            }

            // Handle sticky_header_on_off and sticky_header
            if ("sticky_header_on_off" in bar) {
              bar.sticky_header_on_off =
                bar.sticky_header_on_off === true || bar.sticky_header_on_off === "1" || bar.sticky_header_on_off === 1
              // Also set sticky_header for UI consistency
              bar.sticky_header = bar.sticky_header_on_off
            } else if ("sticky_header" in bar) {
              bar.sticky_header = bar.sticky_header === true || bar.sticky_header === "1" || bar.sticky_header === 1
            }

            // Handle fixed_header_on_off and transparent_header
            if ("fixed_header_on_off" in bar) {
              bar.fixed_header_on_off =
                bar.fixed_header_on_off === true || bar.fixed_header_on_off === "1" || bar.fixed_header_on_off === 1
              // Also set transparent_header for UI consistency
              bar.transparent_header = bar.fixed_header_on_off
            } else if ("transparent_header" in bar) {
              bar.transparent_header =
                bar.transparent_header === true || bar.transparent_header === "1" || bar.transparent_header === 1
            }

            // Handle container_on_off and container
            if ("container_on_off" in bar) {
              bar.container_on_off =
                bar.container_on_off === true || bar.container_on_off === "1" || bar.container_on_off === 1
              // Also set container for UI consistency
              bar.container = bar.container_on_off
            } else if ("container" in bar) {
              bar.container = bar.container === true || bar.container === "1" || bar.container === 1
            }

            // Handle active_class_on_off and active_link
            if ("active_class_on_off" in bar) {
              bar.active_class_on_off =
                bar.active_class_on_off === true || bar.active_class_on_off === "1" || bar.active_class_on_off === 1
              // Also set active_link for UI consistency
              bar.active_link = bar.active_class_on_off
            } else if ("active_link" in bar) {
              bar.active_link = bar.active_link === true || bar.active_link === "1" || bar.active_link === 1
            }

            if (bar.list && Array.isArray(bar.list)) {
              bar.list.forEach((list: any) => {
                // Ensure list.settings exists
                if (!list.settings) {
                  list.settings = {}
                }

                // Handle list position
                if (list.position && !list.settings.list_position) {
                  list.settings.list_position = list.position
                } else if (list.settings.list_position && !list.position) {
                  list.position = list.settings.list_position
                }

                if (list.items) {
                  // Handle both array and object formats for items
                  const itemsArray = Array.isArray(list.items) ? list.items : Object.values(list.items)

                  itemsArray.forEach((item: any) => {
                    // Ensure item has a name property from setting.item_label if available
                    if (item.setting && item.setting.item_label && !item.name) {
                      item.name = item.setting.item_label
                    } else if (item.name && item.setting && !item.setting.item_label) {
                      item.setting.item_label = item.name
                    }

                    // Handle target_blank and link_target_blank_on_off
                    if (item.setting && "link_target_blank_on_off" in item.setting) {
                      item.setting.link_target_blank_on_off =
                        item.setting.link_target_blank_on_off === true ||
                        item.setting.link_target_blank_on_off === "1" ||
                        item.setting.link_target_blank_on_off === 1

                      // Also set target_blank for UI consistency
                      item.target_blank = item.setting.link_target_blank_on_off
                    } else if ("target_blank" in item) {
                      item.target_blank =
                        item.target_blank === true || item.target_blank === "1" || item.target_blank === 1
                    }

                    // Handle sub_link
                    if ("sub_link" in item) {
                      item.sub_link = item.sub_link === true || item.sub_link === "1" || item.sub_link === 1
                    }

                    // Process sub-links if they exist
                    if (item.sub_settings && typeof item.sub_settings === "object") {
                      // Handle both array and object formats
                      const subLinksArray = Array.isArray(item.sub_settings)
                        ? item.sub_settings
                        : Object.values(item.sub_settings)

                      subLinksArray.forEach((subLink: any) => {
                        if (subLink) {
                          // Handle inner_sub_link_on_off
                          if ("inner_sub_link_on_off" in subLink) {
                            subLink.inner_sub_link_on_off =
                              subLink.inner_sub_link_on_off === true ||
                              subLink.inner_sub_link_on_off === "1" ||
                              subLink.inner_sub_link_on_off === 1
                          }

                          // Process inner sub-links if they exist
                          if (subLink.inner_sub_settings && typeof subLink.inner_sub_settings === "object") {
                            // No boolean conversions needed for inner sub-links currently
                          }
                        }
                      })
                    }
                  })

                  // If list.items was an array, keep it as an array
                  if (Array.isArray(list.items)) {
                    list.items = itemsArray
                  }
                }
              })
            }
          }
        })
      }

      // Use direct assignment instead of functional update to avoid dependency on current state
      setConfig(processedConfig)
    }
  }, [initialConfig]) // Only depend on initialConfig

  // Find the renderItemEditor function and update it to properly handle sub-links

  // Update the renderItemEditor function to handle both API and UI property names
  const renderItemEditor = (bar: BarConfig, list: ListConfig, item: ItemConfig) => {
    const toggleSubLinkFeature = (isOn: boolean) => {
      updateItem(bar.id, list.id, item.id, { sub_link: isOn })
    }

    const toggleSubLink = (subLinkId: string) => {
      setExpandedSections((prev) => ({
        ...prev,
        subLinks: {
          ...prev.subLinks,
          [subLinkId]: !prev.subLinks[subLinkId],
        },
      }))
    }

    switch (item.type) {
      case "logo":
        // Logo editor code remains unchanged
        return (
          <div className="space-y-2">
            <div>
              <Label className="block text-xs font-medium mb-1">Choose Item</Label>
              <Select
                onValueChange={(value) => updateItemProperty(bar.id, list.id, item.id, "type", value)}
                defaultValue={item.type}
              >
                <SelectTrigger className="w-full p-1 text-xs border rounded-md">
                  <SelectValue placeholder="Logo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="logo">Logo</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="cart">Cart</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Paste Logo Link</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_link || item.route || ""}
                onChange={(e) => {
                  // Update both the route and setting.logo_link
                  updateItemProperty(bar.id, list.id, item.id, "route", e.target.value)

                  // Also update the setting.logo_link if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, logo_link: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Logo Width</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_width || item.font_size || "127px"}
                onChange={(e) => {
                  // Update both font_size and setting.logo_width
                  updateItemProperty(bar.id, list.id, item.id, "font_size", e.target.value)

                  // Also update the setting.logo_width if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, logo_width: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="127px"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Logo Margin</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_margin || item.margin || ""}
                onChange={(e) => {
                  // Update both margin and setting.logo_margin
                  updateItemProperty(bar.id, list.id, item.id, "margin", e.target.value)

                  // Also update the setting.logo_margin if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, logo_margin: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="0px 0px 0px 0px"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Logo Padding</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_padding || item.padding || "0px 0px 0px 0px"}
                onChange={(e) => {
                  // Update both padding and setting.logo_padding
                  updateItemProperty(bar.id, list.id, item.id, "padding", e.target.value)

                  // Also update the setting.logo_padding if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, logo_padding: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="0px 0px 0px 0px"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Background Color</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_bg_color || item.background_color || ""}
                onChange={(e) => {
                  // Update both background_color and setting.logo_bg_color
                  updateItemProperty(bar.id, list.id, item.id, "background_color", e.target.value)

                  // Also update the setting.logo_bg_color if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, logo_bg_color: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="Label Color Code"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Logo Border</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_border || item.border || "0px 0px 0px 0px"}
                onChange={(e) => {
                  // Update both border and setting.logo_border
                  updateItemProperty(bar.id, list.id, item.id, "border", e.target.value)

                  // Also update the setting.logo_border if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, logo_border: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="0px 0px 0px 0px"
              />
            </div>

            <button className="text-blue-500 text-xs hover:underline mt-2" onClick={(e) => addItem(bar.id, list.id, e)}>
              Add More Item
            </button>
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <div>
              <Label className="block text-xs font-medium mb-1">Choose Item</Label>
              <Select
                onValueChange={(value) => updateItemProperty(bar.id, list.id, item.id, "type", value)}
                defaultValue={item.type}
              >
                <SelectTrigger className="w-full p-1 text-xs border rounded-md">
                  <SelectValue placeholder={item.type} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="logo">Logo</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="cart">Cart</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Name</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.name || item.setting?.item_label || ""}
                onChange={(e) => {
                  const newValue = e.target.value

                  // First update the name property directly
                  updateItemProperty(bar.id, list.id, item.id, "name", newValue)

                  // Then update the setting.item_label if setting exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, item_label: newValue }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Color</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.item_label_color || item.color || "#000000"}
                onChange={(e) => {
                  // Update both color and setting.item_label_color
                  updateItemProperty(bar.id, list.id, item.id, "color", e.target.value)

                  // Also update the setting.item_label_color if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, item_label_color: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="#000000"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Route</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.item_route || item.route || ""}
                onChange={(e) => {
                  // Update both route and setting.item_route
                  updateItemProperty(bar.id, list.id, item.id, "route", e.target.value)

                  // Also update the setting.item_route if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, item_route: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="/path"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Background Color</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.background_color || item.background_color || ""}
                onChange={(e) => {
                  // Update both background_color and setting.background_color
                  updateItemProperty(bar.id, list.id, item.id, "background_color", e.target.value)

                  // Also update the setting.background_color if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, background_color: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="#ffffff"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Font Size</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.link_font_size || item.font_size || "14px"}
                onChange={(e) => {
                  // Update both font_size and setting.link_font_size
                  updateItemProperty(bar.id, list.id, item.id, "font_size", e.target.value)

                  // Also update the setting.link_font_size if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, link_font_size: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="14px"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Font Weight</Label>
              <Select
                onValueChange={(value) => {
                  // Update both font_weight and setting.link_font_weight
                  updateItem(bar.id, list.id, item.id, { font_weight: value })

                  // Also update the setting.link_font_weight if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, link_font_weight: value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                defaultValue={item.setting?.link_font_weight || item.font_weight || "400"}
              >
                <SelectTrigger className="w-full p-1 text-xs border rounded-md">
                  <SelectValue placeholder={item.setting?.link_font_weight || item.font_weight || "400"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">300</SelectItem>
                  <SelectItem value="400">400</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="600">600</SelectItem>
                  <SelectItem value="700">700</SelectItem>
                  <SelectItem value="800">800</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Padding</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.link_padding || item.padding || ""}
                onChange={(e) => {
                  // Update both padding and setting.link_padding
                  updateItemProperty(bar.id, list.id, item.id, "padding", e.target.value)

                  // Also update the setting.link_padding if it exists
                  if (item.setting) {
                    const updatedSetting = { ...item.setting, link_padding: e.target.value }
                    updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                  }
                }}
                placeholder="0px 0px 0px 0px"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium mb-1">Target Blank</Label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="xs"
                  className={`px-2 py-1 text-xs rounded-l-md ${item.target_blank ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                  onClick={() => {
                    // Update both target_blank and setting.link_target_blank_on_off
                    updateItem(bar.id, list.id, item.id, { target_blank: true })

                    // Also update the setting.link_target_blank_on_off if it exists
                    if (item.setting) {
                      const updatedSetting = { ...item.setting, link_target_blank_on_off: "1" }
                      updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                    }
                  }}
                >
                  On
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className={`px-2 py-1 text-xs rounded-r-md ${!item.target_blank ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                  onClick={() => {
                    // Update both target_blank and setting.link_target_blank_on_off
                    updateItem(bar.id, list.id, item.id, { target_blank: false })

                    // Also update the setting.link_target_blank_on_off if it exists
                    if (item.setting) {
                      const updatedSetting = { ...item.setting, link_target_blank_on_off: "0" }
                      updateItemProperty(bar.id, list.id, item.id, "setting", updatedSetting)
                    }
                  }}
                >
                  Off
                </Button>
              </div>
            </div>

            {/* Sub-link toggle - show for all link items */}
            <div>
              <Label className="block text-xs font-medium mb-1">Sub Link</Label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="xs"
                  className={`px-2 py-1 text-xs rounded-l-md ${item.sub_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                  onClick={() => toggleSubLinkFeature(true)}
                >
                  On
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className={`px-2 py-1 text-xs rounded-r-md ${!item.sub_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                  onClick={() => toggleSubLinkFeature(false)}
                >
                  Off
                </Button>
              </div>
            </div>

            {/* Show sub-link settings if sub_link is enabled */}
            {item.sub_link && (
              <div className="mt-2 border-t pt-2">
                <Label className="block text-xs font-medium mb-1">Sub Links</Label>

                {/* List of sub-links */}
                <div className="space-y-2 ml-2">
                  {(() => {
                    // Get sublinks, handling object format
                    let subLinks = []
                    if (item.sub_settings) {
                      if (typeof item.sub_settings === "object") {
                        // Convert object to array with index as key
                        subLinks = Object.entries(item.sub_settings).map(([key, value]) => ({
                          id: key,
                          ...value,
                        }))
                      }
                    }

                    return subLinks.length > 0 ? (
                      subLinks.map((subLink, subIndex) => (
                        <div key={subLink.id || `sublink-${subIndex}`} className="border rounded-md p-2">
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSubLink(subLink.id)}
                          >
                            <span className="text-xs font-medium">Sub Link - {subLink.id}</span>
                            <ChevronRight
                              className={`h-3 w-3 transition-transform ${
                                expandedSections.subLinks?.[subLink.id || `sublink-${subIndex}`] ? "rotate-90" : ""
                              }`}
                            />
                          </div>

                          {expandedSections.subLinks?.[subLink.id || `sublink-${subIndex}`] && (
                            <div className="space-y-2 mt-2">
                              <div>
                                <Label className="block text-xs font-medium mb-1">Icon Image</Label>
                                <Input
                                  type="text"
                                  className="w-full p-1 text-xs border rounded-md"
                                  value={subLink.sub_link_icon || ""}
                                  onChange={(e) => {
                                    // Update the sub_link_icon in the object format
                                    const updatedSubSettings = { ...item.sub_settings }
                                    updatedSubSettings[subLink.id] = {
                                      ...updatedSubSettings[subLink.id],
                                      sub_link_icon: e.target.value,
                                    }
                                    updateItemProperty(bar.id, list.id, item.id, "sub_settings", updatedSubSettings)
                                  }}
                                  placeholder="Image Url"
                                />
                              </div>

                              <div>
                                <Label className="block text-xs font-medium mb-1">Name</Label>
                                <Input
                                  type="text"
                                  className="w-full p-1 text-xs border rounded-md"
                                  value={subLink.sub_link_label || ""}
                                  onChange={(e) => {
                                    // Update the sub_link_label in the object format
                                    const updatedSubSettings = { ...item.sub_settings }
                                    updatedSubSettings[subLink.id] = {
                                      ...updatedSubSettings[subLink.id],
                                      sub_link_label: e.target.value,
                                    }
                                    updateItemProperty(bar.id, list.id, item.id, "sub_settings", updatedSubSettings)
                                  }}
                                  placeholder="Sub Link Label"
                                />
                              </div>

                              <div>
                                <Label className="block text-xs font-medium mb-1">Route</Label>
                                <Input
                                  type="text"
                                  className="w-full p-1 text-xs border rounded-md"
                                  value={subLink.sub_link_route || ""}
                                  onChange={(e) => {
                                    // Update the sub_link_route in the object format
                                    const updatedSubSettings = { ...item.sub_settings }
                                    updatedSubSettings[subLink.id] = {
                                      ...updatedSubSettings[subLink.id],
                                      sub_link_route: e.target.value,
                                    }
                                    updateItemProperty(bar.id, list.id, item.id, "sub_settings", updatedSubSettings)
                                  }}
                                  placeholder="/menu/item"
                                />
                              </div>

                              {/* Inner Sub Link toggle */}
                              <div>
                                <Label className="block text-xs font-medium mb-1">Inner Sub Link</Label>
                                <div className="flex items-center">
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    className={`px-2 py-1 text-xs rounded-l-md ${
                                      subLink.inner_sub_link_on_off ? "bg-[#d9365e] text-white" : "bg-gray-200"
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      // Update inner_sub_link_on_off to true
                                      const updatedSubSettings = { ...item.sub_settings }
                                      updatedSubSettings[subLink.id] = {
                                        ...updatedSubSettings[subLink.id],
                                        inner_sub_link_on_off: true,
                                      }

                                      // Initialize inner_sub_settings if it doesn't exist
                                      if (!updatedSubSettings[subLink.id].inner_sub_settings) {
                                        updatedSubSettings[subLink.id].inner_sub_settings = {
                                          "0": {
                                            inner_sub_link_label: "Inner Label",
                                            inner_sub_link_route: "Inner Route",
                                          },
                                        }
                                      }

                                      updateItemProperty(bar.id, list.id, item.id, "sub_settings", updatedSubSettings)
                                    }}
                                  >
                                    On
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    className={`px-2 py-1 text-xs rounded-r-md ${
                                      !subLink.inner_sub_link_on_off ? "bg-[#d9365e] text-white" : "bg-gray-200"
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      // Update inner_sub_link_on_off to false
                                      const updatedSubSettings = { ...item.sub_settings }
                                      updatedSubSettings[subLink.id] = {
                                        ...updatedSubSettings[subLink.id],
                                        inner_sub_link_on_off: false,
                                      }
                                      updateItemProperty(bar.id, list.id, item.id, "sub_settings", updatedSubSettings)
                                    }}
                                  >
                                    Off
                                  </Button>
                                </div>
                              </div>

                              {/* Show inner sub-links if enabled */}
                              {subLink.inner_sub_link_on_off && (
                                <div className="mt-2">
                                  {/* List of inner sub-links */}
                                  {(() => {
                                    let innerSubLinks = []
                                    if (subLink.inner_sub_settings) {
                                      if (typeof subLink.inner_sub_settings === "object") {
                                        // Convert object to array with index as key
                                        innerSubLinks = Object.entries(subLink.inner_sub_settings).map(
                                          ([key, value]) => ({
                                            id: key,
                                            ...value,
                                          }),
                                        )
                                      }
                                    }

                                    return innerSubLinks.length > 0 ? (
                                      innerSubLinks.map((innerSubLink, innerIndex) => (
                                        <div
                                          key={innerSubLink.id || `innersublink-${innerIndex}`}
                                          className="border rounded-md p-2 mt-2"
                                        >
                                          <div
                                            className="flex justify-between items-center cursor-pointer"
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              // Toggle this specific inner sublink's expanded state
                                              const innerSubLinkId = innerSubLink.id || `innersublink-${innerIndex}`
                                              setExpandedSections((prev) => ({
                                                ...prev,
                                                innerSubLinks: {
                                                  ...(prev.innerSubLinks || {}),
                                                  [innerSubLinkId]: !prev.innerSubLinks?.[innerSubLinkId],
                                                },
                                              }))
                                            }}
                                          >
                                            <span className="text-xs font-medium text-[#d9365e]">
                                              Inner Sub Link - {innerSubLink.id}
                                            </span>
                                            <ChevronRight
                                              className={`h-3 w-3 transition-transform ${
                                                expandedSections.innerSubLinks?.[
                                                  innerSubLink.id || `innersublink-${innerIndex}`
                                                ]
                                                  ? "rotate-90"
                                                  : ""
                                              }`}
                                            />
                                          </div>

                                          {expandedSections.innerSubLinks?.[
                                            innerSubLink.id || `innersublink-${innerIndex}`
                                          ] && (
                                            <div className="space-y-2 mt-2">
                                              <div>
                                                <Label className="block text-xs font-medium mb-1">Name</Label>
                                                <Input
                                                  type="text"
                                                  className="w-full p-1 text-xs border rounded-md"
                                                  value={innerSubLink.inner_sub_link_label || ""}
                                                  onChange={(e) => {
                                                    // Update the inner_sub_link_label
                                                    const updatedSubSettings = { ...item.sub_settings }
                                                    if (!updatedSubSettings[subLink.id].inner_sub_settings) {
                                                      updatedSubSettings[subLink.id].inner_sub_settings = {}
                                                    }
                                                    updatedSubSettings[subLink.id].inner_sub_settings[innerSubLink.id] =
                                                      {
                                                        ...updatedSubSettings[subLink.id].inner_sub_settings[
                                                          innerSubLink.id
                                                        ],
                                                        inner_sub_link_label: e.target.value,
                                                      }
                                                    updateItemProperty(
                                                      bar.id,
                                                      list.id,
                                                      item.id,
                                                      "sub_settings",
                                                      updatedSubSettings,
                                                    )
                                                  }}
                                                  placeholder="Inner Label"
                                                />
                                              </div>

                                              <div>
                                                <Label className="block text-xs font-medium mb-1">Route</Label>
                                                <Input
                                                  type="text"
                                                  className="w-full p-1 text-xs border rounded-md"
                                                  value={innerSubLink.inner_sub_link_route || ""}
                                                  onChange={(e) => {
                                                    // Update the inner_sub_link_route
                                                    const updatedSubSettings = { ...item.sub_settings }
                                                    if (!updatedSubSettings[subLink.id].inner_sub_settings) {
                                                      updatedSubSettings[subLink.id].inner_sub_settings = {}
                                                    }
                                                    updatedSubSettings[subLink.id].inner_sub_settings[innerSubLink.id] =
                                                      {
                                                        ...updatedSubSettings[subLink.id].inner_sub_settings[
                                                          innerSubLink.id
                                                        ],
                                                        inner_sub_link_route: e.target.value,
                                                      }
                                                    updateItemProperty(
                                                      bar.id,
                                                      list.id,
                                                      item.id,
                                                      "sub_settings",
                                                      updatedSubSettings,
                                                    )
                                                  }}
                                                  placeholder="Inner Route"
                                                />
                                              </div>

                                              <button
                                                className="text-red-500 text-xs hover:underline"
                                                onClick={(e) => {
                                                  e.preventDefault()
                                                  e.stopPropagation()
                                                  // Remove this inner sub-link
                                                  const updatedSubSettings = { ...item.sub_settings }
                                                  if (updatedSubSettings[subLink.id].inner_sub_settings) {
                                                    delete updatedSubSettings[subLink.id].inner_sub_settings[
                                                      innerSubLink.id
                                                    ]
                                                  }
                                                  updateItemProperty(
                                                    bar.id,
                                                    list.id,
                                                    item.id,
                                                    "sub_settings",
                                                    updatedSubSettings,
                                                  )
                                                }}
                                              >
                                                Remove Inner Link
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-xs text-gray-500">No inner sub links added yet</div>
                                    )
                                  })()}

                                  <button
                                    className="text-blue-500 text-xs hover:underline flex items-center mt-2"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      // Add a new inner sub-link
                                      const updatedSubSettings = { ...item.sub_settings }
                                      if (!updatedSubSettings[subLink.id].inner_sub_settings) {
                                        updatedSubSettings[subLink.id].inner_sub_settings = {}
                                      }

                                      const newInnerSubLinkId = Object.keys(
                                        updatedSubSettings[subLink.id].inner_sub_settings || {},
                                      ).length.toString()

                                      updatedSubSettings[subLink.id].inner_sub_settings[newInnerSubLinkId] = {
                                        inner_sub_link_label: "",
                                        inner_sub_link_route: "",
                                      }

                                      updateItemProperty(bar.id, list.id, item.id, "sub_settings", updatedSubSettings)
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Add More Inner Link
                                  </button>
                                </div>
                              )}

                              <button
                                className="text-red-500 text-xs hover:underline"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  // Remove this sub-link
                                  const updatedSubSettings = { ...item.sub_settings }
                                  delete updatedSubSettings[subLink.id]
                                  updateItemProperty(bar.id, list.id, item.id, "sub_settings", updatedSubSettings)
                                }}
                              >
                                Remove Sub Link
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500">No sub links added yet</div>
                    )
                  })()}

                  <button
                    className="text-blue-500 text-xs hover:underline flex items-center"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Add a new sub-link
                      const newSubLinkId = Object.keys(item.sub_settings || {}).length.toString()

                      const updatedSubSettings = {
                        ...(item.sub_settings || {}),
                        [newSubLinkId]: {
                          sub_link_icon: null,
                          sub_link_label: "",
                          sub_link_route: "",
                          inner_sub_link_on_off: false,
                        },
                      }

                      updateItemProperty(bar.id, list.id, item.id, "sub_settings", updatedSubSettings)
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Sub Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  const handleBack = () => {
    // Navigate back to the home page
    window.location.href = "/home"
  }

  // In the transformHeaderConfig function at line ~1160, let's update it to better preserve the exact API structure
  const handleSaveLocal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Create a deep copy of the config to avoid modifying the original
    const saveConfig = JSON.parse(JSON.stringify(config))

    // Convert ticker boolean values back to "0"/"1" strings for API compatibility
    if (saveConfig.ticker) {
      saveConfig.ticker.header_ticker_on_off = saveConfig.ticker.header_ticker_on_off ? "1" : "0"

      // Use sticky_ticker_on_off if it was in the original data
      if ("sticky_ticker_on_off" in saveConfig.ticker || "sticky_ticker_on_off" in initialConfig?.ticker) {
        saveConfig.ticker.sticky_ticker_on_off = saveConfig.ticker.sticky_ticker ? "1" : "0"
      } else if ("sticky_ticker" in saveConfig.ticker) {
        // Just set sticky_ticker in the structure it was originally in
        saveConfig.ticker.sticky_ticker = saveConfig.ticker.sticky_ticker ? "1" : "0"
      }
    }

    // Convert nav bar boolean values back to "0"/"1" strings for API
    if (saveConfig.nav && Array.isArray(saveConfig.nav)) {
      saveConfig.nav.forEach((bar: any) => {
        // Use bar_on_off if it was in the original data
        if ("bar_on_off" in bar || (initialConfig?.nav && initialConfig.nav.some((b) => "bar_on_off" in b))) {
          bar.bar_on_off = bar.show_bar ? "1" : "0"
        } else if ("show_bar" in bar) {
          // Just set show_bar in the structure it was originally in
          bar.show_bar = bar.show_bar ? "1" : "0"
        }

        // Use sticky_header_on_off if it was in the original data
        if (
          "sticky_header_on_off" in bar ||
          (initialConfig?.nav && initialConfig.nav.some((b) => "sticky_header_on_off" in b))
        ) {
          bar.sticky_header_on_off = bar.sticky_header ? "1" : "0"
        } else if ("sticky_header" in bar) {
          // Just set sticky_header in the structure it was originally in
          bar.sticky_header = bar.sticky_header ? "1" : "0"
        }

        // Use fixed_header_on_off if it was in the original data
        if (
          "fixed_header_on_off" in bar ||
          (initialConfig?.nav && initialConfig.nav.some((b) => "fixed_header_on_off" in b))
        ) {
          bar.fixed_header_on_off = bar.transparent_header ? "1" : "0"
        } else if ("transparent_header" in bar) {
          // Just set transparent_header in the structure it was originally in
          bar.transparent_header = bar.transparent_header ? "1" : "0"
        }

        // Use container_on_off if it was in the original data
        if (
          "container_on_off" in bar ||
          (initialConfig?.nav && initialConfig.nav.some((b) => "container_on_off" in b))
        ) {
          bar.container_on_off = bar.container ? "1" : "0"
        } else if ("container" in bar) {
          // Just set container in the structure it was originally in
          bar.container = bar.container ? "1" : "0"
        }

        // Use active_class_on_off if it was in the original data
        if (
          "active_class_on_off" in bar ||
          (initialConfig?.nav && initialConfig.nav.some((b) => "active_class_on_off" in b))
        ) {
          bar.active_class_on_off = bar.active_link ? "1" : "0"
        } else if ("active_link" in bar) {
          // Just set active_link in the structure it was originally in
          bar.active_link = bar.active_link ? "1" : "0"
        }

        if (bar.list && Array.isArray(bar.list)) {
          bar.list.forEach((list: any) => {
            // Preserve list structure - don't force any changes to list.position vs list.settings.list_position
            // Just ensure both are set if either exists
            if (list.position && !list.settings?.list_position) {
              if (!list.settings) list.settings = {}
              list.settings.list_position = list.position
            } else if (list.settings?.list_position && !list.position) {
              list.position = list.settings.list_position
            }

            // Preserve the original structure of items (array or object)
            if (list.items) {
              const processItems = (items: any) => {
                // Handle both array format and object format
                const isArrayFormat = Array.isArray(items)
                const entries = isArrayFormat ? items.map((item, i) => [i, item]) : Object.entries(items)

                entries.forEach(([key, item]: [string | number, any]) => {
                  // Ensure item has name and setting.item_label aligned
                  if (item.name && item.setting && !item.setting.item_label) {
                    item.setting.item_label = item.name
                  } else if (item.setting?.item_label && !item.name) {
                    item.name = item.setting.item_label
                  }

                  // Handle target_blank vs link_target_blank_on_off
                  if (item.setting && ("link_target_blank_on_off" in item.setting || "target_blank" in item)) {
                    const targetBlankValue = item.target_blank ? "1" : "0"
                    if ("link_target_blank_on_off" in item.setting) {
                      item.setting.link_target_blank_on_off = targetBlankValue
                    }
                    if ("target_blank" in item) {
                      item.target_blank = targetBlankValue
                    }
                  }

                  // Handle sub_link
                  if ("sub_link" in item) {
                    item.sub_link = item.sub_link ? "1" : "0"
                  }

                  // Process sub-links - preserve structure (array or object)
                  if (item.sub_settings) {
                    const isSubArray = Array.isArray(item.sub_settings)
                    const subEntries = isSubArray
                      ? item.sub_settings.map((subLink: any, i: number) => [i, subLink])
                      : Object.entries(item.sub_settings)

                    subEntries.forEach(([subKey, subLink]: [string | number, any]) => {
                      if (subLink && "inner_sub_link_on_off" in subLink) {
                        subLink.inner_sub_link_on_off = subLink.inner_sub_link_on_off ? "1" : "0"
                      }

                      // Process inner sub-links too
                      if (subLink?.inner_sub_settings) {
                        const isInnerSubArray = Array.isArray(subLink.inner_sub_settings)
                        // No boolean conversions needed for inner sub-links currently,
                        // but we could add them here if needed
                      }
                    })

                    // Don't convert the structure - preserve array or object format
                  }
                })

                return items
              }

              // Process the items while preserving their original structure
              list.items = processItems(list.items)
            }
          })
        }
      })
    }

    // Log the changes to console
    console.log("Changes to be saved:", saveConfig)

    // Call the save function directly with the current config
    onSave(e)
  }

  // Add this useEffect to notify parent of changes after render
  const shouldNotifyParentRef = useRef(false)

  // Update config when it changes
  useEffect(() => {
    // Skip the first render
    if (!shouldNotifyParentRef.current) {
      shouldNotifyParentRef.current = true
      return
    }

    // Notify parent component of changes, but not on the initial render
    onConfigChange(config)
  }, [config, onConfigChange])

  return (
    <div className="w-64 border-r bg-white overflow-y-auto">
      <div className="p-4">
        <Button
          variant="destructive"
          size="sm"
          className="mb-4 rounded-md px-4 py-1 h-auto bg-[#e1416f] hover:bg-[#c02e53] flex items-center"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {saveSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">Header settings saved successfully.</AlertDescription>
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
          {/* Ticker Section */}
          <div className="border rounded-md overflow-hidden shadow-sm">
            <div
              className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => toggleSection("ticker")}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-600">📋</span>
                <span className="font-medium">Ticker</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.ticker ? "rotate-90" : ""}`} />
            </div>

            {expandedSections.ticker && (
              <div className="p-3 border-t">
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium mb-1 text-gray-700">Show Ticker</Label>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="xs"
                        className={`px-3 py-1 text-xs rounded-l-md border border-r-0 ${
                          config.ticker.header_ticker_on_off
                            ? "bg-[#d9365e] text-white border-[#d9365e]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          updateTickerProperty("header_ticker_on_off", true)
                        }}
                      >
                        On
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        className={`px-3 py-1 text-xs rounded-r-md border ${
                          !config.ticker.header_ticker_on_off
                            ? "bg-[#d9365e] text-white border-[#d9365e]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          updateTickerProperty("header_ticker_on_off", false)
                        }}
                      >
                        Off
                      </Button>
                    </div>
                  </div>

                  {/* Only show these fields if header_ticker_on_off is true */}
                  {config.ticker.header_ticker_on_off && (
                    <>
                      <div>
                        <Label className="block text-sm font-medium mb-1 text-gray-700">Sticky Ticker</Label>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="xs"
                            className={`px-3 py-1 text-xs rounded-l-md border border-r-0 ${
                              config.ticker.sticky_ticker
                                ? "bg-[#d9365e] text-white border-[#d9365e]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              updateTickerProperty("sticky_ticker", true)
                            }}
                          >
                            On
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            className={`px-3 py-1 text-xs rounded-r-md border ${
                              !config.ticker.sticky_ticker
                                ? "bg-[#d9365e] text-white border-[#d9365e]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              updateTickerProperty("sticky_ticker", false)
                            }}
                          >
                            Off
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="block text-sm font-medium mb-1 text-gray-700">Background Color</Label>
                        <Input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-[#d9365e] focus:border-[#d9365e] outline-none"
                          value={config.ticker.ticker_bg_color}
                          onChange={(e) => updateTickerProperty("ticker_bg_color", e.target.value)}
                          placeholder="#000000"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div>
                        <Label className="block text-sm font-medium mb-1 text-gray-700">Font Color</Label>
                        <Input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-[#d9365e] focus:border-[#d9365e] outline-none"
                          value={config.ticker.ticker_font_color}
                          onChange={(e) => updateTickerProperty("ticker_font_color", e.target.value)}
                          placeholder="#ffffff"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div>
                        <Label className="block text-sm font-medium mb-1 text-gray-700">Text</Label>
                        <Input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md min-h-[60px] focus:ring-1 focus:ring-[#d9365e] focus:border-[#d9365e] outline-none"
                          value={config.ticker.header_ticker_text}
                          onChange={(e) => updateTickerProperty("header_ticker_text", e.target.value)}
                          placeholder="Enter ticker text here..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bars Sections */}
          {config.nav.map((bar, barIndex) => (
            <div key={bar.id} className="border rounded-md overflow-hidden shadow-sm">
              <div
                className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleSection("bar", bar.id)
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">📋</span>
                  <span className="font-medium">Bar - {barIndex}</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${expandedSections.bars[bar.id] ? "rotate-90" : ""}`}
                />
              </div>

              {expandedSections.bars[bar.id] && (
                <div className="p-3 border-t">
                  <div className="space-y-3">
                    <div>
                      <Label className="block text-sm font-medium mb-1">Show Bar</Label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-l-md ${bar.show_bar ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = true
                            updateBarProperty(bar.id, "show_bar", updatedValue)
                            // Also update bar_on_off for API compatibility
                            updateBarProperty(bar.id, "bar_on_off", updatedValue)
                          }}
                        >
                          On
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-r-md ${!bar.show_bar ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = false
                            updateBarProperty(bar.id, "show_bar", updatedValue)
                            // Also update bar_on_off for API compatibility
                            updateBarProperty(bar.id, "bar_on_off", updatedValue)
                          }}
                        >
                          Off
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Sticky Header</Label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-l-md ${bar.sticky_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = true
                            updateBarProperty(bar.id, "sticky_header", updatedValue)
                            // Also update sticky_header_on_off for API compatibility
                            if ("sticky_header_on_off" in bar) {
                              updateBarProperty(bar.id, "sticky_header_on_off", updatedValue)
                            }
                          }}
                        >
                          On
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-r-md ${!bar.sticky_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = false
                            updateBarProperty(bar.id, "sticky_header", updatedValue)
                            // Also update sticky_header_on_off for API compatibility
                            if ("sticky_header_on_off" in bar) {
                              updateBarProperty(bar.id, "sticky_header_on_off", updatedValue)
                            }
                          }}
                        >
                          Off
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Transparent Header</Label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-l-md ${bar.transparent_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = true
                            updateBarProperty(bar.id, "transparent_header", updatedValue)
                            // Also update related properties for API compatibility
                            if ("fixed_header_on_off" in bar) {
                              updateBarProperty(bar.id, "fixed_header_on_off", updatedValue)
                            }
                            if ("transparent_header_on_off" in bar) {
                              updateBarProperty(bar.id, "transparent_header_on_off", updatedValue)
                            }
                          }}
                        >
                          On
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-r-md ${!bar.transparent_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = false
                            updateBarProperty(bar.id, "transparent_header", updatedValue)
                            // Also update related properties for API compatibility
                            if ("fixed_header_on_off" in bar) {
                              updateBarProperty(bar.id, "fixed_header_on_off", updatedValue)
                            }
                            if ("transparent_header_on_off" in bar) {
                              updateBarProperty(bar.id, "transparent_header_on_off", updatedValue)
                            }
                          }}
                        >
                          Off
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Container</Label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-l-md ${bar.container ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = true
                            updateBarProperty(bar.id, "container", updatedValue)
                            // Also update container_on_off for API compatibility
                            if ("container_on_off" in bar) {
                              updateBarProperty(bar.id, "container_on_off", updatedValue)
                            }
                          }}
                        >
                          On
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-r-md ${!bar.container ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = false
                            updateBarProperty(bar.id, "container", updatedValue)
                            // Also update container_on_off for API compatibility
                            if ("container_on_off" in bar) {
                              updateBarProperty(bar.id, "container_on_off", updatedValue)
                            }
                          }}
                        >
                          Off
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Active Link</Label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-l-md ${bar.active_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = true
                            updateBarProperty(bar.id, "active_link", updatedValue)
                            // Also update active_class_on_off for API compatibility
                            if ("active_class_on_off" in bar) {
                              updateBarProperty(bar.id, "active_class_on_off", updatedValue)
                            }
                          }}
                        >
                          On
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs rounded-r-md ${!bar.active_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const updatedValue = false
                            updateBarProperty(bar.id, "active_link", updatedValue)
                            // Also update active_class_on_off for API compatibility
                            if ("active_class_on_off" in bar) {
                              updateBarProperty(bar.id, "active_class_on_off", updatedValue)
                            }
                          }}
                        >
                          Off
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Height</Label>
                      <Input
                        type="text"
                        className="w-full p-1 text-sm border rounded-md"
                        value={bar.height}
                        onChange={(e) => updateBarProperty(bar.id, "height", e.target.value)}
                        placeholder="Height in Px"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Border Top</Label>
                      <Input
                        type="text"
                        className="w-full p-1 text-sm border rounded-md"
                        value={bar.border_top}
                        onChange={(e) => updateBarProperty(bar.id, "border_top", e.target.value)}
                        placeholder="Border (1px solid)"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Border Bottom</Label>
                      <Input
                        type="text"
                        className="w-full p-1 text-sm border rounded-md"
                        value={bar.border_bottom}
                        onChange={(e) => updateBarProperty(bar.id, "border_bottom", e.target.value)}
                        placeholder="Border (1px solid)"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Margin</Label>
                      <Input
                        type="text"
                        className="w-full p-1 text-sm border rounded-md"
                        value={bar.margin}
                        onChange={(e) => updateBarProperty(bar.id, "margin", e.target.value)}
                        placeholder="0px 0px 0px 0px"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Padding</Label>
                      <Input
                        type="text"
                        className="w-full p-1 text-sm border rounded-md"
                        value={bar.padding}
                        onChange={(e) => updateBarProperty(bar.id, "padding", e.target.value)}
                        placeholder="20px 0 0px"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Background Color</Label>
                      <Input
                        type="text"
                        className="w-full p-1 text-sm border rounded-md"
                        value={bar.bar_background_color}
                        onChange={(e) => updateBarProperty(bar.id, "bar_background_color", e.target.value)}
                        placeholder="#4e2e0b"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Lists within this bar */}
                    {bar.list.map((list, listIndex) => (
                      <div key={list.id} className="mt-2">
                        <div
                          className="flex items-center justify-between px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer rounded-md"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleSection("list", list.id)
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">📋</span>
                            <span className="font-medium text-sm">List - {listIndex}</span>
                          </div>
                          <ChevronRight
                            className={`h-3 w-3 transition-transform ${expandedSections.lists[list.id] ? "rotate-90" : ""}`}
                          />
                        </div>

                        {expandedSections.lists[list.id] && (
                          <div className="p-2 border-t border-gray-200 mt-1">
                            <div className="space-y-2">
                              <div>
                                <Label className="block text-xs font-medium mb-1 text-gray-700 font-semibold">
                                  Position
                                </Label>
                                <Select
                                  value={list.settings?.list_position || "left"}
                                  onValueChange={(value) => {
                                    // Update the nested settings.list_position property
                                    const updatedSettings = { ...(list.settings || {}), list_position: value }
                                    updateListProperty(bar.id, list.id, "settings", updatedSettings)
                                  }}
                                >
                                  <SelectTrigger
                                    className="w-full p-1 text-xs border rounded-md border-gray-300"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <SelectValue>{list.settings?.list_position || "left"}</SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Items within this list */}
                              {list.items.map((item, itemIndex) => (
                                <div key={item.id} className="mt-2">
                                  <div
                                    className="flex items-center justify-between px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer rounded-md"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      toggleSection("item", item.id)
                                    }}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-600">📋</span>
                                      <span className="font-medium text-xs">Item - {itemIndex}</span>
                                    </div>
                                    <ChevronRight
                                      className={`h-3 w-3 transition-transform ${expandedSections.items[item.id] ? "rotate-90" : ""}`}
                                    />
                                  </div>

                                  {expandedSections.items[item.id] && (
                                    <div className="p-2 border-t border-gray-200 mt-1">
                                      {renderItemEditor(bar, list, item)}
                                      <button
                                        className="text-red-500 text-xs hover:underline mt-2 block"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          removeItem(bar.id, list.id, item.id, e)
                                        }}
                                      >
                                        Remove Item
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {list.items.length === 0 && (
                                <button
                                  className="text-blue-500 text-xs hover:underline mt-2 block"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    addItem(bar.id, list.id, e)
                                  }}
                                >
                                  Add More Item
                                </button>
                              )}

                              <button
                                className="text-red-500 text-xs hover:underline mt-2 block"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  removeList(bar.id, list.id, e)
                                }}
                              >
                                Remove List
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      className="text-blue-500 text-xs hover:underline mt-2 flex items-center"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addList(bar.id, e)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add More List
                    </button>

                    <button
                      className="text-red-500 text-xs hover:underline mt-2 block"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeBar(bar.id, e)
                      }}
                    >
                      Remove Bar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            className="text-blue-500 text-sm hover:underline py-2 flex items-center justify-center w-full border border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors"
            onClick={addBar}
          >
            <Plus className="h-4 w-4 mr-1" /> Add More
          </button>

          <div className="pt-4">
            <Button
              className="w-full bg-[#e1416f] hover:bg-[#c02e53] text-white font-medium py-2 rounded-md transition-colors"
              onClick={handleSaveLocal}
              disabled={isSavingState}
            >
              {isSavingState ? "Saving..." : "SAVE"}
            </Button>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full text-[#d9365e] border-[#d9365e] hover:bg-[#d9365e]/10 font-medium py-2 rounded-md transition-colors"
            >
              header save as theme
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
