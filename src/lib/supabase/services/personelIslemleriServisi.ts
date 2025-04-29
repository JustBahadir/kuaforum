import { supabase, supabaseAdmin } from "../client";
import type { PersonelIslemi } from "../types";

// Define the Supabase URLs and keys as constants for API calls
const SUPABASE_URL = "https://xkbjjcizncwkrouvoujw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw";

export const personelIslemleriServisi = {
  // Helper function to get the current user's dukkan_id
  async _getCurrentUserDukkanId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('dukkan_id')
      .eq('id', user.id)
      .maybeSingle();
    
    const { data: personelData } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('auth_id', user.id)
      .maybeSingle();
    
    return profileData?.dukkan_id || personelData?.dukkan_id;
  },
  
  async ekle(islem: Partial<PersonelIslemi>): Promise<PersonelIslemi> {
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      throw new Error("Kullanıcının işletme bilgisi bulunamadı");
    }
    
    // Make sure we're adding the operation to the correct business
    if (islem.personel_id) {
      const { data: personelData } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', islem.personel_id)
        .single();
      
      if (personelData?.dukkan_id !== dukkanId) {
        throw new Error("Bu personel sizin işletmenize ait değil");
      }
    }

    const { data, error } = await supabase
      .from("personel_islemleri")
      .insert(islem)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async hepsiniGetir(): Promise<PersonelIslemi[]> {
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      console.error("Kullanıcının işletme bilgisi bulunamadı");
      return [];
    }
    
    // Join with personel table to filter operations by dukkan_id
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select(`
        *,
        personel:personel_id(id, ad_soyad, dukkan_id),
        islem:islem_id(id, islem_adi, kategori:kategori_id(id, kategori_adi)),
        musteri:musteri_id(id, first_name, last_name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Filter the operations to only include those from our dukkan
    const filteredData = data.filter(item => 
      item.personel && item.personel.dukkan_id === dukkanId
    );
    
    return filteredData || [];
  },

  async personelIslemleriGetir(personelId: number): Promise<PersonelIslemi[]> {
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      console.error("Kullanıcının işletme bilgisi bulunamadı");
      return [];
    }
    
    // First verify that this personnel belongs to our business
    const { data: personelData } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('id', personelId)
      .single();
      
    if (personelData?.dukkan_id !== dukkanId) {
      console.error("Bu personel sizin işletmenize ait değil");
      return [];
    }

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
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      console.error("Kullanıcının işletme bilgisi bulunamadı");
      return [];
    }
    
    // First verify that this personnel belongs to our business
    const { data: personelData } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('id', personelId)
      .single();
      
    if (personelData?.dukkan_id !== dukkanId) {
      console.error("Bu personel sizin işletmenize ait değil");
      return [];
    }

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
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      console.error("Kullanıcının işletme bilgisi bulunamadı");
      return null;
    }

    const { data, error } = await supabase
      .from("personel_islemleri")
      .select(`
        *,
        personel:personel_id(id, ad_soyad, dukkan_id),
        islem:islem_id(id, islem_adi),
        musteri:musteri_id(id, first_name, last_name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    
    // Verify this operation belongs to our business
    if (data.personel?.dukkan_id !== dukkanId) {
      console.error("Bu işlem sizin işletmenize ait değil");
      return null;
    }
    
    return data;
  },

  async guncelle(id: number, islem: Partial<PersonelIslemi>): Promise<PersonelIslemi> {
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      throw new Error("Kullanıcının işletme bilgisi bulunamadı");
    }
    
    // First verify this operation belongs to our business
    const { data: operationData } = await supabase
      .from("personel_islemleri")
      .select(`
        personel:personel_id(id, dukkan_id)
      `)
      .eq("id", id)
      .single();
      
    if (operationData?.personel?.dukkan_id !== dukkanId) {
      throw new Error("Bu işlem sizin işletmenize ait değil");
    }

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
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      throw new Error("Kullanıcının işletme bilgisi bulunamadı");
    }
    
    // First verify this operation belongs to our business
    const { data: operationData } = await supabase
      .from("personel_islemleri")
      .select(`
        personel:personel_id(id, dukkan_id)
      `)
      .eq("id", id)
      .single();
      
    if (operationData?.personel?.dukkan_id !== dukkanId) {
      throw new Error("Bu işlem sizin işletmenize ait değil");
    }

    const { error } = await supabase
      .from("personel_islemleri")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Add the updateShopStatistics method
  async updateShopStatistics(): Promise<void> {
    try {
      // Call the Supabase function to update shop statistics
      const response = await fetch(`${SUPABASE_URL}/functions/v1/update_shop_statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update shop statistics: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating shop statistics:", error);
      throw error;
    }
  },

  // Admin level operations for better data management
  async recoverOperationsFromAppointments(personnelId?: number): Promise<{count: number, operations: any[]}> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/recover_customer_operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
