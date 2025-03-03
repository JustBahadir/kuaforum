
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import { toast } from "sonner";

// Supabase Admin API kullanıcı tipini tanımlayalım
interface SupabaseAdminUser {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  last_sign_in_at?: string;
  app_metadata?: any;
  user_metadata?: any;
  identities?: any[];
}

/**
 * Service to handle authentication-related operations
 */
export const authService = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Auth error:", error);
      return null;
    }
    return data.user;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Çıkış yapılırken hata:", error);
        toast.error("Çıkış yapılırken bir hata oluştu");
        throw error;
      }
      toast.success("Başarıyla çıkış yapıldı");
      console.log("Çıkış başarılı");
      return true;
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
      throw error;
    }
  },

  /**
   * Set up an auth state change listener
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "has session" : "no session");
      callback(event, session);
    });
    
    return data.subscription;
  },

  /**
   * Create a unique shop code based on shop name
   */
  generateShopCode: (shopName: string) => {
    const normalizedName = shopName
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
    
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${normalizedName}-${randomSuffix}`;
  },

  /**
   * Verify if a shop code exists
   */
  verifyShopCode: async (shopCode: string) => {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('id, ad')
      .eq('kod', shopCode)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data;
  },
  
  /**
   * Find a user by email address
   */
  findUserByEmail: async (email: string): Promise<SupabaseAdminUser | null> => {
    try {
      // Doğrudan e-posta ile kullanıcı bulma
      console.log("E-posta ile kullanıcı aranıyor:", email);
      
      // Kullanıcıyı auth tablosunda ara
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) {
        console.error("Kullanıcı listesi alınırken hata:", authError);
        return null;
      }
      
      if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
        console.log("Kullanıcı listesi boş");
        return null;
      }
      
      // Kullanıcıları kontrol et
      console.log(`${authUsers.users.length} kullanıcı bulundu, aranan e-posta: ${email}`);
      
      // E-posta ile eşleşen kullanıcıyı bul
      const user = authUsers.users.find((u: any) => 
        u.email && u.email.toLowerCase() === email.toLowerCase()
      ) as SupabaseAdminUser | undefined;
      
      if (user) {
        console.log("Kullanıcı bulundu:", user.id);
        return user;
      } else {
        console.log("Bu e-posta ile eşleşen kullanıcı bulunamadı");
        return null;
      }
    } catch (error) {
      console.error("Kullanıcı arama hatası:", error);
      return null;
    }
  },
  
  /**
   * Delete a user account by email
   */
  deleteUserByEmail: async (email: string) => {
    try {
      console.log("Silme işlemi başlatıldı:", email);
      
      // Önce e-posta ile kullanıcıyı bul
      const user = await authService.findUserByEmail(email);
      
      if (!user) {
        console.log("Kullanıcı bulunamadı:", email);
        throw new Error("Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.");
      }
      
      console.log("Silinecek kullanıcı:", user.id);
      
      try {
        // Önce ilişkili kayıtları temizle
        console.log("İlişkili kayıtlar temizleniyor...");
        
        // Profiles tablosundan sil
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);
        
        if (profileDeleteError) {
          console.log("Profil silme hatası:", profileDeleteError);
        }
        
        // Personel kayıtlarını bul ve sil
        const { data: personelData, error: personelFindError } = await supabase
          .from('personel')
          .select('id, dukkan_id')
          .eq('auth_id', user.id);
          
        if (personelFindError) {
          console.log("Personel bulma hatası:", personelFindError);
        }
        
        if (personelData && personelData.length > 0) {
          console.log("Silinecek personel kayıtları:", personelData);
          
          // Personel dükkan sahibi ise, dükkana bağlı tüm personelleri de sil
          for (const personel of personelData) {
            if (personel.dukkan_id) {
              const { data: shopData, error: shopError } = await supabase
                .from('dukkanlar')
                .select('sahibi_id')
                .eq('id', personel.dukkan_id)
                .single();
              
              if (!shopError && shopData && shopData.sahibi_id === user.id) {
                console.log("Kullanıcı dükkan sahibi, ilişkili personeller siliniyor...");
                
                // Dükkandaki tüm personelleri sil
                await supabase
                  .from('personel')
                  .delete()
                  .eq('dukkan_id', personel.dukkan_id);
                  
                // Dükkanı sil
                await supabase
                  .from('dukkanlar')
                  .delete()
                  .eq('id', personel.dukkan_id);
              }
            }
            
            // Bu personeli sil
            await supabase
              .from('personel')
              .delete()
              .eq('id', personel.id);
          }
        }
      } catch (cleanupError) {
        console.error("İlişkili kayıtlar temizlenirken hata:", cleanupError);
        // Burada hata fırlatmıyoruz çünkü auth kullanıcısını silmeye devam etmek istiyoruz
      }
      
      // SupabaseAdmin ile kullanıcıyı sil
      console.log("Auth kullanıcısı siliniyor...");
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error("Kullanıcı silme hatası:", deleteError);
        throw deleteError;
      }
      
      console.log("Kullanıcı başarıyla silindi");
      return true;
    } catch (error) {
      console.error("Hesap silme hatası:", error);
      throw error;
    }
  },
};
