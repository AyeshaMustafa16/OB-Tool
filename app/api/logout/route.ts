// Import the dynamic configuration
import "../../dynamic"

import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  cookies().delete("brandId")
  cookies().delete("brandName")

  return NextResponse.json({ success: true })
}
