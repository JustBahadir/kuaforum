export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      isletmeler: {
        Row: {
          ad: string
          adres: string | null
          created_at: string | null
          eposta: string | null
          id: string
          kimlik: string | null
          kod: string | null
          sahip_kimlik: string | null
          telefon: string | null
          updated_at: string | null
        }
        Insert: {
          ad: string
          adres?: string | null
          created_at?: string | null
          eposta?: string | null
          id?: string
          kimlik?: string | null
          kod?: string | null
          sahip_kimlik?: string | null
          telefon?: string | null
          updated_at?: string | null
        }
        Update: {
          ad?: string
          adres?: string | null
          created_at?: string | null
          eposta?: string | null
          id?: string
          kimlik?: string | null
          kod?: string | null
          sahip_kimlik?: string | null
          telefon?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kullanicilar: {
        Row: {
          ad: string | null
          auth_id: string | null
          created_at: string | null
          eposta: string | null
          id: string
          kimlik: string | null
          profil_tamamlandi: boolean | null
          rol: string | null
          soyad: string | null
          telefon: string | null
          updated_at: string | null
        }
        Insert: {
          ad?: string | null
          auth_id?: string | null
          created_at?: string | null
          eposta?: string | null
          id?: string
          kimlik?: string | null
          profil_tamamlandi?: boolean | null
          rol?: string | null
          soyad?: string | null
          telefon?: string | null
          updated_at?: string | null
        }
        Update: {
          ad?: string | null
          auth_id?: string | null
          created_at?: string | null
          eposta?: string | null
          id?: string
          kimlik?: string | null
          profil_tamamlandi?: boolean | null
          rol?: string | null
          soyad?: string | null
          telefon?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      personel: {
        Row: {
          ad_soyad: string
          adres: string | null
          auth_id: string | null
          avatar_url: string | null
          birth_date: string | null
          calisma_sistemi: string | null
          created_at: string | null
          dukkan_id: number | null
          eposta: string | null
          iban: string | null
          id: number
          isletme_id: string | null
          kimlik: string | null
          kullanici_kimlik: string | null
          maas: number | null
          personel_no: string | null
          prim_yuzdesi: number | null
          telefon: string | null
          updated_at: string | null
        }
        Insert: {
          ad_soyad: string
          adres?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          calisma_sistemi?: string | null
          created_at?: string | null
          dukkan_id?: number | null
          eposta?: string | null
          iban?: string | null
          id?: number
          isletme_id?: string | null
          kimlik?: string | null
          kullanici_kimlik?: string | null
          maas?: number | null
          personel_no?: string | null
          prim_yuzdesi?: number | null
          telefon?: string | null
          updated_at?: string | null
        }
        Update: {
          ad_soyad?: string
          adres?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          calisma_sistemi?: string | null
          created_at?: string | null
          dukkan_id?: number | null
          eposta?: string | null
          iban?: string | null
          id?: number
          isletme_id?: string | null
          kimlik?: string | null
          kullanici_kimlik?: string | null
          maas?: number | null
          personel_no?: string | null
          prim_yuzdesi?: number | null
          telefon?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personel_isletme_id_fkey"
            columns: ["isletme_id"]
            isOneToOne: false
            referencedRelation: "isletmeler"
            referencedColumns: ["kimlik"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_appointment: {
        Args:
          | { appointment_data: Json }
          | {
              p_dukkan_id: number
              p_musteri_id: number
              p_personel_id: number
              p_tarih: string
              p_saat: string
              p_durum: string
              p_notlar: string
              p_islemler: Json
              p_customer_id: string
            }
        Returns: Json
      }
      create_category: {
        Args: { p_dukkan_id: number; p_kategori_adi: string }
        Returns: Json
      }
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_customer_name_by_id: {
        Args: { p_musteri_id: number }
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      insert_appointment: {
        Args: {
          p_dukkan_id: number
          p_musteri_id: number
          p_personel_id: number
          p_tarih: string
          p_saat: string
          p_durum: string
          p_islemler: Json
          p_notlar: string
          p_customer_id: string
        }
        Returns: Json
      }
      recover_customer_appointments: {
        Args: { p_customer_id: number }
        Returns: {
          id: number
          tarih: string
          saat: string
          durum: string
          notlar: string
          personel_id: number
          islemler: Json
          service_name: string
          personnel_name: string
          amount: number
          points: number
        }[]
      }
      update_appointment_status: {
        Args: { appointment_id: number; new_status: string }
        Returns: Json
      }
    }
    Enums: {
      user_role: "customer" | "staff" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["customer", "staff", "admin"],
    },
  },
} as const
