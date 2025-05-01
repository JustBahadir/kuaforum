
import { supabase } from '../client';
import { Personel } from '../types';

interface PersonelRegisterData {
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  birth_date?: string;
  prim_yuzdesi: number;
  maas: number;
  personel_no: string;
  calisma_sistemi: string;
  dukkan_id: number;
  dukkan_kod?: string;
  iban?: string;
  avatar_url?: string;
}

export const personelServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      let query = supabase.from('personel').select('*');
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }
      
      const { data, error } = await query.order('ad_soyad');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel getirme hatası:', error);
      throw error;
    }
  },
  
  async ekle(personelData: Partial<Personel>) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .insert([personelData])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel ekleme hatası:', error);
      throw error;
    }
  },
  
  async register(registerData: PersonelRegisterData) {
    try {
      // First check if an email is already registered
      const { data: existingPersonel, error: checkError } = await supabase
        .from('personel')
        .select('id, eposta')
        .eq('eposta', registerData.eposta);
      
      if (checkError) throw checkError;
      
      if (existingPersonel && existingPersonel.length > 0) {
        throw new Error('Bu e-posta adresi ile kayıtlı bir personel zaten var.');
      }
      
      // Then create the personnel record
      const { data, error } = await supabase
        .from('personel')
        .insert([{
          ad_soyad: registerData.ad_soyad,
          telefon: registerData.telefon,
          eposta: registerData.eposta,
          adres: registerData.adres,
          birth_date: registerData.birth_date,
          prim_yuzdesi: registerData.prim_yuzdesi,
          maas: registerData.maas,
          personel_no: registerData.personel_no,
          calisma_sistemi: registerData.calisma_sistemi,
          dukkan_id: registerData.dukkan_id,
          iban: registerData.iban || null,
          avatar_url: registerData.avatar_url || null
        }])
        .select();
      
      if (error) throw error;
      
      // Create staff join request
      if (data && data[0]) {
        const { error: joinRequestError } = await supabase
          .from('staff_join_requests')
          .insert([{
            personel_id: data[0].id,
            dukkan_id: registerData.dukkan_id,
            durum: 'pending'
          }]);
          
        if (joinRequestError) {
          console.error('Staff join request creation error:', joinRequestError);
        }
      }
      
      return data && data[0];
    } catch (error) {
      console.error('Personel kayıt hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: Partial<Personel>) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('personel')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Personel silme hatası:', error);
      throw error;
    }
  },
  
  async topluIslemPerformans() {
    try {
      const { data, error } = await supabase
        .rpc('personel_performans_hesapla');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel performans hesaplama hatası:', error);
      throw error;
    }
  },
  
  async getAuthPersonel(authId: string) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', authId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Auth personel getirme hatası:', error);
      throw error;
    }
  }
};
