
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkbjjcizncwkrouvoujw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tip tanımlamaları
export type Islem = {
  id: number;
  created_at?: string;
  islem_adi: string;
  fiyat: number;
  puan: number;
  kategori_id?: number;
  sira?: number;
}

export type Kategori = {
  id: number;
  created_at?: string;
  kategori_adi: string;
  sira?: number;
}

export type Musteri = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at?: string;
  total_appointments?: number;
  total_services?: number;
}

export type Personel = {
  id: number;
  created_at?: string;
  personel_no: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  maas: number;
  calisma_sistemi: "haftalik" | "aylik";
  prim_yuzdesi: number;
}

export type PersonelIslemi = {
  id: number;
  created_at?: string;
  personel_id: number;
  islem_id: number;
  musteri_id?: string;
  aciklama: string;
  tutar: number;
  prim_yuzdesi: number;
  odenen: number;
  puan: number;
  islem?: Islem;
  musteri?: Musteri;
}

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at?: string;
}

export type Notification = {
  id: number;
  created_at?: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  related_appointment_id?: number;
}

// Randevu durumları
export type RandevuDurumu = "beklemede" | "onaylandi" | "iptal_edildi" | "tamamlandi";

// Randevu tipi
export type Randevu = {
  id: number;
  created_at?: string;
  customer_id: string;
  personel_id?: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  admin_notes?: string;
  counter_proposal_date?: string;
  counter_proposal_time?: string;
  customer_accepted?: boolean;
  musteri?: Profile;
  personel?: Personel;
  islemler: number[];
}

// Kategori servisi
export const kategoriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .order('sira');

    if (error) throw error;
    return data || [];
  },

  async ekle(kategori: { kategori_adi: string }) {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .insert([{
        kategori_adi: kategori.kategori_adi,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, kategori: { kategori_adi: string }) {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .update({
        kategori_adi: kategori.kategori_adi,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('islem_kategorileri')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async siraGuncelle(kategoriler: Kategori[]) {
    const updates = kategoriler.map((kategori, index) => ({
      id: kategori.id,
      sira: index
    }));
    
    const { error } = await supabase
      .from('islem_kategorileri')
      .upsert(updates);
      
    if (error) throw error;
  }
};

// İşlemler servisi
export const islemServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islemler')
      .select('*')
      .order('sira');

    if (error) throw error;
    return data || [];
  },

  async ekle(islem: { islem_adi: string; fiyat: number; puan: number; kategori_id: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .insert([{
        islem_adi: islem.islem_adi.toUpperCase(),
        fiyat: islem.fiyat,
        puan: islem.puan,
        kategori_id: islem.kategori_id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, islem: { islem_adi: string; fiyat: number; puan: number; kategori_id: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .update({
        islem_adi: islem.islem_adi.toUpperCase(),
        fiyat: islem.fiyat,
        puan: islem.puan,
        kategori_id: islem.kategori_id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('islemler')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async siraGuncelle(islemler: Islem[]) {
    const updates = islemler.map((islem, index) => ({
      id: islem.id,
      sira: index
    }));
    
    const { error } = await supabase
      .from('islemler')
      .upsert(updates);
      
    if (error) throw error;
  }
};

// Müşteri servisi
export const musteriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        created_at
      `);

    if (error) throw error;
    return data || [];
  },

  async istatistiklerGetir() {
    // İlk olarak tüm müşterileri alalım
    const { data: musteriler, error: musteriError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        created_at
      `);

    if (musteriError) throw musteriError;

    // Tüm randevuları alalım
    const { data: randevular, error: randevuError } = await supabase
      .from('randevular')
      .select('*');

    if (randevuError) throw randevuError;

    // Tüm personel işlemlerini alalım
    const { data: islemler, error: islemError } = await supabase
      .from('personel_islemleri')
      .select('*');

    if (islemError) throw islemError;

    // Her müşteri için istatistikleri hesaplayalım
    const sonuclar = musteriler?.map(musteri => {
      const musteriRandevulari = randevular?.filter(r => r.customer_id === musteri.id) || [];
      const musteriIslemleri = islemler?.filter(i => i.musteri_id === musteri.id) || [];
      
      return {
        ...musteri,
        total_appointments: musteriRandevulari.length,
        total_services: musteriIslemleri.length
      };
    }) || [];

    return sonuclar;
  },

  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        created_at
      `)
      .or(`first_name.ilike.%${aramaMetni}%,last_name.ilike.%${aramaMetni}%,phone.ilike.%${aramaMetni}%`);

    if (error) throw error;
    return data || [];
  },

  async ekle(musteri: Omit<Musteri, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([musteri])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: string, musteri: Partial<Musteri>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(musteri)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Personel servisi
export const personelServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .order('ad_soyad');

    if (error) throw error;
    return data || [];
  },

  async ekle(personel: Omit<Personel, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('personel')
      .insert([personel])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, personel: Partial<Personel>) {
    const { data, error } = await supabase
      .from('personel')
      .update(personel)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error: islemSilmeHatasi } = await supabase
      .from('personel_islemleri')
      .delete()
      .eq('personel_id', id);

    if (islemSilmeHatasi) throw islemSilmeHatasi;

    const { error } = await supabase
      .from('personel')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Personel İşlemleri servisi
export const personelIslemleriServisi = {
  async hepsiniGetir(personelId?: number) {
    const query = supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        musteri:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (personelId) {
      query.eq('personel_id', personelId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async ekle(islem: Omit<PersonelIslemi, 'id' | 'created_at' | 'islem' | 'musteri'>) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .insert([islem])
      .select(`
        *,
        islem:islemler(*),
        musteri:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, islem: Partial<PersonelIslemi>) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .update(islem)
      .eq('id', id)
      .select(`
        *,
        islem:islemler(*),
        musteri:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('personel_islemleri')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Profil servisi
export const profilServisi = {
  async getir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(profile: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı girişi yapılmamış');

    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Bildirim servisi
export const bildirimServisi = {
  async hepsiniGetir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async okunduIsaretle(id: number) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  }
};

// Randevu servisini güncelle
export const randevuServisi = {
  async hepsiniGetir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('randevular')
      .select(`
        *,
        musteri:profiles(*),
        personel:personel(*)
      `)
      .order('tarih', { ascending: true })
      .order('saat', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async kendiRandevulariniGetir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('randevular')
      .select(`
        *,
        musteri:profiles(*),
        personel:personel(*)
      `)
      .eq('customer_id', user.id)
      .order('tarih', { ascending: true })
      .order('saat', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async ekle(randevu: Omit<Randevu, 'id' | 'created_at' | 'musteri' | 'personel'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı girişi yapılmamış');

    const { data, error } = await supabase
      .from('randevular')
      .insert([{ ...randevu, customer_id: user.id }])
      .select(`
        *,
        musteri:profiles(*),
        personel:personel(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, randevu: Partial<Randevu>) {
    const { data, error } = await supabase
      .from('randevular')
      .update(randevu)
      .eq('id', id)
      .select(`
        *,
        musteri:profiles(*),
        personel:personel(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('randevular')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
