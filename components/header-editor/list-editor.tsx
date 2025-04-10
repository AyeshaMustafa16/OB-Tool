"use client"

import type { ListConfig } from "@/lib/header-types"

interface ListEditorProps {
  list: ListConfig
  updateList: (listConfig: Partial<ListConfig>) => void
}

export default function ListEditor({ list, updateList }: ListEditorProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium mb-1">Position</label>
        <select
          className="w-full p-1 text-xs border rounded-md"
          value={list.position}
          onChange={(e) => updateList({ position: e.target.value as "left" | "center" | "right" })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  )
}
