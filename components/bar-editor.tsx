"use client"

import type React from "react"

interface Bar {
  show_bar: boolean
  sticky_header: boolean
  transparent_header: boolean
  container: boolean
  active_link: boolean
}

interface BarEditorProps {
  bar: Bar
  updateBar: (updates: Partial<Bar>) => void
}

const BarEditor: React.FC<BarEditorProps> = ({ bar, updateBar }) => {
  return (
    <div>
      <div>
        <label className="block text-sm font-medium mb-1">Show Bar</label>
        <div className="flex items-center">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-l-md ${bar.show_bar ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ show_bar: true })
            }}
          >
            On
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.show_bar ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ show_bar: false })
            }}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sticky Header</label>
        <div className="flex items-center">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-l-md ${bar.sticky_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ sticky_header: true })
            }}
          >
            On
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.sticky_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ sticky_header: false })
            }}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Transparent Header</label>
        <div className="flex items-center">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-l-md ${bar.transparent_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ transparent_header: true })
            }}
          >
            On
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.transparent_header ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ transparent_header: false })
            }}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Container</label>
        <div className="flex items-center">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-l-md ${bar.container ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ container: true })
            }}
          >
            On
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.container ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ container: false })
            }}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Active Link</label>
        <div className="flex items-center">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-l-md ${bar.active_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ active_link: true })
            }}
          >
            On
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-r-md ${!bar.active_link ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              updateBar({ active_link: false })
            }}
          >
            Off
          </button>
        </div>
      </div>
    </div>
  )
}

export default BarEditor
