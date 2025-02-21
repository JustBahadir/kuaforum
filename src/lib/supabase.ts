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
}

export type Musteri = {
  id: number;
  created_at?: string;
  musteri_no: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
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
  aciklama: string;
  tutar: number;
  prim_yuzdesi: number;
  odenen: number;
  puan: number;
  islem?: Islem;
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

// İşlemler servisi
export const islemServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islemler')
      .select('*')
      .order('islem_adi');

    if (error) throw error;
    return data || [];
  },

  async ekle(islem: { islem_adi: string; fiyat: number; puan: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .insert([{
        islem_adi: islem.islem_adi.toUpperCase(),
        fiyat: islem.fiyat,
        puan: islem.puan
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, islem: { islem_adi: string; fiyat: number; puan: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .update({
        islem_adi: islem.islem_adi.toUpperCase(),
        fiyat: islem.fiyat,
        puan: islem.puan
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
  }
};

// Müşteri servisi
export const musteriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('musteriler')
      .select('*')
      .order('ad_soyad');

    if (error) throw error;
    return data || [];
  },

  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('musteriler')
      .select('*')
      .ilike('ad_soyad', `%${aramaMetni}%`)
      .order('ad_soyad');

    if (error) throw error;
    return data || [];
  },

  async ekle(musteri: Omit<Musteri, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('musteriler')
      .insert([musteri])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, musteri: Partial<Musteri>) {
    const { data, error } = await supabase
      .from('musteriler')
      .update(musteri)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('musteriler')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
        islem:islemler(*)
      `)
      .order('created_at', { ascending: false });

    if (personelId) {
      query.eq('personel_id', personelId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async ekle(islem: Omit<PersonelIslemi, 'id' | 'created_at' | 'islem'>) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .insert([islem])
      .select(`
        *,
        islem:islemler(*)
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
        islem:islemler(*)
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
