"use client"

import { useState } from "react"
import { Minus, Plus, Camera } from "lucide-react"

interface SearchResultPreviewProps {
  config: any
}

// Sample product data for the preview
const sampleProducts = [
  {
    id: 1,
    name: "Brim Burger Each",
    code: "CAD 299",
    price: 299,
    discounted_price: 199,
    discount: 33.44,
    discount_value: 100,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&h=600&fit=crop&crop=faces,center",
    status: 0, // 0 = available, 1 = not available
    category: "Burgers",
    brand: "Brim",
    quantity: "1 pc",
    weight_unit: "250g",
    sku: "BRG001",
    note: "Bestseller",
    desc: "Delicious burger with cheese, lettuce, and special sauce.",
    currency: "CAD",
    price_per: "/ each",
  },
  {
    id: 2,
    name: "Smashed Shrooms",
    code: "CAD 800",
    price: 800,
    discounted_price: null,
    discount: null,
    discount_value: null,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&h=600&fit=crop&crop=faces,center",
    status: 0,
    category: "Vegetarian",
    brand: "Smashed",
    quantity: "1 pc",
    weight_unit: "300g",
    sku: "VEG002",
    note: "Vegetarian",
    desc: "Mushroom based burger with all the fixings.",
    currency: "CAD",
    price_per: "/ each",
  },
  {
    id: 3,
    name: "The Meltdown",
    code: "CAD 450",
    price: 450,
    discounted_price: null,
    discount: null,
    discount_value: null,
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=600&h=600&fit=crop&crop=faces,center",
    status: 1, // Not available
    category: "Burgers",
    brand: "Meltdown",
    quantity: "1 pc",
    weight_unit: "280g",
    sku: "BRG003",
    note: "Spicy",
    desc: "Spicy burger with melted cheese and jalapeños.",
    currency: "CAD",
    price_per: "/ each",
  },
  {
    id: 4,
    name: "Sweet Chili Time",
    code: "CAD 300",
    price: 300,
    discounted_price: 250,
    discount: 16.67,
    discount_value: 50,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=600&h=600&fit=crop&crop=faces,center",
    status: 0,
    category: "Wraps",
    brand: "Sweet",
    quantity: "1 pc",
    weight_unit: "220g",
    sku: "WRP001",
    note: "Limited time",
    desc: "Sweet chili wrap with grilled chicken and fresh vegetables.",
    currency: "CAD",
    price_per: "/ each",
  },
]

