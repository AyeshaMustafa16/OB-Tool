"use server"
import type { Settings } from "@/contexts/settings-context"

// Utility function for retrying failed requests with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 500,
  isRetry = false,
): Promise<Response> {
  try {
    // Add a small delay between requests to avoid overwhelming the API
    if (isRetry) {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 200))
    }

    console.log(`Fetching ${url}`, { isRetry, retries })
    const response = await fetch(url, options)

    // Log response status
    console.log(`Response from ${url}:`, { status: response.status, ok: response.ok })

    // If we get a 429 Too Many Requests, wait and retry with exponential backoff
    if (response.status === 429 && retries > 0) {
      console.log(`Rate limited. Retrying in ${backoff}ms... (${retries} retries left)`)
      await new Promise((resolve) => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2, true)
    }

    return response
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    if (retries > 0) {
      console.log(`Request failed. Retrying in ${backoff}ms... (${retries} retries left)`)
      await new Promise((resolve) => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2, true)
    }
    throw error
  }
}

// Cache for API responses to reduce duplicate requests
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds cache instead of 60 seconds

const API_PATH = "https://tossdown.site/api"
const PRODUCT_API = "https://tossdown.com/api"

// Request queue to limit concurrent requests
let pendingRequests = 0
const MAX_CONCURRENT_REQUESTS = 3
const requestQueue: Array<() => Promise<void>> = []

async function executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  // If we're already at max concurrent requests, queue this one
  if (pendingRequests >= MAX_CONCURRENT_REQUESTS) {
    return new Promise((resolve, reject) => {
      requestQueue.push(async () => {
        try {
          pendingRequests++
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          pendingRequests--
          // Process next request in queue
          if (requestQueue.length > 0) {
            const nextRequest = requestQueue.shift()
            if (nextRequest) nextRequest()
          }
        }
      })
    })
  }

  // Otherwise execute immediately
  pendingRequests++
  try {
    return await requestFn()
  } finally {
    pendingRequests--
    // Process next request in queue
    if (requestQueue.length > 0) {
      const nextRequest = requestQueue.shift()
      if (nextRequest) nextRequest()
    }
  }
}

// Helper function to safely parse JSON
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error("Error parsing JSON:", e, "Raw response:", text)

    // Check if this is a rate limiting error
    if (text.includes("Too Many Requests")) {
      throw new Error("Rate limited by the API. Please try again later.")
    }

    throw new Error("Invalid response format from API")
  }
}

