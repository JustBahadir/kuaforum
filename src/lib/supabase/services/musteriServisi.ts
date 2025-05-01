
import { supabase } from '../client';

export interface CustomerData {
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  dukkan_id?: number | null;
}

export const musteriServisi = {
  async _getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Try to get dukkan_id from user metadata first
      const dukkanIdFromMeta = user?.user_metadata?.dukkan_id;
      if (dukkanIdFromMeta) return dukkanIdFromMeta;
      
      // Check if user is a shop owner
      const { data: shopData } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (shopData?.id) return shopData.id;
      
      // Check if user is staff
      const { data: personelData } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelData?.dukkan_id) return personelData.dukkan_id;
      
      // Check profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      return profileData?.dukkan_id || null;
    } catch (error) {
      console.error("Error getting dukkan_id:", error);
      return null;
    }
  },
  
  async hepsiniGetir(searchText?: string) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.warn("Kullanıcının dükkan bilgisi bulunamadı");
        return [];
      }
      
      let query = supabase
        .from('musteriler')
        .select('*')
        .eq('dukkan_id', dukkanId);
      
      if (searchText) {
        query = query.or(`first_name.ilike.%${searchText}%,last_name.ilike.%${searchText}%,phone.ilike.%${searchText}%`);
      }
      
      const { data, error } = await query.order('first_name', { ascending: true });
      
      if (error) {
        console.error("Müşteri listesi getirme hatası:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Müşterileri getirme sırasında hata:", error);
      return [];
    }
  },
  
  async getir(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Verify this customer belongs to the current user's shop
      if (dukkanId && data.dukkan_id !== dukkanId) {
        console.warn("Requested customer does not belong to user's dukkan");
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Müşteri getirme hatası:", error);
      return null;
    }
  },
  
  async ekle(customer: CustomerData) {
    try {
      // If dukkan_id is not provided, get the current user's dukkan_id
      if (!customer.dukkan_id) {
        const dukkanId = await this._getCurrentUserDukkanId();
        if (!dukkanId) {
          throw new Error("Kullanıcının dükkan bilgisi bulunamadı");
        }
        customer.dukkan_id = dukkanId;
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .insert(customer)
        .select();
      
      if (error) {
        console.error("Müşteri ekleme hatası:", error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error("Müşteri ekleme sırasında hata:", error);
      throw error;
    }
  },
  
  async guncelle(id: number, customer: Partial<CustomerData>) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      
      // First check if customer belongs to this shop
      if (dukkanId) {
        const { data: existingCustomer } = await supabase
          .from('musteriler')
          .select('dukkan_id')
          .eq('id', id)
          .single();
        
        if (existingCustomer && existingCustomer.dukkan_id !== dukkanId) {
          throw new Error("Bu müşteriyi güncelleme yetkiniz yok");
        }
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .update(customer)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Müşteri güncelleme hatası:", error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      
      // First check if customer belongs to this shop
      if (dukkanId) {
        const { data: existingCustomer } = await supabase
          .from('musteriler')
          .select('dukkan_id')
          .eq('id', id)
          .single();
        
        if (existingCustomer && existingCustomer.dukkan_id !== dukkanId) {
          throw new Error("Bu müşteriyi silme yetkiniz yok");
        }
      }
      
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Müşteri silme hatası:", error);
      throw error;
    }
  },
  
  // Add a method to search customers
  async ara(searchText: string) {
    return this.hepsiniGetir(searchText);
  }
};
