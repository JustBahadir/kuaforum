
import { supabase } from '../client';
import { CalismaSaati } from '@/lib/supabase/types';
import { createDefaultWorkingHours, sortWorkingHours } from '@/components/operations/utils/workingHoursUtils';
import { authService } from '@/lib/auth/authService';

export const calismaSaatleriServisi = {
  async getCurrentDukkanId(): Promise<number> {
    try {
      console.log("calismaSaatleriServisi: Getting current dukkan ID");
      const user = await authService.getCurrentUser();
      
      if (!user) {
        console.error("calismaSaatleriServisi: No user found");
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      console.log("calismaSaatleriServisi: User ID:", user.id);
      
      // First check if user has a dukkan (is an owner)
      const { data: dukkan, error: dukkanError } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (dukkanError) {
        console.error('calismaSaatleriServisi: Dükkan ID alma hatası:', dukkanError);
      }
      
      if (dukkan && dukkan.id) {
        console.log("calismaSaatleriServisi: Found dukkan as owner:", dukkan.id);
        return dukkan.id;
      }
      
      // If not found as owner, check personel table
      const { data: personel, error: personelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelError) {
        console.error('calismaSaatleriServisi: Personel dükkan ID alma hatası:', personelError);
      }
      
      if (personel && personel.dukkan_id) {
        console.log("calismaSaatleriServisi: Found dukkan as personel:", personel.dukkan_id);
        return personel.dukkan_id;
      }
      
      // Last resort: check profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('calismaSaatleriServisi: Profil dükkan ID alma hatası:', profileError);
      }
      
      if (profile && profile.dukkan_id) {
        console.log("calismaSaatleriServisi: Found dukkan from profile:", profile.dukkan_id);
        return profile.dukkan_id;
      }
      
      console.error("calismaSaatleriServisi: No dukkan found for user");
      throw new Error('Dükkan bilgisi bulunamadı');
    } catch (error) {
      console.error('calismaSaatleriServisi: getCurrentDukkanId hatası:', error);
      throw error;
    }
  },

  async dukkanSaatleriGetir(dukkanId: number): Promise<CalismaSaati[]> {
    try {
      console.log("calismaSaatleriServisi: Getting working hours for dukkanId:", dukkanId);
      if (!dukkanId) {
        throw new Error('Dükkan ID gereklidir');
      }

      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId);

      if (error) {
        console.error("calismaSaatleriServisi: Error fetching working hours:", error);
        throw error;
      }

      console.log("calismaSaatleriServisi: Fetched working hours:", data?.length || 0, "records");
      
      // If no hours found for the shop, create defaults
      if (!data || data.length === 0) {
        console.log("calismaSaatleriServisi: Creating default hours");
        const defaultHours = createDefaultWorkingHours(dukkanId);
        return defaultHours;
      }

      return sortWorkingHours(data);
    } catch (error) {
      console.error('calismaSaatleriServisi: Çalışma saatlerini getirme hatası:', error);
      throw error;
    }
  },

  // Alias for dukkanSaatleriGetir to maintain backward compatibility
  async hepsiniGetir(dukkanId: number): Promise<CalismaSaati[]> {
    return this.dukkanSaatleriGetir(dukkanId);
  },

  async saatleriKaydet(saatler: CalismaSaati[]): Promise<CalismaSaati[]> {
    try {
      if (!saatler || saatler.length === 0) {
        throw new Error('Geçersiz çalışma saatleri');
      }

      const dukkanId = saatler[0].dukkan_id;
      if (!dukkanId) {
        throw new Error('Dükkan ID bulunamadı');
      }

      // First, delete all existing hours for this shop to prevent duplicates
      const { error: deleteError } = await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('dukkan_id', dukkanId);

      if (deleteError) {
        throw deleteError;
      }

      // Now insert the new hours
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(saatler)
        .select();

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Çalışma saatlerini kaydetme hatası:', error);
      throw error;
    }
  },

  // Method to update a single working hour record
  async guncelle(id: number, updates: Partial<CalismaSaati>): Promise<CalismaSaati> {
    try {
      // Remove id from updates to avoid conflicts
      const { id: _, ...updateData } = updates;
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Çalışma saati güncelleme hatası:', error);
      throw error;
    }
  },

  // Method to add a new working hour record
  async ekle(saat: Partial<CalismaSaati>): Promise<CalismaSaati> {
    try {
      if (!saat.dukkan_id) {
        saat.dukkan_id = await this.getCurrentDukkanId();
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(saat)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Çalışma saati ekleme hatası:', error);
      throw error;
    }
  },

  async saatleriGuncelle(saatler: CalismaSaati[]): Promise<CalismaSaati[]> {
    // We're implementing this as a complete replace operation to avoid any inconsistencies
    return this.saatleriKaydet(saatler);
  }
};
