
import { supabase } from "../../client";
import { Profil } from "../../types";

/**
 * Creates a new profile for a user
 */
export async function createProfile(userId: string, data: any): Promise<Profil> {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || null,
          role: data.role || 'customer',
          gender: data.gender || null,
          birthdate: data.birthdate || null,
          avatar_url: data.avatar_url || null,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Profil oluşturulurken hata:', error);
      throw error;
    }

    // Return profile data
    return {
      id: userId,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone: data.phone || '',
      role: data.role || 'customer',
      gender: data.gender || null,
      birthdate: data.birthdate || null,
      avatar_url: data.avatar_url || null,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('createProfile fonksiyonunda hata:', error);
    
    // Return a default profile in case of error
    return {
      id: userId,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone: data.phone || '',
      role: data.role || 'customer',
      gender: data.gender || null,
      birthdate: data.birthdate || null,
      avatar_url: data.avatar_url || null,
      created_at: new Date().toISOString()
    };
  }
}
