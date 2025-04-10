/**
 * Comprehensive cache purging utility that matches the Laravel implementation
 * This handles purging the cache and refreshing all necessary data
 */

export async function purgeCache() {
  try {
    // Get brand ID from cookies
    const brandId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("brandId="))
      ?.split("=")[1]

    if (!brandId) {
      throw new Error("No brand ID found in cookies")
    }

    // Step 1: Initial cache purge
    const purgeResponse = await fetch("https://tossdown.site/api/purge_cache", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ brand_id: brandId }).toString(),
    })

    if (!purgeResponse.ok) {
      throw new Error(`Failed to purge cache: ${purgeResponse.status}`)
    }

    // Step 2: Get latest settings
    const API_PATH = "https://tossdown.site/api/"
    const product_API = "https://tossdown.com/api/"

    const settingsResponse = await fetch(`${API_PATH}get_obw_settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ brand_id: brandId }).toString(),
    })

    if (!settingsResponse.ok) {
      throw new Error(`Failed to fetch settings: ${settingsResponse.status}`)
    }

    const settingsText = await settingsResponse.text()
    const res = JSON.parse(settingsText)

    // Get business ID
    const business_id = res.res_id || null
    if (!business_id) {
      throw new Error("Business ID not found in settings")
    }

    // Parse web_theme
    let web_theme = {}
    if (res.web_theme) {
      web_theme = typeof res.web_theme === "string" ? JSON.parse(res.web_theme) : res.web_theme
    }

    // Check if home sections exist
    if (!web_theme.home?.sections) {
      console.log("No home sections found, skipping featured items update")
      return { success: true, message: "Cache purged successfully!" }
    }

    // Step 3: Get categories
    const categoriesResponse = await fetch(`${product_API}get_menu_item_category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ eatout_id: business_id }).toString(),
    })

    if (!categoriesResponse.ok) {
      throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`)
    }

    const categories = await categoriesResponse.json()
    let feature_categories = []

    if (categories.result && categories.result.length > 0) {
      feature_categories = categories.result
    }

    // Step 4: Get brands
    const brandsResponse = await fetch(`${product_API}get_eatout_brands_new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ eatout_id: business_id }).toString(),
    })

    if (!brandsResponse.ok) {
      throw new Error(`Failed to fetch brands: ${brandsResponse.status}`)
    }

    const brands = await brandsResponse.json()
    let featured_brands = []

    if (brands.result && brands.result.length > 0) {
      featured_brands = brands.result
    }

    // Step 5: Get featured products
    const productsResponse = await fetch(
      `${product_API}products?business_id=${business_id}&display_source=2&source=web&menu_item=0&featured_section=1&categories=0&brands=0&filters=1&attributes=1&grouped_products=1`,
    )

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status}`)
    }

    const items = await productsResponse.json()
    let featured_products = []

    if (items && items.result && items.result.items_count !== 0) {
      featured_products = items.result.items
    }

    // Step 6: Update home sections with the latest data
    const data = { ...web_theme }

    Object.entries(data.home.sections).forEach(([keyType, section]) => {
      if (section.type === "featured") {
        const feature_items = section.featured_items
        const feature_products = []

        featured_products.forEach((items) => {
          feature_items.forEach((item) => {
            if (items.menu_item_id == item) {
              feature_products.push(items)
            }
          })
        })

        data.home.sections[keyType].featured_products = feature_products
      } else if (section.type === "category") {
        const featured_category = { result: [] }
        const feature_items = section.featured_ids

        feature_categories.forEach((items) => {
          feature_items.forEach((item) => {
            if (items.category_id == item) {
              const item_array = {
                category_id: items.category_id,
                category_name: items.category_name,
                description: items.description,
                image: items.image,
                slug: items.slug,
                no_of_items: items.products_count,
              }
              featured_category.result.push(item_array)
            }
          })
        })

        data.home.sections[keyType].featured_category = featured_category
      } else if (section.type === "brand") {
        const feature_brands = { result: [] }
        const feature_items = section.featured_ids

        featured_brands.forEach((items) => {
          feature_items.forEach((item) => {
            if (items.id == item) {
              const item_array = {
                id: items.id,
                name: items.name,
                description: items.description,
                image: items.image,
                no_of_items: items.product_count,
              }
              feature_brands.result.push(item_array)
            }
          })
        })

        data.home.sections[keyType].featured_brand = feature_brands
      }
    })

    // Step 7: Save the updated settings
    const final_data = JSON.stringify(data)
    const user_id =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1] || "0"

    const saveResponse = await fetch(`${API_PATH}saveRestaurantSettings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        brand_id: brandId,
        user_id: user_id,
        data: final_data,
        type: "web_theme",
      }).toString(),
    })

    if (!saveResponse.ok) {
      throw new Error(`Failed to save updated settings: ${saveResponse.status}`)
    }

    return {
      success: true,
      message: "Cache purged successfully!",
    }
  } catch (error) {
    console.error("Error during cache purge process:", error)
    return {
      success: false,
      message: `Failed to purge cache: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
