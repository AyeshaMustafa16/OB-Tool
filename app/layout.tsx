import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { SettingsProvider } from "@/contexts/settings-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SettingsProvider>
          {children}
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  )
}

import "./globals.css"

export const metadata = {
  generator: "v0.dev",
}


import './globals.css'