export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      donations: {
        Row: {
          amount: number
          created_at: string
          donation_date: string
          donor_name: string | null
          id: string
          notes: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          donation_date?: string
          donor_name?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          donation_date?: string
          donor_name?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      event_custom_fields: {
        Row: {
          created_at: string
          event_id: string
          field_name: string
          field_order: number
          field_type: string
          id: string
          is_required: boolean
          options: Json | null
        }
        Insert: {
          created_at?: string
          event_id: string
          field_name: string
          field_order?: number
          field_type?: string
          id?: string
          is_required?: boolean
          options?: Json | null
        }
        Update: {
          created_at?: string
          event_id?: string
          field_name?: string
          field_order?: number
          field_type?: string
          id?: string
          is_required?: boolean
          options?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "event_custom_fields_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          accepts_credit_card: boolean
          accepts_installments: boolean
          created_at: string
          description: string | null
          end_date: string | null
          end_time: string | null
          event_date: string
          event_time: string | null
          id: string
          is_active: boolean
          location: string | null
          max_capacity: number | null
          max_installments: number
          n8n_webhook_url: string | null
          payment_method: string | null
          pix_key: string | null
          price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          accepts_credit_card?: boolean
          accepts_installments?: boolean
          created_at?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_capacity?: number | null
          max_installments?: number
          n8n_webhook_url?: string | null
          payment_method?: string | null
          pix_key?: string | null
          price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          accepts_credit_card?: boolean
          accepts_installments?: boolean
          created_at?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_capacity?: number | null
          max_installments?: number
          n8n_webhook_url?: string | null
          payment_method?: string | null
          pix_key?: string | null
          price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          cover_photo_url: string | null
          created_at: string
          description: string | null
          display_order: number
          event_id: string | null
          id: string
          title: string
        }
        Insert: {
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          event_id?: string | null
          id?: string
          title: string
        }
        Update: {
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          event_id?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_albums_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          album_id: string
          caption: string | null
          created_at: string
          display_order: number
          id: string
          photo_url: string
        }
        Insert: {
          album_id: string
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_url: string
        }
        Update: {
          album_id?: string
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      installment_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          installment_number: number
          payment_date: string | null
          payment_status: string
          proof_url: string | null
          registration_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          installment_number: number
          payment_date?: string | null
          payment_status?: string
          proof_url?: string | null
          registration_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          installment_number?: number
          payment_date?: string | null
          payment_status?: string
          proof_url?: string | null
          registration_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installment_payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          avatar_url: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          age: number | null
          checked_in: boolean
          checked_in_at: string | null
          created_at: string
          credit_card_payment_date: string | null
          custom_fields: Json | null
          email: string | null
          event_id: string
          id: string
          installments_total: number | null
          name: string
          payment_mode: string | null
          payment_proof_url: string | null
          payment_status: string
          payment_type: string | null
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          age?: number | null
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
          credit_card_payment_date?: string | null
          custom_fields?: Json | null
          email?: string | null
          event_id: string
          id?: string
          installments_total?: number | null
          name: string
          payment_mode?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          payment_type?: string | null
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          age?: number | null
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
          credit_card_payment_date?: string | null
          custom_fields?: Json | null
          email?: string | null
          event_id?: string
          id?: string
          installments_total?: number | null
          name?: string
          payment_mode?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          payment_type?: string | null
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sermon_outline_files: {
        Row: {
          created_at: string
          display_order: number
          file_path: string
          folder_id: string
          id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          file_path: string
          folder_id: string
          id?: string
          title?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          file_path?: string
          folder_id?: string
          id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sermon_outline_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "sermon_outline_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      sermon_outline_folders: {
        Row: {
          created_at: string
          display_order: number
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          title?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
