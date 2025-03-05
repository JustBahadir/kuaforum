
import { supabase, supabaseAdmin } from '../client';
import { Musteri } from '../types';
import { toast } from 'sonner';

// Helper function to retry API requests with exponential backoff
const retryFetch = async (fetchFn, maxRetries = 3, delay = 500) => {
  let lastError = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Deneme ${i+1}/${maxRetries}`);
      return await fetchFn();
    } catch (error) {
      console.error(`Deneme ${i+1}/${maxRetries} başarısız:`, error);
      lastError = error;
      
      if (error.message?.includes('Invalid API key')) {
        console.error("API anahtarı hatası tespit edildi, oturumu yenilemeye çalışılıyor...");
        try {
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
          console.log("Oturum yenilendi:", session ? "Başarılı" : "Başarısız");
        } catch (refreshError) {
          console.error("Oturum yenileme hatası:", refreshError);
        }
      }
      
      if (i < maxRetries - 1) {
        const retryDelay = delay * Math.pow(2, i); // Exponential backoff
        console.log(`${retryDelay/1000} saniye sonra tekrar deneniyor...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError; // Throw the last error if all retries fail
};

export const musteriServisi = {
  async hepsiniGetir() {
    return retryFetch(async () => {
      console.log("Müşteri listesi alınıyor...");
      
      // Always use admin client to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          birthdate,
          created_at
        `)
        .eq('role', 'customer')
        .order('first_name', { ascending: true }); // Alphabetical order by first name

      if (error) {
        console.error("Müşterileri getirme hatası:", error);
        throw error;
      }
      
      console.log(`${data?.length || 0} müşteri başarıyla alındı`);
      
      // Get the operations count for each customer
      const enrichedCustomers = await Promise.all((data || []).map(async (customer) => {
        try {
          const { count, error: countError } = await supabaseAdmin
            .from('personel_islemleri')
            .select('id', { count: 'exact', head: true })
            .eq('musteri_id', customer.id);
            
          return {
            ...customer,
            total_services: countError ? 0 : count || 0
          };
        } catch (err) {
          console.error("Müşteri işlem sayısı alınamadı:", err);
          return {
            ...customer,
            total_services: 0
          };
        }
      }));
      
      return enrichedCustomers;
    });
  },

  // Diğer fonksiyonlarda da benzer değişiklikler yapıyoruz...
  async istatistiklerGetir() {
    return retryFetch(async () => {
      // İlk olarak tüm müşterileri alalım - admin istemcisi kullan
      const { data: musteriler, error: musteriError } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          created_at
        `)
        .eq('role', 'customer');

      if (musteriError) throw musteriError;

      // Tüm randevuları alalım - admin istemcisi kullan
      const { data: randevular, error: randevuError } = await supabaseAdmin
        .from('randevular')
        .select('*');

      if (randevuError) throw randevuError;

      // Tüm personel işlemlerini alalım - admin istemcisi kullan
      const { data: islemler, error: islemError } = await supabaseAdmin
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
    });
  },

  async ara(aramaMetni: string) {
    return retryFetch(async () => {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          birthdate,
          created_at
        `)
        .eq('role', 'customer')
        .or(`first_name.ilike.%${aramaMetni}%,last_name.ilike.%${aramaMetni}%,phone.ilike.%${aramaMetni}%`);

      if (error) throw error;
      return data || [];
    });
  },

  async ekle(musteri: Partial<Musteri>) {
    return retryFetch(async () => {
      console.log("Müşteri ekleniyor, veriler:", musteri);
      
      // Using admin client to bypass RLS
      const { data, error } = await supabaseAdmin
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
        console.error("Profil ekleme hatası:", error);
        throw error;
      }
      
      console.log("Müşteri başarıyla eklendi:", data);
      
      // Create related records for the new customer
      if (data && data.id) {
        try {
          // Add customer personal data
          const personalDataPayload: any = {
            customer_id: data.id
          };
          
          if (musteri.birthdate) {
            personalDataPayload.birth_date = musteri.birthdate;
          }
          
          const { error: personalDataError } = await supabaseAdmin
            .from('customer_personal_data')
            .insert([personalDataPayload]);
            
          if (personalDataError) {
            console.error("Kişisel veri ekleme hatası:", personalDataError);
          }
          
          // Add customer preferences
          const { error: preferencesError } = await supabaseAdmin
            .from('customer_preferences')
            .insert([{
              customer_id: data.id
            }]);
            
          if (preferencesError) {
            console.error("Tercih ekleme hatası:", preferencesError);
          }
        } catch (err) {
          console.error("İlgili müşteri kayıtlarını oluşturma hatası:", err);
          // Continue even if related records fail
        }
      }
      
      return data;
    });
  },

  async guncelle(id: string, musteri: Partial<Musteri>) {
    return retryFetch(async () => {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(musteri)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  },
  
  async getirKisiselBilgileri(customerId: string) {
    return retryFetch(async () => {
      const { data, error } = await supabaseAdmin
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    });
  },
  
  async guncelleKisiselBilgileri(customerId: string, bilgiler: any) {
    return retryFetch(async () => {
      const { data: existing } = await supabaseAdmin
        .from('customer_personal_data')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (existing) {
        // Kayıt varsa güncelle
        const { data, error } = await supabaseAdmin
          .from('customer_personal_data')
          .update(bilgiler)
          .eq('customer_id', customerId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Kayıt yoksa oluştur
        const { data, error } = await supabaseAdmin
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
    });
  },
  
  async getirTercihleri(customerId: string) {
    return retryFetch(async () => {
      const { data, error } = await supabaseAdmin
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    });
  },
  
  async guncelleTercihleri(customerId: string, tercihler: any) {
    return retryFetch(async () => {
      const { data: existing } = await supabaseAdmin
        .from('customer_preferences')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (existing) {
        // Kayıt varsa güncelle
        const { data, error } = await supabaseAdmin
          .from('customer_preferences')
          .update(tercihler)
          .eq('customer_id', customerId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Kayıt yoksa oluştur
        const { data, error } = await supabaseAdmin
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
    });
  }
};
