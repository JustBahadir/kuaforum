
import { supabase } from '../client';
import { dukkanServisi } from './dukkanServisi';

export const personelIslemleriServisi = {
  async getCurrentDukkanId() {
    try {
      // Get the current user's dukkan_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');
      
      try {
        // Try to get dukkan from profiles if this is an admin user
        const { data: profileData } = await supabase
          .from('profiles')
          .select('dukkan_id')
          .eq('id', user.id)
          .single();
          
        if (profileData?.dukkan_id) return profileData.dukkan_id;
      } catch (error) {
        console.error('Error getting dukkan_id from profiles:', error);
      }
      
      try {
        // Try to get dukkan from personel if this is a staff user
        const { data: personelData } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (personelData?.dukkan_id) return personelData.dukkan_id;
      } catch (error) {
        console.error('Error getting dukkan_id from personel:', error);
      }
      
      try {
        // Try to get dukkan from dukkanlar if this is a dukkan owner
        const { data: dukkanData } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('sahibi_id', user.id)
          .single();
          
        if (dukkanData?.id) return dukkanData.id;
      } catch (error) {
        console.error('Error getting dukkan_id from dukkanlar:', error);
      }
      
      throw new Error('İşletme bulunamadı');
    } catch (error) {
      console.error('Get current dukkan ID error:', error);
      return null;
    }
  },
  
  async hepsiniGetir(dukkanId?: number) {
    try {
      // If dukkanId is not provided, try to get it
      const shopId = dukkanId || await this.getCurrentDukkanId();
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          islem:islem_id (*),
          musteri:musteri_id (*)
        `)
        .eq('dukkan_id', shopId)  // Filter by shop ID to ensure data isolation
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      throw error;
    }
  },
  
  async personelIslemleriniGetir(personelId: number) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islem_id (*),
          musteri:musteri_id (*)
        `)
        .eq('personel_id', personelId)
        .eq('dukkan_id', dukkanId)  // Ensure we only get operations from current shop
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemlerini getirme hatası:', error);
      throw error;
    }
  },
  
  async musteriIslemleriniGetir(musteriId: number) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          islem:islem_id (*)
        `)
        .eq('musteri_id', musteriId)
        .eq('dukkan_id', dukkanId)  // Ensure we only get operations from current shop
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri işlemlerini getirme hatası:', error);
      throw error;
    }
  },
  
  async islemEkle(islemVerileri: any) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      // Ensure the operation is associated with the current shop
      const islemVerileriWithShop = {
        ...islemVerileri,
        dukkan_id: dukkanId
      };
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islemVerileriWithShop])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },
  
  async islemSil(islemId: number) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      // Make sure we're only deleting operations from the current shop
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', islemId)
        .eq('dukkan_id', dukkanId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      throw error;
    }
  }
};
