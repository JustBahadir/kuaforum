
import { supabase } from '../client';
import { Randevu } from '../types';
import { musteriServisi } from './musteriServisi';

export const randevuServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      // If dukkanId is not provided, get it from current user
      const shopId = dukkanId || await musteriServisi.getCurrentUserDukkanId();
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('dukkan_id', shopId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Randevu listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Randevu getirme hatası:', error);
      throw error;
    }
  },
  
  // Add the ekle method to fix StaffAppointmentForm
  async ekle(randevuVerisi: Partial<Randevu>) {
    return this.randevuOlustur(randevuVerisi);
  },
  
  async randevuOlustur(randevuVerisi: Partial<Randevu>) {
    try {
      if (!randevuVerisi.dukkan_id) {
        randevuVerisi.dukkan_id = await musteriServisi.getCurrentUserDukkanId() as number;
      }
      
      if (!randevuVerisi.dukkan_id) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .insert([randevuVerisi])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  },
  
  async randevuGuncelle(id: number, updates: Partial<Randevu>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu güncelleme hatası:', error);
      throw error;
    }
  },
  
  async randevuSil(id: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      throw error;
    }
  },
  
  async durumGuncelle(id: number, durum: string) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      throw error;
    }
  },
  
  // Add a method for randevuDurumGuncelle to fix AppointmentsList
  async randevuDurumGuncelle(id: number, durum: string) {
    return this.durumGuncelle(id, durum);
  },
  
  async musteriRandevulari(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('musteri_id', musteriId)
        .order('tarih', { ascending: false })
        .order('saat', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri randevuları getirme hatası:', error);
      throw error;
    }
  },
  
  async tariheGoreGetir(tarih: Date) {
    try {
      const dukkanId = await musteriServisi.getCurrentUserDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      // Format date to YYYY-MM-DD
      const formattedDate = tarih.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('dukkan_id', dukkanId)
        .eq('tarih', formattedDate)
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Tarihe göre randevu getirme hatası:', error);
      throw error;
    }
  },
  
  async tarihGetir(tarih: Date) {
    return this.tariheGoreGetir(tarih);
  }
};
