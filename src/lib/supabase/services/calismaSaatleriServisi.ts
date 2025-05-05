
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const calismaSaatleriServisi = {
  // Dükkanın çalışma saatlerini getir
  async dukkanSaatleriGetir(dukkanId: string): Promise<CalismaSaati[]> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId);
      
      if (error) throw error;
      
      // Eğer data boşsa veya yoksa varsayılan saatleri oluştur
      if (!data || data.length === 0) {
        return this.varsayilanSaatleriOlustur(dukkanId);
      }
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Çalışma saatleri getirilirken hata:', error);
      return [];
    }
  },
  
  // Varsayılan çalışma saatleri oluştur
  async varsayilanSaatleriOlustur(dukkanId: string): Promise<CalismaSaati[]> {
    const gunler = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    const simdikiZaman = new Date().toISOString();
    
    const saatler = gunler.map(gun => ({
      id: uuidv4(),
      dukkan_id: dukkanId,
      gun,
      acilis: "09:00",
      kapanis: "18:00",
      kapali: gun === "Pazar",
      created_at: simdikiZaman,
      updated_at: simdikiZaman
    }));
    
    try {
      const { error } = await supabase
        .from('calisma_saatleri')
        .insert(saatler);
      
      if (error) throw error;
      
      return saatler as CalismaSaati[];
    } catch (error) {
      console.error('Varsayılan saatler oluşturulurken hata:', error);
      return saatler as CalismaSaati[];
    }
  },
  
  // Çalışma saatlerini güncelle
  async saatleriKaydet(saatler: CalismaSaati[]): Promise<boolean> {
    try {
      // Önce tüm mevcut saatleri sil
      const { error: silmeHata } = await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('dukkan_id', saatler[0]?.dukkan_id);
      
      if (silmeHata) throw silmeHata;
      
      // Sonra yeni saatleri ekle
      const { error: eklemeHata } = await supabase
        .from('calisma_saatleri')
        .insert(saatler.map(saat => ({
          ...saat,
          updated_at: new Date().toISOString()
        })));
      
      if (eklemeHata) throw eklemeHata;
      
      return true;
    } catch (error) {
      console.error('Saatler kaydedilirken hata:', error);
      return false;
    }
  },

  // Mevcut dükkânın ID'sini al
  async getCurrentDukkanId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      // Kullanıcı rolünü kontrol et
      const { data: kullanici, error: kullaniciHata } = await supabase
        .from('kullanicilar')
        .select('rol')
        .eq('kimlik', user.id)
        .single();
      
      if (kullaniciHata || !kullanici) return null;
      
      if (kullanici.rol === 'isletme_sahibi') {
        // İşletme sahibi için dükkanı getir
        const { data: isletme, error: isletmeHata } = await supabase
          .from('isletmeler')
          .select('kimlik')
          .eq('sahip_kimlik', user.id)
          .single();
        
        if (isletmeHata || !isletme) return null;
        
        return isletme.kimlik;
      } else if (kullanici.rol === 'personel') {
        // Personel için dükkanı getir
        const { data: personel, error: personelHata } = await supabase
          .from('personeller')
          .select('isletme_kimlik')
          .eq('kullanici_kimlik', user.id)
          .single();
        
        if (personelHata || !personel || !personel.isletme_kimlik) return null;
        
        return personel.isletme_kimlik;
      }
      
      return null;
    } catch (error) {
      console.error('Dükkan ID alınırken hata:', error);
      return null;
    }
  }
};
