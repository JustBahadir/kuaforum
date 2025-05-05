
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Supabase konfigürasyonu
const supabaseUrl = "https://xkbjjcizncwkrouvoujw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

// Geçerli kullanıcıyı getir
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Kullanıcı bilgisi alınırken hata:", error);
    return null;
  }
};

// Kullanıcı profilini getir
export const getUserProfile = async (userId: string) => {
  try {
    const { data: kullanici, error } = await supabase
      .from("kullanicilar")
      .select("*")
      .eq("kimlik", userId)
      .single();

    if (error) throw error;
    
    // Eğer kullanici null ise güvenli bir şekilde boş object döndür
    return kullanici || {};
    
  } catch (error) {
    console.error("Profil bilgisi alınırken hata:", error);
    toast.error("Profil bilgileri alınamadı", {
      position: "bottom-right"
    });
    return {};
  }
};
