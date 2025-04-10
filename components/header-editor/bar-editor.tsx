"use client"

import type { BarConfig } from "@/lib/header-types"

interface BarEditorProps {
  bar: BarConfig
  updateBar: (barConfig: Partial<BarConfig>) => void
}

export default function BarEditor({ bar, updateBar }: BarEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Show Bar</label>
        <div className="flex items-center">
          <button
            className={`px-3 py-1 text-xs rounded-l-md ${bar.show_bar ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ show_bar: true })}
          >
            On
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.show_bar ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ show_bar: false })}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sticky Header</label>
        <div className="flex items-center">
          <button
            className={`px-3 py-1 text-xs rounded-l-md ${bar.sticky_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ sticky_header: true })}
          >
            On
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.sticky_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ sticky_header: false })}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Transparent Header</label>
        <div className="flex items-center">
          <button
            className={`px-3 py-1 text-xs rounded-l-md ${bar.transparent_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ transparent_header: true })}
          >
            On
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.transparent_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ transparent_header: false })}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Container</label>
        <div className="flex items-center">
          <button
            className={`px-3 py-1 text-xs rounded-l-md ${bar.container ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ container: true })}
          >
            On
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.container ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ container: false })}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Active Link</label>
        <div className="flex items-center">
          <button
            className={`px-3 py-1 text-xs rounded-l-md ${bar.active_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ active_link: true })}
          >
            On
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.active_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateBar({ active_link: false })}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Height</label>
        <input
          type="text"
          className="w-full p-1 text-sm border rounded-md"
          value={bar.height || ""}
          onChange={(e) => updateBar({ height: e.target.value })}
          placeholder="Height in Px"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Background Color</label>
        <input
          type="text"
          className="w-full p-1 text-sm border rounded-md"
          value={bar.bar_background_color || ""}
          onChange={(e) => updateBar({ bar_background_color: e.target.value })}
          placeholder="#ffffff"
        />
      </div>
    </div>
  )
}
