"use client"

import type { User } from "@supabase/supabase-js"

// In-memory storage for mock auth
let mockUser: User | null = null
let mockSession: { user: User | null } | null = null

// Mock Supabase client for preview environment
export const createMockSupabaseClient = () => {
  return {
    auth: {
      getSession: async () => {
        return { data: { session: mockSession }, error: null }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Simple mock authentication
        if (email && password) {
          // Create a mock user
          mockUser = {
            id: "mock-user-id",
            email,
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as User

          mockSession = { user: mockUser }
          return { data: { user: mockUser, session: mockSession }, error: null }
        }
        return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } }
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        // Simple mock sign up
        if (email && password && password.length >= 8) {
          return { data: { user: null, session: null }, error: null }
        }
        return { data: { user: null, session: null }, error: { message: "Invalid signup credentials" } }
      },
      signOut: async () => {
        mockUser = null
        mockSession = null
        return { error: null }
      },
      onAuthStateChange: () => {
        // Return a mock subscription
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from: (table: string) => {
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              then: (callback: Function) => callback({ data: [], error: null }),
            }),
          }),
        }),
        insert: () => ({
          then: (callback: Function) => callback({ error: null }),
        }),
        delete: () => ({
          eq: () => ({
            then: (callback: Function) => callback({ error: null }),
          }),
        }),
      }
    },
    storage: {
      from: (bucket: string) => ({
        upload: () => ({ data: { path: "mock-path" }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://example.com/mock-image.jpg" } }),
      }),
    },
  }
}
