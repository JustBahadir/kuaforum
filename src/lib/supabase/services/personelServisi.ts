
import { supabase } from '../client';

export const personelServisi = {
  async getCurrentDukkanId() {
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
          .eq('sahibi_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.id;
      } else if (role === 'staff') {
        // Staff user - get dukkan through personeller
        const { data, error } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.dukkan_id;
      }
      
      // Try to get from profiles as last resort
      const { data, error } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data?.dukkan_id;
    } catch (error) {
      console.error('Dükkan ID getirme hatası:', error);
      return null;
    }
  },
  
  hepsiniGetir: async (dukkanId?: number) => {
    try {
      console.log("personelServisi.hepsiniGetir called with dukkanId:", dukkanId);
      
      let id = dukkanId;
      if (!id) {
        id = await personelServisi.getCurrentDukkanId();
        console.log("Fetched current dukkanId:", id);
      }
      
      if (!id) {
        console.error("No dukkan ID available");
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('dukkan_id', id);

      if (error) {
        console.error("Error fetching personel:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} personel`);
      return data || [];
    } catch (error) {
      console.error('Personel listesi getirme hatası:', error);
      throw error;
    }
  },

  getir: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel getirme hatası:', error);
      throw error;
    }
  },

  authIdIleGetir: async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Auth ID ile personel getirme hatası:', error);
      throw error;
    }
  },

  ekle: async (personelVerileri: any) => {
    try {
      console.log("Adding personel with data:", personelVerileri);
      
      // Make sure we have a dukkan_id
      if (!personelVerileri.dukkan_id) {
        const dukkanId = await personelServisi.getCurrentDukkanId();
        if (!dukkanId) {
          console.error("No dukkan ID available for adding personel");
          throw new Error('İşletme bilgisi bulunamadı');
        }
        personelVerileri.dukkan_id = dukkanId;
      }
      
      const { data, error } = await supabase
        .from('personel')
        .insert([personelVerileri])
        .select();

      if (error) {
        console.error("Error adding personel:", error);
        throw error;
      }
      
      console.log("Personel added:", data[0]);
      return data[0];
    } catch (error) {
      console.error('Personel ekleme hatası:', error);
      throw error;
    }
  },

  guncelle: async (id: number, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('personel')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel güncelleme hatası:', error);
      throw error;
    }
  },

  sil: async (id: number) => {
    try {
      const { error } = await supabase
        .from('personel')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Personel silme hatası:', error);
      throw error;
    }
  }
};
