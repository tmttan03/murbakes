import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Client-side Supabase client (with limited permissions)
export const createClientComponentClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
    console.warn("Supabase credentials are missing or invalid in client component")
    // Return a dummy client that will gracefully fail
    return createClient("https://example.com", "placeholder-key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // Return a dummy client that will gracefully fail
    return createClient("https://example.com", "placeholder-key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
}

// Server-side Supabase client (with full permissions)
export const createServerComponentClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn("Supabase server credentials are missing")
    throw new Error("FALLBACK_TO_LOCAL_DATA")
  }

  // Validate URL format
  if (!isValidUrl(url)) {
    console.warn("Invalid Supabase URL format:", url)
    throw new Error("FALLBACK_TO_LOCAL_DATA")
  }

  try {
    return createClient<Database>(url, key)
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw new Error("FALLBACK_TO_LOCAL_DATA")
  }
}
