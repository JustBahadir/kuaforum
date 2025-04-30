import { supabase } from "@/lib/supabase/client";
import { PersonelIslemi } from "../types";

export const personelIslemleriServisi = {
  async _getCurrentUserDukkanId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Try to get dukkan_id from user metadata first
    const dukkanIdFromMeta = user.user_metadata?.dukkan_id;
    if (dukkanIdFromMeta) return dukkanIdFromMeta;
    
    // If not in metadata, try profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('dukkan_id')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileData?.dukkan_id) return profileData.dukkan_id;
    
    // Finally try personel table
    const { data: personelData } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('auth_id', user.id)
      .maybeSingle();
    
    return personelData?.dukkan_id;
  },

  hepsiniGetir: async () => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (id, ad_soyad, dukkan_id),
          musteri:musteri_id (id, first_name, last_name, phone, dukkan_id),
          islem:islem_id (id, islem_adi, fiyat, kategori_id)
        `)
        .eq('personel.dukkan_id', dukkanId); // Filter by shop

      if (error) {
        console.error('Personel işlemleri getirme hatası:', error);
        throw error;
      }

      // Process operations for other shops
      interface PersonelData {
        dukkan_id?: number;
      }
      
      interface MusteriData {
        dukkan_id?: number;
      }
      
      const filteredData = data.filter(item => {
        const personel = item.personel as PersonelData | null;
        const musteri = item.musteri as MusteriData | null;
        
        return (personel && personel.dukkan_id === dukkanId) && 
               (!musteri || (musteri && musteri.dukkan_id === dukkanId));
      });

      return filteredData || [];
    } catch (err) {
      console.error('Personel işlemleri getirme hatası:', err);
      return [];
    }
  },

  getir: async (id: number) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (id, ad_soyad, dukkan_id),
          musteri:musteri_id (id, first_name, last_name, phone, dukkan_id),
          islem:islem_id (id, islem_adi, fiyat, kategori_id)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Personel işlemi getirme hatası:', error);
        throw error;
      }

      // Ensure the operation belongs to current shop
      interface PersonelData {
        dukkan_id?: number;
      }
      
      interface MusteriData {
        dukkan_id?: number;
      }
      
      const personel = data.personel as PersonelData | null;
      const musteri = data.musteri as MusteriData | null;

      if ((personel && personel.dukkan_id !== dukkanId) || 
          (musteri && musteri.dukkan_id !== dukkanId)) {
        throw new Error('Bu işlem sizin işletmenize ait değil');
      }

      return data;
    } catch (err) {
      console.error('Personel işlemi getirme hatası:', err);
      throw err;
    }
  },

  personelIslemleriGetir: async (personelId: number) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        return [];
      }

      // First verify this personnel belongs to our business
      const { data: personnelData, error: personnelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', personelId)
        .single();

      if (personnelError || (personnelData && personnelData.dukkan_id !== dukkanId)) {
        console.error('Bu personel sizin işletmenize ait değil');
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (id, ad_soyad, dukkan_id),
          musteri:musteri_id (id, first_name, last_name, phone, dukkan_id),
          islem:islem_id (id, islem_adi, fiyat, kategori_id)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Personel işlemleri getirme hatası:', error);
        throw error;
      }

      // Additional filter to ensure only operations from this shop are shown
      interface PersonelData {
        dukkan_id?: number;
      }
      
      interface MusteriData {
        dukkan_id?: number;
      }
      
      const filteredData = data.filter(item => {
        const personel = item.personel as PersonelData | null;
        const musteri = item.musteri as MusteriData | null;
        
        return (personel && personel.dukkan_id === dukkanId) && 
               (!musteri || (musteri && musteri.dukkan_id === dukkanId));
      });

      return filteredData || [];
    } catch (err) {
      console.error('Personel işlemleri getirme hatası:', err);
      return [];
    }
  },

  getirByMusteriId: async (musteriId: number) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        return [];
      }

      // First verify this customer belongs to our business
      const { data: customerData, error: customerError } = await supabase
        .from('musteriler')
        .select('dukkan_id')
        .eq('id', musteriId)
        .single();

      if (customerError || (customerData && customerData.dukkan_id !== dukkanId)) {
        console.error('Bu müşteri sizin işletmenize ait değil');
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (id, ad_soyad, dukkan_id),
          musteri:musteri_id (id, first_name, last_name, phone, dukkan_id),
          islem:islem_id (id, islem_adi, fiyat, kategori_id)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Müşteri işlemleri getirme hatası:', error);
        throw error;
      }

      // Additional filter to ensure only operations from this shop are shown
      interface PersonelData {
        dukkan_id?: number;
      }
      
      interface MusteriData {
        dukkan_id?: number;
      }
      
      const filteredData = data.filter(item => {
        const personel = item.personel as PersonelData | null;
        const musteri = item.musteri as MusteriData | null;
        
        return (!personel || (personel && personel.dukkan_id === dukkanId)) && 
               (musteri && musteri.dukkan_id === dukkanId);
      });

      return filteredData || [];
    } catch (err) {
      console.error('Müşteri işlemleri getirme hatası:', err);
      return [];
    }
  },

  ekle: async (data: any) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // Verify personnel belongs to this shop
      if (data.personel_id) {
        const { data: personnelData, error: personnelError } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('id', data.personel_id)
          .single();

        if (personnelError || personnelData?.dukkan_id !== dukkanId) {
          throw new Error('Bu personel sizin işletmenize ait değil');
        }
      }

      // Verify customer belongs to this shop
      if (data.musteri_id) {
        const { data: customerData, error: customerError } = await supabase
          .from('musteriler')
          .select('dukkan_id')
          .eq('id', data.musteri_id)
          .single();

        if (customerError || customerData?.dukkan_id !== dukkanId) {
          throw new Error('Bu müşteri sizin işletmenize ait değil');
        }
      }

      const { data: result, error } = await supabase
        .from('personel_islemleri')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Personel işlemi ekleme hatası:', error);
        throw error;
      }

      await personelIslemleriServisi.updateShopStatistics();

      return result;
    } catch (error) {
      console.error('Personel işlemi ekleme hatası:', error);
      throw error;
    }
  },

  guncelle: async (id: number, data: any) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // Get the operation and verify it belongs to this shop
      const { data: operationData, error: operationError } = await supabase
        .from('personel_islemleri')
        .select(`
          personel_id,
          musteri_id,
          personel:personel_id (dukkan_id),
          musteri:musteri_id (dukkan_id)
        `)
        .eq('id', id)
        .single();

      if (operationError || 
          operationData.personel?.dukkan_id !== dukkanId || 
          operationData.musteri?.dukkan_id !== dukkanId) {
        throw new Error('Bu işlem sizin işletmenize ait değil');
      }

      // Verify new personnel belongs to this shop if changing
      if (data.personel_id && data.personel_id !== operationData.personel_id) {
        const { data: personnelData, error: personnelError } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('id', data.personel_id)
          .single();

        if (personnelError || personnelData?.dukkan_id !== dukkanId) {
          throw new Error('Bu personel sizin işletmenize ait değil');
        }
      }

      // Verify new customer belongs to this shop if changing
      if (data.musteri_id && data.musteri_id !== operationData.musteri_id) {
        const { data: customerData, error: customerError } = await supabase
          .from('musteriler')
          .select('dukkan_id')
          .eq('id', data.musteri_id)
          .single();

        if (customerError || customerData?.dukkan_id !== dukkanId) {
          throw new Error('Bu müşteri sizin işletmenize ait değil');
        }
      }

      const { data: result, error } = await supabase
        .from('personel_islemleri')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Personel işlemi güncelleme hatası:', error);
        throw error;
      }

      await personelIslemleriServisi.updateShopStatistics();

      return result;
    } catch (error) {
      console.error('Personel işlemi güncelleme hatası:', error);
      throw error;
    }
  },

  sil: async (id: number) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // Get the operation and verify it belongs to this shop
      const { data: operationData, error: operationError } = await supabase
        .from('personel_islemleri')
        .select(`
          personel:personel_id (dukkan_id),
          musteri:musteri_id (dukkan_id)
        `)
        .eq('id', id)
        .single();

      if (operationError) {
        throw operationError;
      }
      
      // Fix the type issues by properly casting the nested objects
      const personel = operationData.personel as { dukkan_id?: number } | null;
      const musteri = operationData.musteri as { dukkan_id?: number } | null;
      
      if ((personel && personel.dukkan_id !== dukkanId) || 
          (musteri && musteri.dukkan_id !== dukkanId)) {
        throw new Error('Bu işlem sizin işletmenize ait değil');
      }

      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Personel işlemi silme hatası:', error);
        throw error;
      }

      await personelIslemleriServisi.updateShopStatistics();

      return true;
    } catch (error) {
      console.error('Personel işlemi silme hatası:', error);
      throw error;
    }
  },

  personelPerformansRaporu: async (personelId: number, startDate: string, endDate: string) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // Verify personnel belongs to this shop
      const { data: personnelData, error: personnelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', personelId)
        .single();

      if (personnelError || personnelData?.dukkan_id !== dukkanId) {
        throw new Error('Bu personel sizin işletmenize ait değil');
      }

      const { data, error } = await supabase
        .rpc('personel_performans_raporu', { 
          p_personel_id: personelId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) {
        console.error('Personel performans raporu hatası:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Personel performans raporu hatası:', error);
      throw error;
    }
  },

  updateShopStatistics: async () => {
    try {
      // Get current user's shop ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Authenticated user not found");
        return null;
      }
      
      // Fetch the shop ID from user's metadata
      let dukkanId: number | null = null;
      
      if (user.user_metadata?.role === 'admin') {
        const { data: shopData } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('sahibi_id', user.id)
          .single();
          
        if (shopData) {
          dukkanId = shopData.id;
        }
      } else if (user.user_metadata?.role === 'staff') {
        const { data: staffData } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (staffData) {
          dukkanId = staffData.dukkan_id;
        }
      }
      
      if (!dukkanId) {
        console.warn("No shop ID found for user");
        return null;
      }
      
      // Fetch all staff for the shop
      const { data: personelData } = await supabase
        .from('personel')
        .select('id, ad_soyad, calisma_sistemi, maas, prim_yuzdesi')
        .eq('dukkan_id', dukkanId);
        
      if (!personelData || personelData.length === 0) {
        console.warn("No personnel found for shop");
        return null;
      }
      
      // Create a mapping of personnel IDs to their names and other details
      const personelMap = personelData.reduce((acc, p) => {
        acc[p.id] = {
          ad_soyad: p.ad_soyad,
          calisma_sistemi: p.calisma_sistemi,
          maas: p.maas,
          prim_yuzdesi: p.prim_yuzdesi
        };
        return acc;
      }, {} as Record<string, any>);
      
      // Calculate statistics for each staff member
      for (const personel of personelData) {
        const personelId = personel.id;
        
        // Get operations for this staff member
        const { data: islemler } = await supabase
          .from('personel_islemleri')
          .select('*')
          .eq('personel_id', personelId);
          
        if (!islemler || islemler.length === 0) {
          continue;
        }
        
        const islemSayisi = islemler.length;
        const toplamCiro = islemler.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
        const toplamOdenen = islemler.reduce((sum, islem) => sum + (islem.odenen || 0), 0);
        const ciroYuzdesi = (toplamOdenen / toplamCiro) * 100;
        const toplamPuan = islemler.reduce((sum, islem) => sum + (islem.puan || 0), 0);
        const ortalamaPuan = islemSayisi > 0 ? (toplamPuan / islemSayisi) : 0;
        
        // Update or insert the performance record
        const { error } = await supabase
          .from('personel_performans')
          .upsert({
            id: personelId,
            ad_soyad: personel.ad_soyad,
            islem_sayisi: islemSayisi,
            toplam_ciro: toplamCiro,
            toplam_odenen: toplamOdenen,
            ciro_yuzdesi: ciroYuzdesi,
            ortalama_puan: ortalamaPuan
          });
          
        if (error) {
          console.error("Error updating staff performance:", error);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error updating shop statistics:", error);
      return { success: false, error };
    }
  },

  async getShopStatistics(dukkanId: number) {
    if (!dukkanId) {
      throw new Error("Shop ID is required");
    }
    
    try {
      // Get personnel for this shop
      const { data: personelData, error: personelError } = await supabase
        .from('personel')
        .select('id, ad_soyad, dukkan_id')
        .eq('dukkan_id', dukkanId);
        
      if (personelError) throw personelError;
      
      if (!personelData || personelData.length === 0) {
        return {
          totalRevenue: 0,
          totalOperations: 0,
          averageOperationValue: 0,
          topStaff: [],
          recentOperations: []
        };
      }
      
      const personelIds = personelData.map(p => p.id);
      
      // Get all operations for this shop's personnel
      const { data: allOperations, error: opsError } = await supabase
        .from('personel_islemleri')
        .select(`
          id, tutar, odenen, personel_id, created_at, 
          personel:personel_id (ad_soyad, dukkan_id),
          musteri:musteri_id (first_name, last_name)
        `)
        .in('personel_id', personelIds)
        .order('created_at', { ascending: false });
        
      if (opsError) throw opsError;
      
      if (!allOperations || allOperations.length === 0) {
        return {
          totalRevenue: 0,
          totalOperations: 0,
          averageOperationValue: 0,
          topStaff: [],
          recentOperations: []
        };
      }
      
      // Filter out operations for other shops
      const dukkanOperations = allOperations.filter(op => {
        const personel = op.personel as { dukkan_id?: number } | null;
        return personel && personel.dukkan_id === dukkanId;
      });
      
      // Calculate statistics
      const totalRevenue = dukkanOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
      const totalOperations = dukkanOperations.length;
      const averageOperationValue = totalOperations > 0 ? (totalRevenue / totalOperations) : 0;
      
      // Get top staff by revenue
      const staffStats = personelIds.map(pid => {
        const staffOps = dukkanOperations.filter(op => op.personel_id === pid);
        const staffRevenue = staffOps.reduce((sum, op) => sum + (op.tutar || 0), 0);
        const staffOperations = staffOps.length;
        const staffMember = personelData.find(p => p.id === pid);
        
        return {
          id: pid,
          name: staffMember?.ad_soyad || 'Unknown',
          revenue: staffRevenue,
          operations: staffOperations,
          averageValue: staffOperations > 0 ? (staffRevenue / staffOperations) : 0
        };
      });
      
      const topStaff = staffStats
        .filter(staff => staff.operations > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Get recent operations
      interface MusteriData {
        first_name?: string;
        last_name?: string;
      }
      
      const recentOperations = dukkanOperations
        .slice(0, 5)
        .map(op => {
          const personel = op.personel as { ad_soyad?: string } | null;
          const musteri = op.musteri as MusteriData | null;
          
          return {
            id: op.id,
            amount: op.tutar || 0,
            staffId: op.personel_id,
            staffName: personel ? personel.ad_soyad || 'Unknown' : 'Unknown',
            customerName: musteri 
              ? `${musteri.first_name || ''} ${musteri.last_name || ''}`
              : 'Unknown Customer',
            date: op.created_at
          };
        });
      
      return {
        totalRevenue,
        totalOperations,
        averageOperationValue,
        topStaff,
        recentOperations
      };
    } catch (error) {
      console.error("Error getting shop statistics:", error);
      throw error;
    }
  }
};