export async function fetchAllSettings(brandId: string, activeClass: string | null): Promise<Settings> {
  console.log("fetchAllSettings called with:", { brandId, activeClass })

  // Initialize the settings object
  const settings: Partial<Settings> = {
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
  }

  try {
    // Fetch business info first - this is required for other requests
    console.log("Fetching business info for brand ID:", brandId)
    const businessInfo = await fetchBusinessInfo(brandId)
    settings.business_info = businessInfo
    console.log("Business info fetched:", {
      name: businessInfo?.name,
      logo: businessInfo?.logo_image,
      hasWebTheme: !!businessInfo?.web_theme,
    })

    // Log the web_theme to see its structure
    if (businessInfo?.web_theme) {
      console.log(
        "Found web_theme in business_info, length:",
        typeof businessInfo.web_theme === "string"
          ? businessInfo.web_theme.length
          : JSON.stringify(businessInfo.web_theme).length,
      )

      try {
        // Try to parse it if it's a string to see its structure
        const parsedWebTheme =
          typeof businessInfo.web_theme === "string" ? JSON.parse(businessInfo.web_theme) : businessInfo.web_theme

        console.log("web_theme structure:", Object.keys(parsedWebTheme))

        // Check if card exists
        if (parsedWebTheme.card) {
          console.log("card exists in web_theme with keys:", Object.keys(parsedWebTheme.card))

          // Check if search_results exists
          if (parsedWebTheme.card.search_results) {
            console.log("search_results exists in card with keys:", Object.keys(parsedWebTheme.card.search_results))

            // Check if items exist
            if (parsedWebTheme.card.search_results.items) {
              console.log(
                "items exist in search_results with count:",
                Object.keys(parsedWebTheme.card.search_results.items).length,
              )
            } else {
              console.log("No items found in card.search_results")
            }
          } else {
            console.log("No search_results found in card")
          }
        } else {
          console.log("No card found in web_theme")
        }
      } catch (e) {
        console.error("Error parsing web_theme for debugging:", e)
      }
    }

    if (businessInfo) {
      // Set business logo
      settings.business_logo = businessInfo.logo_image || null

      // Set theme settings
      settings.theme_settings = businessInfo.theme_settings || null

      // Parse web theme settings
      if (businessInfo.web_theme) {
        try {
          settings.settings =
            typeof businessInfo.web_theme === "string" ? JSON.parse(businessInfo.web_theme) : businessInfo.web_theme
          console.log("Web theme parsed successfully, header available:", !!settings.settings?.header)
        } catch (e) {
          console.error("Error parsing web_theme:", e)
        }
      }

      // Parse mobile theme settings
      if (businessInfo.mobile_theme) {
        try {
          settings.mobile_settings =
            typeof businessInfo.mobile_theme === "string"
              ? JSON.parse(businessInfo.mobile_theme)
              : businessInfo.mobile_theme
        } catch (e) {
          console.error("Error parsing mobile_theme:", e)
        }
      }

      // Fetch all settings if business_id is available
      const businessId = businessInfo.res_id
      if (businessId) {
        try {
          const allSettings = await fetchAllThemeSettings(businessId)
          settings.get_all_theme_settings = allSettings
        } catch (e) {
          console.error("Error fetching all theme settings:", e)
        }

        // Only fetch additional data if specifically requested by activeClass
        // This reduces the number of API calls
        if (activeClass === "home_sections") {
          try {
            console.log("Fetching data for home_sections, business ID:", businessId)

            // Use Promise.allSettled to handle partial failures
            const [products, categories, brands, featuredProducts] = await Promise.allSettled([
              fetchProducts(businessId),
              fetchCategories(businessId),
              fetchBrands(businessId),
              fetchFeaturedProducts(businessId),
            ])

            console.log("Home sections API responses received:", {
              productsStatus: products.status,
              categoriesStatus: categories.status,
              brandsStatus: brands.status,
              featuredProductsStatus: featuredProducts.status,
            })

            if (products.status === "fulfilled") {
              settings.products = products.value
              console.log("Products loaded successfully:", products.value ? "has data" : "empty data")
            } else {
              console.error("Failed to load products:", products.reason)
              // Provide empty fallback to prevent UI issues
              settings.products = { products: [] }
            }

            if (categories.status === "fulfilled" && categories.value && categories.value.result) {
              settings.featured_categories = categories.value.result
              console.log("Categories loaded successfully:", categories.value.result.length)
            } else {
              console.error(
                "Failed to load categories or empty result:",
                categories.status === "rejected" ? categories.reason : "No data in response",
              )
              // Provide empty fallback
              settings.featured_categories = []
            }

            if (brands.status === "fulfilled" && brands.value && brands.value.result) {
              settings.featured_brands = brands.value.result
              console.log("Brands loaded successfully:", brands.value.result.length)
            } else {
              console.error(
                "Failed to load brands or empty result:",
                brands.status === "rejected" ? brands.reason : "No data in response",
              )
              // Provide empty fallback
              settings.featured_brands = []
            }

            if (featuredProducts.status === "fulfilled") {
              settings.featured_products = featuredProducts.value
              console.log(
                "Featured products loaded successfully:",
                featuredProducts.value ? featuredProducts.value.length : 0,
              )
            } else {
              console.error("Failed to load featured products:", featuredProducts.reason)
              // Provide empty fallback
              settings.featured_products = []
            }
          } catch (e) {
            console.error("Error fetching home sections data:", e)
            // Set empty arrays for all properties to prevent UI issues
            settings.products = { products: [] }
            settings.featured_categories = []
            settings.featured_brands = []
            settings.featured_products = []
          }
        } else if (activeClass === "banner") {
          try {
            // Use Promise.allSettled to handle partial failures
            const [brands, categories, products] = await Promise.allSettled([
              fetchBrands(businessId),
              fetchCategories(businessId),
              fetchProducts(businessId),
            ])

            if (brands.status === "fulfilled") settings.brands = brands.value
            if (categories.status === "fulfilled") settings.categories = categories.value
            if (products.status === "fulfilled") settings.products = products.value
          } catch (e) {
            console.error("Error fetching banner data:", e)
          }
        } else if (activeClass === "theme_settings") {
          try {
            const brandsName = await fetchBrandNames()
            settings.brandsName = brandsName
          } catch (e) {
            console.error("Error fetching brand names:", e)
          }
        }
      }
    }

    return settings as Settings
  } catch (error) {
    console.error("Error in fetchAllSettings:", error)
    throw error
  }
}

