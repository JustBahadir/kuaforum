
import { supabase } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  async hepsiniGetir() {
    try {
      // Basitleştirilmiş sorgu - sonsuz özyineleme sorununu önlemek için
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          birthdate,
          created_at
        `);

      if (error) throw error;
      
      // Get the operations count for each customer
      const enrichedCustomers = await Promise.all((data || []).map(async (customer) => {
        try {
          const { count, error: countError } = await supabase
            .from('personel_islemleri')
            .select('id', { count: 'exact', head: true })
            .eq('musteri_id', customer.id);
            
          return {
            ...customer,
            total_services: countError ? 0 : count || 0
          };
        } catch (err) {
          console.error("Error fetching customer operations count:", err);
          return {
            ...customer,
            total_services: 0
          };
        }
      }));
      
      return enrichedCustomers;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  async istatistiklerGetir() {
    try {
      // İlk olarak tüm müşterileri alalım
      const { data: musteriler, error: musteriError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          created_at
        `);

      if (musteriError) throw musteriError;

      // Tüm randevuları alalım
      const { data: randevular, error: randevuError } = await supabase
        .from('randevular')
        .select('*');

      if (randevuError) throw randevuError;

      // Tüm personel işlemlerini alalım
      const { data: islemler, error: islemError } = await supabase
        .from('personel_islemleri')
        .select('*');

      if (islemError) throw islemError;

      // Her müşteri için istatistikleri hesaplayalım
      const sonuclar = musteriler?.map(musteri => {
        const musteriRandevulari = randevular?.filter(r => r.customer_id === musteri.id) || [];
        const musteriIslemleri = islemler?.filter(i => i.musteri_id === musteri.id) || [];
        
        return {
          ...musteri,
          total_appointments: musteriRandevulari.length,
          total_services: musteriIslemleri.length
        };
      }) || [];

      return sonuclar;
    } catch (error) {
      console.error("Error fetching customer statistics:", error);
      throw error;
    }
  },

  async ara(aramaMetni: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          birthdate,
          created_at
        `)
        .or(`first_name.ilike.%${aramaMetni}%,last_name.ilike.%${aramaMetni}%,phone.ilike.%${aramaMetni}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching customers:", error);
      throw error;
    }
  },

  async ekle(musteri: Partial<Musteri>) {
    try {
      console.log("Adding customer with data:", musteri);
      
      // Basitleştirilmiş sorgu - sonsuz özyineleme sorununu önlemek için
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          first_name: musteri.first_name || '',
          last_name: musteri.last_name || '',
          phone: musteri.phone,
          birthdate: musteri.birthdate,
          role: 'customer'
        }])
        .select()
        .single();

      if (error) {
        console.error("Error in profiles insert:", error);
        throw error;
      }
      
      console.log("Customer added successfully:", data);
      
      // Yeni müşteri için customer_personal_data ve customer_preferences tablolarında kayıt oluştur
      if (data && data.id) {
        try {
          // Müşteri kişisel verileri ekle
          const personalDataPayload: any = {
            customer_id: data.id
          };
          
          if (musteri.birthdate) {
            personalDataPayload.birth_date = musteri.birthdate;
          }
          
          const { error: personalDataError } = await supabase
            .from('customer_personal_data')
            .insert([personalDataPayload]);
            
          if (personalDataError) {
            console.error("Error adding customer personal data:", personalDataError);
          }
          
          // Müşteri tercihlerini ekle
          const { error: preferencesError } = await supabase
            .from('customer_preferences')
            .insert([{
              customer_id: data.id
            }]);
            
          if (preferencesError) {
            console.error("Error adding customer preferences:", preferencesError);
          }
        } catch (err) {
          console.error("Error creating related customer records:", err);
          // Ana profil oluşturuldu, ilgili tablolarda hatalar olsa bile devam edeceğiz
        }
      }
      
      return data;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  },

  async guncelle(id: string, musteri: Partial<Musteri>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(musteri)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },
  
  async getirKisiselBilgileri(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching customer personal data:", error);
      throw error;
    }
  },
  
  async guncelleKisiselBilgileri(customerId: string, bilgiler: any) {
    try {
      const { data: existing } = await supabase
        .from('customer_personal_data')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (existing) {
        // Kayıt varsa güncelle
        const { data, error } = await supabase
          .from('customer_personal_data')
          .update(bilgiler)
          .eq('customer_id', customerId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Kayıt yoksa oluştur
        const { data, error } = await supabase
          .from('customer_personal_data')
          .insert({
            customer_id: customerId,
            ...bilgiler
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error("Error updating customer personal data:", error);
      throw error;
    }
  },
  
  async getirTercihleri(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching customer preferences:", error);
      throw error;
    }
  },
  
  async guncelleTercihleri(customerId: string, tercihler: any) {
    try {
      const { data: existing } = await supabase
        .from('customer_preferences')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (existing) {
        // Kayıt varsa güncelle
        const { data, error } = await supabase
          .from('customer_preferences')
          .update(tercihler)
          .eq('customer_id', customerId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Kayıt yoksa oluştur
        const { data, error } = await supabase
          .from('customer_preferences')
          .insert({
            customer_id: customerId,
            ...tercihler
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error("Error updating customer preferences:", error);
      throw error;
    }
  }
};
