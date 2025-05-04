
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { KullaniciRol } from "@/lib/supabase/types";

// Türkiye il kodları dropdown için
const iller = [
  { kod: "01", ad: "Adana" },
  { kod: "02", ad: "Adıyaman" },
  { kod: "03", ad: "Afyonkarahisar" },
  { kod: "04", ad: "Ağrı" },
  { kod: "05", ad: "Amasya" },
  { kod: "06", ad: "Ankara" },
  { kod: "07", ad: "Antalya" },
  { kod: "34", ad: "İstanbul" },
  { kod: "35", ad: "İzmir" },
  { kod: "16", ad: "Bursa" },
  // Gerekirse daha fazla il eklenebilir
];

export default function ProfilKurulum() {
  const navigate = useNavigate();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    cinsiyet: "",
    rol: "" as KullaniciRol,
    isletme_adi: "",
    il: "",
    isletme_kodu: ""
  });

  const [hatalar, setHatalar] = useState<{[key: string]: string}>({});

  // Telefon numarası formatı (örn. 0532 123 45 67)
  const telefonNumarasiFormatla = (deger: string): string => {
    if (!deger) return deger;
    
    // Rakam olmayanları kaldır
    const telefonNumarasi = deger.replace(/[^\d]/g, "");
    
    // Uzunluğa göre boşluklu format
    if (telefonNumarasi.length <= 4) {
      return telefonNumarasi;
    } else if (telefonNumarasi.length <= 7) {
      return `${telefonNumarasi.slice(0, 4)} ${telefonNumarasi.slice(4)}`;
    } else if (telefonNumarasi.length <= 9) {
      return `${telefonNumarasi.slice(0, 4)} ${telefonNumarasi.slice(4, 7)} ${telefonNumarasi.slice(7)}`;
    } else {
      return `${telefonNumarasi.slice(0, 4)} ${telefonNumarasi.slice(4, 7)} ${telefonNumarasi.slice(7, 9)} ${telefonNumarasi.slice(9, 11)}`;
    }
  };

  // Açılışta kullanıcı verilerini yükle
  useEffect(() => {
    const kullaniciVerileriniYukle = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Oturum açık değil");
        navigate("/login");
        return;
      }
      
      // Kullanıcı meta verisi varsa formu doldur
      if (user.user_metadata) {
        setFormData(prev => ({
          ...prev,
          ad: user.user_metadata.first_name || "",
          soyad: user.user_metadata.last_name || "",
        }));
      }
    };
    
    kullaniciVerileriniYukle();
  }, [navigate]);

  // Telefon input değişikliği, sadece rakam izni
  const telefonDegisimi = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece rakamlara izin ver, 11 karakterle sınırla
    const deger = e.target.value.replace(/[^\d]/g, "").substring(0, 11);
    setFormData(prev => ({ ...prev, telefon: deger }));
  };

  // Text input değişikliği
  const inputDegisimi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Select değişikliği
  const selectDegisimi = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form doğrulama
  const formuDogrula = () => {
    const yeniHatalar: {[key: string]: string} = {};

    // Zorunlu alanlar
    if (!formData.ad.trim()) {
      yeniHatalar.ad = "Ad alanı zorunludur";
    }

    if (!formData.soyad.trim()) {
      yeniHatalar.soyad = "Soyad alanı zorunludur";
    }

    if (!formData.rol) {
      yeniHatalar.rol = "Kullanıcı türü seçmelisiniz";
    }

    // Role göre doğrulamalar
    if (formData.rol === "isletme_sahibi") {
      if (!formData.isletme_adi?.trim()) {
        yeniHatalar.isletme_adi = "İşletme adı zorunludur";
      }

      if (!formData.il) {
        yeniHatalar.il = "İl seçmelisiniz";
      }
    }

    // Telefon numarası doğrulaması (varsa)
    if (formData.telefon && formData.telefon.length < 10) {
      yeniHatalar.telefon = "Telefon numarası en az 10 haneli olmalıdır";
    }

    setHatalar(yeniHatalar);
    return Object.keys(yeniHatalar).length === 0;
  };

  // Profil verilerini kaydet
  const profilKaydet = async () => {
    if (!formuDogrula()) {
      return;
    }
    
    setYukleniyor(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Oturum açık değil");
        navigate("/login");
        return;
      }
      
      // Kullanıcı profilini veritabanında güncelle - TypeScript hatalarını önlemek için any tipi kullandık
      const profilVerisi: any = {
        ad: formData.ad,
        soyad: formData.soyad,
        telefon: formData.telefon || null,
        cinsiyet: formData.cinsiyet || null,
        rol: formData.rol,
        profil_tamamlandi: true
      };
      
      const { error: profilHatasi } = await supabase
        .from("kullanicilar")
        .update(profilVerisi)
        .eq("kimlik", user.id);
      
      if (profilHatasi) {
        throw profilHatasi;
      }
      
      // İşletme sahibi akışını işle
      if (formData.rol === "isletme_sahibi") {
        // Rastgele işletme kodu oluştur (6 rakam)
        const isletmeKodu = Math.floor(100000 + Math.random() * 900000).toString();
        
        // İşletme kaydı oluştur - TypeScript hatalarını önlemek için any tipi kullanılıyor
        const isletmeVerisi: any = {
          isletme_adi: formData.isletme_adi,
          isletme_kodu: isletmeKodu,
          sahip_kimlik: user.id,
          adres: formData.il ? `${formData.il}` : null
        };
        
        const { error: isletmeHatasi } = await supabase
          .from("isletmeler")
          .insert(isletmeVerisi);
        
        if (isletmeHatasi) {
          throw isletmeHatasi;
        }
        
        toast.success("Profil ve işletme bilgileri kaydedildi");
        navigate("/isletme/olustur", { replace: true });
      } 
      // Personel akışını işle
      else if (formData.rol === "personel") {
        // Personel kaydı oluştur - TypeScript hatalarını önlemek için any tipi kullanılıyor
        const personelVerisi: any = {
          kullanici_kimlik: user.id,
          durum: "atanmadi"
        };
        
        const { error: personelHatasi } = await supabase
          .from("personeller")
          .insert(personelVerisi);
        
        if (personelHatasi) {
          throw personelHatasi;
        }
        
        // İşletme kodu girildiyse, başvuru oluştur
        if (formData.isletme_kodu?.trim()) {
          // İşletme kodunun varlığını kontrol et
          const { data: isletme, error: isletmeKontrolHatasi } = await supabase
            .from("isletmeler")
            .select("kimlik")
            .eq("isletme_kodu", formData.isletme_kodu.trim())
            .single();
          
          if (isletmeKontrolHatasi) {
            toast.error("Belirtilen işletme kodu bulunamadı");
            navigate("/personel/atanmamis", { replace: true });
            return;
          }
          
          // Başvuru oluştur - TypeScript hatalarını önlemek için any tipi kullanılıyor
          const basvuruVerisi: any = {
            kullanici_kimlik: user.id,
            isletme_kodu: formData.isletme_kodu.trim(),
            durum: "beklemede",
            tarih: new Date().toISOString().split('T')[0]
          };
          
          const { error: basvuruHatasi } = await supabase
            .from("personel_basvurulari")
            .insert(basvuruVerisi);
          
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
    } catch (error: any) {
      console.error("Profil kayıt hatası:", error);
      setHatalar({
        genel: `Bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      });
      
      toast.error("Profil bilgileri kaydedilemedi");
    } finally {
      setYukleniyor(false);
    }
  };

  const formGonder = (e: React.FormEvent) => {
    e.preventDefault();
    profilKaydet();
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
          <form onSubmit={formGonder} className="space-y-6">
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
                    value={formData.ad}
                    onChange={inputDegisimi}
                    required
                    className={hatalar.ad ? "border-red-500" : ""}
                  />
                  {hatalar.ad && <p className="text-sm text-red-500">{hatalar.ad}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="soyad">Soyad</Label>
                  <Input
                    id="soyad"
                    name="soyad"
                    placeholder="Soyadınız"
                    value={formData.soyad}
                    onChange={inputDegisimi}
                    required
                    className={hatalar.soyad ? "border-red-500" : ""}
                  />
                  {hatalar.soyad && <p className="text-sm text-red-500">{hatalar.soyad}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  name="telefon"
                  placeholder="05XX XXX XX XX"
                  value={telefonNumarasiFormatla(formData.telefon)}
                  onChange={telefonDegisimi}
                  className={hatalar.telefon ? "border-red-500" : ""}
                />
                {hatalar.telefon && <p className="text-sm text-red-500">{hatalar.telefon}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cinsiyet">Cinsiyet</Label>
                <Select
                  value={formData.cinsiyet}
                  onValueChange={(value) => selectDegisimi("cinsiyet", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cinsiyet Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="erkek">Erkek</SelectItem>
                    <SelectItem value="kadin">Kadın</SelectItem>
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
                    variant={formData.rol === "isletme_sahibi" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => selectDegisimi("rol", "isletme_sahibi")}
                  >
                    İşletme Sahibiyim
                  </Button>
                  
                  <Button
                    type="button"
                    variant={formData.rol === "personel" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => selectDegisimi("rol", "personel")}
                  >
                    Personelim
                  </Button>
                </div>
                {hatalar.rol && <p className="text-sm text-red-500">{hatalar.rol}</p>}
              </div>
            </div>
            
            {/* Role göre şartlı alanlar */}
            {formData.rol === "isletme_sahibi" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">İşletme Bilgileri</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="isletme_adi">İşletme Adı</Label>
                  <Input
                    id="isletme_adi"
                    name="isletme_adi"
                    placeholder="İşletmenizin adı"
                    value={formData.isletme_adi}
                    onChange={inputDegisimi}
                    required={formData.rol === "isletme_sahibi"}
                    className={hatalar.isletme_adi ? "border-red-500" : ""}
                  />
                  {hatalar.isletme_adi && <p className="text-sm text-red-500">{hatalar.isletme_adi}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="il">İl</Label>
                  <Select
                    value={formData.il}
                    onValueChange={(value) => selectDegisimi("il", value)}
                  >
                    <SelectTrigger className={hatalar.il ? "border-red-500" : ""}>
                      <SelectValue placeholder="İl Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {iller.map((il) => (
                        <SelectItem key={il.kod} value={il.kod}>
                          {il.ad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hatalar.il && <p className="text-sm text-red-500">{hatalar.il}</p>}
                </div>
              </div>
            )}
            
            {formData.rol === "personel" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personel Bilgileri</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="isletme_kodu">İşletme Kodu (İsteğe Bağlı)</Label>
                  <Input
                    id="isletme_kodu"
                    name="isletme_kodu"
                    placeholder="İşletme kodunuz varsa giriniz"
                    value={formData.isletme_kodu}
                    onChange={inputDegisimi}
                    className={hatalar.isletme_kodu ? "border-red-500" : ""}
                  />
                  {hatalar.isletme_kodu && <p className="text-sm text-red-500">{hatalar.isletme_kodu}</p>}
                  <p className="text-sm text-muted-foreground">
                    İşletme kodunuz yoksa daha sonra da ekleyebilirsiniz.
                  </p>
                </div>
              </div>
            )}
            
            {hatalar.genel && (
              <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
                {hatalar.genel}
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
