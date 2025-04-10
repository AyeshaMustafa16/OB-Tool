"use client"

import { useState } from "react"
import type { ItemConfig, SubLinkConfig, InnerSubLinkConfig } from "@/lib/header-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp, Plus, Trash } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface ItemEditorProps {
  item: ItemConfig
  updateItem: (itemConfig: Partial<ItemConfig>) => void
}

export default function ItemEditor({ item, updateItem }: ItemEditorProps) {
  const [expandedSubLinks, setExpandedSubLinks] = useState<Record<string, boolean>>({})
  const [expandedInnerSubLinks, setExpandedInnerSubLinks] = useState<Record<string, boolean>>({})
  const [customSubLinkHtml, setCustomSubLinkHtml] = useState<string>(item.sl_custom_html || "")

  // Toggle sub-link expansion
  const toggleSubLink = (id: string) => {
    setExpandedSubLinks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Toggle inner sub-link expansion
  const toggleInnerSubLink = (id: string) => {
    setExpandedInnerSubLinks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Add a new sub-link
  const addSubLink = () => {
    const newSubLink: SubLinkConfig = {
      id: `sub-link-${uuidv4()}`,
      sub_link_label: "",
      sub_link_route: "",
      sub_link_icon: "",
      inner_sub_link_on_off: false,
    }

    const updatedSubSettings = [...(item.sub_settings || []), newSubLink]
    updateItem({ sub_settings: updatedSubSettings })

    // Expand the new sub-link
    setExpandedSubLinks((prev) => ({
      ...prev,
      [newSubLink.id]: true,
    }))
  }

  // Remove a sub-link
  const removeSubLink = (id: string) => {
    const updatedSubSettings = (item.sub_settings || []).filter((subLink) => subLink.id !== id)
    updateItem({ sub_settings: updatedSubSettings })

    // Remove from expanded state
    const { [id]: _, ...restExpandedSubLinks } = expandedSubLinks
    setExpandedSubLinks(restExpandedSubLinks)
  }

  // Update a sub-link
  const updateSubLink = (id: string, updates: Partial<SubLinkConfig>) => {
    const updatedSubSettings = (item.sub_settings || []).map((subLink) =>
      subLink.id === id ? { ...subLink, ...updates } : subLink,
    )
    updateItem({ sub_settings: updatedSubSettings })
  }

  // Add a new inner sub-link to a sub-link
  const addInnerSubLink = (subLinkId: string) => {
    const newInnerSubLink: InnerSubLinkConfig = {
      id: `inner-sub-link-${uuidv4()}`,
      inner_sub_link_label: "",
      inner_sub_link_route: "",
    }

    const updatedSubSettings = (item.sub_settings || []).map((subLink) => {
      if (subLink.id === subLinkId) {
        return {
          ...subLink,
          inner_sub_settings: [...(subLink.inner_sub_settings || []), newInnerSubLink],
        }
      }
      return subLink
    })

    updateItem({ sub_settings: updatedSubSettings })

    // Expand the new inner sub-link
    setExpandedInnerSubLinks((prev) => ({
      ...prev,
      [newInnerSubLink.id]: true,
    }))
  }

  // Remove an inner sub-link
  const removeInnerSubLink = (subLinkId: string, innerSubLinkId: string) => {
    const updatedSubSettings = (item.sub_settings || []).map((subLink) => {
      if (subLink.id === subLinkId) {
        return {
          ...subLink,
          inner_sub_settings: (subLink.inner_sub_settings || []).filter(
            (innerSubLink) => innerSubLink.id !== innerSubLinkId,
          ),
        }
      }
      return subLink
    })

    updateItem({ sub_settings: updatedSubSettings })

    // Remove from expanded state
    const { [innerSubLinkId]: _, ...restExpandedInnerSubLinks } = expandedInnerSubLinks
    setExpandedInnerSubLinks(restExpandedInnerSubLinks)
  }

  // Update an inner sub-link
  const updateInnerSubLink = (subLinkId: string, innerSubLinkId: string, updates: Partial<InnerSubLinkConfig>) => {
    const updatedSubSettings = (item.sub_settings || []).map((subLink) => {
      if (subLink.id === subLinkId) {
        return {
          ...subLink,
          inner_sub_settings: (subLink.inner_sub_settings || []).map((innerSubLink) =>
            innerSubLink.id === innerSubLinkId ? { ...innerSubLink, ...updates } : innerSubLink,
          ),
        }
      }
      return subLink
    })

    updateItem({ sub_settings: updatedSubSettings })
  }

  // Toggle sub-link feature
  const toggleSubLinkFeature = (enabled: boolean) => {
    updateItem({ sub_link: enabled })

    // If enabling sub-links and there are none, add one
    if (enabled && (!item.sub_settings || item.sub_settings.length === 0)) {
      addSubLink()
    }
  }

  // Toggle custom sub-link HTML
  const toggleCustomSubLink = (enabled: boolean) => {
    updateItem({ custom_sub_link: enabled })
  }

  // Update custom sub-link HTML
  const updateCustomSubLinkHtml = (html: string) => {
    setCustomSubLinkHtml(html)
    updateItem({ sl_custom_html: html })
  }

  // Render fields based on item type
  const renderTypeSpecificFields = () => {
    switch (item.type) {
      case "logo":
        return (
          <>
            <div>
              <Label className="block text-xs font-medium mb-1">Paste Logo Link</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_link || item.route || ""}
                onChange={(e) => updateItem({ route: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Logo Width</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_width || item.font_size || "127px"}
                onChange={(e) => updateItem({ font_size: e.target.value })}
                placeholder="127px"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Logo Margin</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_margin || item.margin || "0px 0px 0px 0px"}
                onChange={(e) => updateItem({ margin: e.target.value })}
                placeholder="0px 0px 0px 0px"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Logo Padding</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_padding || item.padding || "0px 0px 0px 0px"}
                onChange={(e) => updateItem({ padding: e.target.value })}
                placeholder="0px 0px 0px 0px"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Background Color</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_bg_color || item.background_color || ""}
                onChange={(e) => updateItem({ background_color: e.target.value })}
                placeholder="Label Color Code"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Logo Border</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.setting?.logo_border || item.border || "0px 0px 0px 0px"}
                onChange={(e) => updateItem({ border: e.target.value })}
                placeholder="0px 0px 0px 0px"
              />
            </div>
          </>
        )

      case "search":
        return (
          <>
            <div>
              <Label className="block text-xs font-medium mb-1">Search Width</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.search_width || "560px"}
                onChange={(e) => updateItem({ search_width: e.target.value })}
                placeholder="560px"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Search Placeholder</Label>
              <Input
                type="text"
                className="w-full p-1 text-xs border rounded-md"
                value={item.search_placeholder || "Search items here....."}
                onChange={(e) => updateItem({ search_placeholder: e.target.value })}
                placeholder="Search items here....."
              />
            </div>
            <div>
              <Label className="block text-xs font-medium mb-1">Search Border Bottom</Label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="xs"
                  className={`px-2 py-1 text-xs rounded-l-md ${item.search_border_bottom ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                  onClick={() => updateItem({ search_border_bottom: true })}
                >
                  On
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className={`px-2 py-1 text-xs rounded-r-md ${!item.search_border_bottom ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                  onClick={() => updateItem({ search_border_bottom: false })}
                >
                  Off
                </Button>
              </div>
            </div>
          </>
        )

      case "link":
        return (
          <>
            <div>
              <Label className="block text-xs font-medium mb-1">Icon</Label>
              <Textarea
                className="w-full p-1 text-xs border rounded-md min-h-[60px]"
                value={item.icon || ""}
                onChange={(e) => updateItem({ icon: e.target.value })}
                placeholder="<i class='fa fa-icon'></i>"
              />
            </div>

            {/* Sub Link Section - Only for link type */}
            <div className="mt-4 border-t pt-4">
              <Label className="block text-xs font-medium mb-1">Sub Link</Label>
              <div className="flex items-center mb-3">
                <Button
                  variant="outline"
                  size="xs"
                  className={`px-2 py-1 text-xs rounded-l-md ${item.sub_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                  onClick={() => toggleSubLinkFeature(true)}
                >
                  On
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className={`px-2 py-1 text-xs rounded-r-md ${!item.sub_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                  onClick={() => toggleSubLinkFeature(false)}
                >
                  Off
                </Button>
              </div>

              {item.sub_link && (
                <>
                  <div className="mb-3">
                    <Label className="block text-xs font-medium mb-1">Default</Label>
                    <div className="flex items-center mb-3">
                      <Button
                        variant="outline"
                        size="xs"
                        className={`px-2 py-1 text-xs rounded-l-md ${!item.custom_sub_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                        onClick={() => toggleCustomSubLink(false)}
                      >
                        On
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        className={`px-2 py-1 text-xs rounded-r-md ${item.custom_sub_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                        onClick={() => toggleCustomSubLink(false)}
                      >
                        Off
                      </Button>
                    </div>
                  </div>

                  {!item.custom_sub_link && (
                    <div className="space-y-4">
                      {/* Sub Links List */}
                      {(item.sub_settings || []).map((subLink, index) => (
                        <div key={subLink.id} className="border rounded-md p-2">
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSubLink(subLink.id)}
                          >
                            <span className="text-xs font-medium">Sub Link - {index}</span>
                            {expandedSubLinks[subLink.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>

                          {expandedSubLinks[subLink.id] && (
                            <div className="mt-2 space-y-2">
                              <div>
                                <Label className="block text-xs font-medium mb-1">Icon Image</Label>
                                <Input
                                  type="text"
                                  className="w-full p-1 text-xs border rounded-md"
                                  value={subLink.sub_link_icon || ""}
                                  onChange={(e) => updateSubLink(subLink.id, { sub_link_icon: e.target.value })}
                                  placeholder="Image URL"
                                />
                              </div>

                              <div>
                                <Label className="block text-xs font-medium mb-1">Name</Label>
                                <Input
                                  type="text"
                                  className="w-full p-1 text-xs border rounded-md"
                                  value={subLink.sub_link_label || ""}
                                  onChange={(e) => updateSubLink(subLink.id, { sub_link_label: e.target.value })}
                                  placeholder="Sub Link Label"
                                />
                              </div>

                              <div>
                                <Label className="block text-xs font-medium mb-1">Route</Label>
                                <Input
                                  type="text"
                                  className="w-full p-1 text-xs border rounded-md"
                                  value={subLink.sub_link_route || ""}
                                  onChange={(e) => updateSubLink(subLink.id, { sub_link_route: e.target.value })}
                                  placeholder="Sub Link Route"
                                />
                              </div>

                              <div>
                                <Label className="block text-xs font-medium mb-1">Inner Sub Link</Label>
                                <div className="flex items-center mb-3">
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    className={`px-2 py-1 text-xs rounded-l-md ${subLink.inner_sub_link_on_off ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                                    onClick={() => updateSubLink(subLink.id, { inner_sub_link_on_off: true })}
                                  >
                                    On
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    className={`px-2 py-1 text-xs rounded-r-md ${!subLink.inner_sub_link_on_off ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                                    onClick={() => updateSubLink(subLink.id, { inner_sub_link_on_off: false })}
                                  >
                                    Off
                                  </Button>
                                </div>
                              </div>

                              {/* Inner Sub Links */}
                              {subLink.inner_sub_link_on_off && (
                                <div className="ml-4 space-y-3">
                                  {(subLink.inner_sub_settings || []).map((innerSubLink, innerIndex) => (
                                    <div key={innerSubLink.id} className="border rounded-md p-2">
                                      <div
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => toggleInnerSubLink(innerSubLink.id)}
                                      >
                                        <span className="text-xs font-medium">Inner Sub Link - {innerIndex}</span>
                                        {expandedInnerSubLinks[innerSubLink.id] ? (
                                          <ChevronUp size={14} />
                                        ) : (
                                          <ChevronDown size={14} />
                                        )}
                                      </div>

                                      {expandedInnerSubLinks[innerSubLink.id] && (
                                        <div className="mt-2 space-y-2">
                                          <div>
                                            <Label className="block text-xs font-medium mb-1">Name</Label>
                                            <Input
                                              type="text"
                                              className="w-full p-1 text-xs border rounded-md"
                                              value={innerSubLink.inner_sub_link_label || ""}
                                              onChange={(e) =>
                                                updateInnerSubLink(subLink.id, innerSubLink.id, {
                                                  inner_sub_link_label: e.target.value,
                                                })
                                              }
                                              placeholder="Inner Sub Link Label"
                                            />
                                          </div>

                                          <div>
                                            <Label className="block text-xs font-medium mb-1">Route</Label>
                                            <Input
                                              type="text"
                                              className="w-full p-1 text-xs border rounded-md"
                                              value={innerSubLink.inner_sub_link_route || ""}
                                              onChange={(e) =>
                                                updateInnerSubLink(subLink.id, innerSubLink.id, {
                                                  inner_sub_link_route: e.target.value,
                                                })
                                              }
                                              placeholder="Inner Sub Link Route"
                                            />
                                          </div>

                                          <Button
                                            variant="outline"
                                            size="xs"
                                            className="text-red-500 text-xs mt-2"
                                            onClick={() => removeInnerSubLink(subLink.id, innerSubLink.id)}
                                          >
                                            <Trash size={12} className="mr-1" /> Remove Inner Sub Link
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                  <Button
                                    variant="outline"
                                    size="xs"
                                    className="text-blue-500 text-xs flex items-center"
                                    onClick={() => addInnerSubLink(subLink.id)}
                                  >
                                    <Plus size={12} className="mr-1" /> Add More Inner Link
                                  </Button>
                                </div>
                              )}

                              <Button
                                variant="outline"
                                size="xs"
                                className="text-red-500 text-xs mt-2"
                                onClick={() => removeSubLink(subLink.id)}
                              >
                                <Trash size={12} className="mr-1" /> Remove Sub Link
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="xs"
                        className="text-blue-500 text-xs flex items-center"
                        onClick={addSubLink}
                      >
                        <Plus size={12} className="mr-1" /> Add More Sub Link
                      </Button>
                    </div>
                  )}

                  {/* Custom Sub Link HTML */}
                  <div className="mt-3">
                    <Label className="block text-xs font-medium mb-1">Custom</Label>
                    <div className="flex items-center mb-3">
                      <Button
                        variant="outline"
                        size="xs"
                        className={`px-2 py-1 text-xs rounded-l-md ${item.custom_sub_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                        onClick={() => toggleCustomSubLink(true)}
                      >
                        On
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        className={`px-2 py-1 text-xs rounded-r-md ${!item.custom_sub_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                        onClick={() => toggleCustomSubLink(false)}
                      >
                        Off
                      </Button>
                    </div>

                    {item.custom_sub_link && (
                      <Textarea
                        className="w-full p-2 text-xs border rounded-md min-h-[100px]"
                        value={customSubLinkHtml}
                        onChange={(e) => updateCustomSubLinkHtml(e.target.value)}
                        placeholder="Enter custom HTML for sub-links"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-xs font-medium mb-1">Choose Item</Label>
        <Select onValueChange={(value) => updateItem({ type: value as any })} defaultValue={item.type}>
          <SelectTrigger className="w-full p-1 text-xs border rounded-md">
            <SelectValue placeholder={item.type} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="link">Link</SelectItem>
            <SelectItem value="logo">Logo</SelectItem>
            <SelectItem value="search">Search</SelectItem>
            <SelectItem value="cart">Cart</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="login_signup">Login/Signup</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Common fields for all item types */}
      <div>
        <Label className="block text-xs font-medium mb-1">Name</Label>
        <Input
          type="text"
          className="w-full p-1 text-xs border rounded-md"
          value={item.name || ""}
          onChange={(e) => updateItem({ name: e.target.value })}
        />
      </div>

      {/* Type-specific fields */}
      {renderTypeSpecificFields()}

      {/* Common fields that apply to most item types */}
      {item.type !== "logo" && item.type !== "search" && (
        <>
          <div>
            <Label className="block text-xs font-medium mb-1">Color</Label>
            <Input
              type="text"
              className="w-full p-1 text-xs border rounded-md"
              value={item.setting?.item_label_color || item.color || "#000000"}
              onChange={(e) => updateItem({ color: e.target.value })}
              placeholder="#000000"
            />
          </div>

          <div>
            <Label className="block text-xs font-medium mb-1">Route</Label>
            <Input
              type="text"
              className="w-full p-1 text-xs border rounded-md"
              value={item.setting?.item_route || item.route || ""}
              onChange={(e) => updateItem({ route: e.target.value })}
              placeholder="/path"
            />
          </div>

          <div>
            <Label className="block text-xs font-medium mb-1">Background Color</Label>
            <Input
              type="text"
              className="w-full p-1 text-xs border rounded-md"
              value={item.setting?.background_color || item.background_color || ""}
              onChange={(e) => updateItem({ background_color: e.target.value })}
              placeholder="#ffffff"
            />
          </div>

          <div>
            <Label className="block text-xs font-medium mb-1">Font Size</Label>
            <Input
              type="text"
              className="w-full p-1 text-xs border rounded-md"
              value={item.setting?.link_font_size || item.font_size || "14px"}
              onChange={(e) => updateItem({ font_size: e.target.value })}
              placeholder="14px"
            />
          </div>

          <div>
            <Label className="block text-xs font-medium mb-1">Font Weight</Label>
            <Select
              onValueChange={(value) => updateItem({ font_weight: value })}
              defaultValue={item.setting?.link_font_weight || item.font_weight || "400"}
            >
              <SelectTrigger className="w-full p-1 text-xs border rounded-md">
                <SelectValue placeholder={item.setting?.link_font_weight || item.font_weight || "400"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">300</SelectItem>
                <SelectItem value="400">400</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="600">600</SelectItem>
                <SelectItem value="700">700</SelectItem>
                <SelectItem value="800">800</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-xs font-medium mb-1">Padding</Label>
            <Input
              type="text"
              className="w-full p-1 text-xs border rounded-md"
              value={item.padding || "0px 0px 0px 0px"}
              onChange={(e) => updateItem({ padding: e.target.value })}
              placeholder="0px 0px 0px 0px"
            />
          </div>

          <div>
            <Label className="block text-xs font-medium mb-1">Target Blank</Label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="xs"
                className={`px-2 py-1 text-xs rounded-l-md ${item.target_blank ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                onClick={() => updateItem({ target_blank: true })}
              >
                On
              </Button>
              <Button
                variant="outline"
                size="xs"
                className={`px-2 py-1 text-xs rounded-r-md ${!item.target_blank ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
                onClick={() => updateItem({ target_blank: false })}
              >
                Off
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
