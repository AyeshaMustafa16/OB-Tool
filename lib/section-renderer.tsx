"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface SectionRendererProps {
  section: any
  products?: any[]
  categories?: any[]
  brands?: any[]
}

export default function SectionRenderer({
  section,
  products = [],
  categories = [],
  brands = [],
}: SectionRendererProps) {
  const [content, setContent] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    if (!section) return

    // Only render active sections
    if (section.status !== 1) {
      setContent(null)
      return
    }

    switch (section.type) {
      case "custom":
        setContent(<CustomSection section={section} />)
        break
      case "featured":
        setContent(<FeaturedItemsSection section={section} products={products} />)
        break
      case "category":
        setContent(<CategorySection section={section} categories={categories} />)
        break
      case "brand":
        setContent(<BrandSection section={section} brands={brands} />)
        break
      case "instagram":
        setContent(<SocialFeedSection section={section} />)
        break
      default:
        setContent(null)
    }
  }, [section, products, categories, brands])

  if (!content) return null

  return content
}

function CustomSection({ section }: { section: any }) {
  if (!section.design) {
    return (
      <Card className="mb-6 bg-pink-100 border-pink-200">
        <CardContent className="p-6">
          <div dangerouslySetInnerHTML={{ __html: section.design }} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 bg-pink-100 border-pink-200">
      <CardContent className="p-6">
        <div dangerouslySetInnerHTML={{ __html: section.design }} />
      </CardContent>
    </Card>
  )
}

function FeaturedItemsSection({ section, products }: { section: any; products: any[] }) {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])

  useEffect(() => {
    if (!Array.isArray(products) || !section) return

    let filteredProducts = []

    // Check if "all" is selected or specific products
    if (section.featured_items?.includes("all")) {
      filteredProducts = [...products]
    } else if (Array.isArray(section.featured_items) && section.featured_items.length > 0) {
      filteredProducts = products.filter(
        (product) =>
          section.featured_items.includes(product.product_id) ||
          section.featured_items.includes(String(product.product_id)),
      )
    }

    // Limit the number of products based on the cards setting
    const limit = Number.parseInt(section.cards) || 4
    setFeaturedProducts(filteredProducts.slice(0, limit))
  }, [products, section])

  if (featuredProducts.length === 0) {
    return (
      <Card className="mb-6 bg-pink-100 border-pink-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">{section.name || "Featured Items"}</h2>
          <p className="text-gray-500">No featured products available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 bg-pink-100 border-pink-200">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">{section.name || "Featured Items"}</h2>
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(featuredProducts.length, 4)} gap-4`}>
          {featuredProducts.map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="aspect-square bg-gray-100 mb-2 rounded-md overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <h3 className="font-medium">{product.product_name}</h3>
              {product.price && <p className="text-gray-700">${Number.parseFloat(product.price).toFixed(2)}</p>}
            </div>
          ))}
        </div>
        {section.view_all === 1 && (
          <div className="mt-4 text-center">
            <button className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600">View All</button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CategorySection({ section, categories }: { section: any; categories: any[] }) {
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([])

  useEffect(() => {
    if (!Array.isArray(categories) || !section) return

    let filteredCategories = []

    if (Array.isArray(section.featured_ids) && section.featured_ids.length > 0) {
      filteredCategories = categories.filter(
        (category) =>
          section.featured_ids.includes(category.category_id) ||
          section.featured_ids.includes(String(category.category_id)),
      )
    }

    setFeaturedCategories(filteredCategories)
  }, [categories, section])

  return (
    <Card className="mb-6 bg-pink-100 border-pink-200">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Featured Categories</h2>
        {featuredCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="font-medium">{category.category_name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: section.design || "<p>No categories selected</p>" }} />
        )}
      </CardContent>
    </Card>
  )
}

function BrandSection({ section, brands }: { section: any; brands: any[] }) {
  const [featuredBrands, setFeaturedBrands] = useState<any[]>([])

  useEffect(() => {
    if (!Array.isArray(brands) || !section) return

    let filteredBrands = []

    if (Array.isArray(section.featured_ids) && section.featured_ids.length > 0) {
      filteredBrands = brands.filter(
        (brand) => section.featured_ids.includes(brand.id) || section.featured_ids.includes(String(brand.id)),
      )
    }

    setFeaturedBrands(filteredBrands)
  }, [brands, section])

  return (
    <Card className="mb-6 bg-pink-100 border-pink-200">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Featured Brands</h2>
        {featuredBrands.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredBrands.map((brand, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="font-medium">{brand.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: section.design || "<p>No brands selected</p>" }} />
        )}
      </CardContent>
    </Card>
  )
}

function SocialFeedSection({ section }: { section: any }) {
  return (
    <Card className="mb-6 bg-pink-100 border-pink-200">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">{section.insta_section_name || "Social Feed"}</h2>
        {section.insta_token ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <p className="col-span-full text-gray-500">Instagram feed will be displayed here</p>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: section.social_feed_editor }} />
        )}
      </CardContent>
    </Card>
  )
}
