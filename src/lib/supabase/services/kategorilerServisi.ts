
import { supabase } from '../client';
import { authService } from '@/lib/auth/authService';

export const kategorilerServisi = {
  async getCurrentDukkanId() {
    try {
      // First try to get the current user
      const user = await authService.getCurrentUser();
      
      if (!user) {
        console.error('No user found when getting dukkan ID');
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      console.log('Getting dukkan ID for user:', user.id);
      
      // First check if user has a dukkan (is an owner)
      const { data: dukkan, error: dukkanError } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (dukkanError) {
        console.error('Error fetching shop as owner:', dukkanError);
      }
      
      if (dukkan && dukkan.id) {
        console.log('Found dukkan as owner:', dukkan.id);
        return dukkan.id;
      }
      
      // If not an owner, check if they are personel
      const { data: personel, error: personelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelError) {
        console.error('Error fetching shop as personel:', personelError);
      }
      
      if (personel && personel.dukkan_id) {
        console.log('Found dukkan as personel:', personel.dukkan_id);
        return personel.dukkan_id;
      }
      
      // Last, check profile table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile dukkan_id:', profileError);
      }
      
      if (profile && profile.dukkan_id) {
        console.log('Found dukkan from profile:', profile.dukkan_id);
        return profile.dukkan_id;
      }
      
      // If we reach here, no dukkan was found
      console.error('No dukkan found for user');
      throw new Error('İşletme bilgisi bulunamadı');
    } catch (error) {
      console.error('Error in getCurrentDukkanId:', error);
      throw error;
    }
  },

  async hepsiniGetir(dukkanId?: number) {
    try {
      let shopId = dukkanId;
      
      if (shopId === undefined || shopId === null) {
        shopId = await this.getCurrentDukkanId();
      }
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      console.log('Getting categories for dukkan:', shopId);
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('sira', { ascending: true });
        
      if (error) throw error;
      
      console.log('Retrieved categories:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Kategori listesi getirme hatası:', error);
      throw error;
    }
  },

  async ekle(kategori: any) {
    try {
      if (!kategori.dukkan_id) {
        const dukkanId = await this.getCurrentDukkanId();
        
        if (!dukkanId) {
          throw new Error('Dükkan bilgisi bulunamadı');
        }
        
        kategori.dukkan_id = dukkanId;
      }
      
      console.log('Adding category with dukkanId:', kategori.dukkan_id);
      
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
        
      if (error) {
        console.error('Category insertion error:', error);
        throw error;
      }
      
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

export const kategoriServisi = kategorilerServisi;
