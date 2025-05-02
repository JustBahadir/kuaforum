
import { supabase } from '../client';
import { authService } from '@/lib/auth/authService';

export const kategoriServisi = {
  async getCurrentDukkanId() {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      // First check if user has a dukkan (is an owner)
      const { data: dukkan, error: dukkanError } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (dukkanError) {
        console.error('Dükkan ID alma hatası:', dukkanError);
      }
      
      if (dukkan && dukkan.id) {
        return dukkan.id;
      }
      
      // If not found as owner, check personel table
      const { data: personel, error: personelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelError) {
        console.error('Personel dükkan ID alma hatası:', personelError);
      }
      
      if (personel && personel.dukkan_id) {
        return personel.dukkan_id;
      }
      
      // Last resort: check profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Profil dükkan ID alma hatası:', profileError);
      }
      
      if (profile && profile.dukkan_id) {
        return profile.dukkan_id;
      }
      
      throw new Error('Dükkan bilgisi bulunamadı');
    } catch (error) {
      console.error('getCurrentDukkanId hatası:', error);
      throw error;
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
      let dukkanId = kategori.dukkan_id;
      
      if (!dukkanId) {
        dukkanId = await this.getCurrentDukkanId();
      }
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      // Call the create_category function
      const { data, error } = await supabase
        .rpc('create_category', {
          p_dukkan_id: dukkanId,
          p_kategori_adi: kategori.kategori_adi
        });
      
      if (error) {
        console.error('Create category RPC error:', error);
        throw error;
      }
      
      return data;
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
