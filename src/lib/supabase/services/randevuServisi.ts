
import { supabase } from '../client';
import { Randevu, RandevuDurumu } from '../types';

export const randevuServisi = {
  async getCurrentDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        throw new Error('Kullanıcı bulunamadı');
      }
      
      // Check if user is admin
      const role = user.user_metadata?.role;
      console.log("Current user role:", role);
      
      if (role === 'admin') {
        // Admin user - get dukkan by user_id
        const { data, error } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('sahibi_id', user.id)
          .single();
          
        if (error) {
          console.error("Error getting dukkan as admin:", error);
          throw error;
        }
        console.log("Found dukkan as admin:", data);
        return data?.id;
      } else if (role === 'staff') {
        // Staff user - get dukkan through personeller
        const { data, error } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (error) {
          console.error("Error getting dukkan as staff:", error);
          throw error;
        }
        console.log("Found dukkan as staff:", data);
        return data?.dukkan_id;
      }
      
      // Try to get from profiles as last resort
      const { data, error } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Error getting dukkan from profile:", error);
        throw error;
      }
      console.log("Found dukkan from profile:", data);
      return data?.dukkan_id;
    } catch (error) {
      console.error('Dükkan ID getirme hatası (randevu servisi):', error);
      throw error;
    }
  },
  
  async hepsiniGetir() {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        console.error("Could not determine dukkan ID");
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      console.log("Fetching appointments for dukkanId:", dukkanId);

      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('dukkan_id', dukkanId)
        .order('tarih', { ascending: false })
        .order('saat', { ascending: true });

      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} appointments`);
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

  async kendiRandevulariniGetir() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('customer_id', user.id)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Randevu listesi getirme hatası:', error);
      throw error;
    }
  },

  async musteriRandevulari(musteriId: number) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('musteri_id', musteriId)
        .eq('dukkan_id', dukkanId)
        .order('tarih', { ascending: false })
        .order('saat', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri randevuları getirme hatası:', error);
      throw error;
    }
  },

  async randevuOlustur(randevuData: Partial<Randevu>) {
    try {
      // Add dukkan_id if not provided
      if (!randevuData.dukkan_id) {
        randevuData.dukkan_id = await this.getCurrentDukkanId();
        console.log("Adding dukkan_id to randevu:", randevuData.dukkan_id);
      }

      // Add current user's ID as customer_id if not provided
      if (!randevuData.customer_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          randevuData.customer_id = user.id;
        }
      }

      console.log("Creating randevu with data:", randevuData);
      const { data, error } = await supabase
        .from('randevular')
        .insert([randevuData])
        .select();

      if (error) {
        console.error("Error creating randevu:", error);
        throw error;
      }
      
      console.log("Randevu created:", data[0]);
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

  async durumGuncelle(id: number, durum: RandevuDurumu) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu durumu güncelleme hatası:', error);
      throw error;
    }
  },

  async randevuIptal(id: number) {
    return this.durumGuncelle(id, 'iptal');
  }
};