async function fetchBusinessInfo(brandId: string) {
  // Check cache first
  const cacheKey = `business_info_${brandId}`
  const cachedData = apiCache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log("Using cached business info")
    return cachedData.data
  }

  return executeRequest(async () => {
    const url = `${API_PATH}/get_obw_settings`
    const formData = new URLSearchParams()
    formData.append("brand_id", brandId)

    console.log("Fetching business info from API:", url)
    const response = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
      5, // More retries for this critical request
      300,
    )

    if (!response.ok) {
      // Handle non-JSON responses
      const text = await response.text()
      console.error("Business info API error:", { status: response.status, text })
      if (text.includes("Too Many Requests")) {
        throw new Error("Rate limited by the API. Please try again later.")
      }
      throw new Error(`Failed to fetch business info: ${response.status} - ${text}`)
    }

    const text = await response.text()
    console.log("Business info API response received, length:", text.length)
    const data = safeJsonParse(text)

    // Cache the result
    apiCache.set(cacheKey, { data, timestamp: Date.now() })

    return data
  })
}

async function fetchAllThemeSettings(businessId: string) {
  // Check cache first
  const cacheKey = `all_theme_settings_${businessId}`
  const cachedData = apiCache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  return executeRequest(async () => {
    const url = `${API_PATH}/get_all_settings`
    const formData = new URLSearchParams()
    formData.append("business_id", businessId)

    const response = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
      3,
      300,
    )

    if (!response.ok) {
      // Handle non-JSON responses
      const text = await response.text()
      if (text.includes("Too Many Requests")) {
        throw new Error("Rate limited by the API. Please try again later.")
      }
      throw new Error(`Failed to fetch all settings: ${response.status} - ${text}`)
    }

    const text = await response.text()
    try {
      const data = JSON.parse(text)

      // Cache the result
      apiCache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (e) {
      console.error("Error parsing all settings:", e, "Raw response:", text)
      return null
    }
  })
}

async function fetchProducts(businessId: string) {
  // Check cache first
  const cacheKey = `products_${businessId}`
  const cachedData = apiCache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  return executeRequest(async () => {
    const url = `${API_PATH}/get_products`
    const formData = new URLSearchParams()
    formData.append("business_id", businessId)

    const response = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
      3,
      300,
    )

    if (!response.ok) {
      // Handle non-JSON responses
      const text = await response.text()
      if (text.includes("Too Many Requests")) {
        throw new Error("Rate limited by the API. Please try again later.")
      }
      throw new Error(`Failed to fetch products: ${response.status} - ${text}`)
    }

    const text = await response.text()
    try {
      const data = JSON.parse(text)

      // Cache the result
      apiCache.set(cacheKey, { data, timestamp: Date.now() })
      console.log("get_products successfully run")
      return data
    } catch (e) {
      console.error("Error parsing products:", e, "Raw response:", text)
      return null
    }
  })
}

async function fetchCategories(businessId: string) {
  // Check cache first
  const cacheKey = `categories_${businessId}`
  const cachedData = apiCache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  return executeRequest(async () => {
    const url = `${PRODUCT_API}/get_menu_item_category`
    const formData = new URLSearchParams()
    formData.append("eatout_id", businessId)

    const response = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
      3,
      300,
    )

    if (!response.ok) {
      // Handle non-JSON responses
      const text = await response.text()
      if (text.includes("Too Many Requests")) {
        console.warn("Rate limited when fetching categories. Returning empty result.")
        return { result: [] } // Return empty result instead of throwing
      }
      throw new Error(`Failed to fetch categories: ${response.status} - ${text}`)
    }

    const textResponse = await response.text()
    try {
      const data = JSON.parse(textResponse)
      console.log("get_categories successfully run")
      // Cache the result
      apiCache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (e) {
      console.error("Error parsing categories:", e, "Raw response:", textResponse)
      // Return empty result instead of null to prevent errors
      return { result: [] }
    }
  })
}

