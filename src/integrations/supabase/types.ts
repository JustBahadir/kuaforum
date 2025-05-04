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
      calisma_saatleri: {
        Row: {
          acilis: string | null
          created_at: string | null
          dukkan_id: number | null
          gun: string
          gun_sira: number
          id: number
          kapali: boolean | null
          kapanis: string | null
        }
        Insert: {
          acilis?: string | null
          created_at?: string | null
          dukkan_id?: number | null
          gun: string
          gun_sira: number
          id?: never
          kapali?: boolean | null
          kapanis?: string | null
        }
        Update: {
          acilis?: string | null
          created_at?: string | null
          dukkan_id?: number | null
          gun?: string
          gun_sira?: number
          id?: never
          kapali?: boolean | null
          kapanis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calisma_saatleri_dukkan_id_fkey"
            columns: ["dukkan_id"]
            isOneToOne: false
            referencedRelation: "dukkanlar"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_personal_data: {
        Row: {
          anniversary_date: string | null
          birth_date: string | null
          children_names: string[] | null
          created_at: string
          custom_notes: string | null
          customer_id: string | null
          daily_horoscope_reading: string | null
          horoscope: string | null
          horoscope_description: string | null
          id: number
          spouse_birthdate: string | null
          spouse_name: string | null
          updated_at: string
        }
        Insert: {
          anniversary_date?: string | null
          birth_date?: string | null
          children_names?: string[] | null
          created_at?: string
          custom_notes?: string | null
          customer_id?: string | null
          daily_horoscope_reading?: string | null
          horoscope?: string | null
          horoscope_description?: string | null
          id?: number
          spouse_birthdate?: string | null
          spouse_name?: string | null
          updated_at?: string
        }
        Update: {
          anniversary_date?: string | null
          birth_date?: string | null
          children_names?: string[] | null
          created_at?: string
          custom_notes?: string | null
          customer_id?: string | null
          daily_horoscope_reading?: string | null
          horoscope?: string | null
          horoscope_description?: string | null
          id?: number
          spouse_birthdate?: string | null
          spouse_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_personal_data_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_preferences: {
        Row: {
          birth_date: string | null
          cologne_preference: string | null
          created_at: string
          custom_preferences: Json | null
          customer_id: string | null
          ear_burning: boolean | null
          id: number
          razor_preference: string | null
          special_date: string | null
          special_date_description: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          cologne_preference?: string | null
          created_at?: string
          custom_preferences?: Json | null
          customer_id?: string | null
          ear_burning?: boolean | null
          id?: number
          razor_preference?: string | null
          special_date?: string | null
          special_date_description?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          cologne_preference?: string | null
          created_at?: string
          custom_preferences?: Json | null
          customer_id?: string | null
          ear_burning?: boolean | null
          id?: number
          razor_preference?: string | null
          special_date?: string | null
          special_date_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dukkanlar: {
        Row: {
          acik_adres: string | null
          active: boolean | null
          ad: string
          adres: string | null
          created_at: string
          id: number
          kod: string
          logo_url: string | null
          sahibi_id: string
          telefon: number | null
        }
        Insert: {
          acik_adres?: string | null
          active?: boolean | null
          ad: string
          adres?: string | null
          created_at?: string
          id?: number
          kod: string
          logo_url?: string | null
          sahibi_id: string
          telefon?: number | null
        }
        Update: {
          acik_adres?: string | null
          active?: boolean | null
          ad?: string
          adres?: string | null
          created_at?: string
          id?: number
          kod?: string
          logo_url?: string | null
          sahibi_id?: string
          telefon?: number | null
        }
        Relationships: []
      }
      islem_kategorileri: {
        Row: {
          created_at: string
          dukkan_id: number | null
          id: number
          kategori_adi: string
          sira: number | null
        }
        Insert: {
          created_at?: string
          dukkan_id?: number | null
          id?: number
          kategori_adi: string
          sira?: number | null
        }
        Update: {
          created_at?: string
          dukkan_id?: number | null
          id?: number
          kategori_adi?: string
          sira?: number | null
        }
        Relationships: []
      }
      musteriler: {
        Row: {
          birthdate: string | null
          created_at: string
          dukkan_id: number | null
          first_name: string
          id: number
          last_name: string | null
          phone: string | null
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          dukkan_id?: number | null
          first_name: string
          id?: number
          last_name?: string | null
          phone?: string | null
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          dukkan_id?: number | null
          first_name?: string
          id?: number
          last_name?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "musteriler_dukkan_id_fkey"
            columns: ["dukkan_id"]
            isOneToOne: false
            referencedRelation: "dukkanlar"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          message: string
          read: boolean | null
          related_appointment_id: number | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          read?: boolean | null
          related_appointment_id?: number | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          read?: boolean | null
          related_appointment_id?: number | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personel: {
        Row: {
          ad_soyad: string
          adres: string
          auth_id: string | null
          avatar_url: string | null
          birth_date: string | null
          calisma_sistemi: string
          created_at: string
          dukkan_id: number | null
          eposta: string
          iban: string | null
          id: number
          maas: number
          personel_no: string
          prim_yuzdesi: number
          telefon: string
        }
        Insert: {
          ad_soyad: string
          adres: string
          auth_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          calisma_sistemi: string
          created_at?: string
          dukkan_id?: number | null
          eposta: string
          iban?: string | null
          id?: number
          maas: number
          personel_no: string
          prim_yuzdesi: number
          telefon: string
        }
        Update: {
          ad_soyad?: string
          adres?: string
          auth_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          calisma_sistemi?: string
          created_at?: string
          dukkan_id?: number | null
          eposta?: string
          iban?: string | null
          id?: number
          maas?: number
          personel_no?: string
          prim_yuzdesi?: number
          telefon?: string
        }
        Relationships: [
          {
            foreignKeyName: "personel_dukkan_id_fkey"
            columns: ["dukkan_id"]
            isOneToOne: false
            referencedRelation: "dukkanlar"
            referencedColumns: ["id"]
          },
        ]
      }
      personel_islemleri: {
        Row: {
          aciklama: string
          created_at: string
          id: number
          islem_id: number | null
          musteri_id: number | null
          notlar: string | null
          odenen: number
          personel_id: number | null
          photos: string[] | null
          prim_yuzdesi: number
          puan: number
          randevu_id: number | null
          tutar: number
        }
        Insert: {
          aciklama: string
          created_at?: string
          id?: number
          islem_id?: number | null
          musteri_id?: number | null
          notlar?: string | null
          odenen?: number
          personel_id?: number | null
          photos?: string[] | null
          prim_yuzdesi: number
          puan?: number
          randevu_id?: number | null
          tutar: number
        }
        Update: {
          aciklama?: string
          created_at?: string
          id?: number
          islem_id?: number | null
          musteri_id?: number | null
          notlar?: string | null
          odenen?: number
          personel_id?: number | null
          photos?: string[] | null
          prim_yuzdesi?: number
          puan?: number
          randevu_id?: number | null
          tutar?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_personel_islemleri_musteri"
            columns: ["musteri_id"]
            isOneToOne: false
            referencedRelation: "musteriler"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personel_islemleri_personel_id_fkey"
            columns: ["personel_id"]
            isOneToOne: false
            referencedRelation: "personel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personel_islemleri_personel_id_fkey"
            columns: ["personel_id"]
            isOneToOne: false
            referencedRelation: "personel_performans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birthdate: string | null
          created_at: string
          dukkan_id: number | null
          first_name: string | null
          gender: string | null
          iban: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          shopname: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string
          dukkan_id?: number | null
          first_name?: string | null
          gender?: string | null
          iban?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          shopname?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string
          dukkan_id?: number | null
          first_name?: string | null
          gender?: string | null
          iban?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          shopname?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_dukkan_id_fkey"
            columns: ["dukkan_id"]
            isOneToOne: false
            referencedRelation: "dukkanlar"
            referencedColumns: ["id"]
          },
        ]
      }
      randevular: {
        Row: {
          created_at: string
          customer_id: string | null
          dukkan_id: number | null
          durum: string
          id: number
          islemler: Json
          musteri_id: number | null
          notlar: string | null
          personel_id: number | null
          saat: string
          tarih: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          dukkan_id?: number | null
          durum?: string
          id?: number
          islemler: Json
          musteri_id?: number | null
          notlar?: string | null
          personel_id?: number | null
          saat: string
          tarih: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          dukkan_id?: number | null
          durum?: string
          id?: number
          islemler?: Json
          musteri_id?: number | null
          notlar?: string | null
          personel_id?: number | null
          saat?: string
          tarih?: string
        }
        Relationships: [
          {
            foreignKeyName: "randevular_dukkan_id_fkey"
            columns: ["dukkan_id"]
            isOneToOne: false
            referencedRelation: "dukkanlar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "randevular_musteri_id_fkey"
            columns: ["musteri_id"]
            isOneToOne: false
            referencedRelation: "musteriler"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "randevular_personel_id_fkey"
            columns: ["personel_id"]
            isOneToOne: false
            referencedRelation: "personel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "randevular_personel_id_fkey"
            columns: ["personel_id"]
            isOneToOne: false
            referencedRelation: "personel_performans"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_education: {
        Row: {
          created_at: string | null
          lisedurumu: string
          liseturu: string
          meslekibrans: string
          ortaokuldurumu: string
          personel_id: number
          universitebolum: string
          universitedurumu: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          lisedurumu?: string
          liseturu?: string
          meslekibrans?: string
          ortaokuldurumu?: string
          personel_id: number
          universitebolum?: string
          universitedurumu?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          lisedurumu?: string
          liseturu?: string
          meslekibrans?: string
          ortaokuldurumu?: string
          personel_id?: number
          universitebolum?: string
          universitedurumu?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_personel"
            columns: ["personel_id"]
            isOneToOne: true
            referencedRelation: "personel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_personel"
            columns: ["personel_id"]
            isOneToOne: true
            referencedRelation: "personel_performans"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_history: {
        Row: {
          belgeler: string
          created_at: string | null
          cv: string
          gorevpozisyon: string
          isyerleri: string
          personel_id: number
          updated_at: string | null
          yarismalar: string
        }
        Insert: {
          belgeler?: string
          created_at?: string | null
          cv?: string
          gorevpozisyon?: string
          isyerleri?: string
          personel_id: number
          updated_at?: string | null
          yarismalar?: string
        }
        Update: {
          belgeler?: string
          created_at?: string | null
          cv?: string
          gorevpozisyon?: string
          isyerleri?: string
          personel_id?: number
          updated_at?: string | null
          yarismalar?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_personel_history"
            columns: ["personel_id"]
            isOneToOne: true
            referencedRelation: "personel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_personel_history"
            columns: ["personel_id"]
            isOneToOne: true
            referencedRelation: "personel_performans"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_join_requests: {
        Row: {
          created_at: string
          dukkan_id: number | null
          durum: string
          id: number
          personel_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dukkan_id?: number | null
          durum?: string
          id?: number
          personel_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dukkan_id?: number | null
          durum?: string
          id?: number
          personel_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_join_requests_dukkan_id_fkey"
            columns: ["dukkan_id"]
            isOneToOne: false
            referencedRelation: "dukkanlar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_join_requests_personel_id_fkey"
            columns: ["personel_id"]
            isOneToOne: false
            referencedRelation: "personel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_join_requests_personel_id_fkey"
            columns: ["personel_id"]
            isOneToOne: false
            referencedRelation: "personel_performans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      personel_performans: {
        Row: {
          ad_soyad: string | null
          ciro_yuzdesi: number | null
          id: number | null
          islem_sayisi: number | null
          ortalama_puan: number | null
          toplam_ciro: number | null
          toplam_odenen: number | null
        }
        Relationships: []
      }
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
      get_appointments_by_dukkan: {
        Args: { p_dukkan_id: number }
        Returns: {
          created_at: string
          customer_id: string | null
          dukkan_id: number | null
          durum: string
          id: number
          islemler: Json
          musteri_id: number | null
          notlar: string | null
          personel_id: number | null
          saat: string
          tarih: string
        }[]
      }
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_customer_appointments: {
        Args: { p_customer_id: string }
        Returns: {
          created_at: string
          customer_id: string | null
          dukkan_id: number | null
          durum: string
          id: number
          islemler: Json
          musteri_id: number | null
          notlar: string | null
          personel_id: number | null
          saat: string
          tarih: string
        }[]
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
