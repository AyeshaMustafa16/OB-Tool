"use client"

import type { HeaderConfig } from "@/lib/header-types"
import { Search, Phone, MoreVertical, ShoppingCart } from "lucide-react"
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

  return (
    <div className="header-preview">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
        <div className="text-lg font-medium">{brandName}</div>
        <div className="flex items-center gap-2">
          <button className="flex items-center text-sm border rounded px-2 py-1">
            <span className="mr-1">📱</span>
            Responsive
          </button>
          <button className="bg-[#ff6b8b] hover:bg-[#e05a79] text-white rounded px-3 py-1 text-sm">Purge Cache</button>
          <button className="p-1">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Ticker */}
      {config.ticker.header_ticker_on_off && (
        <div
          className="ticker-bar w-full text-center py-1 text-sm"
          style={{
            backgroundColor: config.ticker.ticker_bg_color,
            color: config.ticker.ticker_font_color,
            position: config.ticker.sticky_ticker ? "sticky" : "relative",
            top: config.ticker.sticky_ticker ? 0 : "auto",
            zIndex: config.ticker.sticky_ticker ? 50 : "auto",
          }}
        >
          {config.ticker.header_ticker_text}
        </div>
      )}

      {/* Navigation Bars */}
      {config.nav.map(
        (bar, barIndex) =>
          bar.show_bar && (
            <div
              key={bar.id}
              className="nav-bar"
              style={{
                backgroundColor: bar.bar_background_color,
                height: bar.height,
                borderTop: bar.border_top,
                borderBottom: bar.border_bottom,
                margin: bar.margin,
                padding: bar.padding,
                position: bar.sticky_header ? "sticky" : "relative",
                top: bar.sticky_header ? 0 : "auto",
                zIndex: bar.sticky_header ? 40 - barIndex : "auto",
                background: bar.transparent_header ? "transparent" : bar.bar_background_color,
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

                    return (
                      <div
                        key={list.id}
                        className={`flex items-center ${positionClass} ${list.position === "center" ? "flex-1 mx-4" : ""}`}
                      >
                        {list.items.map((item) => {
                          // Render different item types
                          switch (item.type) {
                            case "logo":
                              return (
                                <div
                                  key={item.id}
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
                                      src={brandLogo || "/placeholder.svg?height=50&width=150"}
                                      alt={brandName}
                                      className="h-12 object-contain"
                                    />
                                  </Link>
                                </div>
                              )

                            case "search":
                              return (
                                <div
                                  key={item.id}
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
                                  <input
                                    type="text"
                                    placeholder="Search by Product Name"
                                    className="w-full py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#d9365e]"
                                    style={{
                                      fontSize: item.font_size,
                                    }}
                                  />
                                  <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                  />
                                </div>
                              )

                            case "number":
                              return (
                                <div
                                  key={item.id}
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
                              return (
                                <div
                                  key={item.id}
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
                                    className="block"
                                    style={{
                                      color: item.color,
                                      fontSize: item.font_size,
                                      fontWeight: item.font_weight,
                                    }}
                                    target={item.target_blank ? "_blank" : "_self"}
                                  >
                                    {item.icon && <span dangerouslySetInnerHTML={{ __html: item.icon }} />}
                                    {item.name}
                                  </Link>
                                </div>
                              )

                            case "cart":
                              return (
                                <div
                                  key={item.id}
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
                                      <ShoppingCart className="mr-2" size={16} />
                                    )}
                                    {item.name}
                                  </Link>
                                </div>
                              )

                            default:
                              return (
                                <div
                                  key={item.id}
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
