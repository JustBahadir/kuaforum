
import { supabase } from "../client";
import { Dukkan } from "../types";

/**
 * Tüm dükkanları getirir
 */
async function hepsiniGetir(): Promise<Dukkan[]> {
  const { data, error } = await supabase
    .from('dukkanlar')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Dükkanları getirme hatası:", error);
    throw error;
  }

  return data || [];
}

/**
 * Belirli bir dükkanı getirir
 */
async function getir(id: number): Promise<Dukkan | null> {
  const { data, error } = await supabase
    .from('dukkanlar')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Dükkan getirme hatası:", error);
    throw error;
  }

  return data;
}

/**
 * Dükkanı kod ile getir
 */
async function getirByKod(kod: string): Promise<Dukkan | null> {
  const { data, error } = await supabase
    .from('dukkanlar')
    .select('*')
    .eq('kod', kod)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
    console.error("Dükkan kod ile getirme hatası:", error);
    throw error;
  }

  return data || null;
}

/**
 * Kullanıcı ID'sine göre dükkanı getirir (dükkan sahibi)
 */
async function kullanicininDukkani(userId: string): Promise<Dukkan | null> {
  const { data, error } = await supabase
    .from('dukkanlar')
    .select('*')
    .eq('sahibi_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
    console.error("Kullanıcının dükkanını getirme hatası:", error);
    throw error;
  }

  return data || null;
}

/**
 * Personel ID'sine göre dükkanı getirir
 */
async function personelDukkani(personelId: number): Promise<Dukkan | null> {
  const { data: personel, error: personelError } = await supabase
    .from('personel')
    .select('dukkan_id')
    .eq('id', personelId)
    .single();

  if (personelError) {
    console.error("Personel dükkan ID getirme hatası:", personelError);
    throw personelError;
  }

  if (!personel.dukkan_id) {
    return null;
  }

  return await getir(personel.dukkan_id);
}

/**
 * Personelin auth_id'sine göre dükkanı getirir
 */
async function personelAuthIdDukkani(authId: string): Promise<Dukkan | null> {
  const { data: personel, error: personelError } = await supabase
    .from('personel')
    .select('dukkan_id')
    .eq('auth_id', authId)
    .single();

  if (personelError) {
    console.error("Personel dükkan ID getirme hatası:", personelError);
    return null;
  }

  if (!personel?.dukkan_id) {
    return null;
  }

  return await getir(personel.dukkan_id);
}

/**
 * Yeni dükkan ekler
 */
async function ekle(dukkan: Omit<Dukkan, 'id' | 'created_at'>): Promise<Dukkan> {
  const { data, error } = await supabase
    .from('dukkanlar')
    .insert([dukkan])
    .select()
    .single();

  if (error) {
    console.error("Dükkan ekleme hatası:", error);
    throw error;
  }

  return data;
}

/**
 * Dükkan bilgilerini günceller
 */
async function guncelle(id: number, dukkan: Partial<Dukkan>): Promise<Dukkan> {
  const { data, error } = await supabase
    .from('dukkanlar')
    .update(dukkan)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Dükkan güncelleme hatası:", error);
    throw error;
  }

  return data;
}

/**
 * Dükkan siler
 */
async function sil(id: number): Promise<void> {
  const { error } = await supabase
    .from('dukkanlar')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Dükkan silme hatası:", error);
    throw error;
  }
}

// Dışa aktarılan servis fonksiyonları
export const dukkanServisi = {
  hepsiniGetir,
  getir,
  getirByKod,
  kullanicininDukkani,
  personelDukkani,
  personelAuthIdDukkani,
  ekle,
  guncelle,
  sil
};
