
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Calendar, Scissors, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { personelServisi, personelIslemleriServisi, islemServisi, kategoriServisi, supabase } from "@/lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<'none' | 'customer' | 'personnel'>('none');
  const [loading, setLoading] = useState(false);

  const ekleTestVerileri = async () => {
    try {
      setLoading(true);
      
      // Önce mevcut personeli kontrol edelim
      const personeller = await personelServisi.hepsiniGetir();
      let nimetId = 0;
      let ergunId = 0;
      
      // Nimet ve Ergün personelinin varlığını kontrol edelim
      const nimetPersonel = personeller.find(p => p.ad_soyad.includes("Nimet"));
      const ergunPersonel = personeller.find(p => p.ad_soyad.includes("Ergün"));
      
      // Eğer personel yoksa ekleyelim
      if (!nimetPersonel) {
        const yeniNimet = await personelServisi.ekle({
          personel_no: "P001",
          ad_soyad: "Nimet Yılmaz",
          telefon: "05551112233",
          eposta: "nimet@example.com",
          adres: "İstanbul",
          maas: 15000,
          calisma_sistemi: "haftalik",
          prim_yuzdesi: 15
        });
        nimetId = yeniNimet.id;
      } else {
        nimetId = nimetPersonel.id;
      }
      
      if (!ergunPersonel) {
        const yeniErgun = await personelServisi.ekle({
          personel_no: "P002",
          ad_soyad: "Ergün Demir",
          telefon: "05552223344",
          eposta: "ergun@example.com",
          adres: "İstanbul",
          maas: 14000,
          calisma_sistemi: "haftalik",
          prim_yuzdesi: 12
        });
        ergunId = yeniErgun.id;
      } else {
        ergunId = ergunPersonel.id;
      }
      
      // Kategori oluşturalım
      let sacBakimKategoriId = 0;
      let tirnaklarKategoriId = 0;
      let ciltBakimKategoriId = 0;
      
      const kategoriler = await kategoriServisi.hepsiniGetir();
      
      // Saç Bakım kategorisi
      const sacBakimKategori = kategoriler.find(k => k.kategori_adi.includes("SAÇ BAKIM"));
      if (!sacBakimKategori) {
        const yeniKategori = await kategoriServisi.ekle({ kategori_adi: "SAÇ BAKIM" });
        sacBakimKategoriId = yeniKategori.id;
      } else {
        sacBakimKategoriId = sacBakimKategori.id;
      }
      
      // Tırnaklar kategorisi
      const tirnaklarKategori = kategoriler.find(k => k.kategori_adi.includes("TIRNAKLAR"));
      if (!tirnaklarKategori) {
        const yeniKategori = await kategoriServisi.ekle({ kategori_adi: "TIRNAKLAR" });
        tirnaklarKategoriId = yeniKategori.id;
      } else {
        tirnaklarKategoriId = tirnaklarKategori.id;
      }
      
      // Cilt Bakım kategorisi
      const ciltBakimKategori = kategoriler.find(k => k.kategori_adi.includes("CİLT BAKIM"));
      if (!ciltBakimKategori) {
        const yeniKategori = await kategoriServisi.ekle({ kategori_adi: "CİLT BAKIM" });
        ciltBakimKategoriId = yeniKategori.id;
      } else {
        ciltBakimKategoriId = ciltBakimKategori.id;
      }
      
      // İşlemleri getirelim
      const islemler = await islemServisi.hepsiniGetir();
      
      // İşlemleri kategorilere göre tanımlayalım
      const islemTanimlari = [
        { adi: "SAÇ KESİMİ", fiyat: 150, puan: 10, kategori_id: sacBakimKategoriId },
        { adi: "BOYA", fiyat: 350, puan: 15, kategori_id: sacBakimKategoriId },
        { adi: "KERATIN BAKIM", fiyat: 500, puan: 20, kategori_id: sacBakimKategoriId },
        { adi: "MANIKÜR", fiyat: 120, puan: 8, kategori_id: tirnaklarKategoriId },
        { adi: "PEDIKÜR", fiyat: 150, puan: 8, kategori_id: tirnaklarKategoriId },
        { adi: "PROTEZ TIRNAK", fiyat: 250, puan: 12, kategori_id: tirnaklarKategoriId },
        { adi: "CİLT BAKIMI", fiyat: 250, puan: 12, kategori_id: ciltBakimKategoriId },
        { adi: "YÜZ MASKESI", fiyat: 180, puan: 10, kategori_id: ciltBakimKategoriId },
        { adi: "ANTI-AGING", fiyat: 400, puan: 18, kategori_id: ciltBakimKategoriId }
      ];
      
      // İşlemlerin var olup olmadığını kontrol edelim ve ekleyelim
      for (const islemTanimi of islemTanimlari) {
        const mevcutIslem = islemler.find(i => i.islem_adi === islemTanimi.adi);
        if (!mevcutIslem) {
          await islemServisi.ekle({
            islem_adi: islemTanimi.adi,
            fiyat: islemTanimi.fiyat,
            puan: islemTanimi.puan,
            kategori_id: islemTanimi.kategori_id
          });
        }
      }
      
      // Test müşterileri oluşturalım
      const musteriler = [
        { first_name: "Ayşe", last_name: "Yılmaz", phone: "05551112233" },
        { first_name: "Mehmet", last_name: "Kaya", phone: "05552223344" },
        { first_name: "Zeynep", last_name: "Demir", phone: "05553334455" },
        { first_name: "Ahmet", last_name: "Şahin", phone: "05554445566" },
        { first_name: "Fatma", last_name: "Öztürk", phone: "05555556677" }
      ];
      
      // Her müşteri için bir kullanıcı oluşturalım
      const musteriIdleri = [];
      for (const musteri of musteriler) {
        // Önce bu e-postayı kontrol edelim
        const email = `${musteri.first_name.toLowerCase()}.${musteri.last_name.toLowerCase()}@example.com`;
        const { data: mevcutKullanicilar } = await supabase.auth.signInWithPassword({
          email,
          password: "password123"
        });
        
        if (mevcutKullanicilar?.user) {
          // Müşteri zaten var, id'sini alalım
          musteriIdleri.push(mevcutKullanicilar.user.id);
        } else {
          // Yeni müşteri oluşturalım
          const { data: yeniKullanici, error } = await supabase.auth.signUp({
            email,
            password: "password123",
            options: {
              data: {
                first_name: musteri.first_name,
                last_name: musteri.last_name
              }
            }
          });
          
          if (error) {
            console.error("Müşteri kayıt hatası:", error);
            continue;
          }
          
          if (yeniKullanici?.user) {
            // Profil bilgilerini güncelleyelim
            await supabase
              .from('profiles')
              .update({
                first_name: musteri.first_name,
                last_name: musteri.last_name,
                phone: musteri.phone
              })
              .eq('id', yeniKullanici.user.id);
            
            musteriIdleri.push(yeniKullanici.user.id);
          }
        }
      }
      
      // Güncel işlemleri alalım
      const guncelIslemler = await islemServisi.hepsiniGetir();
      
      // Örnek açıklamalar
      const aciklamalar = [
        "Müşteri çok memnun kaldı",
        "Standart işlem yapıldı",
        "Ekstra bakım yapıldı",
        "Müşteri tekrar gelmek istedi",
        "İndirimli işlem uygulandı",
        "VIP müşteri işlemi",
        "Yeni müşteri tanışma işlemi",
        "Kombine bakım yapıldı",
        "Özel işlem uygulandı",
        "Acil işlem yapıldı"
      ];
      
      // Her personel için 10 işlem ekleyelim
      // Nimet için 10 işlem
      for(let i = 0; i < 10; i++) {
        const randomIslem = guncelIslemler[Math.floor(Math.random() * guncelIslemler.length)];
        const randomAciklama = aciklamalar[Math.floor(Math.random() * aciklamalar.length)];
        const randomTutar = randomIslem.fiyat * (Math.random() * 0.3 + 0.9); // %90-120 arası rastgele fiyat
        const randomMusteriId = musteriIdleri[Math.floor(Math.random() * musteriIdleri.length)];
        
        await personelIslemleriServisi.ekle({
          personel_id: nimetId,
          islem_id: randomIslem.id,
          musteri_id: randomMusteriId,
          aciklama: `${randomIslem.islem_adi} - ${randomAciklama}`,
          tutar: parseFloat(randomTutar.toFixed(2)),
          prim_yuzdesi: 15,
          odenen: parseFloat((randomTutar * 0.15).toFixed(2)),
          puan: randomIslem.puan
        });
      }
      
      // Ergün için 10 işlem
      for(let i = 0; i < 10; i++) {
        const randomIslem = guncelIslemler[Math.floor(Math.random() * guncelIslemler.length)];
        const randomAciklama = aciklamalar[Math.floor(Math.random() * aciklamalar.length)];
        const randomTutar = randomIslem.fiyat * (Math.random() * 0.3 + 0.9); // %90-120 arası rastgele fiyat
        const randomMusteriId = musteriIdleri[Math.floor(Math.random() * musteriIdleri.length)];
        
        await personelIslemleriServisi.ekle({
          personel_id: ergunId,
          islem_id: randomIslem.id,
          musteri_id: randomMusteriId,
          aciklama: `${randomIslem.islem_adi} - ${randomAciklama}`,
          tutar: parseFloat(randomTutar.toFixed(2)),
          prim_yuzdesi: 12,
          odenen: parseFloat((randomTutar * 0.12).toFixed(2)),
          puan: randomIslem.puan
        });
      }
      
      toast({
        title: "Başarılı!",
        description: "Kategori, işlem, müşteri ve işlem kayıtları oluşturuldu.",
      });
      
    } catch (error) {
      console.error("İşlem ekleme hatası:", error);
      toast({
        title: "Hata!",
        description: "İşlem girişi yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Admin Test */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={ekleTestVerileri} 
            disabled={loading}
          >
            {loading ? "Yükleniyor..." : "Test Verileri Ekle"}
          </Button>
        </div>
        
        {/* Ana Seçim Butonları */}
        {selectedSection === 'none' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Müşteri Seçeneği */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setSelectedSection('customer')}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <User className="h-8 w-8 text-primary" />
                  Müşteri İşlemleri
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Randevu alma ve müşteri hizmetleri için tıklayın
              </CardContent>
            </Card>

            {/* Personel Seçeneği */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedSection('personnel')}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-8 w-8 text-primary" />
                  Personel İşlemleri
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Personel ve işletme yönetimi için tıklayın
              </CardContent>
            </Card>
          </div>
        )}

        {/* Müşteri Menüsü */}
        {selectedSection === 'customer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Müşteri İşlemleri</h2>
              <Button variant="outline" onClick={() => setSelectedSection('none')}>
                Geri Dön
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/operations')}
              >
                <Scissors className="mr-2 h-6 w-6" />
                Hizmetlerimiz
              </Button>
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/appointments')}
              >
                <Calendar className="mr-2 h-6 w-6" />
                Randevu Al
              </Button>
            </div>
          </div>
        )}

        {/* Personel Menüsü */}
        {selectedSection === 'personnel' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Personel İşlemleri</h2>
              <Button variant="outline" onClick={() => setSelectedSection('none')}>
                Geri Dön
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/personnel')}
              >
                <Users className="mr-2 h-6 w-6" />
                Personel Yönetimi
              </Button>
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/customers')}
              >
                <User className="mr-2 h-6 w-6" />
                Müşteri Listesi
              </Button>
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/operations/staff')}
              >
                <Settings className="mr-2 h-6 w-6" />
                İşletme Ayarları
              </Button>
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/appointments')}
              >
                <Calendar className="mr-2 h-6 w-6" />
                Randevu Takvimi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
