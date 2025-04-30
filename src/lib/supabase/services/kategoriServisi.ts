
import { supabase } from '../client';
import { KategoriDto } from '../types';

// This export name must be 'kategorilerServisi' to match imports
export const kategorilerServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      // If no dukkan_id provided, get the current user's dukkan_id
      if (!dukkanId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Kullanıcı bilgisi bulunamadı");
          
          // Try to get dukkan_id from user metadata
          dukkanId = user.user_metadata?.dukkan_id;
          
          if (!dukkanId) {
            // Try to get from profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('dukkan_id')
              .eq('id', user.id)
              .maybeSingle();
              
            if (profile?.dukkan_id) {
              dukkanId = profile.dukkan_id;
            } else {
              // Try to get from personel
              const { data: personel } = await supabase
                .from('personel')
                .select('dukkan_id')
                .eq('auth_id', user.id)
                .maybeSingle();
                
              if (personel?.dukkan_id) {
                dukkanId = personel.dukkan_id;
              } else {
                // Check if user is a shop owner
                const { data: shop } = await supabase
                  .from('dukkanlar')
                  .select('id')
                  .eq('sahibi_id', user.id)
                  .maybeSingle();
                  
                if (shop?.id) {
                  dukkanId = shop.id;
                }
              }
            }
          }
        } catch (err) {
          console.error("Kullanıcı dükkan bilgisi alınamadı:", err);
          throw new Error("Dükkan bilgisi bulunamadı");
        }
      }
      
      if (!dukkanId) {
        throw new Error("Dükkan bilgisi bulunamadı");
      }
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });
      
      if (error) {
        console.error('Kategoriler getirilemedi:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Kategoriler getirilemedi:', error);
      throw error;
    }
  },
  
  async ekle(kategori: Omit<KategoriDto, 'id'>) {
    try {
      // If dukkan_id is not provided, get the current user's dukkan_id
      if (!kategori.dukkan_id) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Kullanıcı bilgisi bulunamadı");
          
          // Try to get dukkan_id from user metadata
          kategori.dukkan_id = user.user_metadata?.dukkan_id;
          
          if (!kategori.dukkan_id) {
            // Try to get from profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('dukkan_id')
              .eq('id', user.id)
              .maybeSingle();
              
            if (profile?.dukkan_id) {
              kategori.dukkan_id = profile.dukkan_id;
            } else {
              // Try to get from personel
              const { data: personel } = await supabase
                .from('personel')
                .select('dukkan_id')
                .eq('auth_id', user.id)
                .maybeSingle();
                
              if (personel?.dukkan_id) {
                kategori.dukkan_id = personel.dukkan_id;
              } else {
                // Check if user is a shop owner
                const { data: shop } = await supabase
                  .from('dukkanlar')
                  .select('id')
                  .eq('sahibi_id', user.id)
                  .maybeSingle();
                  
                if (shop?.id) {
                  kategori.dukkan_id = shop.id;
                }
              }
            }
          }
        } catch (err) {
          console.error("Kullanıcı dükkan bilgisi alınamadı:", err);
          throw new Error("Dükkan bilgisi bulunamadı");
        }
      }
      
      if (!kategori.dukkan_id) {
        throw new Error("Dükkan bilgisi bulunamadı");
      }
      
      console.log("Eklenecek kategori:", kategori);
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([kategori])
        .select();
      
      if (error) {
        console.error('Kategori eklenemedi:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Kategori eklenemedi:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: Partial<KategoriDto>) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Kategori güncellenemedi:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Kategori güncellenemedi:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Kategori silinemedi:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Kategori silinemedi:', error);
      throw error;
    }
  },
  
  async siralamaGuncelle(kategoriler: KategoriDto[]) {
    try {
      const updates = kategoriler.map(item => ({
        id: item.id,
        sira: item.sira
      }));
      
      // Update each kategori's order
      for (const update of updates) {
        const { error } = await supabase
          .from('islem_kategorileri')
          .update({ sira: update.sira })
          .eq('id', update.id);
        
        if (error) {
          console.error('Kategori sıralaması güncellenemedi:', error);
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Kategori sıralaması güncellenemedi:', error);
      throw error;
    }
  }
};

// For backward compatibility with any potential older imports
export const kategoriServisi = kategorilerServisi;
