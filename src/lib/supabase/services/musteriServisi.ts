import { supabase } from '../client';
import { toast } from 'sonner';

export const musteriServisi = {
  async getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      console.log('Getting dukkan ID for user:', user.id);
      
      // First check if user is an admin (dukkan owner)
      const { data: dukkanlar, error: dukkanError } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (dukkanError) {
        console.error('Dükkan bilgisi sorgulama hatası:', dukkanError);
      }
      
      if (dukkanlar && dukkanlar.id) {
        console.log('Dukkan ID (from dukkanlar):', dukkanlar.id);
        return dukkanlar.id;
      }
      
      // If not, check if user is staff
      const { data: personel, error: personelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
        
      if (personelError) {
        console.error('Personel bilgisi sorgulama hatası:', personelError);
      }
      
      if (personel && personel.dukkan_id) {
        console.log('Dukkan ID (from personel):', personel.dukkan_id);
        return personel.dukkan_id;
      }
      
      // Finally check the profile table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error('Profil bilgisi sorgulama hatası:', profileError);
      }
      
      if (profile && profile.dukkan_id) {
        console.log('Dukkan ID (from profile):', profile.dukkan_id);
        return profile.dukkan_id;
      }
      
      // If no dukkan ID found try to get user role
      const { data: userRole } = await supabase.rpc('get_user_role');
      
      if (userRole === 'admin') {
        console.log('User is admin but has no dukkan. Creating a new one.');
        
        // Get user's profile info for the name
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        const shopName = userProfile?.first_name 
          ? `${userProfile.first_name} ${userProfile.last_name || ''} İşletmesi`
          : 'Yeni İşletme';
          
        const shopCode = 'SH' + Math.floor(10000 + Math.random() * 90000);
        
        // Create a new dukkan for the admin
        const { data: newShop, error: newShopError } = await supabase
          .from('dukkanlar')
          .insert([{
            ad: shopName,
            kod: shopCode,
            sahibi_id: user.id,
            active: true
          }])
          .select();
          
        if (newShopError) {
          console.error('Yeni dükkan oluşturma hatası:', newShopError);
          throw newShopError;
        }
        
        if (newShop && newShop.length > 0) {
          console.log('Yeni dukkan oluşturuldu:', newShop[0].id);
          
          // Update the user's profile to link to this dukkan
          await supabase
            .from('profiles')
            .update({ dukkan_id: newShop[0].id })
            .eq('id', user.id);
            
          return newShop[0].id;
        }
      }
      
      console.log('Dükkan ID bulunamadı');
      return null;
    } catch (error) {
      console.error('Kullanıcı dükkanı getirme hatası:', error);
      throw error;
    }
  },

  async hepsiniGetir(dukkanId?: number | null) {
    try {
      let shopId = dukkanId;
      if (shopId === null || shopId === undefined) {
        shopId = await this.getCurrentUserDukkanId();
      }
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('first_name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Müşteri getirme hatası:', error);
      throw error;
    }
  },
  
  async getirById(id: number) {
    return this.getir(id);
  },
  
  async ekle(musteri: any) {
    try {
      console.log('Adding customer with data:', musteri);
      
      if (!musteri.dukkan_id) {
        musteri.dukkan_id = await this.getCurrentUserDukkanId();
        console.log('Retrieved dukkan_id for customer:', musteri.dukkan_id);
      }
      
      if (!musteri.dukkan_id) {
        console.error('No dukkan_id available for customer');
        toast.error('Dükkan bilgisi bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .insert([musteri])
        .select();
        
      if (error) {
        console.error('Müşteri ekleme hatası (DB):', error);
        throw error;
      }
      
      console.log('Customer added successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      throw error;
    }
  }
};

export default musteriServisi;
