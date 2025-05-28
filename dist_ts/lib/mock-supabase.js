"use client";
// In-memory storage for mock auth
let mockUser = null;
let mockSession = null;
// Mock Supabase client for preview environment
export const createMockSupabaseClient = () => {
    return {
        auth: {
            getSession: async () => {
                return { data: { session: mockSession }, error: null };
            },
            signInWithPassword: async ({ email, password }) => {
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
                    };
                    mockSession = { user: mockUser };
                    return { data: { user: mockUser, session: mockSession }, error: null };
                }
                return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } };
            },
            signUp: async ({ email, password }) => {
                // Simple mock sign up
                if (email && password && password.length >= 8) {
                    return { data: { user: null, session: null }, error: null };
                }
                return { data: { user: null, session: null }, error: { message: "Invalid signup credentials" } };
            },
            signOut: async () => {
                mockUser = null;
                mockSession = null;
                return { error: null };
            },
            onAuthStateChange: () => {
                // Return a mock subscription
                return { data: { subscription: { unsubscribe: () => { } } } };
            },
        },
        from: (table) => {
            return {
                select: () => ({
                    eq: () => ({
                        order: () => ({
                            then: (callback) => callback({ data: [], error: null }),
                        }),
                    }),
                }),
                insert: () => ({
                    then: (callback) => callback({ error: null }),
                }),
                delete: () => ({
                    eq: () => ({
                        then: (callback) => callback({ error: null }),
                    }),
                }),
            };
        },
        storage: {
            from: (bucket) => ({
                upload: () => ({ data: { path: "mock-path" }, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: "https://example.com/mock-image.jpg" } }),
            }),
        },
    };
};
