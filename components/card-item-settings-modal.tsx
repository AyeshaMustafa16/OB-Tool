"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CardItemSettingsModalProps {
  item: any
  isOpen: boolean
  onClose: () => void
  onSave: (settings: any) => void
}

export function CardItemSettingsModal({ item, isOpen, onClose, onSave }: CardItemSettingsModalProps) {
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    if (item?.settings) {
      console.log("Modal received item:", item)
      console.log("Modal received item settings:", JSON.stringify(item.settings, null, 2))
      // Create a new object to avoid reference issues
      setSettings({ ...item.settings })
    } else {
      console.log("Modal received item with no settings:", item)
    }
  }, [item])

  const handleSave = () => {
    console.log("Saving settings:", settings)
    onSave(settings)
    onClose()
  }

  const handleChange = (key: string, value: any) => {
    setSettings((prevSettings: any) => ({
      ...prevSettings,
      [key]: value,
    }))
  }

  if (!item) {
    return null
  }

  // Format the display name based on type
  let displayName = item.type
  if (item.type === "name") displayName = "Product Name"
  else if (item.type === "discounted_price") displayName = "Discounted Price"
  else if (item.type === "discount_percentage") displayName = "Discounted Percentage"
  else if (item.type === "not_available") displayName = "Not Available"
  else if (item.type === "add_to_cart") displayName = "Add to Cart"
  else displayName = item.type.charAt(0).toUpperCase() + item.type.slice(1)

  // Helper function to format setting key to display name
  const formatSettingName = (key: string) => {
    // Remove the item type prefix from the key
    const name = key.replace(`${item.type}_`, "")
    // Replace underscores with spaces and capitalize each word
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Determine if a setting is a boolean toggle (on/off)
  const isToggleSetting = (key: string) => {
    return key.includes("on_off")
  }

  // Determine if a setting should use a select dropdown
  const isSelectSetting = (key: string) => {
    return key.includes("property") || key.includes("position") || key.includes("float") || key.includes("text_align")
  }

  // Get options for select settings
  const getSelectOptions = (key: string) => {
    if (key.includes("property")) {
      return ["contain", "cover", "fill", "none", "scale-down"]
    } else if (key.includes("position")) {
      return ["static", "relative", "absolute", "fixed", "sticky"]
    } else if (key.includes("float")) {
      return ["none", "left", "right"]
    } else if (key.includes("text_align")) {
      return ["left", "center", "right", "justify"]
    }
    return []
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {displayName} Settings</DialogTitle>
          <DialogDescription>Make changes to your card item settings here.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Render all settings */}
          {Object.entries(settings).map(([key, value]) => {
            // Convert null or "null" values to empty strings for display
            const displayValue = value === null || value === "null" ? "" : value

            const displayName = formatSettingName(key)

            if (isToggleSetting(key)) {
              return (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex-1">
                    {displayName}
                  </Label>
                  <Switch
                    id={key}
                    checked={displayValue === "1" || displayValue === 1 || displayValue === true}
                    onCheckedChange={(checked) => handleChange(key, checked ? "1" : "0")}
                  />
                </div>
              )
            } else if (isSelectSetting(key)) {
              const options = getSelectOptions(key)
              return (
                <div key={key} className="grid gap-2">
                  <Label htmlFor={key}>{displayName}</Label>
                  <Select
                    value={displayValue ? String(displayValue) : ""}
                    onValueChange={(newValue) => handleChange(key, newValue)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            } else {
              return (
                <div key={key} className="grid gap-2">
                  <Label htmlFor={key}>{displayName}</Label>
                  <Input
                    type="text"
                    id={key}
                    value={String(displayValue)}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </div>
              )
            }
          })}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} className="bg-[#e1416f] hover:bg-[#c02e53] text-white">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
