// This file configures dynamic routes for the application
export const dynamicParams = true

// Force dynamic rendering for specific routes
export const dynamic = "force-dynamic"

// Disable static generation for all routes
export const generateStaticParams = () => {
  return []
}
