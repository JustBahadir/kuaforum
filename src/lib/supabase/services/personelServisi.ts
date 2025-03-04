
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel')
      .select(`
        *,
        dukkan:dukkanlar(*)
      `)
      .order('ad_soyad');

    if (error) throw error;
    return data || [];
  },

  async getirById(id: number) {
    const { data, error } = await supabase
      .from('personel')
      .select(`
        *,
        dukkan:dukkanlar(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getirByAuthId(authId: string) {
    const { data, error } = await supabase
      .from('personel')
      .select(`
        *,
        dukkan:dukkanlar(*)
      `)
      .eq('auth_id', authId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No records found
      }
      throw error;
    }
    return data;
  },

  async ekle(personel: Omit<Personel, 'id' | 'created_at' | 'dukkan'>) {
    const { data, error } = await supabase
      .from('personel')
      .insert([personel])
      .select(`
        *,
        dukkan:dukkanlar(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, personel: Partial<Omit<Personel, 'dukkan'>>) {
    const { data, error } = await supabase
      .from('personel')
      .update(personel)
      .eq('id', id)
      .select(`
        *,
        dukkan:dukkanlar(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    // First check if this personnel has an auth_id
    const { data: personel } = await supabase
      .from('personel')
      .select('auth_id, eposta')
      .eq('id', id)
      .single();

    // Delete related operations first
    const { error: islemSilmeHatasi } = await supabase
      .from('personel_islemleri')
      .delete()
      .eq('personel_id', id);

    if (islemSilmeHatasi) throw islemSilmeHatasi;

    // Delete the personnel record
    const { error } = await supabase
      .from('personel')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // If personnel had an auth account, try to delete that too
    if (personel?.auth_id || personel?.eposta) {
      try {
        // Try to delete auth user if there's an associated email
        if (personel.eposta) {
          await supabase.functions.invoke('delete-user', {
            body: { email: personel.eposta }
          });
        }
      } catch (authDeleteError) {
        console.error("Error deleting auth user:", authDeleteError);
        // We don't throw here since the personnel record is already deleted
      }
    }
  }
};
