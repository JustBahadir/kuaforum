
import { supabase } from '../client';
import { authService } from '@/lib/auth/authService';

export const kategoriServisi = {
  async getCurrentDukkanId() {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .single();
      
      if (error) {
        console.error('Dükkan ID alma hatası:', error);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('dukkan_id')
          .eq('id', user.id)
          .single();
          
        return profileData?.dukkan_id;
      }
      
      return data?.id;
    } catch (error) {
      console.error('getCurrentDukkanId hatası:', error);
      return null;
    }
  },
  
  async hepsiniGetir(dukkanId?: number) {
    try {
      let shopId = dukkanId;
      
      if (!shopId) {
        shopId = await this.getCurrentDukkanId();
      }
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('sira', { ascending: true });
        
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
  
  async ekle(kategori: any) {
    try {
      if (!kategori.dukkan_id) {
        const dukkanId = await this.getCurrentDukkanId();
        
        if (!dukkanId) {
          // Try to get from profile if user is staff
          const user = await authService.getCurrentUser();
          
          if (user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('dukkan_id')
              .eq('id', user.id)
              .single();
              
            if (profileData?.dukkan_id) {
              kategori.dukkan_id = profileData.dukkan_id;
            }
          }
          
          if (!kategori.dukkan_id) {
            throw new Error('Dükkan bilgisi bulunamadı');
          }
        } else {
          kategori.dukkan_id = dukkanId;
        }
      }
      
      // Get the current max sira
      const { data: existingItems } = await supabase
        .from('islem_kategorileri')
        .select('sira')
        .eq('dukkan_id', kategori.dukkan_id)
        .order('sira', { ascending: false })
        .limit(1);
      
      const nextSira = existingItems && existingItems.length > 0 ? existingItems[0].sira + 1 : 0;
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([{ ...kategori, sira: nextSira }])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
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
  
  async sirayiGuncelle(items: any[]) {
    try {
      const updates = items.map(item => ({
        id: item.id,
        sira: item.sira
      }));
      
      const { error } = await supabase
        .from('islem_kategorileri')
        .upsert(updates);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Kategori sıralama güncelleme hatası:', error);
      throw error;
    }
  }
};

export const kategorilerServisi = kategoriServisi;
