
import { supabase } from '../client';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
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
  
  dukkanSaatleriGetir: async (dukkanId?: number) => {
    let id = dukkanId;
    
    try {
      if (!id) {
        id = await calismaSaatleriServisi.getCurrentDukkanId();
        console.log("Auto-resolved dukkanId:", id);
      }
      
      if (!id) {
        console.error("No dukkan ID available for fetching hours");
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', id);
      
      if (error) {
        console.error("Error fetching working hours:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri getirme hatası:', error);
      throw error;
    }
  },
  
  dukkanSaatleriKaydet: async (saatler: Partial<CalismaSaati>[]) => {
    try {
      // First, check if all entries have dukkan_id
      const dukkanId = saatler[0]?.dukkan_id;
      
      if (!dukkanId) {
        throw new Error('Dükkan ID eksik');
      }
      
      // Delete existing hours for the dukkan
      const { error: deleteError } = await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('dukkan_id', dukkanId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert the new hours
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(saatler)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri kaydetme hatası:', error);
      throw error;
    }
  },
  
  // For backward compatibility
  hepsiniGetir: async (dukkanId?: number) => {
    return calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
  },
  
  guncelle: async (saatler: Partial<CalismaSaati>[]) => {
    return calismaSaatleriServisi.dukkanSaatleriKaydet(saatler);
  }
};
