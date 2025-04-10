"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, Phone, ShoppingCart, User, MapPin, ChevronDown } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import Link from "next/link"

interface HeaderThemeProps {
  brandLogo?: string | null
  brandName?: string
  isPreview?: boolean
  headerConfig?: any
}

export default function HeaderTheme({ brandLogo, brandName, isPreview = false, headerConfig }: HeaderThemeProps) {
  const { settings } = useSettings()
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState("0.00")
  const [nearestBranch, setNearestBranch] = useState("Nearest Branch")
  const [headerError, setHeaderError] = useState<string | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Get header settings from context or props
  const headerSettings = headerConfig || settings?.settings?.header || null

  // Ensure logo URL is properly formatted
  const logoUrl = settings.business_logo || brandLogo || "/placeholder.svg?height=50&width=150"

  // Add additional validation for the logo URL
  useEffect(() => {
    // Validate the logo URL
    if (logoUrl === "/" || !logoUrl || logoUrl.trim() === "") {
      console.warn("Invalid logo URL detected, using placeholder instead")
    }
  }, [logoUrl])

  // Add a more aggressive approach to prevent navigation when in preview mode
  useEffect(() => {
    if (isPreview && headerRef.current) {
      console.log("Applying preview mode navigation prevention")

      // Create an overlay div that captures all clicks
      const overlay = document.createElement("div")
      overlay.style.position = "absolute"
      overlay.style.top = "0"
      overlay.style.left = "0"
      overlay.style.width = "100%"
      overlay.style.height = "100%"
      overlay.style.zIndex = "1000"
      overlay.style.backgroundColor = "transparent"

      // Add the overlay to the header
      headerRef.current.style.position = "relative"
      headerRef.current.appendChild(overlay)

      // Prevent all clicks on the overlay
      overlay.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log("Click intercepted by overlay")
        return false
      })

      // Disable all links in the header
      const links = headerRef.current.querySelectorAll("a")
      links.forEach((link) => {
        link.style.pointerEvents = "none"
        link.setAttribute("data-original-href", link.getAttribute("href") || "")
        link.setAttribute("href", "javascript:void(0)")
      })

      // Return cleanup function
      return () => {
        if (headerRef.current) {
          headerRef.current.removeChild(overlay)
          links.forEach((link) => {
            link.style.pointerEvents = ""
            const originalHref = link.getAttribute("data-original-href")
            if (originalHref) {
              link.setAttribute("href", originalHref)
            }
          })
        }
      }
    }
  }, [isPreview])

  useEffect(() => {
    // Get nearest branch from cookie if available
    const nearestBranchCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("nearest_brand_name="))
      ?.split("=")[1]

    if (nearestBranchCookie) {
      setNearestBranch(nearestBranchCookie)
    }

    if (headerSettings) {
      try {
        // Debug the header structure
        console.log("Header settings:", {
          ticker: headerSettings.ticker,
          navCount: Array.isArray(headerSettings.nav) ? headerSettings.nav.length : "Not an array",
        })
      } catch (error) {
        console.error("Error debugging header structure:", error)
        setHeaderError("Error processing header structure")
      }
    }
  }, [headerSettings])

  // Prevent default for all link clicks when in preview mode
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault()
      e.stopPropagation()
      console.log("Link click prevented in preview")
    }
  }

  if (headerError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {headerError}</span>
      </div>
    )
  }

  if (!headerSettings) {
    return null
  }

  // Render ticker - only if header_ticker_on_off is true
  const renderTicker = () => {
    try {
      const ticker = headerSettings.ticker || {}

      // Check if ticker is turned on - could be boolean or string "1"
      const isTickerOn =
        ticker.header_ticker_on_off === true || ticker.header_ticker_on_off === "1" || ticker.header_ticker_on_off === 1

      if (!isTickerOn) {
        return null
      }

      // Check if ticker is sticky - could be boolean or string "1"
      const isTickerSticky =
        ticker.sticky_ticker === true || ticker.sticky_ticker_on_off === "1" || ticker.sticky_ticker_on_off === 1

      return (
        <div
          className="header_ticker w-full text-center text-xs py-1"
          style={{
            background: ticker.ticker_bg_color || "#fde6c6",
            color: ticker.ticker_font_color || "#000000",
            zIndex: 1,
            height: "21px",
            position: isTickerSticky ? "sticky" : "relative",
            top: isTickerSticky ? 0 : "auto",
          }}
        >
          <p>{ticker.header_ticker_text || "Fast & free delivery. You can place your order from 10:00AM to 9:45PM"}</p>
        </div>
      )
    } catch (error) {
      console.error("Error rendering ticker:", error)
      return null
    }
  }

  // Render icon with HTML
  const renderIcon = (iconHtml: string) => {
    if (!iconHtml) return null
    return <span dangerouslySetInnerHTML={{ __html: iconHtml }} />
  }

  // Render custom HTML for sub-links
  const renderCustomSubLinks = (customHtml: string) => {
    if (!customHtml) return null
    return <div dangerouslySetInnerHTML={{ __html: customHtml }} />
  }

  // Update the renderMenuItem function to handle potential null or undefined items
  const renderMenuItem = (item: any, barKey: number, listKey: number, itemKey: number) => {
    try {
      if (!item || typeof item !== "object") {
        console.warn(`Invalid item at bar ${barKey}, list ${listKey}, item ${itemKey}`, item)
        return null
      }

      // Safely access properties with optional chaining
      const setting = item.setting || {}
      const type = item.type || "link"

      switch (type) {
        case "link":
          return renderLinkItem(item, setting)
        case "facebook":
        case "instagram":
        case "twitter":
        case "google":
        case "youtube":
        case "tiktok":
          return renderSocialItem(item, setting, type)
        case "email":
          return renderEmailItem(item, setting)
        case "number":
          return renderNumberItem(item, setting)
        case "logo":
          return renderLogoItem(item, setting)
        case "search":
          return renderSearchItem(item, setting)
        case "cart":
          return renderCartItem(item, setting)
        case "login_signup":
          return renderLoginSignupItem(item, setting)
        case "location":
          return renderLocationItem(item, setting)
        default:
          return null
      }
    } catch (error) {
      console.error("Error rendering menu item:", error)
      return null
    }
  }

  // Update the renderLinkItem function to properly use all dynamic values from the API
  const renderLinkItem = (item: any, setting: any) => {
    try {
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
    } catch (error) {
      console.error("Error rendering link item:", error)
      return null
    }
  }

  // Render social media item
  const renderSocialItem = (item: any, setting: any, type: string) => {
    try {
      // Create style object without mixing shorthand and non-shorthand properties
      const itemStyle = {
        margin: setting[`${type}_margin`],
        backgroundColor: setting[`${type}_bg_color`],
        borderRadius: setting[`${type}_border_radius`],
        // Use individual border properties instead of the shorthand
        borderTopWidth: setting[`${type}_border_top`] ? setting[`${type}_border_top`].split(" ")[0] : "",
        borderTopStyle: setting[`${type}_border_top`] ? setting[`${type}_border_top`].split(" ")[1] || "solid" : "",
        borderTopColor: setting[`${type}_border_top`] ? setting[`${type}_border_top`].split(" ")[2] || "#000" : "",
        borderRightWidth: setting[`${type}_border_right`] ? setting[`${type}_border_right`].split(" ")[0] : "",
        borderRightStyle: setting[`${type}_border_right`]
          ? setting[`${type}_border_right`].split(" ")[1] || "solid"
          : "",
        borderRightColor: setting[`${type}_border_right`]
          ? setting[`${type}_border_right`].split(" ")[2] || "#000"
          : "",
        borderBottomWidth: setting[`${type}_border_bottom`] ? setting[`${type}_border_bottom`].split(" ")[0] : "",
        borderBottomStyle: setting[`${type}_border_bottom`]
          ? setting[`${type}_border_bottom`].split(" ")[1] || "solid"
          : "",
        borderBottomColor: setting[`${type}_border_bottom`]
          ? setting[`${type}_border_bottom`].split(" ")[2] || "#000"
          : "",
        borderLeftWidth: setting[`${type}_border_left`] ? setting[`${type}_border_left`].split(" ")[0] : "",
        borderLeftStyle: setting[`${type}_border_left`] ? setting[`${type}_border_left`].split(" ")[1] || "solid" : "",
        borderLeftColor: setting[`${type}_border_left`] ? setting[`${type}_border_left`].split(" ")[2] || "#000" : "",
      }

      return (
        <li className="nav-item" style={itemStyle}>
          <a
            href="javascript:void(0)"
            onClick={handleLinkClick}
            className="nav-link block"
            style={{
              color: setting[`${type}_label_color`],
              padding: setting[`${type}_padding`],
              fontSize: setting[`${type}_font_size`],
              fontWeight: setting[`${type}_font_weight`],
            }}
          >
            {setting[`${type}_icon`] && renderIcon(setting[`${type}_icon`])}
            {setting[`${type}_label`]}
          </a>
        </li>
      )
    } catch (error) {
      console.error(`Error rendering ${type} item:`, error)
      return null
    }
  }

  // Render email item
  const renderEmailItem = (item: any, setting: any) => {
    try {
      // Create style object without mixing shorthand and non-shorthand properties
      const itemStyle = {
        margin: setting.email_margin,
        backgroundColor: setting.email_bg_color,
        borderRadius: setting.email_border_radius,
        // Use individual border properties instead of the shorthand
        borderTopWidth: setting.email_border_top ? setting.email_border_top.split(" ")[0] : "",
        borderTopStyle: setting.email_border_top ? setting.email_border_top.split(" ")[1] || "solid" : "",
        borderTopColor: setting.email_border_top ? setting.email_border_top.split(" ")[2] || "#000" : "",
        borderRightWidth: setting.email_border_right ? setting.email_border_right.split(" ")[0] : "",
        borderRightStyle: setting.email_border_right ? setting.email_border_right.split(" ")[1] || "solid" : "",
        borderRightColor: setting.email_border_right ? setting.email_border_right.split(" ")[2] || "#000" : "",
        borderBottomWidth: setting.email_border_bottom ? setting.email_border_bottom.split(" ")[0] : "",
        borderBottomStyle: setting.email_border_bottom ? setting.email_border_bottom.split(" ")[1] || "solid" : "",
        borderBottomColor: setting.email_border_bottom ? setting.email_border_bottom.split(" ")[2] || "#000" : "",
        borderLeftWidth: setting.email_border_left ? setting.email_border_left.split(" ")[0] : "",
        borderLeftStyle: setting.email_border_left ? setting.email_border_left.split(" ")[1] || "solid" : "",
        borderLeftColor: setting.email_border_left ? setting.email_border_left.split(" ")[2] || "#000" : "",
      }

      return (
        <li className="nav-item" style={itemStyle}>
          <a
            href="javascript:void(0)"
            onClick={handleLinkClick}
            className="nav-link block"
            style={{
              color: setting.email_label_color,
              padding: setting.email_padding,
              fontSize: setting.email_font_size,
              fontWeight: setting.email_font_weight,
            }}
          >
            {setting.email_icon && renderIcon(setting.email_icon)}
            {setting.email_label}
          </a>
        </li>
      )
    } catch (error) {
      console.error("Error rendering email item:", error)
      return null
    }
  }

  // Render number item
  const renderNumberItem = (item: any, setting: any) => {
    try {
      // Create style object without mixing shorthand and non-shorthand properties
      const itemStyle = {
        margin: setting.number_margin,
        backgroundColor: setting.number_bg_color,
        borderRadius: setting.number_border_radius,
        // Use individual border properties instead of the shorthand
        borderTopWidth: setting.number_border_top ? setting.number_border_top.split(" ")[0] : "",
        borderTopStyle: setting.number_border_top ? setting.number_border_top.split(" ")[1] || "solid" : "",
        borderTopColor: setting.number_border_top ? setting.number_border_top.split(" ")[2] || "#000" : "",
        borderRightWidth: setting.number_border_right ? setting.number_border_right.split(" ")[0] : "",
        borderRightStyle: setting.number_border_right ? setting.number_border_right.split(" ")[1] || "solid" : "",
        borderRightColor: setting.number_border_right ? setting.number_border_right.split(" ")[2] || "#000" : "",
        borderBottomWidth: setting.number_border_bottom ? setting.number_border_bottom.split(" ")[0] : "",
        borderBottomStyle: setting.number_border_bottom ? setting.number_border_bottom.split(" ")[1] || "solid" : "",
        borderBottomColor: setting.number_border_bottom ? setting.number_border_bottom.split(" ")[2] || "#000" : "",
        borderLeftWidth: setting.number_border_left ? setting.number_border_left.split(" ")[0] : "",
        borderLeftStyle: setting.number_border_left ? setting.number_border_left.split(" ")[1] || "solid" : "",
        borderLeftColor: setting.number_border_left ? setting.number_border_left.split(" ")[2] || "#000" : "",
      }

      return (
        <li className="nav-item" style={itemStyle}>
          <a
            href="javascript:void(0)"
            onClick={handleLinkClick}
            className="nav-link flex items-center"
            style={{
              color: setting.number_label_color,
              padding: setting.number_padding,
              fontSize: setting.number_font_size,
              fontWeight: setting.number_font_weight,
            }}
          >
            {setting.number_icon ? renderIcon(setting.number_icon) : <Phone className="mr-2" size={16} />}
            {setting.number_label}
          </a>
        </li>
      )
    } catch (error) {
      console.error("Error rendering number item:", error)
      return null
    }
  }

  // Render logo item
  const renderLogoItem = (item: any, setting: any) => {
    try {
      // Use a more reliable approach to get the logo URL
      // Ensure the logo URL is a valid image URL, not just "/"
      let logoSrc = setting.logo_link || logoUrl || "/placeholder.svg?height=50&width=150"

      // Validate the logo URL - if it's just "/" or empty, use the placeholder
      if (!logoSrc || logoSrc === "/" || logoSrc.trim() === "") {
        logoSrc = "/placeholder.svg?height=50&width=150"
      }

      // Create style object without mixing shorthand and non-shorthand properties
      const itemStyle = {
        padding: setting.logo_padding,
        backgroundColor: setting.logo_background_color,
        margin: setting.logo_margin,
        // If there's a border, use individual properties
        borderWidth: setting.logo_border ? setting.logo_border.split(" ")[0] : "",
        borderStyle: setting.logo_border ? setting.logo_border.split(" ")[1] || "solid" : "",
        borderColor: setting.logo_border ? setting.logo_border.split(" ")[2] || "#000" : "",
      }

      return (
        <li style={itemStyle}>
          <a href="javascript:void(0)" onClick={handleLinkClick} className="navbar-brand">
            <img
              width={setting.logo_width || 150}
              src={logoSrc || "/placeholder.svg"}
              alt={settings.business_info?.name || brandName || "Logo"}
              className="h-auto"
              onError={(e) => {
                console.error("Error loading logo:", logoSrc)
                // Set to placeholder image on error
                e.currentTarget.src = "/placeholder.svg?height=50&width=150"
              }}
            />
          </a>
        </li>
      )
    } catch (error) {
      console.error("Error rendering logo item:", error)
      // Return a fallback logo if there's an error
      return (
        <li>
          <a href="javascript:void(0)" onClick={handleLinkClick} className="navbar-brand">
            <img width={150} src="/placeholder.svg?height=50&width=150" alt="Fallback Logo" className="h-auto" />
          </a>
        </li>
      )
    }
  }

  // Render search item
  const renderSearchItem = (item: any, setting: any) => {
    try {
      // Create base style object without mixing shorthand and non-shorthand properties
      const baseStyle = {
        margin: setting.search_margin,
        padding: setting.search_padding,
      }

      // Add borderLeft as a separate property if it exists
      const borderLeftStyle = setting.search_border_left
        ? {
            borderLeftWidth: setting.search_border_left.split(" ")[0],
            borderLeftStyle: setting.search_border_left.split(" ")[1] || "solid",
            borderLeftColor: setting.search_border_left.split(" ")[2] || "#000",
          }
        : {}

      // Combine styles
      const itemStyle = { ...baseStyle, ...borderLeftStyle }

      // Expandable search
      if (setting.search_expand === 1 || setting.search_expand === "1") {
        return (
          <li
            style={{
              ...itemStyle,
              marginRight: "5px",
              display: "inline-block",
            }}
          >
            <div className="search relative">
              <div className="search-wrap flex items-center">
                <div className="search-input-elm hidden group-hover:block">
                  <input
                    id="search-auto"
                    style={{ width: setting.search_width }}
                    className="autosearch-input"
                    type="text"
                    placeholder="Search for Product"
                  />
                </div>
                <button
                  style={{
                    backgroundColor: setting.search_button_color,
                    padding: "10px",
                    borderRadius: "5px",
                  }}
                  className="search-btn"
                  onClick={handleLinkClick}
                >
                  <Search style={{ color: setting.search_icon_color }} size={17} />
                </button>
              </div>
            </div>
          </li>
        )
      }

      // Border bottom search
      if (setting.search_border_bottom === 1 || setting.search_border_bottom === "1") {
        return (
          <li style={itemStyle}>
            <div className="input-group flex">
              <Search
                style={{
                  color: setting.search_icon_color || "#000000",
                  position: "relative",
                  top: "7px",
                  left: "20px",
                  zIndex: 10,
                  fontSize: "20px",
                }}
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
                  width: setting.search_width || "560px",
                  color: "#ffffff",
                }}
                className="form-control autosearch-input"
                type="search"
                placeholder={setting.search_placeholder || "Search items here....."}
              />
            </div>
          </li>
        )
      }

      // Default search
      return (
        <li style={itemStyle}>
          <div className="input-group flex">
            <input
              style={{
                width: setting.search_width || "560px",
                borderRadius: setting.search_border_radius,
              }}
              className="form-control autosearch-input px-3 py-2 border rounded-md"
              type="search"
              placeholder={setting.search_placeholder || "Search"}
            />
            {(setting.search_button_on_off === 1 || setting.search_button_on_off === "1") && (
              <button
                className="btn flex items-center justify-center"
                type="button"
                onClick={handleLinkClick}
                style={{
                  backgroundColor: setting.search_button_color,
                  color: setting.search_icon_color,
                  borderRadius: setting.search_button_border_radius,
                  padding: setting.search_button_padding,
                }}
              >
                <Search size={16} />
              </button>
            )}
          </div>
        </li>
      )
    } catch (error) {
      console.error("Error rendering search item:", error)
      return null
    }
  }

  // Render cart item
  const renderCartItem = (item: any, setting: any) => {
    try {
      return (
        <>
          <li
            className="nav-item relative"
            style={{
              backgroundColor: setting.cart_bg_color,
              borderRadius: setting.cart_border_radius,
              margin: setting.cart_margin,
            }}
          >
            <a
              href="javascript:void(0)"
              onClick={handleLinkClick}
              className="nav-link"
              style={{
                color: setting.cart_label_color || item.color,
                padding: setting.cart_padding,
              }}
            >
              {setting.cart_icon ? renderIcon(setting.cart_icon) : <ShoppingCart size={16} />}
            </a>
            <p
              className="cart-price-box r_items absolute text-white text-xs font-semibold text-center leading-5 rounded-full w-[18px] h-[18px]"
              style={{
                top: setting.cart_count_top || "0px",
                right: setting.cart_count_right || "-3px",
                backgroundColor: setting.cart_count_bg_color || "#FB0000",
              }}
            >
              {cartCount}
            </p>
          </li>

          {(setting.show_price_on_off === 1 || setting.show_price_on_off === "1") && (
            <li
              className="nav-item"
              style={{
                margin: setting.cart_price_margin,
                backgroundColor: setting.cart_price_bg_color,
                padding: setting.cart_price_padding,
              }}
            >
              <a href="javascript:void(0)" onClick={handleLinkClick} className="nav-link">
                <span
                  style={{
                    color: setting.cart_price_label_color || "#ffe4af",
                    fontSize: setting.link_font_size,
                    fontWeight: setting.link_font_weight,
                  }}
                >
                  {setting.cart_label || "Cart"}
                  <span
                    style={{
                      color: setting.cart_price_label_color || "#ffe4af",
                    }}
                    className="rs"
                  >
                    {cartTotal}
                  </span>
                </span>
              </a>
            </li>
          )}
        </>
      )
    } catch (error) {
      console.error("Error rendering cart item:", error)
      return null
    }
  }

  // Render login/signup item
  const renderLoginSignupItem = (item: any, setting: any) => {
    try {
      // Create style object without mixing shorthand and non-shorthand properties
      const baseStyle = {
        margin: setting.login_signup_margin,
        backgroundColor: setting.login_signup_bg_color,
        borderRadius: setting.login_signup_border_radius,
      }

      // Add borderLeft as a separate property if it exists
      const borderLeftStyle = setting.login_signup_border_left
        ? {
            borderLeftWidth: setting.login_signup_border_left.split(" ")[0],
            borderLeftStyle: setting.login_signup_border_left.split(" ")[1] || "solid",
            borderLeftColor: setting.login_signup_border_left.split(" ")[2] || "#000",
          }
        : {}

      // Combine styles
      const itemStyle = { ...baseStyle, ...borderLeftStyle }

      return (
        <li className="nav-item" style={itemStyle}>
          <a
            href={setting.login_signup_route || "javascript:void(0)"}
            onClick={handleLinkClick}
            className="nav-link flex items-center"
            style={{
              color: setting.login_signup_label_color || item.color || "#ffffff",
              fontWeight: setting.login_signup_font_weight || "400",
              fontSize: setting.login_signup_font_size,
              padding: setting.login_signup_padding,
            }}
          >
            {setting.login_icon_position === "before" && setting.login_icon && renderIcon(setting.login_icon)}
            {!setting.login_icon && <User className="mr-2" size={16} />}
            {setting.login_signup_label}
            {setting.login_icon_position === "after" && setting.login_icon && renderIcon(setting.login_icon)}
          </a>
        </li>
      )
    } catch (error) {
      console.error("Error rendering login/signup item:", error)
      return null
    }
  }

  // Render location item
  const renderLocationItem = (item: any, setting: any) => {
    try {
      if (setting.store_location === 1 || setting.store_location === "1") {
        return (
          <li
            className="nav-item"
            style={{
              backgroundColor: setting.location_bg_color,
              margin: setting.location_margin,
              borderRadius: setting.location_border_radius,
            }}
          >
            <button
              className="nav-link"
              style={{
                color: setting.location_color || "black",
                padding: setting.location_padding,
              }}
              onClick={handleLinkClick}
            >
              {setting.location_label}
            </button>
          </li>
        )
      }

      if (setting.current_location === 1 || setting.current_location === "1") {
        return (
          <li className="nav-item">
            <button
              className="nav-link flex items-center"
              style={{
                color: setting.item_label_color || item.color || "#ffe4af",
              }}
              onClick={handleLinkClick}
            >
              {setting.location_label || "Nearest Branch"}
              <MapPin className="ml-1" size={14} />
              <span className="text-xs ml-1 cookie_branch">{nearestBranch}</span>
            </button>
          </li>
        )
      }

      return null
    } catch (error) {
      console.error("Error rendering location item:", error)
      return null
    }
  }

  // Render list position class
  const getListPositionClass = (position: string, listCount: number) => {
    let classes = ""

    if (position === "left") {
      classes = "justify-start"
    } else if (position === "center") {
      classes = "justify-center"
      if (listCount === 1) {
        classes += " w-full"
      }
    } else if (position === "right") {
      classes = "justify-end"
    }

    return classes
  }

  return (
    <div ref={headerRef} className={isPreview ? "pointer-events-none relative" : "relative"}>
      {/* Render ticker - only if it's turned on */}
      {renderTicker()}

      {/* Render header */}
      <header
        className={`web_header ${headerSettings.fixed_header_on_off === 1 ? "fixed top-0 w-full z-50" : ""}`}
        onClick={isPreview ? handleLinkClick : undefined}
      >
        {headerSettings.nav && Array.isArray(headerSettings.nav)
          ? headerSettings.nav.map((bar: any, barKey: number) => {
              if (!bar || typeof bar !== "object") {
                console.warn(`Invalid bar at index ${barKey}`, bar)
                return null
              }

              // Check if bar is turned on
              const barOnOff = bar.bar_on_off === "1" || bar.bar_on_off === 1 || bar.show_bar === true
              if (!barOnOff) return null

              return (
                <div
                  key={`bar-${barKey}`}
                  className={`header_nav_bar_${barKey} ${bar.container_on_off === "1" || bar.container ? "container mx-auto" : "w-full"}`}
                  style={{ backgroundColor: bar.bar_background_color || "#4e2e0b" }}
                >
                  <nav
                    className="navbar flex items-center justify-between"
                    style={{
                      height: bar.bar_height || "auto",
                      borderBottom: bar.bar_border_bottom,
                      borderTop: bar.bar_border_top,
                      margin: bar.bar_margin,
                      padding: bar.bar_padding,
                    }}
                  >
                    <div className="navbar-collapse flex flex-wrap items-center w-full">
                      {bar.list && Array.isArray(bar.list)
                        ? bar.list.map((list: any, listKey: number) => {
                            if (!list || typeof list !== "object") {
                              console.warn(`Invalid list at bar ${barKey}, list ${listKey}`, list)
                              return null
                            }

                            // Get list position from settings or default to "left"
                            const listPosition = list.settings?.list_position || list.position || "left"
                            const positionClass = getListPositionClass(
                              listPosition,
                              Array.isArray(bar.list) ? bar.list.length : 0,
                            )

                            return (
                              <ul
                                key={`list-${barKey}-${listKey}`}
                                className={`navbar-nav flex items-center ${positionClass} ${listPosition === "center" ? "flex-1 mx-4" : ""}`}
                              >
                                {list.items && (Array.isArray(list.items) || typeof list.items === "object")
                                  ? (Array.isArray(list.items) ? list.items : Object.values(list.items)).map(
                                      (item: any, itemKey: number) => (
                                        <React.Fragment key={`item-${barKey}-${listKey}-${itemKey}`}>
                                          {renderMenuItem(item, barKey, listKey, itemKey)}
                                        </React.Fragment>
                                      ),
                                    )
                                  : null}
                              </ul>
                            )
                          })
                        : null}
                    </div>
                  </nav>
                </div>
              )
            })
          : null}
      </header>
    </div>
  )
}
