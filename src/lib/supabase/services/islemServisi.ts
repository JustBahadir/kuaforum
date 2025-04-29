
import { supabase } from '../client';
import { Islem } from '../types';

export const islemServisi = {
  // Helper function to get the current user's dukkan_id
  async _getCurrentUserDukkanId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('dukkan_id')
      .eq('id', user.id)
      .maybeSingle();
    
    const { data: personelData } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('auth_id', user.id)
      .maybeSingle();
    
    return profileData?.dukkan_id || personelData?.dukkan_id;
  },

  async hepsiniGetir() {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }

      // Update query to filter by dukkan_id
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlemleri getirme hatası:', error);
      throw error;
    }
  },

  async kategorileriGetir() {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }

      // Update query to filter by dukkan_id
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('sira');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategorileri getirme hatası:', error);
      throw error;
    }
  },

  async kategoriIslemleriGetir(kategoriId: number) {
    try {
      if (!kategoriId) return [];
      
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }
      
      // First verify this category belongs to our business
      const { data: categoryData } = await supabase
        .from('islem_kategorileri')
        .select('dukkan_id')
        .eq('id', kategoriId)
        .single();
        
      if (categoryData?.dukkan_id !== dukkanId) {
        console.error("Bu kategori sizin işletmenize ait değil");
        return [];
      }

      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategoriId)
        .eq('dukkan_id', dukkanId) // Additional safety filter
        .order('sira');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori işlemlerini getirme hatası:', error);
      throw error;
    }
  },

  async ekle(islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number; maliyet?: number }) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // If category provided, verify it belongs to our business
      if (islem.kategori_id) {
        const { data: categoryData } = await supabase
          .from('islem_kategorileri')
          .select('dukkan_id')
          .eq('id', islem.kategori_id)
          .single();
          
        if (categoryData?.dukkan_id !== dukkanId) {
          throw new Error("Bu kategori sizin işletmenize ait değil");
        }
      }

      // Get the max sira value for the category
      const query = supabase
        .from('islemler')
        .select('sira')
        .eq('dukkan_id', dukkanId); // Filter by dukkan_id
        
      if (islem.kategori_id) {
        query.eq('kategori_id', islem.kategori_id);
      } else {
        query.is('kategori_id', null);
      }
      
      const { data: maxSiraData, error: maxSiraError } = await query
        .order('sira', { ascending: false })
        .limit(1);
      
      if (maxSiraError) throw maxSiraError;
      
      const maxSira = maxSiraData && maxSiraData.length > 0 ? maxSiraData[0].sira || 0 : 0;
      
      const { data, error } = await supabase
        .from('islemler')
        .insert([{
          ...islem,
          dukkan_id: dukkanId, // Set the correct dukkan_id
          sira: maxSira + 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },

  islemEkle: async (islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number; maliyet?: number }) => {
    try {
      console.log("İşlem ekleniyor:", islem);
      return await islemServisi.ekle(islem);
    } catch (error) {
      console.error("İşlem eklenirken hata oluştu:", error);
      throw error;
    }
  },

  async guncelle(id: number, islem: { islem_adi?: string; fiyat?: number; puan?: number; kategori_id?: number; maliyet?: number }) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // First verify this operation belongs to our business
      const { data: operationData } = await supabase
        .from('islemler')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (operationData?.dukkan_id !== dukkanId) {
        throw new Error("Bu işlem sizin işletmenize ait değil");
      }
      
      // If category provided, verify it belongs to our business
      if (islem.kategori_id) {
        const { data: categoryData } = await supabase
          .from('islem_kategorileri')
          .select('dukkan_id')
          .eq('id', islem.kategori_id)
          .single();
          
        if (categoryData?.dukkan_id !== dukkanId) {
          throw new Error("Bu kategori sizin işletmenize ait değil");
        }
      }

      const { data, error } = await supabase
        .from('islemler')
        .update(islem)
        .eq('id', id)
        .eq('dukkan_id', dukkanId) // Additional safety filter
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem güncelleme hatası:', error);
      throw error;
    }
  },

  islemGuncelle: async (id: number, islem: { islem_adi?: string; fiyat?: number; puan?: number; kategori_id?: number; maliyet?: number }) => {
    try {
      return await islemServisi.guncelle(id, islem);
    } catch (error) {
      console.error('İşlem güncellenirken hata oluştu:', error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // First verify this operation belongs to our business
      const { data: operationData } = await supabase
        .from('islemler')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (operationData?.dukkan_id !== dukkanId) {
        throw new Error("Bu işlem sizin işletmenize ait değil");
      }
      
      console.log("Silinecek işlem ID:", id);
      
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId); // Additional safety filter

      if (error) {
        console.error('İşlem silme hatası (detaylı):', error);
        throw error;
      }
      
      console.log("İşlem başarıyla silindi:", id);
      return { success: true };
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      throw error;
    }
  },

  islemSil: async (id: number) => {
    try {
      console.log("İşlem silme isteği:", id);
      return await islemServisi.sil(id);
    } catch (error) {
      console.error("İşlem silinirken hata oluştu:", error);
      throw error;
    }
  },

  async siraGuncelle(islemler: Islem[]) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // Verify all operations belong to our business
      const islemIds = islemler.map(islem => islem.id);
      
      const { data: existingOperations } = await supabase
        .from('islemler')
        .select('id, dukkan_id')
        .in('id', islemIds);
        
      const unauthorizedOperations = existingOperations?.filter(op => op.dukkan_id !== dukkanId);
      
      if (unauthorizedOperations && unauthorizedOperations.length > 0) {
        throw new Error("Bazı işlemler sizin işletmenize ait değil");
      }

      // Update each item with its new position
      const updates = islemler.map((islem, index) => ({
        id: islem.id,
        sira: index,
        islem_adi: islem.islem_adi,
        fiyat: islem.fiyat,
        puan: islem.puan,
        kategori_id: islem.kategori_id,
        maliyet: islem.maliyet,
        dukkan_id: dukkanId // Ensure correct dukkan_id
      }));

      const { data, error } = await supabase
        .from('islemler')
        .upsert(updates, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlem sıralama hatası:', error);
      throw error;
    }
  }
};
