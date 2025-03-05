import { supabase, supabaseAdmin } from '../client';
import { Musteri } from '../types';
import { toast } from 'sonner';

// API isteklerini tekrarlama ve backoff stratejisi ile yeniden deneme fonksiyonu
const retryFetch = async (fetchFn, maxRetries = 8, delay = 1000) => {
  let lastError = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Deneme ${i+1}/${maxRetries}`);
      return await fetchFn();
    } catch (error) {
      console.error(`Deneme ${i+1}/${maxRetries} başarısız:`, error);
      lastError = error;
      
      // API anahtarı hatası durumunda oturumu yenileme
      if (error.message?.includes('Invalid API key')) {
        console.error("API anahtarı hatası tespit edildi, oturumu yenilemeye çalışılıyor...");
        try {
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
          
          // Oturum anahtarını kontrol et
          if (data && data.session) {
            console.log("Oturum yenilendi:", "Başarılı");
          } else {
            console.error("Oturum yenilendi ama session yok!");
          }
        } catch (refreshError) {
          console.error("Oturum yenileme hatası:", refreshError);
        }
      }
      
      if (i < maxRetries - 1) {
        // Üstel artış ile bekleme süresi (exponential backoff)
        const retryDelay = delay * Math.pow(1.5, i);
        console.log(`${retryDelay/1000} saniye sonra tekrar deneniyor...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError; // Tüm denemeler başarısız olursa son hatayı fırlat
};

export const musteriServisi = {
  async hepsiniGetir() {
    return retryFetch(async () => {
      console.log("Müşteri listesi alınıyor...");
      
      // Her zaman admin istemcisini kullan (RLS'yi bypass etmek için)
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
        .order('first_name', { ascending: true }); // İsme göre alfabetik sırala

      if (error) {
        console.error("Müşterileri getirme hatası:", error);
        throw error;
      }
      
      console.log(`${data?.length || 0} müşteri başarıyla alındı`);
      
      // Her müşteri için işlem sayısını al
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
    }, 8); // Daha fazla deneme hakkı (8)
  },

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
    }, 8); // Daha fazla deneme hakkı (8)
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
    }, 8); // Daha fazla deneme hakkı (8)
  },

  async ekle(musteri: Partial<Musteri>) {
    return retryFetch(async () => {
      console.log("Müşteri ekleniyor, veriler:", musteri);
      
      // Önce oturumu yenileyelim
      try {
        await supabase.auth.refreshSession();
      } catch (err) {
        console.log("Ekleme öncesi oturum yenileme hatası (devam ediliyor):", err);
      }
      
      // Her zaman admin istemcisini kullan
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
      
      // Yeni müşteri için ilişkili kayıtları oluştur
      if (data && data.id) {
        try {
          // Müşteri kişisel verilerini ekle
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
          
          // Müşteri tercihlerini ekle
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
          // İlişkili kayıtlar başarısız olsa bile devam et
        }
      }
      
      return data;
    }, 8); // Daha fazla deneme hakkı (8)
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
    }, 8); // Daha fazla deneme hakkı (8)
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
    }, 8); // Daha fazla deneme hakkı (8)
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
    }, 8); // Daha fazla deneme hakkı (8)
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
    }, 8); // Daha fazla deneme hakkı (8)
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
    }, 8); // Daha fazla deneme hakkı (8)
  }
};
