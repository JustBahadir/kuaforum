
import { supabase } from '../client';
import { toast } from 'sonner';
import { KategoriDto } from '../types';

export const kategoriServisi = {
  async getCurrentUserDukkanId() {
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
        if (!data?.id) throw new Error('İşletme bilgisi bulunamadı');
        return data?.id;
      } else if (role === 'staff') {
        // Staff user - get dukkan through personeller
        const { data, error } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (error) throw error;
        if (!data?.dukkan_id) throw new Error('İşletme bilgisi bulunamadı');
        return data?.dukkan_id;
      }
      
      // Try to get from profiles as last resort
      const { data, error } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      if (!data?.dukkan_id) throw new Error('İşletme bilgisi bulunamadı');
      return data?.dukkan_id;
    } catch (error: any) {
      console.error('Dükkan ID getirme hatası:', error);
      throw error;
    }
  },
  
  async hepsiniGetir(dukkanId?: number) {
    try {
      // If dukkanId is not provided, get it from the current user
      const shopId = dukkanId || await this.getCurrentUserDukkanId();
      
      if (!shopId) {
        throw new Error('İşletme bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('sira');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori listesi getirme hatası:', error);
      throw error;
    }
  },

  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori getirme hatası:', error);
      throw error;
    }
  },

  async ekle(kategori: {kategori_adi: string, sira: number, dukkan_id?: number}): Promise<KategoriDto> {
    try {
      if (!kategori.dukkan_id) {
        // Get the current user's dukkan_id if not provided
        kategori.dukkan_id = await this.getCurrentUserDukkanId();
      }
      
      if (!kategori.dukkan_id) {
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      // Manually insert using the RPC endpoint which accepts dukkan_id
      const { data, error } = await supabase.rpc('add_kategori', {
        p_kategori_adi: kategori.kategori_adi,
        p_sira: kategori.sira,
        p_dukkan_id: kategori.dukkan_id
      });

      if (error) {
        console.error('Kategori ekle error details:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      throw error;
    }
  },

  async guncelle(id: number, updates: Partial<{kategori_adi: string, sira: number}>) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      throw error;
    }
  },

  async sirayiGuncelle(items: {id: number, sira: number}[]) {
    try {
      for (const item of items) {
        const { error } = await supabase
          .from('islem_kategorileri')
          .update({ sira: item.sira })
          .eq('id', item.id);

        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Sıra güncelleme hatası:', error);
      throw error;
    }
  }
};

export const kategorilerServisi = kategoriServisi;
