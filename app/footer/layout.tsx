import type React from "react"
import type { Metadata } from "next"
import { SettingsProvider } from "@/contexts/settings-context"

export const metadata: Metadata = {
  title: "Footer Editor",
  description: "Edit your website footer",
}

export default function FooterLayout({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>
}
