
import { supabase, supabaseAdmin } from "../client";
import type { PersonelIslemi } from "../types";

export const personelIslemleriServisi = {
  async ekle(islem: Partial<PersonelIslemi>): Promise<PersonelIslemi> {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .insert(islem)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async hepsiniGetir(): Promise<PersonelIslemi[]> {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select(`
        *,
        personel:personel_id(id, ad_soyad),
        islem:islem_id(id, islem_adi, kategori:kategori_id(id, kategori_adi)),
        musteri:musteri_id(id, first_name, last_name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async personelIslemleriGetir(personelId: number): Promise<PersonelIslemi[]> {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select(`
        *,
        personel:personel_id(id, ad_soyad),
        islem:islem_id(id, islem_adi, kategori:kategori_id(id, kategori_adi)),
        musteri:musteri_id(id, first_name, last_name)
      `)
      .eq("personel_id", personelId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async personelIslemleriGetirById(personelId: number): Promise<PersonelIslemi[]> {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select(`
        *,
        personel:personel_id(id, ad_soyad),
        islem:islem_id(id, islem_adi, kategori:kategori_id(id, kategori_adi)),
        musteri:musteri_id(id, first_name, last_name)
      `)
      .eq("personel_id", personelId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getirById(id: number): Promise<PersonelIslemi | null> {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select(`
        *,
        personel:personel_id(id, ad_soyad),
        islem:islem_id(id, islem_adi),
        musteri:musteri_id(id, first_name, last_name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async guncelle(id: number, islem: Partial<PersonelIslemi>): Promise<PersonelIslemi> {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .update(islem)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number): Promise<void> {
    const { error } = await supabase
      .from("personel_islemleri")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Admin level operations for better data management
  async recoverOperationsFromAppointments(personnelId?: number): Promise<{count: number, operations: any[]}> {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/recover_customer_operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({ personnel_id: personnelId })
      });
      
      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error recovering operations:", error);
      throw error;
    }
  }
};
