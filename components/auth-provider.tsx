"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

type UserProfile = {
  id: string
  account_type: "free" | "premium"
  subscription_id?: string
  created_at?: string
  updated_at?: string
}

type AuthContextType = {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  setUser: (user: User | null) => void
  setUserProfile: (profile: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  setUser: () => {},
  setUserProfile: () => {},
})

export const useAuth = () => useContext(AuthContext)

// Simple user storage using localStorage
const storeUser = (user: User | null) => {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("mitch-user", JSON.stringify(user))
  } else {
    localStorage.removeItem("mitch-user")
  }
}

const storeUserProfile = (profile: UserProfile | null) => {
  if (typeof window === "undefined") return
  if (profile) {
    localStorage.setItem("mitch-user-profile", JSON.stringify(profile))
  } else {
    localStorage.removeItem("mitch-user-profile")
  }
}

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null
  const storedUser = localStorage.getItem("mitch-user")
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser)
  } catch (error) {
    console.error("Error parsing stored user:", error)
    return null
  }
}

const getStoredUserProfile = (): UserProfile | null => {
  if (typeof window === "undefined") return null
  const storedProfile = localStorage.getItem("mitch-user-profile")
  if (!storedProfile) return null
  try {
    return JSON.parse(storedProfile)
  } catch (error) {
    console.error("Error parsing stored user profile:", error)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Set user and store in localStorage
  const setUser = (newUser: User | null) => {
    setUserState(newUser)
    storeUser(newUser)
  }

  // Set user profile and store in localStorage
  const setUserProfile = (newProfile: UserProfile | null) => {
    setUserProfileState(newProfile)
    storeUserProfile(newProfile)
  }

  // Only run on client side
  useEffect(() => {
    setMounted(true)
    // Load user from localStorage on mount
    const storedUser = getStoredUser()
    const storedProfile = getStoredUserProfile()
    setUserState(storedUser)
    setUserProfileState(storedProfile)
    setLoading(false)
  }, [])

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !mounted) return

      try {
        // Check if we're in a preview environment
        const isPreview = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

        if (isPreview) {
          // Use mock profile in preview
          setUserProfile({
            id: user.id,
            account_type: "free",
          })
          return
        }

        // Dynamically import to prevent any SSR issues
        const { getSupabaseBrowser } = await import("@/lib/supabase-browser")
        const supabase = getSupabaseBrowser()

        if (!supabase) {
          console.error("Could not initialize Supabase client")
          return
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching user profile:", error)
          return
        }

        if (data) {
          setUserProfile(data as UserProfile)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [user, mounted])

  // Don't render anything on server
  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, setUser, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
