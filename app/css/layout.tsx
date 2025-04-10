import type React from "react"
import type { Metadata } from "next"
import { SettingsProvider } from "@/contexts/settings-context"

export const metadata: Metadata = {
  title: "CSS Editor",
  description: "Edit your website CSS",
}

export default function CssLayout({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>
}
