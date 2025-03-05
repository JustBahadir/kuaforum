import { supabase, supabaseAdmin, refreshSupabaseSession } from '../client';
import { Musteri } from '../types';
import { toast } from 'sonner';

// Müşteri hizmetleri sınıfı
export const musteriServisi = {
  // Müşterileri getirme fonksiyonu - hızlandırıldı, daha az yeniden deneme
  async hepsiniGetir() {
    try {
      console.log("Müşteri listesi alınıyor...");
      
      // Bağlantıyı yenilemeyi dene
      await refreshSupabaseSession();
      
      // Admin istemcisi ile veri çekme
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
        .order('first_name', { ascending: true });

      if (error) {
        console.error("Müşterileri getirme hatası:", error);
        throw error;
      }
      
      console.log(`${data?.length || 0} müşteri başarıyla alındı`);
      
      // Daha hızlı olması için işlem sayısı eklemeden döndür
      return data || [];
      
    } catch (error: any) {
      console.error("Müşteri listesi alma hatası:", error);
      
      // API anahtarı hatası durumunda bir daha dene
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();
          
          // Tekrar dene
          const { data, error: retryError } = await supabaseAdmin
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
            .order('first_name', { ascending: true });
            
          if (retryError) throw retryError;
          return data || [];
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      
      throw error;
    }
  },

  // Yeni müşteri ekleme - basitleştirildi ve hızlandırıldı
  async ekle(musteri: Partial<Musteri>) {
    try {
      console.log("Müşteri ekleniyor:", musteri);
      
      // Bağlantıyı yenile
      await refreshSupabaseSession();
      
      // Müşteri profili ekle
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
        console.error("Müşteri ekleme hatası:", error);
        throw error;
      }
      
      console.log("Müşteri başarıyla eklendi:", data);
      return data;
      
    } catch (error: any) {
      console.error("Müşteri ekleme hatası:", error);
      
      // API anahtarı hatası durumunda bir daha dene
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();
          
          // Tekrar dene (sadece bir kez)
          const { data, error: retryError } = await supabaseAdmin
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
            
          if (retryError) throw retryError;
          return data;
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      
      throw error;
    }
  },

  async guncelle(id: string, musteri: Partial<Musteri>) {
    try {
      console.log(`Müşteri güncelleniyor: ${id}`, musteri);
      await refreshSupabaseSession();
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(musteri)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Müşteri güncelleme hatası:", error);
        throw error;
      }
      console.log("Müşteri başarıyla güncellendi:", data);
      return data;
    } catch (error: any) {
      console.error("Müşteri güncelleme sırasında hata:", error);
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();
          const { data, error: retryError } = await supabaseAdmin
            .from('profiles')
            .update(musteri)
            .eq('id', id)
            .select()
            .single();
          if (retryError) throw retryError;
          return data;
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      throw error;
    }
  },

  async ara(aramaMetni: string) {
    try {
      console.log(`Müşteri aranıyor: ${aramaMetni}`);
      await refreshSupabaseSession();
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

      if (error) {
        console.error("Müşteri arama hatası:", error);
        throw error;
      }
      console.log(`${data?.length || 0} müşteri bulundu.`);
      return data || [];
    } catch (error: any) {
      console.error("Müşteri arama sırasında hata:", error);
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();
          const { data, error: retryError } = await supabaseAdmin
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
          if (retryError) throw retryError;
          return data || [];
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      throw error;
    }
  },

  async istatistiklerGetir() {
    try {
      console.log("Müşteri istatistikleri alınıyor...");
      await refreshSupabaseSession();

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

      if (musteriError) {
        console.error("Müşteri istatistikleri alınırken müşteri hatası:", musteriError);
        throw musteriError;
      }

      // Tüm randevuları alalım - admin istemcisi kullan
      const { data: randevular, error: randevuError } = await supabaseAdmin
        .from('randevular')
        .select('*');

      if (randevuError) {
        console.error("Müşteri istatistikleri alınırken randevu hatası:", randevuError);
        throw randevuError;
      }

      // Tüm personel işlemlerini alalım - admin istemcisi kullan
      const { data: islemler, error: islemError } = await supabaseAdmin
        .from('personel_islemleri')
        .select('*');

      if (islemError) {
        console.error("Müşteri istatistikleri alınırken işlem hatası:", islemError);
        throw islemError;
      }

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

      console.log(`${sonuclar?.length || 0} müşteri istatistiği hesaplandı.`);
      return sonuclar;
    } catch (error: any) {
      console.error("Müşteri istatistikleri alınırken genel hata:", error);
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();

          // Tüm müşterileri alalım - admin istemcisi kullan
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
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      throw error;
    }
  },
  
  async getirKisiselBilgileri(customerId: string) {
    try {
      console.log(`Müşteri kişisel bilgileri getiriliyor: ${customerId}`);
      await refreshSupabaseSession();
      const { data, error } = await supabaseAdmin
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) {
        console.error("Müşteri kişisel bilgileri getirme hatası:", error);
        throw error;
      }
      console.log("Müşteri kişisel bilgileri:", data);
      return data;
    } catch (error: any) {
      console.error("Müşteri kişisel bilgileri getirme sırasında hata:", error);
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();
          const { data, error: retryError } = await supabaseAdmin
            .from('customer_personal_data')
            .select('*')
            .eq('customer_id', customerId)
            .maybeSingle();
            
          if (retryError) throw retryError;
          return data;
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      throw error;
    }
  },
  
  async guncelleKisiselBilgileri(customerId: string, bilgiler: any) {
    try {
      console.log(`Müşteri kişisel bilgileri güncelleniyor: ${customerId}`, bilgiler);
      await refreshSupabaseSession();
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
          
        if (error) {
          console.error("Müşteri kişisel bilgileri güncelleme hatası:", error);
          throw error;
        }
        console.log("Müşteri kişisel bilgileri başarıyla güncellendi:", data);
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
          
        if (error) {
          console.error("Müşteri kişisel bilgileri ekleme hatası:", error);
          throw error;
        }
        console.log("Müşteri kişisel bilgileri başarıyla eklendi:", data);
        return data;
      }
    } catch (error: any) {
      console.error("Müşteri kişisel bilgileri güncelleme sırasında hata:", error);
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();
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
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      throw error;
    }
  },
  
  async getirTercihleri(customerId: string) {
    try {
      console.log(`Müşteri tercihleri getiriliyor: ${customerId}`);
      await refreshSupabaseSession();
      const { data, error } = await supabaseAdmin
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) {
        console.error("Müşteri tercihleri getirme hatası:", error);
        throw error;
      }
      console.log("Müşteri tercihleri:", data);
      return data;
    } catch (error: any) {
      console.error("Müşteri tercihleri getirme sırasında hata:", error);
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();
          const { data, error: retryError } = await supabaseAdmin
            .from('customer_preferences')
            .select('*')
            .eq('customer_id', customerId)
            .maybeSingle();
            
          if (retryError) throw retryError;
          return data;
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      throw error;
    }
  },
  
  async guncelleTercihleri(customerId: string, tercihler: any) {
    try {
      console.log(`Müşteri tercihleri güncelleniyor: ${customerId}`, tercihler);
      await refreshSupabaseSession();
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
          
        if (error) {
          console.error("Müşteri tercihleri güncelleme hatası:", error);
          throw error;
        }
        console.log("Müşteri tercihleri başarıyla güncellendi:", data);
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
          
        if (error) {
          console.error("Müşteri tercihleri ekleme hatası:", error);
          throw error;
        }
        console.log("Müşteri tercihleri başarıyla eklendi:", data);
        return data;
      }
    } catch (error: any) {
      console.error("Müşteri tercihleri güncelleme sırasında hata:", error);
      if (error.message?.includes('Invalid API key')) {
        try {
          await refreshSupabaseSession();
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
        } catch (retryErr) {
          console.error("Tekrar denemede hata:", retryErr);
          throw retryErr;
        }
      }
      throw error;
    }
  }
};
