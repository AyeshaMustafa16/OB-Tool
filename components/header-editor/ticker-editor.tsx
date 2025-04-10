"use client"

import type { TickerConfig } from "@/lib/header-types"

interface TickerEditorProps {
  ticker: TickerConfig
  updateTicker: (tickerConfig: Partial<TickerConfig>) => void
}

export default function TickerEditor({ ticker, updateTicker }: TickerEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Show Ticker</label>
        <div className="flex items-center">
          <button
            className={`px-3 py-1 text-xs rounded-l-md ${ticker.header_ticker_on_off ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateTicker({ header_ticker_on_off: true })}
          >
            On
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-r-md ${!ticker.header_ticker_on_off ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateTicker({ header_ticker_on_off: false })}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sticky Ticker</label>
        <div className="flex items-center">
          <button
            className={`px-3 py-1 text-xs rounded-l-md ${ticker.sticky_ticker ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateTicker({ sticky_ticker: true })}
          >
            On
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-r-md ${!ticker.sticky_ticker ? "bg-[#d9365e] text-white" : "bg-gray-200"}`}
            onClick={() => updateTicker({ sticky_ticker: false })}
          >
            Off
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Background Color</label>
        <input
          type="text"
          className="w-full p-1 text-sm border rounded-md"
          value={ticker.ticker_bg_color || ""}
          onChange={(e) => updateTicker({ ticker_bg_color: e.target.value })}
          placeholder="#000000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Font Color</label>
        <input
          type="text"
          className="w-full p-1 text-sm border rounded-md"
          value={ticker.ticker_font_color || ""}
          onChange={(e) => updateTicker({ ticker_font_color: e.target.value })}
          placeholder="#ffffff"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Text</label>
        <textarea
          className="w-full p-1 text-sm border rounded-md min-h-[60px]"
          value={ticker.header_ticker_text || ""}
          onChange={(e) => updateTicker({ header_ticker_text: e.target.value })}
          placeholder="Enter ticker text here..."
        />
      </div>
    </div>
  )
}
