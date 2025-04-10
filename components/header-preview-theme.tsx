"use client"

import React, { useState, useEffect } from "react"
import { Search, Phone, ShoppingCart, User, MapPin } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import { ChevronDown } from "lucide-react"

interface HeaderPreviewThemeProps {
  brandLogo?: string | null
  brandName?: string
}

export default function HeaderPreviewTheme({ brandLogo, brandName }: HeaderPreviewThemeProps) {
  const { settings } = useSettings()
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState("0.00")
  const [nearestBranch, setNearestBranch] = useState("Nearest Branch")
  const [headerError, setHeaderError] = useState<string | null>(null)

  // Get header settings from context
  const headerSettings = settings?.settings?.header || null

  // Add a debug function to help diagnose structure issues
  const debugStructure = (settings: any) => {
    if (!settings) return

    try {
      console.log("Header settings structure:", {
        ticker: settings.ticker,
        navCount: Array.isArray(settings.nav) ? settings.nav.length : "Not an array",
        navSample:
          Array.isArray(settings.nav) && settings.nav.length > 0
            ? {
                firstBar: settings.nav[0],
                listCount: Array.isArray(settings.nav[0]?.list) ? settings.nav[0].list.length : "Not an array",
                firstList: settings.nav[0]?.list?.[0],
                itemsCount: Array.isArray(settings.nav[0]?.list?.[0]?.items)
                  ? settings.nav[0].list[0].items.length
                  : "Not an array",
                firstItem: settings.nav[0]?.list?.[0]?.items?.[0],
              }
            : "No nav items",
      })
    } catch (error) {
      console.error("Error in debugStructure:", error)
    }
  }

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
        debugStructure(headerSettings)
      } catch (error) {
        console.error("Error debugging header structure:", error)
        setHeaderError("Error processing header structure")
      }
    }
  }, [headerSettings])

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

  // Prevent default for all link clicks
  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("Link click prevented in preview")
  }

  // Render ticker
  const renderTicker = () => {
    try {
      const ticker = headerSettings.ticker || {}

      if (!ticker.header_ticker_on_off) {
        return null
      }

      return (
        <div
          className="header_ticker w-full text-center text-xs py-1"
          style={{
            background: ticker.ticker_bg_color,
            color: ticker.ticker_font_color,
            zIndex: 1,
            height: "21px",
          }}
        >
          <p>{ticker.header_ticker_text || ""}</p>
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

  // Update the renderMenuItem function to properly use all dynamic values from the API
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
      const hasSubMenu = item.sub_link === 1 || item.sub_link === "1" || item.sub_link === true

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

      // Create a style object without mixing shorthand and non-shorthand properties
      const itemStyle = {
        margin: itemMargin,
        backgroundColor: itemBgColor,
        borderRadius: itemBorderRadius,
        // Use individual border properties instead of the shorthand
        borderTopWidth: setting.link_border_top ? setting.link_border_top.split(" ")[0] : "",
        borderTopStyle: setting.link_border_top ? setting.link_border_top.split(" ")[1] || "solid" : "",
        borderTopColor: setting.link_border_top ? setting.link_border_top.split(" ")[2] || "#000" : "",
        borderRightWidth: setting.link_border_right ? setting.link_border_right.split(" ")[0] : "",
        borderRightStyle: setting.link_border_right ? setting.link_border_right.split(" ")[1] || "solid" : "",
        borderRightColor: setting.link_border_right ? setting.link_border_right.split(" ")[2] || "#000" : "",
        borderBottomWidth: setting.link_border_bottom ? setting.link_border_bottom.split(" ")[0] : "",
        borderBottomStyle: setting.link_border_bottom ? setting.link_border_bottom.split(" ")[1] || "solid" : "",
        borderBottomColor: setting.link_border_bottom ? setting.link_border_bottom.split(" ")[2] || "#000" : "",
        borderLeftWidth: setting.link_border_left ? setting.link_border_left.split(" ")[0] : "",
        borderLeftStyle: setting.link_border_left ? setting.link_border_left.split(" ")[1] || "solid" : "",
        borderLeftColor: setting.link_border_left ? setting.link_border_left.split(" ")[2] || "#000" : "",
      }

      const linkStyle = {
        color: itemColor,
        margin: itemMargin,
        padding: itemPadding,
        fontWeight: itemFontWeight,
        fontSize: itemFontSize,
      }

      // Check if there's a custom HTML for sub-links
      const hasCustomSubLinks = item.custom_sub_link === 1 || item.custom_sub_link === "1"
      const customSubLinksHtml = item.sl_custom_html

      // Function to render custom sub-links HTML
      const renderCustomSubLinks = (html: string) => {
        return <div dangerouslySetInnerHTML={{ __html: html }} />
      }

      if (hasSubMenu) {
        return (
          <li className="nav-item dropdown relative group" style={itemStyle}>
            <a
              href="javascript:void(0)"
              className="nav-link flex items-center cursor-pointer"
              onClick={handleLinkClick}
              style={linkStyle}
            >
              {setting.link_icon && renderIcon(setting.link_icon)}
              {itemName}
              <span className="ml-1">▼</span>
            </a>

            {/* Render custom sub-links HTML if available */}
            {hasCustomSubLinks && customSubLinksHtml ? (
              <div className="dropdown-menu hidden group-hover:block absolute left-0 top-full bg-white shadow-md min-w-[200px] z-50">
                {renderCustomSubLinks(customSubLinksHtml)}
              </div>
            ) : (
              /* Otherwise render standard sub-links */
              <ul className="dropdown-menu hidden group-hover:block absolute left-0 top-full bg-white shadow-md min-w-[200px] z-50">
                {(() => {
                  // Handle both array and object formats
                  let subLinks = []
                  if (Array.isArray(item.sub_settings)) {
                    subLinks = item.sub_settings
                  } else if (typeof item.sub_settings === "object") {
                    // Convert object to array for rendering
                    subLinks = Object.values(item.sub_settings)
                  }

                  return subLinks.map((subItem: any, subIndex: number) => {
                    if (!subItem) return null

                    // Check if this sub-item has inner sub-links - support multiple data formats
                    const hasInnerSubMenu =
                      subItem.inner_sub_link_on_off === 1 ||
                      subItem.inner_sub_link_on_off === "1" ||
                      subItem.inner_sub_link_on_off === true

                    const hasInnerSubLinks =
                      hasInnerSubMenu &&
                      subItem.inner_sub_settings &&
                      (Array.isArray(subItem.inner_sub_settings)
                        ? subItem.inner_sub_settings.length > 0
                        : Object.keys(subItem.inner_sub_settings || {}).length > 0)

                    return (
                      <li key={subIndex} className={hasInnerSubMenu && hasInnerSubLinks ? "relative group/inner" : ""}>
                        <a
                          href={subItem.sub_link_route || "javascript:void(0)"}
                          onClick={handleLinkClick}
                          className="dropdown-item block px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
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
                          {hasInnerSubMenu && hasInnerSubLinks && (
                            <ChevronDown className="ml-1 h-3 w-3 rotate-[-90deg]" />
                          )}
                        </a>

                        {/* Render inner sub-links if available */}
                        {hasInnerSubMenu && hasInnerSubLinks && (
                          <ul className="submenu dropdown-menu hidden group-hover/inner:block absolute left-full top-0 bg-white shadow-md min-w-[200px]">
                            {(() => {
                              // Handle both array and object formats for inner sub-links
                              let innerSubLinks = []
                              if (Array.isArray(subItem.inner_sub_settings)) {
                                innerSubLinks = subItem.inner_sub_settings
                              } else if (typeof subItem.inner_sub_settings === "object") {
                                // Convert object to array for rendering
                                innerSubLinks = Object.values(subItem.inner_sub_settings)
                              }

                              return innerSubLinks.map((innerItem: any, innerIndex: number) => {
                                if (!innerItem) return null
                                return (
                                  <li key={innerIndex}>
                                    <a
                                      href={innerItem.inner_sub_link_route || "javascript:void(0)"}
                                      onClick={handleLinkClick}
                                      className="dropdown-item block px-4 py-2 text-sm hover:bg-gray-100"
                                    >
                                      {innerItem.inner_sub_link_label}
                                    </a>
                                  </li>
                                )
                              })
                            })()}
                          </ul>
                        )}
                      </li>
                    )
                  })
                })()}
              </ul>
            )}
          </li>
        )
      }

      return (
        <li className="nav-item" style={itemStyle}>
          <a
            href={itemRoute || "javascript:void(0)"}
            onClick={handleLinkClick}
            className="nav-link block"
            style={linkStyle}
          >
            {setting.link_icon && renderIcon(setting.link_icon)}
            {itemName}
          </a>
        </li>
      )
    } catch (error) {
      console.error("Error rendering link item:", error)
      return null
    }
  }

  // Render social media item
  const renderSocialItem = (item: any, setting: any, type: string) => {
    try {
      return (
        <li
          className="nav-item"
          style={{
            margin: setting[`${type}_margin`],
            backgroundColor: setting[`${type}_bg_color`],
            borderRadius: setting[`${type}_border_radius`],
            border: setting[`${type}_border`],
            borderLeft: setting[`${type}_border_left`],
          }}
        >
          <a
            href="#"
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
      return (
        <li
          className="nav-item"
          style={{
            margin: setting.email_margin,
            backgroundColor: setting.email_bg_color,
            borderRadius: setting.email_border_radius,
            border: setting.email_border,
            borderLeft: setting.email_border_left,
          }}
        >
          <a
            href="#"
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
      return (
        <li
          className="nav-item"
          style={{
            margin: setting.number_margin,
            backgroundColor: setting.number_bg_color,
            borderRadius: setting.number_border_radius,
            border: setting.number_border,
            borderLeft: setting.number_border_left,
          }}
        >
          <a
            href="#"
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
      // Replace business_logo placeholder if needed
      const logoUrl = setting.logo_link
        ? setting.logo_link.replace("<business_logo>", settings.business_logo || "")
        : settings.business_logo || "http://placehold.it/150x50?text=Logo"

      return (
        <li
          style={{
            padding: setting.logo_padding,
            border: setting.logo_border,
            backgroundColor: setting.logo_background_color,
            margin: setting.logo_margin,
          }}
        >
          <a href="#" onClick={handleLinkClick} className="navbar-brand">
            <img
              width={setting.logo_width || 150}
              src={logoUrl || "/placeholder.svg"}
              alt={settings.business_info?.name || brandName || "Logo"}
              className="h-auto"
            />
          </a>
        </li>
      )
    } catch (error) {
      console.error("Error rendering logo item:", error)
      return null
    }
  }

  // Render search item
  const renderSearchItem = (item: any, setting: any) => {
    try {
      // Expandable search
      if (setting.search_expand === 1) {
        return (
          <li
            style={{
              marginRight: "5px",
              display: "inline-block",
              margin: setting.search_margin,
              borderLeft: setting.search_border_left,
              padding: setting.search_padding,
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
      if (setting.search_border_bottom === 1) {
        return (
          <li
            style={{
              margin: setting.search_margin,
              borderLeft: setting.search_border_left,
              padding: setting.search_padding,
            }}
          >
            <div className="input-group flex">
              <Search
                style={{
                  color: setting.search_icon_color,
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
                  borderTop: "unset",
                  borderLeft: "unset",
                  borderRight: "unset",
                  borderBottom: "1px solid #cfcfcf",
                  borderBottomRightRadius: "0px",
                  borderBottomLeftRadius: "0px",
                  paddingLeft: "30px",
                  backgroundColor: "transparent",
                  width: setting.search_width,
                }}
                className="form-control autosearch-input"
                type="search"
                placeholder={setting.search_placeholder || "Search"}
              />
            </div>
          </li>
        )
      }

      // Default search
      return (
        <li
          style={{
            margin: setting.search_margin,
            borderLeft: setting.search_border_left,
            padding: setting.search_padding,
          }}
        >
          <div className="input-group flex">
            <input
              style={{
                width: setting.search_width,
                borderRadius: setting.search_border_radius,
              }}
              className="form-control autosearch-input px-3 py-2 border rounded-md"
              type="search"
              placeholder={setting.search_placeholder || "Search"}
            />
            {setting.search_button_on_off === 1 && (
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
              href="#"
              onClick={handleLinkClick}
              className="nav-link"
              style={{
                color: setting.cart_label_color,
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

          {setting.show_price_on_off === 1 && (
            <li
              className="nav-item"
              style={{
                margin: setting.cart_price_margin,
                backgroundColor: setting.cart_price_bg_color,
                padding: setting.cart_price_padding,
              }}
            >
              <a href="#" onClick={handleLinkClick} className="nav-link">
                <span
                  style={{
                    color: setting.cart_price_label_color,
                    fontSize: setting.link_font_size,
                    fontWeight: setting.link_font_weight,
                  }}
                >
                  {setting.cart_label}
                  <span
                    style={{
                      color: setting.cart_price_label_color,
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
      return (
        <li
          className="nav-item"
          style={{
            margin: setting.login_signup_margin,
            backgroundColor: setting.login_signup_bg_color,
            borderRadius: setting.login_signup_border_radius,
            borderLeft: setting.login_signup_border_left,
          }}
        >
          <a
            href="#"
            onClick={handleLinkClick}
            className="nav-link flex items-center"
            style={{
              color: setting.login_signup_label_color,
              fontWeight: setting.login_signup_font_weight,
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
      if (setting.store_location === 1) {
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

      if (setting.current_location === 1) {
        return (
          <li className="nav-item">
            <button
              className="nav-link flex items-center"
              style={{
                color: setting.item_label_color || "white",
              }}
              onClick={handleLinkClick}
            >
              {setting.location_label}
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
    <>
      {/* Render ticker */}
      {renderTicker()}

      {/* Render header */}
      <header className={`web_header ${headerSettings.fixed_header_on_off === 1 ? "fixed top-0 w-full z-50" : ""}`}>
        {headerSettings.nav && Array.isArray(headerSettings.nav)
          ? headerSettings.nav.map((bar: any, barKey: number) => {
              if (!bar || typeof bar !== "object") {
                console.warn(`Invalid bar at index ${barKey}`, bar)
                return null
              }

              return (
                <div
                  key={`bar-${barKey}`}
                  className={`header_nav_bar_${barKey} ${bar.container_on_off === 1 ? "container mx-auto" : "w-full"}`}
                  style={{ backgroundColor: bar.bar_background_color }}
                >
                  <nav
                    className="navbar flex items-center justify-between"
                    style={{
                      height: bar.bar_height,
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

                            const listPosition = list.settings?.list_position || "left"
                            const positionClass = getListPositionClass(
                              listPosition,
                              Array.isArray(bar.list) ? bar.list.length : 0,
                            )

                            return (
                              <ul
                                key={`list-${barKey}-${listKey}`}
                                className={`navbar-nav flex items-center ${positionClass} ${listPosition === "center" ? "flex-1 mx-4" : ""}`}
                              >
                                {list.items && Array.isArray(list.items)
                                  ? list.items.map((item: any, itemKey: number) => (
                                      <React.Fragment key={`item-${barKey}-${listKey}-${itemKey}`}>
                                        {renderMenuItem(item, barKey, listKey, itemKey)}
                                      </React.Fragment>
                                    ))
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
    </>
  )
}
