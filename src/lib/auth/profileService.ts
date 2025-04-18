
import { supabase } from "../supabase/client";
import { Profil } from "@/lib/supabase/types";

// Profil verilerini güvenli şekilde alma
export const getProfileData = async (userId: string): Promise<Profil | null> => {
  try {
    // Önce edge function ile almayı dene
    try {
      const { data: userData, error: edgeFnError } = await supabase.functions.invoke('get_current_user_role');
      
      if (!edgeFnError && userData?.profile) {
        console.log("Profil edge function ile alındı");
        return userData.profile as Profil;
      }
    } catch (edgeError) {
      console.error("Edge function profil alma hatası:", edgeError);
      // Edge function başarısız olursa devam et ve direkt sorgu dene
    }
    
    // Normal sorgu ile profil al
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Profil alma hatası:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Beklenmeyen profil alma hatası:", error);
    return null;
  }
};

// Adı unvan ile getir
export const getUserNameWithTitle = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Değerli Müşterimiz";
    
    // Önce user metadata'dan bilgi almaya çalış
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || '';
    const lastName = userMetadata.last_name || '';
    const gender = userMetadata.gender || '';
    
    if (firstName || lastName) {
      const title = gender === 'male' ? 'Bay' : 
                   gender === 'female' ? 'Bayan' : '';
      
      return `${title} ${firstName} ${lastName}`.trim();
    }

    // Metadata'da yoksa veritabanından al
    const profile = await getProfileData(user.id);
    if (!profile) return "Değerli Müşterimiz";

    const title = profile.gender === 'male' ? 'Bay' : 
                 profile.gender === 'female' ? 'Bayan' : '';
    
    if (!profile.first_name && !profile.last_name) {
      return "Değerli Müşterimiz";
    }
    
    return `${title} ${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  } catch (error) {
    console.error("İsim getirme hatası:", error);
    return "Değerli Müşterimiz";
  }
};

// Kullanıcı rolünü getir
export const getUserRole = async (): Promise<string | null> => {
  try {
    // Önce edge function ile almayı dene
    try {
      const { data: userData, error: edgeFnError } = await supabase.functions.invoke('get_current_user_role');
      
      if (!edgeFnError && userData?.role) {
        console.log("Rol edge function ile alındı");
        return userData.role as string;
      }
    } catch (edgeError) {
      console.error("Edge function rol alma hatası:", edgeError);
      // Edge function başarısız olursa devam et ve direkt sorgu dene
    }
    
    // Eğer edge function başarısız olursa user metadatasından kontrol et
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Metadata kontrolü
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }
    
    // Son çare olarak veritabanından al
    const profile = await getProfileData(user.id);
    return profile?.role || null;
  } catch (error) {
    console.error("Rol getirme hatası:", error);
    return null;
  }
};

// Geriye dönük uyumluluk için nesne olarak dışa aktar
export const profileService = {
  getProfileData,
  getUserNameWithTitle,
  getUserRole
};
