
import { supabase } from '../client';

export const bildirimServisi = {
  async bildirimGetir(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Bildirim getirme hatası:', error);
      throw error;
    }
  },
  
  async bildirimOkundu(bildirimId: number) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', bildirimId)
        .select();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Bildirim okundu işaretleme hatası:', error);
      throw error;
    }
  },
  
  async bildirimEkle(bildirim: any) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(bildirim)
        .select();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Bildirim ekleme hatası:', error);
      throw error;
    }
  }
};
