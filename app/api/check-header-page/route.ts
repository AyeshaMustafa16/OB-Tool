// Import the dynamic configuration
import "../../dynamic"

import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const headersList = headers()
  const isHeaderPage = headersList.get("x-header-page") === "true"
  const pathname = headersList.get("x-pathname") || ""

  console.log("Check header page API called:", {
    isHeaderPage,
    pathname,
    "x-header-page": headersList.get("x-header-page"),
  })

  // Update to only consider exact header path
  return NextResponse.json({
    isHeaderPage: isHeaderPage || pathname === "/header",
    pathname,
    headers: {
      "x-header-page": headersList.get("x-header-page"),
    },
  })
}
