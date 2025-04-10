"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  defaultValue?: string
  onChange?: (value: string) => void
}

export function ColorPicker({ defaultValue = "#000000", onChange }: ColorPickerProps) {
  const [color, setColor] = useState(defaultValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setColor(newColor)
    onChange?.(newColor)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="w-10 h-10 rounded border border-gray-200"
            style={{ backgroundColor: color }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="p-2">
            <input type="color" value={color} onChange={handleChange} className="w-full h-32 cursor-pointer" />
          </div>
        </PopoverContent>
      </Popover>
      <Input type="text" value={color} onChange={handleChange} className="font-mono" />
    </div>
  )
}
