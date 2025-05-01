
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
    try {
      let id = dukkanId;
      if (!id) {
        id = await calismaSaatleriServisi.getCurrentDukkanId();
      }
      
      if (!id) {
        throw new Error('İşletme bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', id)
        .order('gun_sira');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri getirme hatası:', error);
      throw error;
    }
  },

  dukkanSaatleriKaydet: async (saatler: Partial<CalismaSaati>[]) => {
    try {
      // Make sure we have a dukkan_id
      if (!saatler[0].dukkan_id) {
        const dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
        if (!dukkanId) {
          throw new Error('İşletme bilgisi bulunamadı');
        }
        
        // Add dukkan_id to each item
        saatler = saatler.map(saat => ({
          ...saat,
          dukkan_id: dukkanId
        }));
      }

      // First delete existing hours
      const { error: deleteError } = await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('dukkan_id', saatler[0].dukkan_id);

      if (deleteError) throw deleteError;

      // Then insert new hours
      const { data, error: insertError } = await supabase
        .from('calisma_saatleri')
        .insert(saatler)
        .select();

      if (insertError) throw insertError;
      return data;
    } catch (error) {
      console.error('Çalışma saatleri kaydetme hatası:', error);
      throw error;
    }
  }
};