async function fetchBrands(businessId: string) {
  // Check cache first
  const cacheKey = `brands_${businessId}`
  const cachedData = apiCache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  return executeRequest(async () => {
    const url = `${PRODUCT_API}/get_eatout_brands_new`
    const formData = new URLSearchParams()
    formData.append("eatout_id", businessId)

    const response = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
      3,
      300,
    )

    if (!response.ok) {
      // Handle non-JSON responses
      const text = await response.text()
      if (text.includes("Too Many Requests")) {
        console.warn("Rate limited when fetching brands. Returning empty result.")
        return { result: [] } // Return empty result instead of throwing
      }
      throw new Error(`Failed to fetch brands: ${response.status} - ${text}`)
    }

    const textResponse = await response.text()
    try {
      const data = JSON.parse(textResponse)
      console.log("get_brand successfully run")
      // Cache the result
      apiCache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (e) {
      console.error("Error parsing brands:", e, "Raw response:", textResponse)
      // Return empty result instead of null to prevent errors
      return { result: [] }
    }
  })
}

async function fetchFeaturedProducts(businessId: string) {
  // Check cache first
  const cacheKey = `featured_products_${businessId}`
  const cachedData = apiCache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  return executeRequest(async () => {
    const url = `${PRODUCT_API}/products?business_id=${businessId}&display_source=2&source=web&menu_item=0&featured_section=1&categories=0&brands=0&filters=1`

    const response = await fetchWithRetry(
      url,
      {
        method: "GET",
      },
      3,
      300,
    )

    if (!response.ok) {
      // Handle non-JSON responses
      const text = await response.text()
      if (text.includes("Too Many Requests")) {
        console.warn("Rate limited when fetching featured products. Returning empty result.")
        return [] // Return empty array instead of throwing
      }
      throw new Error(`Failed to fetch featured products: ${response.status} - ${text}`)
    }

    try {
      const data = await response.json()
      console.log("products api successfully run")
      // Cache the result
      const result = data && data.result && data.result.items ? data.result.items : []
      apiCache.set(cacheKey, { data: result, timestamp: Date.now() })

      return result
    } catch (e) {
      console.error("Error parsing featured products:", e)
      return []
    }
  })
}

async function fetchBrandNames() {
  // Check cache first
  const cacheKey = `brand_names`
  const cachedData = apiCache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  return executeRequest(async () => {
    const url = `${API_PATH}/getBrandName`

    const response = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "",
      },
      3,
      300,
    )

    if (!response.ok) {
      // Handle non-JSON responses
      const text = await response.text()
      if (text.includes("Too Many Requests")) {
        console.warn("Rate limited when fetching brand names. Returning empty result.")
        return [] // Return empty array instead of throwing
      }
      throw new Error(`Failed to fetch brand names: ${response.status} - ${text}`)
    }

    try {
      const data = await response.json()

      // Cache the result
      apiCache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (e) {
      console.error("Error parsing brand names:", e)
      return []
    }
  })
}

// Function to set active class in a cookie
export async function setActiveClass(className: string) {
  document.cookie = `active_class=${className}; path=/; max-age=86400`
}

// Add a function for saving sidebar settings
export async function saveSidebarSettings(config: any): Promise<boolean> {
  try {
    const brandId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("brandId="))
      ?.split("=")[1]

    if (!brandId) {
      throw new Error("No brand ID found")
    }

    // Use the correct API endpoint - this should match what your Laravel app uses
    const url = "https://tossdown.site/api/obw_settings_api"

    // Prepare form data in the format expected by the API
    const formData = new URLSearchParams()
    formData.append("brand_id", brandId)
    formData.append("sidebar_settings", JSON.stringify(config))
    formData.append("type", "sidebar") // Add type parameter to specify we're saving sidebar settings

    console.log("Saving sidebar settings to:", url)
    console.log("Request payload:", {
      brand_id: brandId,
      type: "sidebar",
      sidebar_settings: JSON.stringify(config).substring(0, 100) + "...", // Log truncated for brevity
    })

    // Use the fetchWithRetry function for reliability
    const response = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
      3, // retries
      500, // backoff
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to save sidebar settings: ${response.status} - ${errorText.substring(0, 100)}`)
    }

    const responseText = await response.text()
    console.log("Save response:", responseText)

    try {
      const data = JSON.parse(responseText)
      console.log("Parsed response data:", data)
    } catch (e) {
      console.log("Response is not valid JSON, but save is considered successful")
    }

    return true
  } catch (error) {
    console.error("Error saving sidebar settings:", error)
    throw error
  }
}

// Also export these functions so they can be used directly in the page component
export { fetchProducts, fetchCategories, fetchBrands, fetchFeaturedProducts }
