"use client"

import type { HeaderConfig } from "@/lib/header-types"
import { Search, Phone, ShoppingCart, User, MapPin, ChevronDown } from "lucide-react"
import Link from "next/link"

interface HeaderPreviewProps {
  config: HeaderConfig
  brandLogo?: string | null
  brandName: string
  isLoading?: boolean
}

export default function HeaderPreview({ config, brandLogo, brandName, isLoading = false }: HeaderPreviewProps) {
  if (isLoading) {
    return (
      <div className="header-preview p-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Helper function to render custom HTML
  const renderCustomHtml = (html: string) => {
    if (!html) return null
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  // Update the renderLinkItem function to properly use all dynamic values from the API
  const renderLinkItem = (item: any, setting: any) => {
    // Check if this item has sub-links - support multiple data formats
    const hasSubMenu = item.sub_link === 1 || item.sub_link === "1" || item.sub_link === true

    // Check if sub_settings exists and has items
    const hasSubLinks =
      hasSubMenu &&
      item.sub_settings &&
      (Array.isArray(item.sub_settings)
        ? item.sub_settings.length > 0
        : Object.keys(item.sub_settings || {}).length > 0)

    // Get the correct values from either setting or item properties
    const itemName = setting?.item_label || item.name || ""
    const itemColor = setting?.item_label_color || item.color || "#ffe4af"
    const itemRoute = setting?.item_route || item.route || "#"
    const itemFontSize = setting?.link_font_size || item.font_size || "14px"
    const itemFontWeight = setting?.link_font_weight || item.font_weight || "400"
    const itemPadding = setting?.link_padding || item.padding || "0px"
    const itemBgColor = setting?.item_bg_color || item.background_color || ""
    const itemBorderRadius = setting?.item_border_radius || item.border_radius || ""
    const itemMargin = setting?.link_margin || item.margin || "0px"
    const itemBorder = setting?.link_border || item.border || ""
    const itemBorderLeft = setting?.link_border_left || item.border_left || ""

    return (
      <div
        key={item.id}
        className="relative group"
        style={{
          backgroundColor: itemBgColor,
          borderRadius: itemBorderRadius,
          margin: itemMargin,
          padding: itemPadding,
          border: itemBorder,
          borderLeft: itemBorderLeft,
        }}
      >
        <Link
          href={itemRoute}
          className="block flex items-center"
          style={{
            color: itemColor,
            fontSize: itemFontSize,
            fontWeight: itemFontWeight,
            padding: itemPadding,
          }}
          target={item.target_blank ? "_blank" : "_self"}
        >
          {setting?.link_icon && <span dangerouslySetInnerHTML={{ __html: setting.link_icon }} />}
          {itemName}
          {/* Only show dropdown icon if there are actual sublinks */}
          {hasSubMenu && hasSubLinks && <ChevronDown className="ml-1 h-3 w-3" />}
        </Link>

        {/* Render sub-links if available */}
        {hasSubMenu && hasSubLinks && (
          <ul className="dropdown-menu">
            {(() => {
              // Handle both array and object formats for sub-links
              let subLinks = []
              if (Array.isArray(item.sub_settings)) {
                subLinks = item.sub_settings
              } else if (typeof item.sub_settings === "object") {
                // Convert object to array for rendering
                subLinks = Object.values(item.sub_settings)
              }

              return subLinks.map((subItem: any, subIndex: number) => {
                // Skip empty sub-links
                if (!subItem || !subItem.sub_link_label) return null

                // Check if this sub-item has inner sub-links
                const hasInnerSubMenu =
                  subItem.inner_sub_link_on_off === true ||
                  subItem.inner_sub_link_on_off === 1 ||
                  subItem.inner_sub_link_on_off === "1"

                const hasInnerSubLinks =
                  hasInnerSubMenu &&
                  subItem.inner_sub_settings &&
                  (Array.isArray(subItem.inner_sub_settings)
                    ? subItem.inner_sub_settings.length > 0
                    : Object.keys(subItem.inner_sub_settings || {}).length > 0)

                return (
                  <li key={subIndex} className={hasInnerSubLinks ? "relative group/inner" : ""}>
                    <Link
                      href={subItem.sub_link_route || "#"}
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        {subItem.sub_link_icon && (
                          <img
                            src={subItem.sub_link_icon || "/placeholder.svg"}
                            alt=""
                            className="inline-block mr-2"
                            width="20"
                          />
                        )}
                        {subItem.sub_link_label}
                      </span>
                      {/* Only show chevron if it has inner sublinks */}
                      {hasInnerSubLinks && <span className="ml-1">»</span>}
                    </Link>

                    {/* Render inner sub-links if available */}
                    {hasInnerSubLinks && (
                      <ul className="submenu">
                        {(() => {
                          // Handle both array and object formats for inner sub-links
                          let innerSubLinks = []
                          if (Array.isArray(subItem.inner_sub_settings)) {
                            innerSubLinks = subItem.inner_sub_settings
                          } else if (typeof subItem.inner_sub_settings === "object") {
                            // Convert object to array for rendering
                            innerSubLinks = Object.values(subItem.inner_sub_settings)
                          }

                          return innerSubLinks.map((innerItem: any, innerIndex: number) => (
                            <li key={innerIndex}>
                              <Link
                                href={innerItem.inner_sub_link_route || "#"}
                                className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                              >
                                {innerItem.inner_sub_link_label}
                              </Link>
                            </li>
                          ))
                        })()}
                      </ul>
                    )}
                  </li>
                )
              })
            })()}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div
      className="header-preview"
      style={{
        backgroundColor: "#4e2e0b", // Brown background color from JSON
        color: "white",
      }}
    >
      {/* Ticker - only show if header_ticker_on_off is true */}
      {(config.ticker.header_ticker_on_off === true ||
        config.ticker.header_ticker_on_off === "1" ||
        config.ticker.header_ticker_on_off === 1) && (
        <div
          className="ticker-bar w-full text-center py-1 text-sm"
          style={{
            backgroundColor: config.ticker.ticker_bg_color,
            color: config.ticker.ticker_font_color,
            position:
              config.ticker.sticky_ticker === true ||
              config.ticker.sticky_ticker_on_off === "1" ||
              config.ticker.sticky_ticker_on_off === 1
                ? "sticky"
                : "relative",
            top:
              config.ticker.sticky_ticker === true ||
              config.ticker.sticky_ticker_on_off === "1" ||
              config.ticker.sticky_ticker_on_off === 1
                ? 0
                : "auto",
            zIndex:
              config.ticker.sticky_ticker === true ||
              config.ticker.sticky_ticker_on_off === "1" ||
              config.ticker.sticky_ticker_on_off === 1
                ? 50
                : "auto",
          }}
        >
          {config.ticker.header_ticker_text}
        </div>
      )}

      {/* Navigation Bars */}
      {config.nav.map(
        (bar, barIndex) =>
          (bar.show_bar || bar.bar_on_off === "1") && (
            <div
              key={bar.id}
              className="nav-bar"
              style={{
                backgroundColor: bar.bar_background_color || "#4e2e0b",
                height: bar.height || "auto",
                borderTop: bar.border_top,
                borderBottom: bar.border_bottom,
                margin: bar.margin,
                padding: bar.padding,
                position: bar.sticky_header ? "sticky" : "relative",
                top: bar.sticky_header ? 0 : "auto",
                zIndex: bar.sticky_header ? 40 - barIndex : "auto",
                background: bar.transparent_header ? "transparent" : bar.bar_background_color || "#4e2e0b",
              }}
            >
              <div className={bar.container ? "container mx-auto px-4" : "w-full"}>
                <div className="flex items-center justify-between h-full">
                  {bar.list.map((list) => {
                    // Determine list position class
                    let positionClass = ""
                    if (list.position === "left") {
                      positionClass = "justify-start"
                    } else if (list.position === "center") {
                      positionClass = "justify-center"
                    } else if (list.position === "right") {
                      positionClass = "justify-end"
                    }

                    // Get items from list - handle both array and object formats
                    const items = Array.isArray(list.items)
                      ? list.items
                      : typeof list.items === "object"
                        ? Object.values(list.items)
                        : []

                    return (
                      <div
                        key={list.id}
                        className={`flex items-center ${positionClass} ${list.position === "center" ? "flex-1 mx-4" : ""}`}
                      >
                        {items.map((item, itemIndex) => {
                          if (!item) return null

                          // Skip items with extra_class="d-none"
                          if (item.setting?.link_extra_class === "d-none" || item.extra_class === "d-none") {
                            return null
                          }

                          // Check if this item has sub-links
                          const hasSubMenu = item.sub_link === 1 || item.sub_link === "1"
                          const hasCustomSubLinks = item.custom_sub_link === 1 || item.custom_sub_link === "1"

                          // Render different item types
                          switch (item.type) {
                            case "logo":
                              return (
                                <div
                                  key={item.id || `logo-${itemIndex}`}
                                  style={{
                                    backgroundColor: item.background_color,
                                    borderRadius: item.border_radius,
                                    margin: item.margin,
                                    padding: item.padding,
                                    border: item.border,
                                    borderLeft: item.border_left,
                                  }}
                                >
                                  <Link href={item.route || "/"}>
                                    <img
                                      src={
                                        item.setting?.logo_link || brandLogo || "/placeholder.svg?height=50&width=150"
                                      }
                                      alt={brandName}
                                      className="h-12 object-contain"
                                      style={{ width: item.setting?.logo_width || "auto" }}
                                    />
                                  </Link>
                                </div>
                              )

                            case "search":
                              return (
                                <div
                                  key={item.id || `search-${itemIndex}`}
                                  className="relative w-full"
                                  style={{
                                    backgroundColor: item.background_color,
                                    borderRadius: item.border_radius,
                                    margin: item.margin,
                                    padding: item.padding,
                                    border: item.border,
                                    borderLeft: item.border_left,
                                  }}
                                >
                                  {/* For search with border bottom */}
                                  {item.setting?.search_border_bottom === "1" ||
                                  item.setting?.search_border_bottom === 1 ? (
                                    <div className="input-group flex">
                                      <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={20}
                                      />
                                      <input
                                        style={{
                                          borderTopWidth: "0",
                                          borderLeftWidth: "0",
                                          borderRightWidth: "0",
                                          borderBottomWidth: "1px",
                                          borderBottomStyle: "solid",
                                          borderBottomColor: "#cfcfcf",
                                          borderBottomRightRadius: "0px",
                                          borderBottomLeftRadius: "0px",
                                          paddingLeft: "30px",
                                          backgroundColor: "transparent",
                                          width: item.setting?.search_width || "560px",
                                          color: "#ffffff",
                                        }}
                                        className="form-control autosearch-input w-full"
                                        type="search"
                                        placeholder={item.setting?.search_placeholder || "Search items here....."}
                                      />
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder={item.setting?.search_placeholder || "Search"}
                                      className="w-full py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#d9365e]"
                                      style={{
                                        fontSize: item.font_size,
                                        width: item.setting?.search_width || "100%",
                                      }}
                                    />
                                  )}
                                </div>
                              )

                            case "number":
                              return (
                                <div
                                  key={item.id || `number-${itemIndex}`}
                                  style={{
                                    backgroundColor: item.background_color,
                                    borderRadius: item.border_radius,
                                    margin: item.margin,
                                    padding: item.padding,
                                    border: item.border,
                                    borderLeft: item.border_left,
                                  }}
                                >
                                  <Link
                                    href={item.route || "#"}
                                    className="flex items-center"
                                    style={{
                                      color: item.color,
                                      fontSize: item.font_size,
                                      fontWeight: item.font_weight,
                                    }}
                                  >
                                    {item.icon ? (
                                      <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                                    ) : (
                                      <Phone className="mr-2" size={16} />
                                    )}
                                    {item.name}
                                  </Link>
                                </div>
                              )

                            case "link":
                              return renderLinkItem(item, item.setting)

                            case "cart":
                              return (
                                <div
                                  key={item.id || `cart-${itemIndex}`}
                                  style={{
                                    backgroundColor: item.background_color,
                                    borderRadius: item.border_radius,
                                    margin: item.margin,
                                    padding: item.padding,
                                    border: item.border,
                                    borderLeft: item.border_left,
                                  }}
                                >
                                  <Link
                                    href={item.route || "#"}
                                    className="flex items-center relative"
                                    style={{
                                      color: item.color,
                                      fontSize: item.font_size,
                                      fontWeight: item.font_weight,
                                    }}
                                  >
                                    {item.setting?.cart_icon ? (
                                      <span dangerouslySetInnerHTML={{ __html: item.setting.cart_icon }} />
                                    ) : (
                                      <ShoppingCart className="mr-2" size={16} />
                                    )}
                                    {item.name}
                                    <span
                                      className="absolute text-white text-xs font-semibold text-center leading-5 rounded-full w-[18px] h-[18px]"
                                      style={{
                                        top: item.setting?.cart_count_top || "-3px",
                                        right: item.setting?.cart_count_right || "0px",
                                        backgroundColor: item.setting?.cart_count_bg_color || "#ffe4af",
                                      }}
                                    >
                                      0
                                    </span>
                                  </Link>
                                </div>
                              )

                            case "login_signup":
                              return (
                                <div
                                  key={item.id || `login-${itemIndex}`}
                                  style={{
                                    backgroundColor: item.background_color,
                                    borderRadius: item.border_radius,
                                    margin: item.margin,
                                    padding: item.padding,
                                    border: item.border,
                                    borderLeft: item.border_left,
                                  }}
                                >
                                  <Link
                                    href={item.setting?.login_signup_route || "#"}
                                    className="flex items-center"
                                    style={{
                                      color: item.setting?.login_signup_label_color || item.color || "#ffffff",
                                      fontSize: item.font_size,
                                      fontWeight: item.font_weight,
                                    }}
                                  >
                                    {item.setting?.login_icon ? (
                                      <span dangerouslySetInnerHTML={{ __html: item.setting.login_icon }} />
                                    ) : (
                                      <User className="mr-2" size={16} />
                                    )}
                                    {item.setting?.login_signup_label || item.name}
                                  </Link>
                                </div>
                              )

                            case "location":
                              return (
                                <div
                                  key={item.id || `location-${itemIndex}`}
                                  style={{
                                    backgroundColor: item.background_color,
                                    borderRadius: item.border_radius,
                                    margin: item.margin,
                                    padding: item.padding,
                                    border: item.border,
                                    borderLeft: item.border_left,
                                  }}
                                >
                                  <div
                                    className="flex items-center"
                                    style={{
                                      color: item.setting?.location_color || item.color || "#ffe4af",
                                      fontSize: item.font_size,
                                      fontWeight: item.font_weight,
                                    }}
                                  >
                                    {item.setting?.location_label || "Nearest Branch"}
                                    <MapPin className="ml-1" size={14} />
                                  </div>
                                </div>
                              )

                            default:
                              return (
                                <div
                                  key={item.id || `default-${itemIndex}`}
                                  style={{
                                    backgroundColor: item.background_color,
                                    borderRadius: item.border_radius,
                                    margin: item.margin,
                                    padding: item.padding,
                                    border: item.border,
                                    borderLeft: item.border_left,
                                  }}
                                >
                                  <Link
                                    href={item.route || "#"}
                                    className="flex items-center"
                                    style={{
                                      color: item.color,
                                      fontSize: item.font_size,
                                      fontWeight: item.font_weight,
                                    }}
                                  >
                                    {item.icon && <span dangerouslySetInnerHTML={{ __html: item.icon }} />}
                                    {item.name}
                                  </Link>
                                </div>
                              )
                          }
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ),
      )}
    </div>
  )
}
