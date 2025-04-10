"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login } from "@/lib/auth"
import { useSettings } from "@/contexts/settings-context"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { refreshSettings } = useSettings()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", { username })
      const result = await login(username, password)

      if (result && result.success) {
        console.log("Login successful, setting client-side cookies...")

        // Set cookies client-side to ensure they're available immediately
        document.cookie = `brandId=${result.brandId}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
        document.cookie = `brandName=${encodeURIComponent(result.brandName)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`

        // Also store in localStorage for redundancy
        localStorage.setItem("brandId", result.brandId)
        localStorage.setItem("brandName", result.brandName)

        if (result.brandLogo) {
          document.cookie = `brandLogo=${encodeURIComponent(result.brandLogo)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
          localStorage.setItem("brandLogo", result.brandLogo)
        }

        // Wait a moment for cookies to be set
        await new Promise((resolve) => setTimeout(resolve, 500))

        console.log("Client-side cookies set, refreshing settings...")

        try {
          await refreshSettings() // Fetch settings after successful login
          console.log("Settings refreshed, redirecting...")
        } catch (settingsError) {
          console.error("Error refreshing settings:", settingsError)
          // Continue with redirect even if settings refresh fails
        }

        // Force a hard navigation to ensure cookies are properly recognized
        window.location.href = "/home"
      } else {
        console.log("Login failed")
        setError("Invalid username or password")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Business Sign In</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="username@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-100"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full bg-[#d9365e] hover:bg-[#c02e53]" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
