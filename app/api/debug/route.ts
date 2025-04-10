// Import the dynamic configuration
import "../../dynamic"

import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = cookies()
  const brandId = cookieStore.get("brandId")?.value
  const brandName = cookieStore.get("brandName")?.value
  const brandLogo = cookieStore.get("brandLogo")?.value

  return NextResponse.json({
    brandId,
    brandName,
    brandLogo,
    allCookies: cookieStore.getAll().map((c) => c.name),
  })
}
