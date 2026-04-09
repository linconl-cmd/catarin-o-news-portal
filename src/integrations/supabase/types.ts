export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          content: string | null
          cover_image_url: string | null
          category_id: string | null
          author_id: string | null
          status: Database["public"]["Enums"]["article_status"]
          is_featured: boolean
          views_count: number
          published_at: string | null
          scheduled_at: string | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          content?: string | null
          cover_image_url?: string | null
          category_id?: string | null
          author_id?: string | null
          status?: Database["public"]["Enums"]["article_status"]
          is_featured?: boolean
          views_count?: number
          published_at?: string | null
          scheduled_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          content?: string | null
          cover_image_url?: string | null
          category_id?: string | null
          author_id?: string | null
          status?: Database["public"]["Enums"]["article_status"]
          is_featured?: boolean
          views_count?: number
          published_at?: string | null
          scheduled_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      navigation_menus: {
        Row: {
          id: string
          label: string
          url: string | null
          category_id: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          open_in_new_tab: boolean
          created_at: string
        }
        Insert: {
          id?: string
          label: string
          url?: string | null
          category_id?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          open_in_new_tab?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          label?: string
          url?: string | null
          category_id?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          open_in_new_tab?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_menus_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_menus_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          }
        ]
      }
      media: {
        Row: {
          id: string
          file_name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          alt_text: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          alt_text?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          alt_text?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      print_editions: {
        Row: {
          id: string
          title: string
          edition_number: string | null
          cover_image_url: string | null
          pdf_url: string
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          edition_number?: string | null
          cover_image_url?: string | null
          pdf_url: string
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          edition_number?: string | null
          cover_image_url?: string | null
          pdf_url?: string
          published_at?: string | null
          created_at?: string
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
      increment_article_views: {
        Args: {
          article_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "master" | "tecnico" | "editorial"
      article_status: "draft" | "published" | "archived"
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
      app_role: ["master", "tecnico", "editorial"],
      article_status: ["draft", "published", "archived"],
    },
  },
} as const
