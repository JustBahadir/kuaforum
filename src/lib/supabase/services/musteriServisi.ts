
import { supabase } from '../client';

// Define CustomerData interface for type safety
interface CustomerData {
  first_name: string;
  last_name: string | null;
  phone: string | null;
  birthdate: string | null;
  dukkan_id: number | null;
  email?: string | null;
  address?: string | null;
  gender?: string | null;
  notes?: string | null;
}

export const musteriServisi = {
  // Get current user's dukkan ID - renamed to be consistent with randevuServisi
  getCurrentUserDukkanId: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');
      
      // Check if user is admin
      const role = user.user_metadata?.role;
      
      if (role === 'admin') {
        // Admin user - get dukkan by user_id
        const { data, error } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.id;
      } else if (role === 'staff') {
        // Staff user - get dukkan through personeller
        const { data, error } = await supabase
          .from('personeller')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.dukkan_id;
      }
      
      return null;
    } catch (error) {
      console.error('Dükkan ID getirme hatası:', error);
      return null;
    }
  },

  hepsiniGetir: async (searchText?: string) => {
    try {
      const dukkanId = await musteriServisi.getCurrentUserDukkanId();

      if (!dukkanId) {
        throw new Error("Dükkan bilgisine erişilemedi");
      }

      let query = supabase
        .from('musteriler')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('first_name');
        
      if (searchText) {
        query = query.or(`first_name.ilike.%${searchText}%,last_name.ilike.%${searchText}%,phone.ilike.%${searchText}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri listesi getirme hatası:', error);
      throw error;
    }
  },

  getir: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Müşteri getirme hatası:', error);
      throw error;
    }
  },
  
  // Method renamed to getirById for compatibility
  getirById: async (id: number) => {
    return musteriServisi.getir(id);
  },

  ekle: async (customer: CustomerData) => {
    try {
      // If dukkan_id is not provided, get the current user's dukkan_id
      if (!customer.dukkan_id) {
        customer.dukkan_id = await musteriServisi.getCurrentUserDukkanId();
        
        if (!customer.dukkan_id) {
          throw new Error("Dükkan bilgisine erişilemedi");
        }
      }

      const { data, error } = await supabase
        .from('musteriler')
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      throw error;
    }
  },

  guncelle: async (id: number, customer: Partial<CustomerData>) => {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .update(customer)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      throw error;
    }
  },

  sil: async (id: number) => {
    try {
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      throw error;
    }
  },

  ara: async (searchText: string) => {
    try {
      const dukkanId = await musteriServisi.getCurrentUserDukkanId();
      
      if (!dukkanId) {
        throw new Error("Dükkan bilgisine erişilemedi");
      }

      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .or(`first_name.ilike.%${searchText}%,last_name.ilike.%${searchText}%,phone.ilike.%${searchText}%`)
        .order('first_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri arama hatası:', error);
      throw error;
    }
  }
};
