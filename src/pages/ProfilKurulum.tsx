
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useProfileSetup } from "@/hooks/useProfileSetup";

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
  const [kullaniciId, setKullaniciId] = useState<string | null>(null);
  const {
    formData,
    errors,
    loading,
    formatPhoneNumber,
    handlePhoneChange,
    handleInputChange,
    handleSelectChange,
    saveProfile
  } = useProfileSetup();
  
  // Kullanıcı oturum bilgilerini kontrol et
  useEffect(() => {
    const oturumKontrol = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Oturum bilginiz bulunamadı. Lütfen giriş yapın.", {
          position: "bottom-right"
        });
        navigate("/login");
        return;
      }
      
      setKullaniciId(session.user.id);
      
      // Kullanıcı bilgilerini ön doldurmak için
      if (session.user.user_metadata) {
        const adSoyad = session.user.user_metadata.full_name || "";
        const adParcalar = adSoyad.split(" ");
        
        let ad = "";
        let soyad = "";
        
        if (adParcalar.length > 0) {
          ad = adParcalar[0];
          if (adParcalar.length > 1) {
            soyad = adParcalar.slice(1).join(" ");
          }
        }
        
        handleInputChange({
          target: { name: "ad", value: ad }
        } as React.ChangeEvent<HTMLInputElement>);
        
        handleInputChange({
          target: { name: "soyad", value: soyad }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };
    
    oturumKontrol();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kullaniciId) {
      toast.error("Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.", {
        position: "bottom-right"
      });
      return;
    }
    
    await saveProfile(kullaniciId);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
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
                    onChange={handleInputChange}
                    required
                  />
                  {errors.ad && <p className="text-sm text-red-500">{errors.ad}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="soyad">Soyad</Label>
                  <Input
                    id="soyad"
                    name="soyad"
                    placeholder="Soyadınız"
                    value={formData.soyad}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.soyad && <p className="text-sm text-red-500">{errors.soyad}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  name="telefon"
                  placeholder="05XX XXX XX XX"
                  value={formatPhoneNumber(formData.telefon)}
                  onChange={handlePhoneChange}
                />
                {errors.telefon && <p className="text-sm text-red-500">{errors.telefon}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cinsiyet">Cinsiyet</Label>
                <Select
                  value={formData.cinsiyet}
                  onValueChange={(value) => handleSelectChange("cinsiyet", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cinsiyet Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kadin">Kadın</SelectItem>
                    <SelectItem value="erkek">Erkek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Role Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hesap Türü</h3>
              
              <div className="space-y-2">
                <Label>Ben bir...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={formData.rol === "isletme_sahibi" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleSelectChange("rol", "isletme_sahibi")}
                  >
                    İşletme Sahibiyim
                  </Button>
                  
                  <Button
                    type="button"
                    variant={formData.rol === "personel" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleSelectChange("rol", "personel")}
                  >
                    Personelim
                  </Button>
                </div>
                {errors.rol && <p className="text-sm text-red-500">{errors.rol}</p>}
              </div>
            </div>
            
            {/* Conditional fields based on role */}
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
                    onChange={handleInputChange}
                    required={formData.rol === "isletme_sahibi"}
                  />
                  {errors.isletme_adi && <p className="text-sm text-red-500">{errors.isletme_adi}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="il">İl</Label>
                  <Select
                    value={formData.il}
                    onValueChange={(value) => handleSelectChange("il", value)}
                  >
                    <SelectTrigger>
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
                  {errors.il && <p className="text-sm text-red-500">{errors.il}</p>}
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
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    İşletme kodunuz yoksa daha sonra da ekleyebilirsiniz.
                  </p>
                  {errors.isletme_kodu && <p className="text-sm text-red-500">{errors.isletme_kodu}</p>}
                </div>
              </div>
            )}
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                {errors.general}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Profil Bilgilerini Tamamla"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
