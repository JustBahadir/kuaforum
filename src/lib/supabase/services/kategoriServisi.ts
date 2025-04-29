
import { supabase } from "../client";
import { IslemKategori } from "../types";

export const kategoriServisi = {
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
  
  async hepsiniGetir(): Promise<IslemKategori[]> {
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      console.error("Kullanıcının işletme bilgisi bulunamadı");
      return [];
    }
    
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .eq('dukkan_id', dukkanId) // Filter by dukkan_id
      .order('sira');
      
    if (error) throw error;
    return data || [];
  },
  
  async getir(id: number): Promise<IslemKategori> {
    const dukkanId = await this._getCurrentUserDukkanId();
    if (!dukkanId) {
      throw new Error("Kullanıcının işletme bilgisi bulunamadı");
    }
    
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .eq('id', id)
      .eq('dukkan_id', dukkanId) // Filter by dukkan_id
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async ekle(kategori: Partial<IslemKategori>): Promise<IslemKategori> {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // Get the max sira value
      const { data: maxSiraData, error: maxSiraError } = await supabase
        .from('islem_kategorileri')
        .select('sira')
        .eq('dukkan_id', dukkanId) // Filter by dukkan_id
        .order('sira', { ascending: false })
        .limit(1);
      
      if (maxSiraError) throw maxSiraError;
      
      const maxSira = maxSiraData && maxSiraData.length > 0 ? maxSiraData[0].sira || 0 : 0;
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([{
          ...kategori,
          dukkan_id: dukkanId, // Set the correct dukkan_id
          sira: maxSira + 1
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, kategori: Partial<IslemKategori>): Promise<IslemKategori> {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // First verify this category belongs to our business
      const { data: categoryData } = await supabase
        .from('islem_kategorileri')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (categoryData?.dukkan_id !== dukkanId) {
        throw new Error("Bu kategori sizin işletmenize ait değil");
      }
      
      // Don't allow changing dukkan_id
      delete kategori.dukkan_id;
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(kategori)
        .eq('id', id)
        .eq('dukkan_id', dukkanId) // Additional safety filter
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number): Promise<void> {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // First verify this category belongs to our business
      const { data: categoryData } = await supabase
        .from('islem_kategorileri')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (categoryData?.dukkan_id !== dukkanId) {
        throw new Error("Bu kategori sizin işletmenize ait değil");
      }
      
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId); // Additional safety filter
        
      if (error) throw error;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      throw error;
    }
  },
  
  async siraGuncelle(kategoriler: IslemKategori[]): Promise<IslemKategori[]> {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // Verify all categories belong to our business
      const kategoriIds = kategoriler.map(kategori => kategori.id);
      
      const { data: existingCategories } = await supabase
        .from('islem_kategorileri')
        .select('id, dukkan_id')
        .in('id', kategoriIds);
        
      const unauthorizedCategories = existingCategories?.filter(cat => cat.dukkan_id !== dukkanId);
      
      if (unauthorizedCategories && unauthorizedCategories.length > 0) {
        throw new Error("Bazı kategoriler sizin işletmenize ait değil");
      }
      
      // Update each category with its new position
      const updates = kategoriler.map((kategori, index) => ({
        id: kategori.id,
        sira: index,
        dukkan_id: dukkanId, // Ensure correct dukkan_id
      }));
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .upsert(updates, { onConflict: 'id' })
        .select();
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori sıra güncelleme hatası:', error);
      throw error;
    }
  },
};
