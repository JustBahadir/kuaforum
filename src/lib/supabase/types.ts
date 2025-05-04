
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hizmetler: {
        Row: {
          created_at: string
          fiyat: number
          hizmet_adi: string
          isletme_kimlik: string
          kategori_kimlik: string
          kimlik: string
          siralama: number
          sure_dakika: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          fiyat?: number
          hizmet_adi: string
          isletme_kimlik: string
          kategori_kimlik: string
          kimlik?: string
          siralama?: number
          sure_dakika?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          fiyat?: number
          hizmet_adi?: string
          isletme_kimlik?: string
          kategori_kimlik?: string
          kimlik?: string
          siralama?: number
          sure_dakika?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hizmetler_isletme_kimlik_fkey"
            columns: ["isletme_kimlik"]
            isOneToOne: false
            referencedRelation: "isletmeler"
            referencedColumns: ["kimlik"]
          },
          {
            foreignKeyName: "hizmetler_kategori_kimlik_fkey"
            columns: ["kategori_kimlik"]
            isOneToOne: false
            referencedRelation: "islem_kategorileri"
            referencedColumns: ["kimlik"]
          }
        ]
      },
      islem_kategorileri: {
        Row: {
          aciklama: string | null
          baslik: string
          created_at: string
          isletme_kimlik: string
          kimlik: string
          siralama: number
          updated_at: string
        }
        Insert: {
          aciklama?: string | null
          baslik: string
          created_at?: string
          isletme_kimlik: string
          kimlik?: string
          siralama?: number
          updated_at?: string
        }
        Update: {
          aciklama?: string | null
          baslik?: string
          created_at?: string
          isletme_kimlik?: string
          kimlik?: string
          siralama?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "islem_kategorileri_isletme_kimlik_fkey"
            columns: ["isletme_kimlik"]
            isOneToOne: false
            referencedRelation: "isletmeler"
            referencedColumns: ["kimlik"]
          }
        ]
      },
      isletmeler: {
        Row: {
          aciklama: string | null
          adres: string | null
          created_at: string
          isletme_adi: string
          isletme_kodu: string
          kimlik: string
          sahip_kimlik: string | null
          telefon: string | null
          updated_at: string
        }
        Insert: {
          aciklama?: string | null
          adres?: string | null
          created_at?: string
          isletme_adi: string
          isletme_kodu: string
          kimlik?: string
          sahip_kimlik?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          aciklama?: string | null
          adres?: string | null
          created_at?: string
          isletme_adi?: string
          isletme_kodu?: string
          kimlik?: string
          sahip_kimlik?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "isletmeler_sahip_kimlik_fkey"
            columns: ["sahip_kimlik"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["kimlik"]
          }
        ]
      },
      kullanicilar: {
        Row: {
          ad: string | null
          created_at: string
          eposta: string
          kimlik: string
          profil_tamamlandi: boolean | null
          rol: Database["public"]["Enums"]["kullanici_rol"] | null
          soyad: string | null
          telefon: string | null
          updated_at: string
        }
        Insert: {
          ad?: string | null
          created_at?: string
          eposta: string
          kimlik: string
          profil_tamamlandi?: boolean | null
          rol?: Database["public"]["Enums"]["kullanici_rol"] | null
          soyad?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          ad?: string | null
          created_at?: string
          eposta?: string
          kimlik?: string
          profil_tamamlandi?: boolean | null
          rol?: Database["public"]["Enums"]["kullanici_rol"] | null
          soyad?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kullanicilar_kimlik_fkey"
            columns: ["kimlik"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      musteriler: {
        Row: {
          ad: string
          created_at: string
          dogum_tarihi: string | null
          isletme_kimlik: string
          kimlik: string
          soyad: string | null
          telefon: string | null
          updated_at: string
        }
        Insert: {
          ad: string
          created_at?: string
          dogum_tarihi?: string | null
          isletme_kimlik: string
          kimlik?: string
          soyad?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          ad?: string
          created_at?: string
          dogum_tarihi?: string | null
          isletme_kimlik?: string
          kimlik?: string
          soyad?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "musteriler_isletme_kimlik_fkey"
            columns: ["isletme_kimlik"]
            isOneToOne: false
            referencedRelation: "isletmeler"
            referencedColumns: ["kimlik"]
          }
        ]
      },
      personel: {
        Row: {
          created_at: string
          deneyim: string | null
          durum: Database["public"]["Enums"]["personel_durum"] | null
          isletme_kimlik: string | null
          kimlik: string
          kullanici_kimlik: string | null
          okul_gecmisi: string | null
          updated_at: string
          uzmanlik_alani: string | null
        }
        Insert: {
          created_at?: string
          deneyim?: string | null
          durum?: Database["public"]["Enums"]["personel_durum"] | null
          isletme_kimlik?: string | null
          kimlik?: string
          kullanici_kimlik?: string | null
          okul_gecmisi?: string | null
          updated_at?: string
          uzmanlik_alani?: string | null
        }
        Update: {
          created_at?: string
          deneyim?: string | null
          durum?: Database["public"]["Enums"]["personel_durum"] | null
          isletme_kimlik?: string | null
          kimlik?: string
          kullanici_kimlik?: string | null
          okul_gecmisi?: string | null
          updated_at?: string
          uzmanlik_alani?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personel_isletme_kimlik_fkey"
            columns: ["isletme_kimlik"]
            isOneToOne: false
            referencedRelation: "isletmeler"
            referencedColumns: ["kimlik"]
          },
          {
            foreignKeyName: "personel_kullanici_kimlik_fkey"
            columns: ["kullanici_kimlik"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["kimlik"]
          }
        ]
      },
      personel_basvurulari: {
        Row: {
          aciklama: string | null
          durum: Database["public"]["Enums"]["basvuru_durum"] | null
          isletme_kodu: string
          kimlik: string
          kullanici_kimlik: string
          tarih: string
        }
        Insert: {
          aciklama?: string | null
          durum?: Database["public"]["Enums"]["basvuru_durum"] | null
          isletme_kodu: string
          kimlik?: string
          kullanici_kimlik: string
          tarih?: string
        }
        Update: {
          aciklama?: string | null
          durum?: Database["public"]["Enums"]["basvuru_durum"] | null
          isletme_kodu?: string
          kimlik?: string
          kullanici_kimlik?: string
          tarih?: string
        }
        Relationships: [
          {
            foreignKeyName: "personel_basvurulari_kullanici_kimlik_fkey"
            columns: ["kullanici_kimlik"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["kimlik"]
          }
        ]
      },
      randevular: {
        Row: {
          created_at: string
          durum: Database["public"]["Enums"]["randevu_durum"] | null
          hizmet_kimlik: string | null
          isletme_kimlik: string
          kategori_kimlik: string | null
          kimlik: string
          musteri_kimlik: string | null
          notlar: string | null
          personel_kimlik: string | null
          saat: string
          tarih: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          durum?: Database["public"]["Enums"]["randevu_durum"] | null
          hizmet_kimlik?: string | null
          isletme_kimlik: string
          kategori_kimlik?: string | null
          kimlik?: string
          musteri_kimlik?: string | null
          notlar?: string | null
          personel_kimlik?: string | null
          saat: string
          tarih: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          durum?: Database["public"]["Enums"]["randevu_durum"] | null
          hizmet_kimlik?: string | null
          isletme_kimlik?: string
          kategori_kimlik?: string | null
          kimlik?: string
          musteri_kimlik?: string | null
          notlar?: string | null
          personel_kimlik?: string | null
          saat?: string
          tarih?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "randevular_hizmet_kimlik_fkey"
            columns: ["hizmet_kimlik"]
            isOneToOne: false
            referencedRelation: "hizmetler"
            referencedColumns: ["kimlik"]
          },
          {
            foreignKeyName: "randevular_isletme_kimlik_fkey"
            columns: ["isletme_kimlik"]
            isOneToOne: false
            referencedRelation: "isletmeler"
            referencedColumns: ["kimlik"]
          },
          {
            foreignKeyName: "randevular_kategori_kimlik_fkey"
            columns: ["kategori_kimlik"]
            isOneToOne: false
            referencedRelation: "islem_kategorileri"
            referencedColumns: ["kimlik"]
          },
          {
            foreignKeyName: "randevular_musteri_kimlik_fkey"
            columns: ["musteri_kimlik"]
            isOneToOne: false
            referencedRelation: "musteriler"
            referencedColumns: ["kimlik"]
          },
          {
            foreignKeyName: "randevular_personel_kimlik_fkey"
            columns: ["personel_kimlik"]
            isOneToOne: false
            referencedRelation: "personel"
            referencedColumns: ["kimlik"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_isletme_kodu: {
        Args: {
          isletme_adi: string
          ulke_kodu: string
          sehir_kodu: string
          sube_no: number
        }
        Returns: string
      }
      has_role: {
        Args: {
          user_kimlik: string
          role_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      basvuru_durum: "beklemede" | "kabul" | "reddedildi"
      kullanici_rol: "isletme_sahibi" | "personel"
      personel_durum: "atanmadi" | "beklemede" | "onaylandi"
      randevu_durum: "planlandi" | "iptal" | "tamamlandi"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Custom types for our new schema
export type Kullanici = Tables<'kullanicilar'>
export type Isletme = Tables<'isletmeler'>
export type Personel = Tables<'personel'>
export type Musteri = Tables<'musteriler'>
export type IslemKategorisi = Tables<'islem_kategorileri'>
export type Hizmet = Tables<'hizmetler'>
export type Randevu = Tables<'randevular'>
export type PersonelBasvurusu = Tables<'personel_basvurulari'>

export type KullaniciRol = Enums<'kullanici_rol'>
export type PersonelDurum = Enums<'personel_durum'>
export type RandevuDurum = Enums<'randevu_durum'>
export type BasvuruDurum = Enums<'basvuru_durum'>
