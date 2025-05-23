export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      scans: {
        Row: {
          id: string
          user_id: string
          created_at: string
          image_url: string | null
          result: Json | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          image_url?: string | null
          result?: Json | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          image_url?: string | null
          result?: Json | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
