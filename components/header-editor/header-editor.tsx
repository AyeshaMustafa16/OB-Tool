"use client"

import { useState, useEffect } from "react"
import type { HeaderConfig } from "@/lib/header-types"
import { ChevronRight, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeaderPreview from "./header-preview"
import TickerEditor from "./ticker-editor"
import BarEditor from "./bar-editor"
import ListEditor from "./list-editor"
import ItemEditor from "./item-editor"
import { v4 as uuidv4 } from "uuid"
import { useSettings } from "@/contexts/settings-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface HeaderEditorProps {
  initialConfig: HeaderConfig
  brandLogo?: string | null
  brandName: string
}

export default function HeaderEditor({ initialConfig, brandLogo, brandName }: HeaderEditorProps) {
  const { settings, setActiveClass, refreshSettings } = useSettings()
  const [config, setConfig] = useState<HeaderConfig>(initialConfig)
  const [activeSection, setActiveSection] = useState<string>("ticker")
  const [activeBar, setActiveBar] = useState<string | null>(initialConfig.nav[0]?.id || null)
  const [activeList, setActiveList] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeBarId, setActiveBarId] = useState<string | null>(initialConfig.nav[0]?.id || null)
  \
  const [activeListId, setActiveListId] = useState<string | null>(null)
  )

  // Set active class for header section
  useEffect(() =>
  {
    // Only set active class once
    const timer = setTimeout(() => {
      setActiveClass("header")
    }, 300)

    return () => clearTimeout(timer)
  }
  , [setActiveClass])

  // Use settings from context if available
  const displayName = settings.business_info?.name || brandName
  const displayLogo = settings.business_logo || brandLogo

  // If settings contain header configuration, use it
  useEffect(() => {
    if (settings.settings && settings.settings.header && !isSaving) {
      setConfig(settings.settings.header)
    }
  }, [settings.settings, isSaving])

  const toggleSection = (section: string, id?: string, parentId?: string) => {
    if (section === "ticker") {
      setExpandedSections((prev) => ({
        ...prev,
        ticker: !prev.ticker,
      }))
      )
      setActiveSection("ticker")
    } else if (section === "bar" && id) {
      setExpandedSections((prev) => ({
        ...prev,
        bars: {
          ...prev.bars,
          [id]: !prev.bars[id],
        },
      }))
      )
      setActiveSection("bar")
      setActiveBar(id)
    } else if (section === "list" && id && parentId) {
      setExpandedSections((prev) => ({
        ...prev,
        lists: {
          ...prev.lists,
          [id]: !prev.lists[id],
        },
      }))
      )
      setActiveSection("list")
      setActiveBar(parentId)
      setActiveList(id)
    } else if (section === "item" && id && parentId) {
      setActiveSection("item")
      setActiveItem(id)
    }
  }

  const updateTicker = (tickerConfig: any) => {
    setConfig((prev) => ({
      ...prev,
      ticker: {
        ...prev.ticker,
        ...tickerConfig,
      },
    }))
    )
  }

  const updateBar = (barId: string, barConfig: any) => {
    setConfig((prev) => ({
      ...prev,
      nav: prev.nav.map((bar) => (bar.id === barId ? { ...bar, ...barConfig } : bar)),
    }))
    )
  }

  const updateList = (barId: string, listId: string, listConfig: any) => {
    setConfig((prev) => ({
      ...prev,
      nav: prev.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: bar.list.map((list) => (list.id === listId ? { ...list, ...listConfig } : list)),
            }
          : bar,
      ),
    }))
    )
  }

  const updateItem = (barId: string, listId: string, itemId: string, itemConfig: any) => {
    setConfig((prev) => ({
      ...prev,
      nav: prev.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: bar.list.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      items: list.items.map((item) => (item.id === itemId ? { ...item, ...itemConfig } : item)),
                    }
                  : list,
              ),
            }
          : bar,
      ),
    }))
    )
  }

  const addBar = () => {
    const newBar = {
      id: `bar-${config.nav.length}`,
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
          id: `list-0`,
          position: "left" as const,
          items: [],
        },
      ],
    }

    setConfig((prev) => ({
      ...prev,
      nav: [...prev.nav, newBar],
    }))
    )

    setActiveBar(newBar.id)
    setActiveSection("bar")
  }

  const removeBar = (barId: string) => {
    setConfig((prev) => ({
      ...prev,
      nav: prev.nav.filter((bar) => bar.id !== barId),
    }))
    )

    if (activeBar === barId) {
      setActiveBar(config.nav[0]?.id || null)
      setActiveList(null)
      setActiveItem(null)
    }
  }

  const addList = (barId: string) => {
    const newList = {
      id: `list-${uuidv4()}`,
      position: "left" as const,
      items: [],
    }

    setConfig((prev) => ({
      ...prev,
      nav: prev.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: [...bar.list, newList],
            }
          : bar,
      ),
    }))
    )

    setActiveList(newList.id)
  }

  const removeList = (barId: string, listId: string) => {
    setConfig((prev) => ({
      ...prev,
      nav: prev.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: bar.list.filter((list) => list.id !== listId),
            }
          : bar,
      ),
    }))
    )

    if (activeList === listId) {
      setActiveList(null)
      setActiveItem(null)
    }
  }

  const addItem = (barId: string, listId: string) => {
    const newItem = {
      id: `item-${uuidv4()}`,
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
    }

    setConfig((prev) => ({
      ...prev,
      nav: prev.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: bar.list.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      items: [...list.items, newItem],
                    }
                  : list,
              ),
            }
          : bar,
      ),
    }))
    )

    setActiveItem(newItem.id)
  }

  const removeItem = (barId: string, listId: string, itemId: string) => {
    setConfig((prev) => ({
      ...prev,
      nav: prev.nav.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              list: bar.list.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      items: list.items.filter((item) => item.id !== itemId),
                    }
                  : list,
              ),
            }
          : bar,
      ),
    }))
    )

    if (activeItem === itemId) {
      setActiveItem(null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Here you would save the configuration to your API
      const brandId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("brandId="))
        ?.split("=")[1]

      if (!brandId) {
        throw new Error("No brand ID found")
      }

      const url = "https://tossdown.site/api/save_header_settings"
      const formData = new URLSearchParams()
      formData.append("brand_id", brandId)
      formData.append("header_settings", JSON.stringify(config))

      // Use fetch with retry logic for saving
      let retries = 3
      let backoff = 500
      let success = false

      while (retries > 0 && !success) {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          })
          )

          if (response.ok) {
            success = true
          } else if (response.status === 429) {
            // Rate limited, wait and retry
            console.log(`Rate limited. Retrying in ${backoff}ms...`)
            await new Promise((resolve) => setTimeout(resolve, backoff))
            backoff *= 2
            retries--
          } else {
            throw new Error(`Failed to save settings: ${response.status}`)
          }
        } catch (error) {
          if (retries > 1) {
            console.log(`Request failed. Retrying in ${backoff}ms...`)
            await new Promise((resolve) => setTimeout(resolve, backoff))
            backoff *= 2
            retries--
          } else {
            throw error
          }
        }
      }

      if (!success) {
        throw new Error("Failed to save after multiple retries")
      }

      console.log("Saved configuration:", config)
      setSaveSuccess(true)

      // Refresh settings after save
      setTimeout(() => {
        refreshSettings().catch((err) => console.error("Failed to refresh settings after save:", err))
      }, 1000)
    } catch (error) {
      console.error("Error saving configuration:", error)
      setSaveError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    // Navigate back to previous page
    window.history.back()
  }

  return (
    <div className="flex h-screen">
      {/* Left sidebar - Editor controls */}
      <div className="w-64 border-r bg-white overflow-y-auto">
        <div className="p-4">
          <Button
            variant="destructive"
            size="sm"
            className="mb-6 rounded-md px-4 py-1 h-auto bg-[#d9365e]"
            onClick={handleBack}
          >
            Back
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

          <div className="space-y-2">
            {/* Ticker Section */}
            <div className="border-b pb-2">
              <button onClick={() => toggleSection("ticker")} className="flex items-center w-full text-left py-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📋</span>
                  <span className="font-medium">Ticker</span>
                </div>
                <ChevronRight
                  className={`ml-auto h-4 w-4 transition-transform ${expandedSections.ticker ? "rotate-90" : ""}`}
                />
              </button>

              {expandedSections.ticker && (
                <div className="pl-6 py-2">
                  <TickerEditor ticker={config.ticker} updateTicker={updateTicker} />
                </div>
              )}
            </div>

            {/* Bars Sections */}
            {config.nav.map((bar, barIndex) => (
              <div key={bar.id} className="border-b pb-2">
                <button
                  onClick={() => toggleSection("bar", bar.id)}
                  className="flex items-center w-full text-left py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📋</span>
                    <span className="font-medium">Bar - {barIndex}</span>
                  </div>
                  <ChevronRight
                    className={`ml-auto h-4 w-4 transition-transform ${expandedSections.bars[bar.id] ? "rotate-90" : ""}`}
                  />
                </button>

                {expandedSections.bars[bar.id] && (
                  <div className="pl-6 py-2">
                    <BarEditor bar={bar} updateBar={(barConfig) => updateBar(bar.id, barConfig)} />

                    {/* Lists within this bar */}
                    <div className="mt-3 space-y-2">
                      <div className="font-medium text-sm">Lists</div>
                      {bar.list.map((list, listIndex) => (
                        <div key={list.id} className="border-l-2 border-gray-200 pl-2">
                          <button
                            onClick={() => toggleSection("list", list.id, bar.id)}
                            className="flex items-center w-full text-left py-1 text-sm"
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-blue-500">📋</span>
                              <span className="font-medium text-blue-500">List - {listIndex}</span>
                            </div>
                            <ChevronRight
                              className={`ml-auto h-3 w-3 transition-transform ${expandedSections.lists[list.id] ? "rotate-90" : ""}`}
                            />
                          </button>

                          {expandedSections.lists[list.id] && (
                            <div className="pl-4 py-1">
                              <ListEditor
                                list={list}
                                updateList={(listConfig) => updateList(bar.id, list.id, listConfig)}
                              />

                              {/* Items within this list */}
                              <div className="mt-2 space-y-1">
                                <div className="font-medium text-xs">Items</div>
                                {list.items && Array.isArray(list.items) ? (
                                  list.items.map((item, itemIndex) => (
                                    <div key={item.id} className="border-l-2 border-gray-200 pl-2">
                                      <button
                                        onClick={() => toggleSection("item", item.id, list.id)}
                                        className="flex items-center w-full text-left py-1 text-xs"
                                      >
                                        <div className="flex items-center gap-1">
                                          <span className="text-green-500">📝</span>
                                          <span className="font-medium text-green-500">
                                            {item.type} - {itemIndex}
                                          </span>
                                        </div>
                                      </button>

                                      {activeItem === item.id && activeSection === "item" && (
                                        <div className="pl-3 py-1">
                                          <ItemEditor
                                            item={item}
                                            updateItem={(itemConfig) =>
                                              updateItem(bar.id, list.id, item.id, itemConfig)
                                            }
                                          />
                                          <button
                                            className="text-red-500 text-xs hover:underline mt-1"
                                            onClick={() => removeItem(bar.id, list.id, item.id)}
                                          >
                                            Remove item
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-gray-500">No items found</div>
                                )}
                                <button
                                  className="text-blue-500 text-xs hover:underline py-1"
                                  onClick={() => addItem(bar.id, list.id)}
                                >
                                  Add More Item
                                </button>
                              </div>

                              <button
                                className="text-red-500 text-xs hover:underline mt-1"
                                onClick={() => removeList(bar.id, list.id)}
                              >
                                Remove list
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button className="text-blue-500 text-xs hover:underline py-1" onClick={() => addList(bar.id)}>
                        Add More List
                      </button>
                    </div>

                    <button className="text-red-500 text-sm hover:underline mt-2" onClick={() => removeBar(bar.id)}>
                      Remove bar
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button className="text-blue-500 text-sm hover:underline py-2 flex items-center" onClick={addBar}>
              <Plus className="h-3 w-3 mr-1" />
              Add More
            </button>

            <div className="pt-4">
              <Button className="w-full bg-[#d9365e] hover:bg-[#c02e53]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>

            <div className="pt-2">
              <Button variant="outline" className="w-full text-[#d9365e] border-[#d9365e]">
                header save as theme
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Preview */}
      <div className="flex-1 bg-gray-50 p-4">
        <div className="bg-white rounded-md overflow-hidden border">
          <HeaderPreview config={config} brandLogo={displayLogo} brandName={displayName} />
        </div>
      </div>
    </div>
  )
}
