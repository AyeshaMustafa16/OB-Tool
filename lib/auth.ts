"use server"

import { cookies } from "next/headers"
import crypto from "crypto"

export async function login(username: string, password: string) {
  try {
    const API_PATH = "https://tossdown.site/api/"
    const url = `${API_PATH}getBrand`

    // Format the request exactly like the PHP curl implementation
    const formData = new URLSearchParams()
    formData.append("user_name", username)

    console.log("Sending login request to:", url)
    console.log("With username:", username)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`)
      return false
    }

    const responseText = await response.text()
    console.log("API Response length:", responseText.length)

    // Parse the JSON response
    let brand
    try {
      brand = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse JSON response:", e)
      return false
    }

    if (!brand) {
      console.log("No brand data returned")
      return false
    }

    console.log("Brand data received:", {
      id: brand.id,
      name: brand.name,
      hasLogo: !!brand.logo_image,
    })

    // Convert password to MD5 hash for comparison - exactly as in PHP
    const md5Password = crypto.createHash("md5").update(password).digest("hex")
    console.log("Comparing password hashes:", { provided: md5Password, stored: brand.password })

    if (brand.password === md5Password) {
      // Store brand info in cookies with more permissive settings
      cookies().set("brandId", brand.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        sameSite: "lax",
      })

      // Store the actual brand name from the API response
      cookies().set("brandName", brand.name || username.split("@")[0], {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        sameSite: "lax",
      })

      // Store the logo URL if available
      if (brand.logo_image) {
        console.log("Storing logo_image URL:", brand.logo_image)
        cookies().set("brandLogo", brand.logo_image, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
          sameSite: "lax",
        })
      } else {
        console.log("No logo_image found in brand data")
      }

      // Return the brand data so it can be used client-side
      return {
        success: true,
        brandId: brand.id.toString(),
        brandName: brand.name || username.split("@")[0],
        brandLogo: brand.logo_image || null,
      }
    }

    console.log("Password mismatch")
    return false
  } catch (error) {
    console.error("Login error:", error)
    return false
  }
}

export async function getBrandInfo() {
  try {
    const brandId = cookies().get("brandId")?.value
    const brandName = cookies().get("brandName")?.value
    const brandLogo = cookies().get("brandLogo")?.value

    console.log("getBrandInfo called, cookies:", { brandId, brandName, hasLogo: !!brandLogo })

    if (!brandId) {
      console.log("No brandId cookie found")
      return null
    }

    return {
      id: brandId,
      name: brandName || "Unknown",
      logo: brandLogo || null,
    }
  } catch (error) {
    console.error("Error in getBrandInfo:", error)
    return null
  }
}

export async function isAuthenticated() {
  try {
    const hasBrandId = cookies().has("brandId")
    console.log("isAuthenticated check:", hasBrandId)
    return hasBrandId
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export async function logout() {
  try {
    cookies().delete("brandId")
    cookies().delete("brandName")
    cookies().delete("brandLogo")
    console.log("Logout successful, cookies deleted")
    return true
  } catch (error) {
    console.error("Error during logout:", error)
    return false
  }
}

export async function getAuthToken() {
  // This is a placeholder implementation. In a real application,
  // you would retrieve the authentication token from a secure source,
  // such as an environment variable, a configuration file, or a secrets manager.

  // For demonstration purposes, we'll just return a dummy token.
  return "dummy_auth_token"
}
