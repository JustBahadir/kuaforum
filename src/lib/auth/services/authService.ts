
import { supabase } from '@/lib/supabase/client';

export const authService = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  async signUp(email: string, password: string, metadata: any = {}) {
    return await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata
      }
    });
  },
  
  async signOut() {
    return await supabase.auth.signOut();
  },
  
  onAuthStateChange(callback: any) {
    return supabase.auth.onAuthStateChange(callback);
  },
  
  async verifyShopCode(code: string) {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('id, ad')
        .eq('kod', code)
        .eq('active', true)
        .single();
      
      if (error || !data) return null;
      return data;
    } catch (error) {
      console.error('Shop code verification error:', error);
      return null;
    }
  },
  
  async getPendingShopJoinRequests(shopId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_shop_requests')
        .select('*, personel:personel_id(id, ad_soyad, telefon, eposta, avatar_url)')
        .eq('dukkan_id', shopId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting pending shop join requests:', error);
      return [];
    }
  }
};