export default function SearchResultPreview({ config }: SearchResultPreviewProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(sampleProducts.map((product) => [product.id, 1])),
  )

  // Safety check for undefined config
  if (!config) {
    return (
      <div className="p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
        <div className="text-red-500">Error: Configuration data is missing</div>
      </div>
    )
  }

  const searchResult = config.search_result || {}
  console.log("searchResult", searchResult)
  const settings = searchResult.settings || {}
  console.log("settings of card:", settings)
  const items = searchResult.items || {}

  // Helper function to increment quantity
  const incrementQuantity = (productId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }))
  }

  // Helper function to decrement quantity
  const decrementQuantity = (productId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1),
    }))
  }

  // Helper function to get item settings
  const getItemSettings = (type: string) => {
    const item = Object.values(items).find((item: any) => item.type === type)
    return item ? item.settings : {}
  }

  // Determine number of cards per row
  const cardsPerRow = Number.parseInt(settings.cards_to_show) || 4
  const colSize = 12 / cardsPerRow

  return (
    <div className="card-box container p-4">
      <div className="row">
        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            cardsPerRow === 1
              ? "md:grid-cols-1"
              : cardsPerRow === 2
                ? "md:grid-cols-2"
                : cardsPerRow === 3
                  ? "md:grid-cols-3"
                  : cardsPerRow === 4
                    ? "md:grid-cols-4"
                    : cardsPerRow === 5
                      ? "md:grid-cols-5"
                      : "md:grid-cols-6"
          } gap-4`}
        >
          {sampleProducts.map((product) => {
            // Get settings for each component
            const imageSettings = getItemSettings("image")
            const nameSettings = getItemSettings("name")
            const descriptionSettings = getItemSettings("description")
            const priceSettings = getItemSettings("price")
            const discountedPriceSettings = getItemSettings("discounted_price")
            const discountPercentageSettings = getItemSettings("discount_percentage")
            const categorySettings = getItemSettings("category")
            const brandSettings = getItemSettings("brand")
            const quantitySettings = getItemSettings("quantity")
            const skuSettings = getItemSettings("sku")
            const noteSettings = getItemSettings("note")
            const notAvailableSettings = getItemSettings("not_available")
            const counterSettings = getItemSettings("counter")
            const addToCartSettings = getItemSettings("add_to_cart")

            return (
              <div key={product.id} className={`col-span-1`}>
                <div
                  className="card rounded overflow-hidden"
                  style={{
                    border: settings.card_border || "1px solid #e5e7eb",
                  }}
                >
                  <div
                    className="card-body relative"
                    style={{
                      padding: "10px",
                      backgroundColor: settings.card_bg_color || "#ffffff",
                      padding: imageSettings.image_padding === "0px" ? "0px" : "10px",
                    }}
                  >
                    {/* Discount Percentage Badge (positioned absolutely) */}
                    {discountPercentageSettings.discount_percentage_on_off === "1" &&
                      product.status === 0 &&
                      product.discount && (
                        <div
                          className="absolute top-2 right-2 z-10"
                          style={{
                            backgroundColor: discountPercentageSettings.discount_percentage_bg_color || "#ef4444",
                            color: discountPercentageSettings.discount_percentage_color || "#ffffff",
                            borderRadius: discountPercentageSettings.discount_percentage_border_radius || "4px",
                            padding: discountPercentageSettings.discount_percentage_padding || "2px 6px",
                            fontSize: discountPercentageSettings.discount_percentage_font_size || "12px",
                            fontWeight: discountPercentageSettings.discount_percentage_font_weight || "bold",
                          }}
                        >
                          {product.discount}% OFF
                        </div>
                      )}

                    {/* Image */}
                    {imageSettings.image_on_off === "1" && (
                      <div
                        className="card-product-image"
                        style={{
                          width: imageSettings.image_float === "left" ? "30%" : "100%",
                          float: imageSettings.image_float === "left" ? "left" : "none",
                        }}
                      >
                        <p>
                          <img
                            className="card-img-top w-full rounded-t-md"
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            style={{
                              objectFit: imageSettings.image_property || "cover",
                              height: imageSettings.image_height || "200px",
                              aspectRatio: "1/1",
                            }}
                          />
                        </p>
                      </div>
                    )}

                    {/* Product Info Container */}
                    <div
                      className="card-product-info"
                      style={{
                        width: imageSettings.image_float === "left" ? "70%" : "100%",
                        float: imageSettings.image_float === "left" ? "right" : "none",
                        padding:
                          imageSettings.image_float === "left" || imageSettings.image_padding === "0px" ? "15px" : "0",
                      }}
                    >
                      {/* Product Name */}
                      {nameSettings.name_on_off === "1" && (
                        <p
                          className="card-name mb-1 font-weight-bold"
                          style={{
                            display: "block",
                            textOverflow: "ellipsis",
                            wordWrap: "break-word",
                            overflow: "hidden",
                            maxHeight: "45px",
                            lineHeight: "1.6em",
                            float: nameSettings.name_float || "none",
                            textAlign: nameSettings.name_text_align || "left",
                            color: nameSettings.name_color || "black",
                            backgroundColor: nameSettings.name_bg_color || "",
                            borderRadius: nameSettings.name_border_radius || "",
                            margin: nameSettings.name_margin || "",
                            padding: nameSettings.name_padding || "",
                            fontSize: nameSettings.name_font_size || "",
                            border: nameSettings.name_border || "",
                            borderBottom: nameSettings.name_border_bottom || "",
                            fontWeight: nameSettings.name_font_weight || "",
                            height: nameSettings.name_height || "auto",
                          }}
                        >
                          {product.name} <span className="card-weight">{product.weight_unit}</span>
                          {nameSettings.show_camera_icon && <Camera className="inline-block ml-1" size={16} />}
                        </p>
                      )}

                      {/* Description */}
                      {descriptionSettings.description_on_off === "1" && (
                        <p
                          className="card-description mb-1"
                          style={{
                            display: "block",
                            textOverflow: "ellipsis",
                            wordWrap: "break-word",
                            overflow: "hidden",
                            maxHeight: "45px",
                            lineHeight: "1.8em",
                            textAlign: descriptionSettings.description_text_align || "left",
                            color: descriptionSettings.description_color || "black",
                            margin: descriptionSettings.description_margin || "",
                            padding: descriptionSettings.description_padding || "",
                            fontSize: descriptionSettings.description_font_size || "",
                            fontWeight: descriptionSettings.description_font_weight || "",
                            borderBottom: descriptionSettings.description_border_bottom || "",
                            height: descriptionSettings.description_height || "",
                          }}
                        >
                          {product.desc}
                        </p>
                      )}

                      {/* Price */}
                      {priceSettings.price_on_off === "1" && product.status === 0 && (
                        <p
                          className="card-price mb-1"
                          style={{
                            maxWidth: priceSettings.price_width || "",
                            flex: priceSettings.price_width ? `0 0 ${priceSettings.price_width}` : "",
                            float: priceSettings.price_float || "none",
                            textAlign: priceSettings.price_text_align || "left",
                            color: priceSettings.price_color || "black",
                            backgroundColor: priceSettings.price_bg_color || "",
                            borderRadius: priceSettings.price_border_radius || "",
                            margin: priceSettings.price_margin || "",
                            padding: priceSettings.price_padding || "",
                            fontSize: priceSettings.price_font_size || "",
                            border: priceSettings.price_border || "",
                            borderBottom: priceSettings.price_border_bottom || "",
                            fontWeight: priceSettings.price_font_weight || "",
                          }}
                        >
                          <span className="currency">{product.currency}</span> {product.price}
                        </p>
                      )}

                      {/* Discounted Price */}
                      {discountedPriceSettings.discounted_price_on_off === "1" &&
                        product.status === 0 &&
                        product.discount_value && (
                          <p
                            className="card-discounted_price mb-1"
                            style={{
                              width: discountedPriceSettings.discounted_price_width || "",
                              float: discountedPriceSettings.discounted_price_float || "none",
                              textAlign: discountedPriceSettings.discounted_price_text_align || "left",
                              color: discountedPriceSettings.discounted_price_color || "black",
                              backgroundColor: discountedPriceSettings.discounted_price_bg_color || "",
                              borderRadius: discountedPriceSettings.discounted_price_border_radius || "",
                              margin: discountedPriceSettings.discounted_price_margin || "",
                              padding: discountedPriceSettings.discounted_price_padding || "",
                              fontSize: discountedPriceSettings.discounted_price_font_size || "",
                              border: discountedPriceSettings.discounted_price_border || "",
                              borderBottom: discountedPriceSettings.discounted_price_border_bottom || "",
                              fontWeight: discountedPriceSettings.discounted_price_font_weight || "",
                            }}
                          >
                            {product.currency} {product.price - (product.discount_value || 0)} {product.price_per}
                          </p>
                        )}

                      {/* Category */}
                      {categorySettings.category_on_off === "1" && (
                        <p
                          className="card-category mb-1"
                          style={{
                            float: categorySettings.category_float || "none",
                            textAlign: categorySettings.category_text_align || "left",
                            color: categorySettings.category_color || "black",
                            backgroundColor: categorySettings.category_bg_color || "",
                            borderRadius: categorySettings.category_border_radius || "",
                            margin: categorySettings.category_margin || "",
                            padding: categorySettings.category_padding || "",
                            fontSize: categorySettings.category_font_size || "",
                            border: categorySettings.category_border || "",
                            borderBottom: categorySettings.category_border_bottom || "",
                            fontWeight: categorySettings.category_font_weight || "",
                          }}
                        >
                          {product.category}
                        </p>
                      )}

                      {/* Brand */}
                      {brandSettings.brand_on_off === "1" && (
                        <p
                          className="card-brand mb-1"
                          style={{
                            float: brandSettings.brand_float || "none",
                            textAlign: brandSettings.brand_text_align || "left",
                            color: brandSettings.brand_color || "black",
                            backgroundColor: brandSettings.brand_bg_color || "",
                            borderRadius: brandSettings.brand_border_radius || "",
                            margin: brandSettings.brand_margin || "",
                            padding: brandSettings.brand_padding || "",
                            fontSize: brandSettings.brand_font_size || "",
                            border: brandSettings.brand_border || "",
                            borderBottom: brandSettings.brand_border_bottom || "",
                            fontWeight: brandSettings.brand_font_weight || "",
                          }}
                        >
                          {product.brand}
                        </p>
                      )}

                      {/* Quantity */}
                      {quantitySettings.quantity_on_off === "1" && (
                        <p
                          className="card-quantity mb-1"
                          style={{
                            float: quantitySettings.quantity_float || "none",
                            textAlign: quantitySettings.quantity_text_align || "left",
                            color: quantitySettings.quantity_color || "black",
                            backgroundColor: quantitySettings.quantity_bg_color || "",
                            borderRadius: quantitySettings.quantity_border_radius || "",
                            margin: quantitySettings.quantity_margin || "",
                            padding: quantitySettings.quantity_padding || "",
                            fontSize: quantitySettings.quantity_font_size || "",
                            border: quantitySettings.quantity_border || "",
                            borderBottom: quantitySettings.quantity_border_bottom || "",
                            fontWeight: quantitySettings.quantity_font_weight || "",
                          }}
                        >
                          {product.quantity}
                        </p>
                      )}

                      {/* SKU */}
                      {skuSettings.sku_on_off === "1" && (
                        <p
                          className="card-sku mb-1"
                          style={{
                            float: skuSettings.sku_float || "none",
                            textAlign: skuSettings.sku_text_align || "left",
                            color: skuSettings.sku_color || "black",
                            backgroundColor: skuSettings.sku_bg_color || "",
                            borderRadius: skuSettings.sku_border_radius || "",
                            margin: skuSettings.sku_margin || "",
                            padding: skuSettings.sku_padding || "",
                            fontSize: skuSettings.sku_font_size || "",
                            border: skuSettings.sku_border || "",
                            borderBottom: skuSettings.sku_border_bottom || "",
                            fontWeight: skuSettings.sku_font_weight || "",
                          }}
                        >
                          {product.sku}
                        </p>
                      )}

                      {/* Note */}
                      {noteSettings.note_on_off === "1" && (
                        <p
                          className="card-note mb-1"
                          style={{
                            float: noteSettings.note_float || "none",
                            textAlign: noteSettings.note_text_align || "left",
                            color: noteSettings.note_color || "black",
                            backgroundColor: noteSettings.note_bg_color || "",
                            borderRadius: noteSettings.note_border_radius || "",
                            margin: noteSettings.note_margin || "",
                            padding: noteSettings.note_padding || "",
                            fontSize: noteSettings.note_font_size || "",
                            border: noteSettings.note_border || "",
                            borderBottom: noteSettings.note_border_bottom || "",
                            fontWeight: noteSettings.note_font_weight || "",
                          }}
                        >
                          {product.note}
                        </p>
                      )}

                      {/* Not Available */}
                      {notAvailableSettings.not_available_on_off === "1" && product.status === 1 && (
                        <p
                          className="card-not_available mb-1"
                          style={{
                            float: notAvailableSettings.not_available_float || "none",
                            textAlign: notAvailableSettings.not_available_text_align || "left",
                            color: notAvailableSettings.not_available_color || "red",
                            backgroundColor: notAvailableSettings.not_available_bg_color || "",
                            borderRadius: notAvailableSettings.not_available_border_radius || "",
                            margin: notAvailableSettings.not_available_margin || "",
                            padding: notAvailableSettings.not_available_padding || "",
                            fontSize: notAvailableSettings.not_available_font_size || "",
                            border: notAvailableSettings.not_available_border || "",
                            borderBottom: notAvailableSettings.not_available_border_bottom || "",
                            fontWeight: notAvailableSettings.not_available_font_weight || "",
                          }}
                        >
                          {notAvailableSettings.not_available_text || "Not Available"}
                        </p>
                      )}

                      {/* Counter */}
                      {counterSettings.counter_on_off === "1" && product.status === 0 && (
                        <div
                          className="main_counter_box flex mb-1"
                          style={{
                            float: counterSettings.counter_float || "none",
                            borderBottom: counterSettings.counter_border_bottom || "",
                          }}
                        >
                          <div className="counter_minus_button">
                            <a
                              href="javascript:;"
                              className="main-popup-cart-minus"
                              onClick={() => decrementQuantity(product.id)}
                              style={{
                                padding: "0px 6px",
                                color: counterSettings.counter_color || "black",
                                borderRadius: "3px",
                                display: "inline-block",
                                width: "25px",
                                height: "25px",
                                fontWeight: "bolder",
                                backgroundColor: counterSettings.counter_minus_bg_color || "",
                              }}
                            >
                              <Minus size={12} />
                            </a>
                          </div>
                          <div className="counter_quantity">
                            <span className="qty" style={{ margin: "0px 10px 0px 10px" }}>
                              {quantities[product.id] || 1}
                            </span>
                          </div>
                          <div className="counter_plus_button">
                            <a
                              href="javascript:;"
                              className="main-popup-cart-plus"
                              onClick={() => incrementQuantity(product.id)}
                              style={{
                                padding: "0px 7px",
                                color: counterSettings.counter_color || "black",
                                borderRadius: "3px",
                                display: "inline-block",
                                width: "25px",
                                height: "25px",
                                fontWeight: "bolder",
                                backgroundColor: counterSettings.counter_plus_bg_color || "",
                              }}
                            >
                              <Plus size={12} />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Add to Cart */}
                      {addToCartSettings.add_to_cart_on_off === "1" && product.status === 0 && (
                        <p
                          className="add-to-cart-button mb-1"
                          style={{
                            textAlign: addToCartSettings.add_to_cart_text_align || "left",
                            float: addToCartSettings.add_to_cart_float || "none",
                            margin: addToCartSettings.add_to_cart_margin || "",
                            borderBottom: addToCartSettings.add_to_cart_border_bottom || "",
                          }}
                        >
                          <a
                            href="javascript:void(0);"
                            className="product-grid-popup-cart"
                            style={{
                              maxWidth: addToCartSettings.add_to_cart_width || "",
                              flex: addToCartSettings.add_to_cart_width
                                ? `0 0 ${addToCartSettings.add_to_cart_width}`
                                : "",
                              color: addToCartSettings.add_to_cart_color || "white",
                              backgroundColor: addToCartSettings.add_to_cart_bg_color || "#e07c51",
                              borderRadius: addToCartSettings.add_to_cart_border_radius || "4px",
                              margin: addToCartSettings.add_to_cart_margin || "",
                              padding: addToCartSettings.add_to_cart_padding || "6px 12px",
                              fontSize: addToCartSettings.add_to_cart_font_size || "",
                              border: addToCartSettings.add_to_cart_border || "",
                              fontWeight: addToCartSettings.add_to_cart_font_weight || "",
                              display: "inline-block",
                            }}
                          >
                            {addToCartSettings.add_to_cart_label || "Add To Cart"}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
