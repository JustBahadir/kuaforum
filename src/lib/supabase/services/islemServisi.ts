
import { supabase } from '../client';

export const islemServisi = {
  // Get the current user's dukkan_id
  getCurrentDukkanId: async () => {
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
      throw error;
    }
  },

  // Get all operations
  hepsiniGetir: async (dukkanId?: number) => {
    try {
      const shopId = dukkanId || await islemServisi.getCurrentDukkanId();
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          musteri:musteri_id (*)
        `)
        .eq('dukkan_id', shopId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlem listesi getirme hatası:', error);
      throw error;
    }
  },

  // Get operations by personnel ID
  personelIslemleriniGetir: async (personelId: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      throw error;
    }
  },

  // Alias for compatibility
  personelIslemleriGetir: async (personelId: number) => {
    return islemServisi.personelIslemleriniGetir(personelId);
  },

  // Get operations by customer ID
  musteriIslemleriniGetir: async (musteriId: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          islem:islem_id (*)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri işlemleri getirme hatası:', error);
      throw error;
    }
  },

  // Alias for compatibility
  getirByMusteriId: async (musteriId: number) => {
    return islemServisi.musteriIslemleriniGetir(musteriId);
  },

  // Add a new operation
  islemEkle: async (islemVerileri: any) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islemVerileri])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },

  // Delete an operation
  islemSil: async (islemId: number) => {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', islemId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      throw error;
    }
  }
};

export const personelIslemServisi = islemServisi;
