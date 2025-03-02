
import { supabase } from '../client';

export const staffServisi = {
  async girisYap(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  async cikisYap() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async kayitOl(email: string, password: string, firstName: string, lastName: string, phone: string) {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'staff'
        }
      }
    });
    
    if (error) throw error;
    
    // Add to personel table
    if (data.user) {
      const { data: personelData, error: personelError } = await supabase
        .from('personel')
        .insert([
          {
            email: email,
            ad_soyad: `${firstName} ${lastName}`,
            telefon: phone,
            durum: 'aktif'
          }
        ]);
        
      if (personelError) throw personelError;
    }
    
    return data;
  },
  
  async isStaff(userId: string) {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return !!data;
  }
};
