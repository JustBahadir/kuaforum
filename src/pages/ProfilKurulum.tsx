
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { KullaniciRol } from "@/lib/supabase/temporaryTypes";

// Türkiye il listesi
const ILLER = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya",
  "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne",
  "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane",
  "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu",
  "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya",
  "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu",
  "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray",
  "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır",
  "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export default function ProfilKurulum() {
  const navigate = useNavigate();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [formVerileri, setFormVerileri] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    cinsiyet: "",
    rol: "" as KullaniciRol,
    isletme_adi: "",
    il: "",
    isletme_kodu: ""
  });
  const [hatalar, setHatalar] = useState<Record<string, string>>({});
  const [kullaniciId, setKullaniciId] = useState<string | null>(null);

  // Kullanıcı oturum bilgilerini kontrol et
  useEffect(() => {
    const oturumKontrol = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Oturum bilginiz bulunamadı. Lütfen giriş yapın.");
        navigate("/login");
        return;
      }
      
      setKullaniciId(session.user.id);
      
      // Kullanıcı bilgilerini ön doldurmak için
      if (session.user.user_metadata) {
        setFormVerileri(onceki => ({
          ...onceki,
          ad: session.user.user_metadata.full_name?.split(' ')[0] || "",
          soyad: session.user.user_metadata.full_name?.split(' ').slice(1).join(' ') || ""
        }));
      }
      
      // Kullanıcının profil bilgilerini kontrol et
      const { data: kullanici } = await supabase
        .from("kullanicilar")
        .select("*")
        .eq("kimlik", session.user.id)
        .maybeSingle();
      
      // Eğer kullanıcı profili varsa ve tamamlanmışsa ilgili sayfaya yönlendir
      if (kullanici?.profil_tamamlandi) {
        if (kullanici.rol === "isletme_sahibi") {
          navigate("/isletme/anasayfa", { replace: true });
        } else if (kullanici.rol === "personel") {
          navigate("/personel/atanmamis", { replace: true });
        }
      }
    };
    
    oturumKontrol();
  }, [navigate]);

  // Telefonu formatla (05XX XXX XX XX)
  const telefonuFormatla = (deger: string): string => {
    if (!deger) return deger;
    
    // Sadece rakamları al
    const rakamlar = deger.replace(/[^\d]/g, "");
    
    // Uzunluğa göre formatla
    if (rakamlar.length <= 4) {
      return rakamlar;
    } else if (rakamlar.length <= 7) {
      return `${rakamlar.slice(0, 4)} ${rakamlar.slice(4)}`;
    } else if (rakamlar.length <= 9) {
      return `${rakamlar.slice(0, 4)} ${rakamlar.slice(4, 7)} ${rakamlar.slice(7)}`;
    } else {
      return `${rakamlar.slice(0, 4)} ${rakamlar.slice(4, 7)} ${rakamlar.slice(7, 9)} ${rakamlar.slice(9, 11)}`;
    }
  };

  // Input değişikliklerini takip et
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormVerileri(onceki => ({
      ...onceki,
      [name]: value
    }));
  };

  // Telefon numarası değişikliğini takip et (sadece rakam)
  const handleTelefonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").substring(0, 11);
    setFormVerileri(onceki => ({
      ...onceki,
      telefon: value
    }));
  };

  // Select değişikliklerini takip et (cinsiyet, rol, il)
  const handleSelectChange = (name: string, value: string) => {
    setFormVerileri(onceki => ({
      ...onceki,
      [name]: value
    }));
  };

  // Form verilerini doğrula
  const formDogrula = (): boolean => {
    const yeniHatalar: Record<string, string> = {};
    
    // Zorunlu alanlar
    if (!formVerileri.ad.trim()) {
      yeniHatalar.ad = "Ad alanı zorunludur";
    }
    
    if (!formVerileri.soyad.trim()) {
      yeniHatalar.soyad = "Soyad alanı zorunludur";
    }
    
    if (!formVerileri.rol) {
      yeniHatalar.rol = "Kullanıcı türü seçmelisiniz";
    }
    
    // Rol bazlı doğrulamalar
    if (formVerileri.rol === "isletme_sahibi") {
      if (!formVerileri.isletme_adi?.trim()) {
        yeniHatalar.isletme_adi = "İşletme adı zorunludur";
      }
      
      if (!formVerileri.il) {
        yeniHatalar.il = "İl seçmelisiniz";
      }
    }
    
    // Telefon numarası doğrulama (isteğe bağlı alan)
    if (formVerileri.telefon && formVerileri.telefon.length < 10) {
      yeniHatalar.telefon = "Telefon numarası en az 10 haneli olmalıdır";
    }
    
    setHatalar(yeniHatalar);
    return Object.keys(yeniHatalar).length === 0;
  };

  // Profil kaydet
  const profilKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formDogrula() || !kullaniciId) {
      return;
    }
    
    setYukleniyor(true);
    
    try {
      // Kullanıcı profilini güncelle
      const { error: profilHatasi } = await supabase
        .from("kullanicilar")
        .update({
          ad: formVerileri.ad,
          soyad: formVerileri.soyad,
          telefon: formVerileri.telefon || null,
          rol: formVerileri.rol,
          profil_tamamlandi: true,
          cinsiyet: formVerileri.cinsiyet || null
        })
        .eq("kimlik", kullaniciId);
      
      if (profilHatasi) {
        throw profilHatasi;
      }
      
      // İşletme sahibi için işlemler
      if (formVerileri.rol === "isletme_sahibi") {
        // Rastgele işletme kodu oluştur (6 haneli)
        const isletmeKodu = Math.floor(100000 + Math.random() * 900000).toString();
        
        // İşletme kaydı oluştur
        const { error: isletmeHatasi } = await supabase
          .from("isletmeler")
          .insert({
            isletme_adi: formVerileri.isletme_adi,
            isletme_kodu: isletmeKodu,
            sahip_kimlik: kullaniciId,
            adres: formVerileri.il ? `${formVerileri.il}` : null
          } as any);
        
        if (isletmeHatasi) {
          throw isletmeHatasi;
        }
        
        toast.success("Profil bilgileri kaydedildi. İşletme bilgilerinizi tamamlamak için yönlendiriliyorsunuz.");
        navigate("/isletme/olustur", { replace: true });
      } 
      // Personel için işlemler
      else if (formVerileri.rol === "personel") {
        // Personel kaydı oluştur
        const { error: personelHatasi } = await supabase
          .from("personeller")
          .insert({
            kullanici_kimlik: kullaniciId,
            durum: "atanmadi"
          } as any);
        
        if (personelHatasi) {
          throw personelHatasi;
        }
        
        // İşletme kodu girildiyse başvuru oluştur
        if (formVerileri.isletme_kodu?.trim()) {
          // İşletme kodunun geçerli olup olmadığını kontrol et
          const { data: isletme, error: isletmeKontrolHatasi } = await supabase
            .from("isletmeler")
            .select("kimlik")
            .eq("isletme_kodu", formVerileri.isletme_kodu.trim())
            .single();
          
          if (isletmeKontrolHatasi) {
            toast.error("Belirtilen işletme kodu bulunamadı");
            navigate("/personel/atanmamis", { replace: true });
            return;
          }
          
          // Başvuru oluştur
          const { error: basvuruHatasi } = await supabase
            .from("personel_basvurulari")
            .insert({
              kullanici_kimlik: kullaniciId,
              isletme_kodu: formVerileri.isletme_kodu.trim(),
              durum: "beklemede",
              tarih: new Date().toISOString().split('T')[0]
            } as any);
          
          if (basvuruHatasi) {
            throw basvuruHatasi;
          }
          
          toast.success("Başvuru gönderildi. İşletme sahibi başvurunuzu değerlendirdikten sonra bilgilendirileceksiniz.");
          navigate("/personel/beklemede", { replace: true });
        } else {
          toast.success("Profil bilgileri kaydedildi. Personel bilgilerinizi tamamlamak için yönlendiriliyorsunuz.");
          navigate("/personel/atanmamis", { replace: true });
        }
      }
    } catch (hata: any) {
      console.error("Profil kayıt hatası:", hata);
      toast.error(`Bir hata oluştu: ${hata.message || "Bilinmeyen hata"}`);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Profil Bilgileri</CardTitle>
          <CardDescription className="text-center">
            Hesabınızı tamamlamak için lütfen gerekli bilgileri giriniz
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={profilKaydet} className="space-y-6">
            {/* Kişisel Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad">Ad</Label>
                  <Input
                    id="ad"
                    name="ad"
                    placeholder="Adınız"
                    value={formVerileri.ad}
                    onChange={handleInputChange}
                    className={hatalar.ad ? "border-red-500" : ""}
                    required
                  />
                  {hatalar.ad && <p className="text-red-500 text-sm">{hatalar.ad}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="soyad">Soyad</Label>
                  <Input
                    id="soyad"
                    name="soyad"
                    placeholder="Soyadınız"
                    value={formVerileri.soyad}
                    onChange={handleInputChange}
                    className={hatalar.soyad ? "border-red-500" : ""}
                    required
                  />
                  {hatalar.soyad && <p className="text-red-500 text-sm">{hatalar.soyad}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  name="telefon"
                  placeholder="05XX XXX XX XX"
                  value={telefonuFormatla(formVerileri.telefon)}
                  onChange={handleTelefonChange}
                  className={hatalar.telefon ? "border-red-500" : ""}
                />
                {hatalar.telefon && <p className="text-red-500 text-sm">{hatalar.telefon}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cinsiyet">Cinsiyet</Label>
                <Select
                  value={formVerileri.cinsiyet}
                  onValueChange={(value) => handleSelectChange("cinsiyet", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cinsiyet Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="erkek">Erkek</SelectItem>
                    <SelectItem value="kadın">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Rol Seçimi */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hesap Türü</h3>
              
              <div className="space-y-2">
                <Label>Ben bir...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={formVerileri.rol === "isletme_sahibi" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleSelectChange("rol", "isletme_sahibi")}
                  >
                    İşletme Sahibiyim
                  </Button>
                  
                  <Button
                    type="button"
                    variant={formVerileri.rol === "personel" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleSelectChange("rol", "personel")}
                  >
                    Personelim
                  </Button>
                </div>
                {hatalar.rol && <p className="text-red-500 text-sm">{hatalar.rol}</p>}
              </div>
            </div>
            
            {/* Rol bazlı dinamik alanlar */}
            {formVerileri.rol === "isletme_sahibi" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">İşletme Bilgileri</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="isletme_adi">İşletme Adı</Label>
                  <Input
                    id="isletme_adi"
                    name="isletme_adi"
                    placeholder="İşletmenizin adı"
                    value={formVerileri.isletme_adi}
                    onChange={handleInputChange}
                    className={hatalar.isletme_adi ? "border-red-500" : ""}
                    required={formVerileri.rol === "isletme_sahibi"}
                  />
                  {hatalar.isletme_adi && <p className="text-red-500 text-sm">{hatalar.isletme_adi}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="il">İl</Label>
                  <Select
                    value={formVerileri.il}
                    onValueChange={(value) => handleSelectChange("il", value)}
                  >
                    <SelectTrigger className={hatalar.il ? "border-red-500" : ""}>
                      <SelectValue placeholder="İl Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {ILLER.map((il) => (
                        <SelectItem key={il} value={il}>
                          {il}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hatalar.il && <p className="text-red-500 text-sm">{hatalar.il}</p>}
                </div>
              </div>
            )}
            
            {formVerileri.rol === "personel" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personel Bilgileri</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="isletme_kodu">İşletme Kodu (İsteğe Bağlı)</Label>
                  <Input
                    id="isletme_kodu"
                    name="isletme_kodu"
                    placeholder="İşletme kodunuz varsa giriniz"
                    value={formVerileri.isletme_kodu}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    İşletme kodunuz yoksa daha sonra da ekleyebilirsiniz.
                  </p>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={yukleniyor}>
              {yukleniyor ? "Kaydediliyor..." : "Profil Bilgilerini Tamamla"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
