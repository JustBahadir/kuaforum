
import { supabase } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  // Helper function to get the current user's dukkan_id
  async _getCurrentUserDukkanId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Try to get dukkan_id from user metadata first
    const dukkanIdFromMeta = user.user_metadata?.dukkan_id;
    if (dukkanIdFromMeta) return dukkanIdFromMeta;
    
    // If not in metadata, try profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('dukkan_id')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileData?.dukkan_id) return profileData.dukkan_id;
    
    // Finally try personel table
    const { data: personelData } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('auth_id', user.id)
      .maybeSingle();
    
    return personelData?.dukkan_id;
  },
  
  async hepsiniGetir(dukkanId?: number) {
    try {
      const userDukkanId = dukkanId || await this._getCurrentUserDukkanId();
      if (!userDukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }
      
      console.log(`Dükkan ID ${userDukkanId} için müşteriler getiriliyor`);
      
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('dukkan_id', userDukkanId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Müşteriler getirme hatası:", error);
        throw error;
      }
      
      console.log(`${data.length} müşteri başarıyla getirildi`);
      return data || [];
    } catch (err) {
      console.error("Müşteriler getirme sırasında hata:", err);
      return [];
    }
  },
  
  async getirById(id: number): Promise<Musteri | null> {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return null;
      }
      
      console.log(`Müşteri ID ${id} ve Dükkan ID ${dukkanId} için müşteri getiriliyor`);
      
      // Get the customer data with shop isolation
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', id)
        .eq('dukkan_id', dukkanId) // Strict shop isolation
        .single();
      
      if (error) {
        console.error(`ID ${id} müşteri getirme hatası:`, error);
        return null;
      }
      
      // If we have customer data, create a complete customer object with auth_id
      if (data) {
        // Simply use the customer ID as the auth_id for now
        let customer = { 
          ...data,
          auth_id: id.toString()
        } as Musteri;
        
        return customer;
      }
      
      return null;
    } catch (err) {
      console.error(`ID ${id} müşteri getirme sırasında hata:`, err);
      return null;
    }
  },
  
  async ekle(musteri: Omit<Musteri, 'id' | 'created_at'>) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // Set the correct dukkan_id
      musteri.dukkan_id = dukkanId;
      
      // Explicitly set optional fields to null if undefined to ensure DB has values
      const dataForInsert = {
        first_name: musteri.first_name,
        last_name: musteri.last_name || null,
        phone: musteri.phone || null,
        birthdate: musteri.birthdate || null,
        dukkan_id: dukkanId,
        adres: (musteri as any).adres || null,
        not: (musteri as any).not || null,
      };

      const { data, error } = await supabase
        .from('musteriler')
        .insert([dataForInsert])
        .select();
      
      if (error) {
        console.error("Müşteri ekleme hatası:", error);
        throw error;
      }
      
      return data[0];
    } catch (err) {
      console.error("Müşteri eklenirken hata:", err);
      throw err;
    }
  },
  
  async guncelle(id: number, updates: Partial<Musteri>) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // First verify this customer belongs to our business
      const { data: customerData } = await supabase
        .from('musteriler')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (customerData?.dukkan_id !== dukkanId) {
        throw new Error("Bu müşteri sizin işletmenize ait değil");
      }
      
      // Don't allow changing dukkan_id
      delete updates.dukkan_id;
      
      const { data, error } = await supabase
        .from('musteriler')
        .update(updates)
        .eq('id', id)
        .eq('dukkan_id', dukkanId) // Additional safety filter
        .select();
      
      if (error) {
        console.error("Müşteri güncelleme hatası:", error);
        throw error;
      }
      
      return data[0];
    } catch (err) {
      console.error(`ID ${id} müşteri güncellenirken hata:`, err);
      throw err;
    }
  },
  
  async sil(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // First verify this customer belongs to our business
      const { data: customerData } = await supabase
        .from('musteriler')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (customerData?.dukkan_id !== dukkanId) {
        throw new Error("Bu müşteri sizin işletmenize ait değil");
      }
      
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId); // Additional safety filter
      
      if (error) {
        console.error("Müşteri silme hatası:", error);
        throw error;
      }
      
      return true;
    } catch (err) {
      console.error(`ID ${id} müşteri silinirken hata:`, err);
      throw err;
    }
  }
};
