import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Get brandId from request body
    const brandId = data.brandId

    if (!brandId) {
      return NextResponse.json({ message: "Brand ID is required" }, { status: 400 })
    }

    // Remove brandId from data before forwarding
    const { brandId: _, ...settingsData } = data

    // Use API_BASE_URL environment variable
    const apiBaseUrl = process.env.API_BASE_URL || ""
    const response = await fetch(`${apiBaseUrl}/api/settings/update?brandId=${brandId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settingsData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: `API error: ${errorData.message || response.statusText}` },
        { status: response.status },
      )
    }

    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error in settings update API route:", error)
    return NextResponse.json(
      { message: `Server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
