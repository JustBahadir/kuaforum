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
          gun: string
          id: number
          kapali: boolean | null
          kapanis: string | null
        }
        Insert: {
          acilis?: string | null
          gun: string
          id?: number
          kapali?: boolean | null
          kapanis?: string | null
        }
        Update: {
          acilis?: string | null
          gun?: string
          id?: number
          kapali?: boolean | null
          kapanis?: string | null
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
          ad_soyad: string
          adres: string
          created_at: string
          eposta: string
          id: number
          musteri_no: string
          telefon: string
        }
        Insert: {
          ad_soyad: string
          adres: string
          created_at?: string
          eposta: string
          id?: number
          musteri_no: string
          telefon: string
        }
        Update: {
          ad_soyad?: string
          adres?: string
          created_at?: string
          eposta?: string
          id?: number
          musteri_no?: string
          telefon?: string
        }
        Relationships: []
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
            foreignKeyName: "notifications_related_appointment_id_fkey"
            columns: ["related_appointment_id"]
            isOneToOne: false
            referencedRelation: "randevular"
            referencedColumns: ["id"]
          },
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
          eposta?: string
          id?: number
          maas?: number
          personel_no?: string
          prim_yuzdesi?: number
          telefon?: string
        }
        Relationships: []
      }
      personel_islemleri: {
        Row: {
          aciklama: string
          created_at: string
          id: number
          islem_id: number | null
          odenen: number
          personel_id: number | null
          prim_yuzdesi: number
          puan: number
          tutar: number
        }
        Insert: {
          aciklama: string
          created_at?: string
          id?: number
          islem_id?: number | null
          odenen?: number
          personel_id?: number | null
          prim_yuzdesi: number
          puan?: number
          tutar: number
        }
        Update: {
          aciklama?: string
          created_at?: string
          id?: number
          islem_id?: number | null
          odenen?: number
          personel_id?: number | null
          prim_yuzdesi?: number
          puan?: number
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
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      randevular: {
        Row: {
          admin_notes: string | null
          counter_proposal_date: string | null
          counter_proposal_time: string | null
          created_at: string
          customer_accepted: boolean | null
          customer_id: string | null
          durum: string
          id: number
          islemler: number[] | null
          musteri_id: number | null
          notlar: string | null
          personel_id: number | null
          saat: string
          tarih: string
        }
        Insert: {
          admin_notes?: string | null
          counter_proposal_date?: string | null
          counter_proposal_time?: string | null
          created_at?: string
          customer_accepted?: boolean | null
          customer_id?: string | null
          durum?: string
          id?: number
          islemler?: number[] | null
          musteri_id?: number | null
          notlar?: string | null
          personel_id?: number | null
          saat: string
          tarih: string
        }
        Update: {
          admin_notes?: string | null
          counter_proposal_date?: string | null
          counter_proposal_time?: string | null
          created_at?: string
          customer_accepted?: boolean | null
          customer_id?: string | null
          durum?: string
          id?: number
          islemler?: number[] | null
          musteri_id?: number | null
          notlar?: string | null
          personel_id?: number | null
          saat?: string
          tarih?: string
        }
        Relationships: [
          {
            foreignKeyName: "randevular_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      [_ in never]: never
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
