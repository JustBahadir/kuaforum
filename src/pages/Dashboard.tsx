
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Calendar, Scissors, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { personelServisi, personelIslemleriServisi, islemServisi } from "@/lib/supabase";

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
      
      // İşlemleri getirelim
      const islemler = await islemServisi.hepsiniGetir();
      
      // Eğer işlem yoksa bazı örnek işlemler ekleyelim
      if (islemler.length === 0) {
        await islemServisi.ekle({ islem_adi: "SAÇ KESİMİ", fiyat: 150, puan: 10 });
        await islemServisi.ekle({ islem_adi: "BOYA", fiyat: 350, puan: 15 });
        await islemServisi.ekle({ islem_adi: "MANIKÜR", fiyat: 120, puan: 8 });
        await islemServisi.ekle({ islem_adi: "PEDIKÜR", fiyat: 150, puan: 8 });
        await islemServisi.ekle({ islem_adi: "CİLT BAKIMI", fiyat: 250, puan: 12 });
      }
      
      // Tekrar işlemleri alalım, yeni eklenmiş olanları da görelim
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
        
        await personelIslemleriServisi.ekle({
          personel_id: nimetId,
          islem_id: randomIslem.id,
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
        
        await personelIslemleriServisi.ekle({
          personel_id: ergunId,
          islem_id: randomIslem.id,
          aciklama: `${randomIslem.islem_adi} - ${randomAciklama}`,
          tutar: parseFloat(randomTutar.toFixed(2)),
          prim_yuzdesi: 12,
          odenen: parseFloat((randomTutar * 0.12).toFixed(2)),
          puan: randomIslem.puan
        });
      }
      
      toast({
        title: "Başarılı!",
        description: "Nimet ve Ergün için 10'ar işlem girişi yapıldı.",
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
