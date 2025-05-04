
export type Database = {
  public: {
    Tables: {
      kullanicilar: {
        Row: {
          kimlik: string;
          ad: string | null;
          soyad: string | null;
          eposta: string;
          telefon: string | null;
          rol: 'isletme_sahibi' | 'personel';
          profil_tamamlandi: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          kimlik: string;
          ad?: string | null;
          soyad?: string | null;
          eposta: string;
          telefon?: string | null;
          rol?: 'isletme_sahibi' | 'personel';
          profil_tamamlandi?: boolean;
        };
        Update: {
          kimlik?: string;
          ad?: string | null;
          soyad?: string | null;
          eposta?: string;
          telefon?: string | null;
          rol?: 'isletme_sahibi' | 'personel';
          profil_tamamlandi?: boolean;
        };
      };
      isletmeler: {
        Row: {
          kimlik: string;
          isletme_adi: string;
          isletme_kodu: string;
          adres: string | null;
          telefon: string | null;
          sahip_kimlik: string | null;
          aciklama: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          kimlik?: string;
          isletme_adi: string;
          isletme_kodu: string;
          adres?: string | null;
          telefon?: string | null;
          sahip_kimlik?: string | null;
          aciklama?: string | null;
        };
        Update: {
          kimlik?: string;
          isletme_adi?: string;
          isletme_kodu?: string;
          adres?: string | null;
          telefon?: string | null;
          sahip_kimlik?: string | null;
          aciklama?: string | null;
        };
      };
      personel: {
        Row: {
          kimlik: string;
          kullanici_kimlik: string | null;
          isletme_kimlik: string | null;
          okul_gecmisi: string | null;
          deneyim: string | null;
          uzmanlik_alani: string | null;
          durum: 'atanmadi' | 'beklemede' | 'onaylandi';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          kimlik?: string;
          kullanici_kimlik?: string | null;
          isletme_kimlik?: string | null;
          okul_gecmisi?: string | null;
          deneyim?: string | null;
          uzmanlik_alani?: string | null;
          durum?: 'atanmadi' | 'beklemede' | 'onaylandi';
        };
        Update: {
          kimlik?: string;
          kullanici_kimlik?: string | null;
          isletme_kimlik?: string | null;
          okul_gecmisi?: string | null;
          deneyim?: string | null;
          uzmanlik_alani?: string | null;
          durum?: 'atanmadi' | 'beklemede' | 'onaylandi';
        };
      };
      islem_kategorileri: {
        Row: {
          kimlik: string;
          isletme_kimlik: string | null;
          baslik: string;
          aciklama: string | null;
          siralama: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          kimlik?: string;
          isletme_kimlik?: string | null;
          baslik: string;
          aciklama?: string | null;
          siralama?: number;
        };
        Update: {
          kimlik?: string;
          isletme_kimlik?: string | null;
          baslik?: string;
          aciklama?: string | null;
          siralama?: number;
        };
      };
      hizmetler: {
        Row: {
          kimlik: string;
          kategori_kimlik: string | null;
          isletme_kimlik: string | null;
          hizmet_adi: string;
          sure_dakika: number;
          fiyat: number;
          siralama: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          kimlik?: string;
          kategori_kimlik?: string | null;
          isletme_kimlik?: string | null;
          hizmet_adi: string;
          sure_dakika?: number;
          fiyat?: number;
          siralama?: number;
        };
        Update: {
          kimlik?: string;
          kategori_kimlik?: string | null;
          isletme_kimlik?: string | null;
          hizmet_adi?: string;
          sure_dakika?: number;
          fiyat?: number;
          siralama?: number;
        };
      };
      musteriler: {
        Row: {
          kimlik: string;
          isletme_kimlik: string | null;
          ad: string;
          soyad: string | null;
          telefon: string | null;
          dogum_tarihi: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          kimlik?: string;
          isletme_kimlik?: string | null;
          ad: string;
          soyad?: string | null;
          telefon?: string | null;
          dogum_tarihi?: string | null;
        };
        Update: {
          kimlik?: string;
          isletme_kimlik?: string | null;
          ad?: string;
          soyad?: string | null;
          telefon?: string | null;
          dogum_tarihi?: string | null;
        };
      };
      randevular: {
        Row: {
          kimlik: string;
          musteri_kimlik: string | null;
          isletme_kimlik: string | null;
          personel_kimlik: string | null;
          kategori_kimlik: string | null;
          hizmet_kimlik: string | null;
          tarih: string;
          saat: string;
          notlar: string | null;
          durum: 'planlandi' | 'iptal' | 'tamamlandi';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          kimlik?: string;
          musteri_kimlik?: string | null;
          isletme_kimlik?: string | null;
          personel_kimlik?: string | null;
          kategori_kimlik?: string | null;
          hizmet_kimlik?: string | null;
          tarih: string;
          saat: string;
          notlar?: string | null;
          durum?: 'planlandi' | 'iptal' | 'tamamlandi';
        };
        Update: {
          kimlik?: string;
          musteri_kimlik?: string | null;
          isletme_kimlik?: string | null;
          personel_kimlik?: string | null;
          kategori_kimlik?: string | null;
          hizmet_kimlik?: string | null;
          tarih?: string;
          saat?: string;
          notlar?: string | null;
          durum?: 'planlandi' | 'iptal' | 'tamamlandi';
        };
      };
      personel_basvurulari: {
        Row: {
          kimlik: string;
          kullanici_kimlik: string | null;
          isletme_kodu: string;
          durum: 'beklemede' | 'kabul' | 'reddedildi';
          aciklama: string | null;
          tarih: string;
        };
        Insert: {
          kimlik?: string;
          kullanici_kimlik?: string | null;
          isletme_kodu: string;
          durum?: 'beklemede' | 'kabul' | 'reddedildi';
          aciklama?: string | null;
          tarih?: string;
        };
        Update: {
          kimlik?: string;
          kullanici_kimlik?: string | null;
          isletme_kodu?: string;
          durum?: 'beklemede' | 'kabul' | 'reddedildi';
          aciklama?: string | null;
          tarih?: string;
        };
      };
    };
  };
};
