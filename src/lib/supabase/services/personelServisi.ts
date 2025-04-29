
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  async hepsiniGetir() {
    try {
      // First get the current user's dukkan_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı oturum açmamış");
      
      // Get the dukkan_id from the user's profile or from personel table
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
      
      const dukkanId = profileData?.dukkan_id || personelData?.dukkan_id;
      
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }

      // Query personnel only for this dukkan_id
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('ad_soyad');

      if (error) {
        console.error("Personel getirme hatası:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Personel listesi alınırken hata:", error);
      return [];
    }
  },

  async getirById(id: number) {
    try {
      // First validate that this personnel belongs to the user's business
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı oturum açmamış");
      
      // Get the dukkan_id from the user's profile or from personel table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('dukkan_id, role')
        .eq('id', user.id)
        .maybeSingle();
      
      const { data: personelData } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      const dukkanId = profileData?.dukkan_id || personelData?.dukkan_id;
      const userRole = profileData?.role;
      
      if (!dukkanId && userRole !== 'admin') {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return null;
      }

      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("Personel bulunamadı:", id);
          return null;
        }
        console.error("Personel getirme hatası:", error);
        throw error;
      }
      
      // Validate that this personnel belongs to the user's business
      if (data.dukkan_id !== dukkanId && userRole !== 'admin') {
        console.error("Bu personel başka bir işletmeye ait");
        return null;
      }

      return data;
    } catch (error) {
      console.error("Personel getirme hatası:", error);
      return null;
    }
  },

  async ekle(personel: any) {
    try {
      // First get the current user's dukkan_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı oturum açmamış");
      
      // Get the dukkan_id from the user's profile or from personel table
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
      
      const dukkanId = profileData?.dukkan_id || personelData?.dukkan_id;
      
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // Always set the correct dukkan_id for the new personnel
      personel.dukkan_id = dukkanId;

      const { data, error } = await supabase
        .from('personel')
        .insert([personel])
        .select();

      if (error) {
        console.error("Personel ekleme hatası:", error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error("Personel ekleme hatası:", error);
      throw error;
    }
  },

  async guncelle(id: number, personel: Partial<Personel>) {
    try {
      // First validate that this personnel belongs to the user's business
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı oturum açmamış");
      
      // Get the dukkan_id from the user's profile or from personel table
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
      
      const dukkanId = profileData?.dukkan_id || personelData?.dukkan_id;
      
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // First check if this personnel belongs to the user's business
      const { data: existingPersonel, error: checkError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error("Personel kontrol hatası:", checkError);
        throw checkError;
      }
      
      if (existingPersonel.dukkan_id !== dukkanId) {
        throw new Error("Bu personel başka bir işletmeye ait");
      }

      // Never allow changing the dukkan_id
      delete personel.dukkan_id;

      const { data, error } = await supabase
        .from('personel')
        .update(personel)
        .eq('id', id)
        .eq('dukkan_id', dukkanId) // Additional safety filter
        .select();

      if (error) {
        console.error("Personel güncelleme hatası:", error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error("Personel güncelleme hatası:", error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      // First validate that this personnel belongs to the user's business
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı oturum açmamış");
      
      // Get the dukkan_id from the user's profile or from personel table
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
      
      const dukkanId = profileData?.dukkan_id || personelData?.dukkan_id;
      
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // First check if this personnel belongs to the user's business
      const { data: existingPersonel, error: checkError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error("Personel kontrol hatası:", checkError);
        throw checkError;
      }
      
      if (existingPersonel.dukkan_id !== dukkanId) {
        throw new Error("Bu personel başka bir işletmeye ait");
      }

      const { error } = await supabase
        .from('personel')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId); // Additional safety filter

      if (error) {
        console.error("Personel silme hatası:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Personel silme hatası:", error);
      throw error;
    }
  }
};
