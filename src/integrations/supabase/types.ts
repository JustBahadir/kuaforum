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
          horoscope: string | null
          horoscope_description: string | null
          id: number
          updated_at: string
        }
        Insert: {
          anniversary_date?: string | null
          birth_date?: string | null
          children_names?: string[] | null
          created_at?: string
          custom_notes?: string | null
          customer_id?: string | null
          horoscope?: string | null
          horoscope_description?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          anniversary_date?: string | null
          birth_date?: string | null
          children_names?: string[] | null
          created_at?: string
          custom_notes?: string | null
          customer_id?: string | null
          horoscope?: string | null
          horoscope_description?: string | null
          id?: number
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
          telefon: string | null
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
          telefon?: string | null
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
          telefon?: string | null
        }
        Relationships: []
      }
      islem_kategorileri: {
        Row: {
          created_at: string
          id: number
          kategori_adi: string
          sira: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          kategori_adi: string
          sira?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          kategori_adi?: string
          sira?: number | null
        }
        Relationships: []
      }
      islemler: {
        Row: {
          created_at: string
          fiyat: number
          id: number
          islem_adi: string
          kategori_id: number | null
          puan: number
          sira: number | null
        }
        Insert: {
          created_at?: string
          fiyat: number
          id?: number
          islem_adi: string
          kategori_id?: number | null
          puan: number
          sira?: number | null
        }
        Update: {
          created_at?: string
          fiyat?: number
          id?: number
          islem_adi?: string
          kategori_id?: number | null
          puan?: number
          sira?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "islemler_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "islem_kategorileri"
            referencedColumns: ["id"]
          },
        ]
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
          calisma_sistemi: string
          created_at: string
          dukkan_id: number | null
          eposta: string
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
          calisma_sistemi: string
          created_at?: string
          dukkan_id?: number | null
          eposta: string
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
          calisma_sistemi?: string
          created_at?: string
          dukkan_id?: number | null
          eposta?: string
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
            foreignKeyName: "personel_islemleri_islem_id_fkey"
            columns: ["islem_id"]
            isOneToOne: false
            referencedRelation: "islemler"
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
          birthdate: string | null
          created_at: string
          dukkan_id: number | null
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          dukkan_id?: number | null
          first_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          dukkan_id?: number | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
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
      create_appointment:
        | {
            Args: {
              appointment_data: Json
            }
            Returns: Json
          }
        | {
            Args: {
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
      get_appointments_by_dukkan: {
        Args: {
          p_dukkan_id: number
        }
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
      get_customer_appointments: {
        Args: {
          p_customer_id: string
        }
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
        Args: {
          p_musteri_id: number
        }
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
      update_appointment_status: {
        Args: {
          appointment_id: number
          new_status: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
