"use client"

import { useState, useEffect, useCallback } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Loader2, AlertCircle, Plus, Save, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RichTextEditor } from "@/components/rich-text-editor"
import { XIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { fetchProducts, fetchCategories, fetchBrands, fetchFeaturedProducts } from "@/lib/api"
import { purgeCache } from "@/lib/purge-cache"

export default function HomeSectionsPage() {
  const { settings, refreshSettings, setActiveClass } = useSettings()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [apiErrors, setApiErrors] = useState<string[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false)
  const [sectionCounter, setSectionCounter] = useState(0)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [availableCategories, setAvailableCategories] = useState<any[]>([])
  const [availableBrands, setAvailableBrands] = useState<any[]>([])
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Refs for popovers
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  // Debug state to track changes
  const [debugLastUpdate, setDebugLastUpdate] = useState<string>("")

  useEffect(() => {
    const init = async () => {
      console.log("Home Sections page initialization started")
      setActiveClass("home_sections")

      // Check if user is authenticated using localStorage
      const brandId = localStorage.getItem("brandId")
      console.log("Brand ID from localStorage:", brandId)

      setIsAuthenticated(!!brandId)

      if (!brandId) {
        console.log("User not authenticated, skipping settings refresh")
        setError("You are not logged in. Please log in to access all features.")
        setIsLoading(false)
        return
      }

      try {
        console.log("Starting to refresh settings for home_sections")
        await refreshSettings()
        console.log("Settings refreshed successfully")

        // We'll handle data loading in the second useEffect
      } catch (error) {
        console.error("Failed to refresh settings:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setError("Failed to load settings. Please try logging in again.")

        // Check for CORS errors
        if (errorMessage.includes("CORS")) {
          setApiErrors((prev) => [...prev, errorMessage])
        }

        // Set loading to false if there's an error
        setIsLoading(false)
      }
    }

    // Only run init once when the component mounts
    if (isLoading) {
      init()
    }
  }, [isLoading, refreshSettings, setActiveClass])

  // Extract sections and products/categories/brands from settings when they're loaded
  useEffect(() => {
    console.log("Settings data changed useEffect triggered", {
      hasBusinessInfo: !!settings?.business_info,
      hasWebTheme: !!settings?.business_info?.web_theme,
      productsDataType: settings?.products ? typeof settings.products : "undefined",
      hasProducts: !!settings?.products,
      hasProductsArray: settings?.products?.products ? settings.products.products.length : 0,
      hasCategories: !!settings?.featured_categories,
      categoriesLength: settings?.featured_categories ? settings.featured_categories.length : 0,
      hasBrands: !!settings?.featured_brands,
      brandsLength: settings?.featured_brands ? settings.featured_brands.length : 0,
      currentDataLoadedState: dataLoaded,
    })

    // First, check if we have the business info and can extract sections
    if (settings?.business_info?.web_theme) {
      try {
        const webTheme =
          typeof settings.business_info.web_theme === "string"
            ? JSON.parse(settings.business_info.web_theme)
            : settings.business_info.web_theme

        if (webTheme?.home?.sections) {
          // Convert to array if it's an object
          const sectionsArray = Array.isArray(webTheme.home.sections)
            ? webTheme.home.sections
            : Object.values(webTheme.home.sections)

          // Ensure all arrays are properly initialized
          const processedSections = sectionsArray.map((section) => {
            // Force status to be a number
            section.status = section.status === 1 || section.status === "1" ? 1 : 0

            // Initialize arrays if they don't exist
            if (section.type === "featured" && !section.featured_items) {
              section.featured_items = []
            }
            if ((section.type === "category" || section.type === "brand") && !section.featured_ids) {
              section.featured_ids = []
            }
            return section
          })

          setSections(processedSections)
          console.log("Loaded sections:", processedSections.length)

          // Set the section counter to be higher than any existing section key
          const highestKey = processedSections.reduce((max, section, index) => {
            const key = section.key || index
            return Math.max(max, typeof key === "number" ? key : Number.parseInt(key) || 0)
          }, 0)

          setSectionCounter(highestKey + 1)
        }
      } catch (error) {
        console.error("Error parsing web theme:", error)
      }
    }

    // Now check for products, categories, and brands data
    let productsLoaded = false
    let categoriesLoaded = false
    let brandsLoaded = false

    // Check for products data
    if (settings?.products?.products) {
      setAvailableProducts(settings.products.products)
      console.log("Products loaded:", settings.products.products.length)
      productsLoaded = true
    } else if (settings?.products) {
      // Try to find products in a different location in the settings object
      const productsArray = Array.isArray(settings.products) ? settings.products : []
      setAvailableProducts(productsArray)
      console.log("Products loaded from alternate location:", productsArray.length)
      productsLoaded = true
    }

    // Check for categories data
    if (settings?.featured_categories) {
      setAvailableCategories(settings.featured_categories)
      console.log("Categories loaded:", settings.featured_categories.length)
      categoriesLoaded = true
    }

    // Check for brands data
    if (settings?.featured_brands) {
      setAvailableBrands(settings.featured_brands)
      console.log("Brands loaded:", settings.featured_brands.length)
      brandsLoaded = true
    }

    // Only set dataLoaded to true when all data is available
    if (productsLoaded && categoriesLoaded && brandsLoaded) {
      console.log("All data loaded successfully - rendering page")
      setDataLoaded(true)
      setIsLoading(false)
    } else {
      console.log("Still waiting for data:", { productsLoaded, categoriesLoaded, brandsLoaded })

      // If we have business info but missing some data, check if we need to manually fetch it
      if (settings?.business_info?.res_id && !dataLoaded && !settings.isLoading) {
        const businessId = settings.business_info.res_id
        console.log(
          "Business info available but missing some data. Manually fetching data for business ID:",
          businessId,
        )

        // Only trigger this once to avoid infinite loops
        const manuallyFetchData = async () => {
          try {
            console.log("Manually fetching products, categories, brands, and featured products")

            const [products, categories, brands, featuredProducts] = await Promise.allSettled([
              fetchProducts(businessId),
              fetchCategories(businessId),
              fetchBrands(businessId),
              fetchFeaturedProducts(businessId),
            ])

            console.log("Manual API fetch results:", {
              productsStatus: products.status,
              categoriesStatus: categories.status,
              brandsStatus: brands.status,
              featuredProductsStatus: featuredProducts.status,
            })

            // Update state with the results
            if (products.status === "fulfilled" && products.value) {
              setAvailableProducts(products.value.products || [])
              productsLoaded = true
            }

            if (categories.status === "fulfilled" && categories.value && categories.value.result) {
              setAvailableCategories(categories.value.result)
              categoriesLoaded = true
            }

            if (brands.status === "fulfilled" && brands.value && brands.value.result) {
              setAvailableBrands(brands.value.result)
              brandsLoaded = true
            }

            // Set data loaded if we have all the data now
            if (productsLoaded && categoriesLoaded && brandsLoaded) {
              console.log("All data manually loaded successfully")
              setDataLoaded(true)
              setIsLoading(false)
            }
          } catch (error) {
            console.error("Error manually fetching data:", error)
          }
        }

        manuallyFetchData()
      }
    }

    // Safety timeout to prevent infinite loading
    const safetyTimer = setTimeout(() => {
      if (!dataLoaded) {
        console.log("Safety timeout triggered - forcing data loaded state")
        setDataLoaded(true)
        setIsLoading(false)

        // Create empty arrays for any missing data
        if (!productsLoaded) setAvailableProducts([])
        if (!categoriesLoaded) setAvailableCategories([])
        if (!brandsLoaded) setAvailableBrands([])

        setDebugLastUpdate("Loaded with fallback data due to timeout")
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(safetyTimer)
  }, [settings, dataLoaded])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSections(items)
  }

  const addSection = (type: string) => {
    const newSection: any = {
      type,
      key: sectionCounter,
      status: 1,
      platform: "all",
    }

    // Add type-specific properties
    switch (type) {
      case "custom":
        newSection.app_name = ""
        newSection.image_url = ""
        newSection.redirect_url = ""
        newSection.design = ""
        break
      case "featured":
        newSection.name = `Featured Items ${sectionCounter}`
        newSection.app_name = ""
        newSection.cards = "3"
        newSection.tabs = 0
        newSection.slider = 0
        newSection.view_all = 0
        newSection.design_as_shop = 0
        newSection.featured_items = []
        break
      case "category":
        newSection.app_name = ""
        newSection.featured_ids = []
        newSection.design = ""
        break
      case "brand":
        newSection.app_name = ""
        newSection.featured_ids = []
        newSection.design = ""
        break
      case "instagram":
        newSection.insta_section_name = "Social Feed"
        newSection.insta_token = ""
        newSection.social_feed_editor = ""
        break
    }

    const newSections = [...sections, newSection]
    setSections(newSections)
    setSectionCounter(sectionCounter + 1)
    setShowAddSectionDialog(false)

    // Open the newly added section
    setOpenAccordionItems([...openAccordionItems, `section-${newSections.length - 1}`])

    // Log debug info
    setDebugLastUpdate(`Added new ${type} section with key ${sectionCounter}`)
  }

  const updateSection = useCallback((index: number, field: string, value: any) => {
    setSections((prevSections) => {
      // Create a deep copy of the sections array to avoid state mutation issues
      const updatedSections = JSON.parse(JSON.stringify(prevSections))

      // Update the specific field in the section
      updatedSections[index] = {
        ...updatedSections[index],
        [field]: value,
      }

      // Log for debugging
      console.log(`Updated section ${index}, field ${field}:`, value)
      setDebugLastUpdate(`Updated section ${index}, field ${field} to ${JSON.stringify(value)}`)

      return updatedSections
    })
  }, [])

  const removeSection = (index: number) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections]
      updatedSections.splice(index, 1)
      setDebugLastUpdate(`Removed section at index ${index}`)
      return updatedSections
    })

    // Remove from open accordion items if it was open
    setOpenAccordionItems(openAccordionItems.filter((item) => item !== `section-${index}`))
  }

  const saveChanges = async () => {
    if (!settings?.business_info) return
    const brandId = localStorage.getItem("brandId")

    if (!brandId) {
      setSaveStatus("error")
      setDebugLastUpdate("Error saving: Brand ID not found")
      return
    }

    setIsSaving(true)
    setSaveStatus("idle")

    try {
      // Convert sections array to object with keys
      const sectionsObject = sections.reduce((obj, section, index) => {
        obj[section.key || index] = section
        return obj
      }, {})

      // Get current web_theme or create new one
      const webTheme =
        typeof settings.business_info.web_theme === "string"
          ? JSON.parse(settings.business_info.web_theme)
          : settings.business_info.web_theme || {}

      // Update home sections
      const updatedWebTheme = {
        ...webTheme,
        home: {
          ...(webTheme.home || {}),
          sections: sectionsObject,
        },
      }

      // Convert to string for API - DO NOT stringify again in the form data
      const webThemeString = JSON.stringify(updatedWebTheme)
      console.log("Saving web theme (first 100 chars):", webThemeString.substring(0, 100))

      // Save the updated settings
      const response = await fetch("https://tossdown.site/api/saveRestaurantSettings", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          brand_id: brandId,
          user_id: "0",
          data: webThemeString, // Send the JSON string directly, don't stringify again
        }).toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to save settings: ${response.status} - ${errorText.substring(0, 100)}`)
      }

      const responseText = await response.text()
      console.log("Save response:", responseText)

      // Refresh settings to get updated data
      await refreshSettings()

      setSaveStatus("success")
      setDebugLastUpdate(`Settings saved successfully at ${new Date().toLocaleTimeString()}`)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      setSaveStatus("error")
      setDebugLastUpdate(`Error saving: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAccordionChange = (value: string) => {
    console.log("Accordion change:", value, "Current open:", openAccordionItems)
    setOpenAccordionItems((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  // Function to remove a selected item
  const removeSelectedItem = (sectionIndex: number, itemId: string | number, field: string) => {
    setSections((prevSections) => {
      const updatedSections = JSON.parse(JSON.stringify(prevSections))
      const currentItems = Array.isArray(updatedSections[sectionIndex][field])
        ? updatedSections[sectionIndex][field]
        : []

      updatedSections[sectionIndex][field] = currentItems.filter(
        (id: string | number) => id !== itemId && id !== String(itemId),
      )

      return updatedSections
    })
  }

  // Function to get item name by ID
  const getItemName = (itemId: string | number, type: "product" | "category" | "brand") => {
    if (type === "product") {
      const product = availableProducts.find((p) => p.product_id === itemId || p.product_id === Number(itemId))
      return product ? product.product_name : `Product ${itemId}`
    } else if (type === "category") {
      const category = availableCategories.find((c) => c.category_id === itemId || c.category_id === Number(itemId))
      return category ? category.category_name : `Category ${itemId}`
    } else if (type === "brand") {
      const brand = availableBrands.find((b) => b.id === itemId || b.id === Number(itemId))
      return brand ? brand.name : `Brand ${itemId}`
    }
    return `Item ${itemId}`
  }

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

  if (isLoading || !dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading home sections...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <div className="flex-1 p-6">
          {/* Rest of the existing content */}
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Home Sections</h1>
              <div className="flex gap-2">
                <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-pink-500 hover:bg-pink-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Sections +
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-center text-xl mb-4">
                        Which section do you want to create?
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => addSection("custom")}>
                        Custom
                      </Button>
                      <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => addSection("featured")}>
                        Items
                      </Button>
                      <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => addSection("category")}>
                        Category
                      </Button>
                      <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => addSection("brand")}>
                        Brand
                      </Button>
                      <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => addSection("instagram")}>
                        Social Feed
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button className="bg-pink-500 hover:bg-pink-600" onClick={saveChanges} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            {saveStatus === "success" && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription className="text-green-700">Home sections saved successfully!</AlertDescription>
              </Alert>
            )}

            {saveStatus === "error" && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  Failed to save home sections. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {debugLastUpdate && (
              <div className="mb-4 text-xs text-gray-500 p-2 border border-gray-200 rounded bg-gray-50">
                Last update: {debugLastUpdate}
              </div>
            )}

            <Tabs defaultValue="feature_and_custom">
              <TabsList className="mb-4">
                <TabsTrigger value="feature_and_custom">Feature & Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="feature_and_custom">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {sections.map((section, index) => (
                          <Draggable
                            key={section.key || index}
                            draggableId={`section-${section.key || index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <Accordion
                                  type="multiple"
                                  value={openAccordionItems}
                                  onValueChange={setOpenAccordionItems}
                                >
                                  <AccordionItem
                                    value={`section-${index}`}
                                    className="border rounded-md overflow-hidden"
                                  >
                                    <div className="bg-pink-500 text-white p-3 flex justify-between items-center">
                                      <AccordionTrigger
                                        className="text-white hover:text-white hover:no-underline"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleAccordionChange(`section-${index}`)
                                        }}
                                      >
                                        {section.type === "custom" && `Custom Section ${section.key || index}`}
                                        {section.type === "featured" && `Featured Items ${section.key || index}`}
                                        {section.type === "category" && `Feature Category ${section.key || index}`}
                                        {section.type === "brand" && `Feature Brand ${section.key || index}`}
                                        {section.type === "instagram" && `Social Feed Section ${section.key || index}`}
                                      </AccordionTrigger>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:text-white hover:bg-pink-600"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          removeSection(index)
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <AccordionContent>
                                      <div className="p-4">
                                        <input type="hidden" value={section.type} />

                                        <div className="mb-4">
                                          <div className="flex items-center space-x-2">
                                            <Label htmlFor={`status-${index}`}>Status</Label>
                                            <Switch
                                              id={`status-${index}`}
                                              checked={section.status === 1}
                                              onCheckedChange={(checked) => {
                                                console.log(
                                                  `Toggling status for section ${index} to ${checked ? 1 : 0}`,
                                                )
                                                updateSection(index, "status", checked ? 1 : 0)
                                              }}
                                            />
                                            <span className="text-xs ml-2">
                                              {section.status === 1 ? "Active" : "Inactive"}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Common fields for all section types */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                          <div>
                                            <Label htmlFor={`app-name-${index}`}>App Name</Label>
                                            <Input
                                              id={`app-name-${index}`}
                                              value={section.app_name || ""}
                                              onChange={(e) => updateSection(index, "app_name", e.target.value)}
                                              placeholder="Feature section name for App"
                                            />
                                          </div>

                                          <div>
                                            <Label htmlFor={`platform-${index}`}>Platform</Label>
                                            <Select
                                              value={section.platform || "all"}
                                              onValueChange={(value) => updateSection(index, "platform", value)}
                                            >
                                              <SelectTrigger id={`platform-${index}`}>
                                                <SelectValue placeholder="Select platform" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="web">Web</SelectItem>
                                                <SelectItem value="app">App</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>

                                        {/* Custom section specific fields */}
                                        {section.type === "custom" && (
                                          <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                              <div>
                                                <Label htmlFor={`image-url-${index}`}>Image URL</Label>
                                                <Input
                                                  id={`image-url-${index}`}
                                                  value={section.image_url || ""}
                                                  onChange={(e) => updateSection(index, "image_url", e.target.value)}
                                                  placeholder="Enter image URL"
                                                />
                                              </div>

                                              <div>
                                                <Label htmlFor={`redirect-url-${index}`}>Redirect URL</Label>
                                                <Input
                                                  id={`redirect-url-${index}`}
                                                  value={section.redirect_url || ""}
                                                  onChange={(e) => updateSection(index, "redirect_url", e.target.value)}
                                                  placeholder="Enter redirect URL"
                                                />
                                              </div>
                                            </div>

                                            <div className="mb-4">
                                              <Label>Section Content</Label>
                                              <RichTextEditor
                                                initialValue={section.design || ""}
                                                onSave={async (content) => {
                                                  updateSection(index, "design", content)
                                                  return Promise.resolve()
                                                }}
                                              />
                                            </div>
                                          </>
                                        )}

                                        {/* Featured items specific fields */}
                                        {section.type === "featured" && (
                                          <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                              <div>
                                                <Label htmlFor={`feature-name-${index}`}>Name</Label>
                                                <Input
                                                  id={`feature-name-${index}`}
                                                  value={section.name || ""}
                                                  onChange={(e) => updateSection(index, "name", e.target.value)}
                                                  placeholder="Feature section name"
                                                />
                                              </div>

                                              <div>
                                                <Label htmlFor={`cards-${index}`}>Number of Cards</Label>
                                                <Select
                                                  value={section.cards || "3"}
                                                  onValueChange={(value) => updateSection(index, "cards", value)}
                                                >
                                                  <SelectTrigger id={`cards-${index}`}>
                                                    <SelectValue placeholder="Select number of cards" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="12">1 card</SelectItem>
                                                    <SelectItem value="6">2 cards</SelectItem>
                                                    <SelectItem value="4">3 cards</SelectItem>
                                                    <SelectItem value="3">4 cards</SelectItem>
                                                    <SelectItem value="13">5 cards</SelectItem>
                                                    <SelectItem value="2">6 cards</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                              <div className="flex items-center space-x-2">
                                                <Switch
                                                  id={`tabs-${index}`}
                                                  checked={section.tabs === 1}
                                                  onCheckedChange={(checked) =>
                                                    updateSection(index, "tabs", checked ? 1 : 0)
                                                  }
                                                />
                                                <Label htmlFor={`tabs-${index}`}>Tabs</Label>
                                              </div>

                                              <div className="flex items-center space-x-2">
                                                <Switch
                                                  id={`slider-${index}`}
                                                  checked={section.slider === 1}
                                                  onCheckedChange={(checked) =>
                                                    updateSection(index, "slider", checked ? 1 : 0)
                                                  }
                                                />
                                                <Label htmlFor={`slider-${index}`}>Slider</Label>
                                              </div>

                                              <div className="flex items-center space-x-2">
                                                <Switch
                                                  id={`view-all-${index}`}
                                                  checked={section.view_all === 1}
                                                  onCheckedChange={(checked) =>
                                                    updateSection(index, "view_all", checked ? 1 : 0)
                                                  }
                                                />
                                                <Label htmlFor={`view-all-${index}`}>View All Button</Label>
                                              </div>

                                              <div className="flex items-center space-x-2">
                                                <Switch
                                                  id={`design-as-shop-${index}`}
                                                  checked={section.design_as_shop === 1}
                                                  onCheckedChange={(checked) =>
                                                    updateSection(index, "design_as_shop", checked ? 1 : 0)
                                                  }
                                                />
                                                <Label htmlFor={`design-as-shop-${index}`}>Design As Shop</Label>
                                              </div>
                                            </div>

                                            <div className="mb-4">
                                              <Label>Featured Items</Label>
                                              <Select
                                                value={section.featured_items?.includes("all") ? "all" : "selected"}
                                                onValueChange={(value) => {
                                                  if (value === "all") {
                                                    updateSection(index, "featured_items", ["all"])
                                                  } else {
                                                    updateSection(index, "featured_items", [])
                                                  }
                                                }}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select items" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="all">All Items</SelectItem>
                                                  <SelectItem value="selected">Selected Items</SelectItem>
                                                </SelectContent>
                                              </Select>

                                              {section.featured_items && !section.featured_items.includes("all") && (
                                                <div className="mt-4">
                                                  <Label className="mb-2 block">Selected Products</Label>

                                                  {/* Display selected products as tags */}
                                                  <div className="flex flex-wrap gap-2 mb-3 border p-2 rounded-md min-h-10">
                                                    {section.featured_items && section.featured_items.length > 0 ? (
                                                      section.featured_items.map((itemId: string | number) => (
                                                        <div
                                                          key={`selected-product-${itemId}`}
                                                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center text-sm"
                                                        >
                                                          <span>{getItemName(itemId, "product")}</span>
                                                          <button
                                                            type="button"
                                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                                            onClick={() =>
                                                              removeSelectedItem(index, itemId, "featured_items")
                                                            }
                                                          >
                                                            <XIcon className="h-3 w-3" />
                                                          </button>
                                                        </div>
                                                      ))
                                                    ) : (
                                                      <div className="text-gray-400 text-sm">No products selected</div>
                                                    )}
                                                  </div>

                                                  {/* Product selector */}
                                                  <Popover
                                                    open={openPopover === `products-${index}`}
                                                    onOpenChange={(open) => {
                                                      if (open) {
                                                        setOpenPopover(`products-${index}`)
                                                      } else {
                                                        setOpenPopover(null)
                                                      }
                                                    }}
                                                  >
                                                    <PopoverTrigger asChild>
                                                      <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal"
                                                      >
                                                        <span>Select Products</span>
                                                      </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0" align="start">
                                                      <Command>
                                                        <CommandInput placeholder="Search products..." />
                                                        <CommandList>
                                                          <CommandEmpty>No products found.</CommandEmpty>
                                                          <CommandGroup>
                                                            {availableProducts && availableProducts.length > 0 ? (
                                                              availableProducts.map((product: any) => {
                                                                const isSelected =
                                                                  section.featured_items?.includes(
                                                                    product.product_id,
                                                                  ) ||
                                                                  section.featured_items?.includes(
                                                                    String(product.product_id),
                                                                  )
                                                                return (
                                                                  <CommandItem
                                                                    key={product.product_id}
                                                                    onSelect={() => {
                                                                      const currentItems = [
                                                                        ...(section.featured_items || []),
                                                                      ]
                                                                      if (!isSelected) {
                                                                        updateSection(index, "featured_items", [
                                                                          ...currentItems,
                                                                          product.product_id,
                                                                        ])
                                                                      } else {
                                                                        updateSection(
                                                                          index,
                                                                          "featured_items",
                                                                          currentItems.filter(
                                                                            (id) =>
                                                                              id !== product.product_id &&
                                                                              id !== String(product.product_id),
                                                                          ),
                                                                        )
                                                                      }
                                                                      setOpenPopover(null)
                                                                    }}
                                                                  >
                                                                    <div className="flex items-center">
                                                                      {isSelected && (
                                                                        <Check className="mr-2 h-4 w-4 text-green-600" />
                                                                      )}
                                                                      <span>{product.product_name}</span>
                                                                    </div>
                                                                  </CommandItem>
                                                                )
                                                              })
                                                            ) : (
                                                              <div className="py-2 px-4 text-sm text-gray-500">
                                                                No products available
                                                              </div>
                                                            )}
                                                          </CommandGroup>
                                                        </CommandList>
                                                      </Command>
                                                    </PopoverContent>
                                                  </Popover>
                                                </div>
                                              )}
                                            </div>
                                          </>
                                        )}

                                        {/* Category section specific fields */}
                                        {section.type === "category" && (
                                          <>
                                            <div className="mb-4">
                                              <Label className="mb-2 block">Selected Categories</Label>

                                              {/* Display selected categories as tags */}
                                              <div className="flex flex-wrap gap-2 mb-3 border p-2 rounded-md min-h-10">
                                                {section.featured_ids && section.featured_ids.length > 0 ? (
                                                  section.featured_ids.map((itemId: string | number) => (
                                                    <div
                                                      key={`selected-category-${itemId}`}
                                                      className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md flex items-center text-sm"
                                                    >
                                                      <span>{getItemName(itemId, "category")}</span>
                                                      <button
                                                        type="button"
                                                        className="ml-1 text-purple-600 hover:text-purple-800"
                                                        onClick={() =>
                                                          removeSelectedItem(index, itemId, "featured_ids")
                                                        }
                                                      >
                                                        <XIcon className="h-3 w-3" />
                                                      </button>
                                                    </div>
                                                  ))
                                                ) : (
                                                  <div className="text-gray-400 text-sm">No categories selected</div>
                                                )}
                                              </div>

                                              {/* Category selector */}
                                              <Popover
                                                open={openPopover === `categories-${index}`}
                                                onOpenChange={(open) => {
                                                  if (open) {
                                                    setOpenPopover(`categories-${index}`)
                                                  } else {
                                                    setOpenPopover(null)
                                                  }
                                                }}
                                              >
                                                <PopoverTrigger asChild>
                                                  <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                  >
                                                    <span>Select Categories</span>
                                                  </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                  <Command>
                                                    <CommandInput placeholder="Search categories..." />
                                                    <CommandList>
                                                      <CommandEmpty>No categories found.</CommandEmpty>
                                                      <CommandGroup>
                                                        {availableCategories && availableCategories.length > 0 ? (
                                                          availableCategories.map((category: any) => {
                                                            const isSelected =
                                                              section.featured_ids?.includes(category.category_id) ||
                                                              section.featured_ids?.includes(
                                                                String(category.category_id),
                                                              )
                                                            return (
                                                              <CommandItem
                                                                key={category.category_id}
                                                                onSelect={() => {
                                                                  const currentIds = [...(section.featured_ids || [])]
                                                                  if (!isSelected) {
                                                                    updateSection(index, "featured_ids", [
                                                                      ...currentIds,
                                                                      category.category_id,
                                                                    ])
                                                                  } else {
                                                                    updateSection(
                                                                      index,
                                                                      "featured_ids",
                                                                      currentIds.filter(
                                                                        (id) =>
                                                                          id !== category.category_id &&
                                                                          id !== String(category.category_id),
                                                                      ),
                                                                    )
                                                                  }
                                                                  setOpenPopover(null)
                                                                }}
                                                              >
                                                                <div className="flex items-center">
                                                                  {isSelected && (
                                                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                                                  )}
                                                                  <span>{category.category_name}</span>
                                                                </div>
                                                              </CommandItem>
                                                            )
                                                          })
                                                        ) : (
                                                          <div className="py-2 px-4 text-sm text-gray-500">
                                                            No categories available
                                                          </div>
                                                        )}
                                                      </CommandGroup>
                                                    </CommandList>
                                                  </Command>
                                                </PopoverContent>
                                              </Popover>
                                            </div>

                                            <div className="mb-4">
                                              <Label>Section Content</Label>
                                              <RichTextEditor
                                                initialValue={section.design || ""}
                                                onSave={async (content) => {
                                                  updateSection(index, "design", content)
                                                  return Promise.resolve()
                                                }}
                                              />
                                            </div>
                                          </>
                                        )}

                                        {/* Brand section specific fields */}
                                        {section.type === "brand" && (
                                          <>
                                            <div className="mb-4">
                                              <Label className="mb-2 block">Selected Brands</Label>

                                              {/* Display selected brands as tags */}
                                              <div className="flex flex-wrap gap-2 mb-3 border p-2 rounded-md min-h-10">
                                                {section.featured_ids && section.featured_ids.length > 0 ? (
                                                  section.featured_ids.map((itemId: string | number) => (
                                                    <div
                                                      key={`selected-brand-${itemId}`}
                                                      className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center text-sm"
                                                    >
                                                      <span>{getItemName(itemId, "brand")}</span>
                                                      <button
                                                        type="button"
                                                        className="ml-1 text-green-600 hover:text-green-800"
                                                        onClick={() =>
                                                          removeSelectedItem(index, itemId, "featured_ids")
                                                        }
                                                      >
                                                        <XIcon className="h-3 w-3" />
                                                      </button>
                                                    </div>
                                                  ))
                                                ) : (
                                                  <div className="text-gray-400 text-sm">No brands selected</div>
                                                )}
                                              </div>

                                              {/* Brand selector */}
                                              <Popover
                                                open={openPopover === `brands-${index}`}
                                                onOpenChange={(open) => {
                                                  if (open) {
                                                    setOpenPopover(`brands-${index}`)
                                                  } else {
                                                    setOpenPopover(null)
                                                  }
                                                }}
                                              >
                                                <PopoverTrigger asChild>
                                                  <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                  >
                                                    <span>Select Brands</span>
                                                  </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                  <Command>
                                                    <CommandInput placeholder="Search brands..." />
                                                    <CommandList>
                                                      <CommandEmpty>No brands found.</CommandEmpty>
                                                      <CommandGroup>
                                                        {availableBrands && availableBrands.length > 0 ? (
                                                          availableBrands.map((brand: any) => {
                                                            const isSelected =
                                                              section.featured_ids?.includes(brand.id) ||
                                                              section.featured_ids?.includes(String(brand.id))
                                                            return (
                                                              <CommandItem
                                                                key={brand.id}
                                                                onSelect={() => {
                                                                  const currentIds = [...(section.featured_ids || [])]
                                                                  if (!isSelected) {
                                                                    updateSection(index, "featured_ids", [
                                                                      ...currentIds,
                                                                      brand.id,
                                                                    ])
                                                                  } else {
                                                                    updateSection(
                                                                      index,
                                                                      "featured_ids",
                                                                      currentIds.filter(
                                                                        (id) =>
                                                                          id !== brand.id && id !== String(brand.id),
                                                                      ),
                                                                    )
                                                                  }
                                                                  setOpenPopover(null)
                                                                }}
                                                              >
                                                                <div className="flex items-center">
                                                                  {isSelected && (
                                                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                                                  )}
                                                                  <span>{brand.name}</span>
                                                                </div>
                                                              </CommandItem>
                                                            )
                                                          })
                                                        ) : (
                                                          <div className="py-2 px-4 text-sm text-gray-500">
                                                            No brands available
                                                          </div>
                                                        )}
                                                      </CommandGroup>
                                                    </CommandList>
                                                  </Command>
                                                </PopoverContent>
                                              </Popover>
                                            </div>

                                            <div className="mb-4">
                                              <Label>Section Content</Label>
                                              <RichTextEditor
                                                initialValue={section.design || ""}
                                                onSave={async (content) => {
                                                  updateSection(index, "design", content)
                                                  return Promise.resolve()
                                                }}
                                              />
                                            </div>
                                          </>
                                        )}

                                        {/* Instagram section specific fields */}
                                        {section.type === "instagram" && (
                                          <>
                                            <div className="mb-4">
                                              <Label htmlFor={`insta-section-name-${index}`}>
                                                Instagram Section Heading
                                              </Label>
                                              <Input
                                                id={`insta-section-name-${index}`}
                                                value={section.insta_section_name || ""}
                                                onChange={(e) =>
                                                  updateSection(index, "insta_section_name", e.target.value)
                                                }
                                                placeholder="Instagram feed heading"
                                              />
                                            </div>

                                            <div className="mb-4">
                                              <Label htmlFor={`insta-token-${index}`}>Instagram Feed Token</Label>
                                              <Input
                                                id={`insta-token-${index}`}
                                                value={section.insta_token || ""}
                                                onChange={(e) => updateSection(index, "insta_token", e.target.value)}
                                                placeholder="Enter Instagram feed token"
                                              />
                                            </div>

                                            <div className="mb-4">
                                              <Label>Social Feed Content</Label>
                                              <RichTextEditor
                                                initialValue={section.social_feed_editor || ""}
                                                onSave={async (content) => {
                                                  updateSection(index, "social_feed_editor", content)
                                                  return Promise.resolve()
                                                }}
                                              />
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <div className="mt-6 flex justify-between">
                  <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => setShowAddSectionDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sections +
                  </Button>

                  <Button className="bg-pink-500 hover:bg-pink-600" onClick={saveChanges} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
