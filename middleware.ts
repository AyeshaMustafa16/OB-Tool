import { type NextRequest, NextResponse } from "next/server"

// This config ensures middleware runs only on specified paths
export const config = {
  matcher: ["/", "/home/:path*", "/header/:path*"],
}

export function middleware(request: NextRequest) {
  const brandId = request.cookies.get("brandId")?.value
  const { pathname } = request.nextUrl

  console.log("Middleware check - brandId:", brandId, "Path:", pathname)

  // Special case for header page - don't redirect
  if (pathname.startsWith("/header")) {
    console.log("Allowing header page access without authentication")
    return NextResponse.next()
  }

  // Allow access to home page without authentication
  if (pathname === "/home") {
    console.log("Allowing access to home page without authentication")
    return NextResponse.next()
  }

  // If user is not logged in and trying to access protected routes
  if (!brandId && pathname.startsWith("/home/")) {
    console.log("Redirecting to home from protected route:", pathname)
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // If user is logged in and trying to access login page
  if (brandId && pathname === "/") {
    console.log("Redirecting to home from login page")
    return NextResponse.redirect(new URL("/home", request.url))
  }

  console.log("Middleware allowing access to:", pathname)
  return NextResponse.next()
}
