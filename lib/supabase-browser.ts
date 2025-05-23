"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { createMockSupabaseClient } from "./mock-supabase"

// Check if we're running in a browser environment
const isBrowser = typeof window !== "undefined"

// Check if we're in a preview environment
const isPreview = isBrowser && window.location.hostname.includes("v0.dev")

// Create the Supabase client on demand
export const getSupabaseBrowser = () => {
  // Only create the client in browser environments
  if (!isBrowser) {
    console.warn("Attempted to initialize Supabase client in a non-browser environment")
    return null
  }

  try {
    // Use mock client in preview environment
    if (isPreview) {
      console.log("Using mock Supabase client in preview environment")
      return createMockSupabaseClient()
    }

    // Use real client in production
    return createClientComponentClient<Database>({
      // Add options to prevent storage access during SSR/hydration
      auth: {
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return null
  }
}
