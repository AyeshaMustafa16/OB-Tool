import type React from "react"
import type { Metadata } from "next"
import { SettingsProvider } from "@/contexts/settings-context"

export const metadata: Metadata = {
  title: "Detail Page Editor",
  description: "Edit your product detail page",
}

export default function DetailPageLayout({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>
}
