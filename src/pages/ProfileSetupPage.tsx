
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";
import { KullaniciRol } from "@/lib/supabase/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const turkiyeIlleri = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", 
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", 
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", 
  "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", 
  "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", 
  "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", 
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", 
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

type FormErrors = {
  ad?: string;
  soyad?: string;
  telefon?: string;
  rol?: string;
  isletme_adi?: string;
  il?: string;
  isletme_kodu?: string;
  general?: string;
};

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          navigate("/giris", { replace: true });
          return;
        }
        
        setUser(session.session.user);
        
        // Check if profile is already completed
        const { data: kullanici, error } = await supabase
          .from("kullanicilar")
          .select("profil_tamamlandi, ad, soyad, rol, telefon")
          .eq("kimlik", session.session.user.id)
          .single();
          
        if (error) {
          console.error("Profile check error:", error);
          return;
        }
          
        if (kullanici?.profil_tamamlandi) {
          // User has already completed profile, redirect based on role
          if (kullanici.rol === "isletme_sahibi") {
            navigate("/isletme/anasayfa", { replace: true });
          } else if (kullanici.rol === "personel") {
            navigate("/personel/atanmamis", { replace: true });
          }
        } else if (kullanici) {
          // Pre-fill form data if available
          setFormData(prev => ({
            ...prev,
            ad: kullanici.ad || "",
            soyad: kullanici.soyad || "",
            telefon: kullanici.telefon || "",
            rol: kullanici.rol as KullaniciRol || ""
          }));
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    
    checkAuthAndProfile();
  }, [navigate]);
  
  // Format phone number display (0xxx xxx xx xx)
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    
    // Remove non-digits
    const phoneNumber = value.replace(/[^\d]/g, "");
    
    // Format with spaces
    if (phoneNumber.length <= 4) {
      return phoneNumber;
    } else if (phoneNumber.length <= 7) {
      return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4)}`;
    } else if (phoneNumber.length <= 9) {
      return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
    } else {
      return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7, 9)} ${phoneNumber.slice(9, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").substring(0, 11);
    setFormData({ ...formData, telefon: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.ad.trim()) {
      newErrors.ad = "Ad alanı zorunludur";
    }

    if (!formData.soyad.trim()) {
      newErrors.soyad = "Soyad alanı zorunludur";
    }

    if (!formData.rol) {
      newErrors.rol = "Kullanıcı türü seçmelisiniz";
    }

    if (formData.rol === "isletme_sahibi") {
      if (!formData.isletme_adi.trim()) {
        newErrors.isletme_adi = "İşletme adı zorunludur";
      }

      if (!formData.il) {
        newErrors.il = "İl seçmelisiniz";
      }
    }

    if (formData.telefon && formData.telefon.length < 10) {
      newErrors.telefon = "Telefon numarası en az 10 haneli olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!user) {
      setErrors({ general: "Kullanıcı oturumu bulunamadı. Lütfen yeniden giriş yapın." });
      return;
    }
    
    setLoading(true);
    
    try {
      // First update user profile in kullanicilar table
      const { error: profileError } = await supabase
        .from("kullanicilar")
        .update({
          ad: formData.ad,
          soyad: formData.soyad,
          telefon: formData.telefon || null,
          rol: formData.rol,
          profil_tamamlandi: true
        })
        .eq("kimlik", user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      if (formData.rol === "isletme_sahibi") {
        // Generate a random business code
        const businessCode = generateBusinessCode();
        
        // Create business
        const { error: businessError } = await supabase
          .from("isletmeler")
          .insert({
            isletme_adi: formData.isletme_adi,
            isletme_kodu: businessCode,
            sahip_kimlik: user.id,
            adres: formData.il ? `${formData.il}` : null
          });
        
        if (businessError) {
          throw businessError;
        }
        
        toast({
          title: "Profil bilgileri kaydedildi",
          description: "İşletme bilgilerinizi tamamlamak için yönlendiriliyorsunuz."
        });
        
        navigate("/isletme/anasayfa", { replace: true });
      } else if (formData.rol === "personel") {
        // Create personnel record
        const { error: personnelError } = await supabase
          .from("personeller")
          .insert({
            kullanici_kimlik: user.id,
            durum: "atanmadi"
          });
        
        if (personnelError) {
          throw personnelError;
        }
        
        // If business code is provided, create an application
        if (formData.isletme_kodu.trim()) {
          // Check if business code exists
          const { data: business, error: businessCheckError } = await supabase
            .from("isletmeler")
            .select("kimlik")
            .eq("isletme_kodu", formData.isletme_kodu.trim())
            .single();
          
          if (businessCheckError) {
            toast({
              title: "Hata",
              description: "Belirtilen işletme kodu bulunamadı",
              variant: "destructive"
            });
            
            // Still proceed to personnel page
            navigate("/personel/atanmamis", { replace: true });
            return;
          }
          
          // Create application
          const { error: applicationError } = await supabase
            .from("personel_basvurulari")
            .insert({
              kullanici_kimlik: user.id,
              isletme_kodu: formData.isletme_kodu.trim(),
              durum: "beklemede",
              tarih: new Date().toISOString().split('T')[0]
            });
          
          if (applicationError) {
            throw applicationError;
          }
          
          toast({
            title: "Başvuru Gönderildi",
            description: "İşletme sahibi başvurunuzu değerlendirdikten sonra bilgilendirileceksiniz."
          });
          
          navigate("/personel/beklemede", { replace: true });
        } else {
          toast({
            title: "Profil bilgileri kaydedildi",
            description: "Personel bilgilerinizi tamamlamak için yönlendiriliyorsunuz."
          });
          
          navigate("/personel/atanmamis", { replace: true });
        }
      }
    } catch (error: any) {
      console.error("Profile setup error:", error);
      setErrors({
        general: `Bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      });
      
      toast({
        title: "Hata",
        description: "Profil bilgileri kaydedilemedi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate a random business code - 6 digits
  const generateBusinessCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p>Oturum kontrol ediliyor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center py-6 rounded-t-lg">
            <h1 className="text-2xl font-bold">Profil Bilgilerinizi Tamamlayın</h1>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad">Ad<span className="text-red-500">*</span></Label>
                  <Input
                    id="ad"
                    name="ad"
                    value={formData.ad}
                    onChange={handleInputChange}
                    placeholder="Adınız"
                    className={errors.ad ? "border-red-500" : ""}
                  />
                  {errors.ad && <p className="text-red-500 text-xs">{errors.ad}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="soyad">Soyad<span className="text-red-500">*</span></Label>
                  <Input
                    id="soyad"
                    name="soyad"
                    value={formData.soyad}
                    onChange={handleInputChange}
                    placeholder="Soyadınız"
                    className={errors.soyad ? "border-red-500" : ""}
                  />
                  {errors.soyad && <p className="text-red-500 text-xs">{errors.soyad}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon Numarası</Label>
                <Input
                  id="telefon"
                  name="telefon"
                  value={formatPhoneNumber(formData.telefon)}
                  onChange={handlePhoneChange}
                  placeholder="05xx xxx xx xx"
                  className={errors.telefon ? "border-red-500" : ""}
                />
                {errors.telefon && <p className="text-red-500 text-xs">{errors.telefon}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cinsiyet">Cinsiyet</Label>
                  <Select 
                    value={formData.cinsiyet} 
                    onValueChange={(value) => handleSelectChange("cinsiyet", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kadin">Kadın</SelectItem>
                      <SelectItem value="erkek">Erkek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rol">Kullanıcı Türü<span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.rol} 
                    onValueChange={(value) => handleSelectChange("rol", value as KullaniciRol)}
                  >
                    <SelectTrigger className={errors.rol ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="isletme_sahibi">İşletme Sahibi</SelectItem>
                      <SelectItem value="personel">Personel</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.rol && <p className="text-red-500 text-xs">{errors.rol}</p>}
                </div>
              </div>
              
              {/* Conditional fields based on role */}
              {formData.rol === "isletme_sahibi" && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="isletme_adi">İşletme Adı<span className="text-red-500">*</span></Label>
                    <Input
                      id="isletme_adi"
                      name="isletme_adi"
                      value={formData.isletme_adi}
                      onChange={handleInputChange}
                      placeholder="İşletmenizin adı"
                      className={errors.isletme_adi ? "border-red-500" : ""}
                    />
                    {errors.isletme_adi && <p className="text-red-500 text-xs">{errors.isletme_adi}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="il">İl<span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.il} 
                      onValueChange={(value) => handleSelectChange("il", value)}
                    >
                      <SelectTrigger className={errors.il ? "border-red-500" : ""}>
                        <SelectValue placeholder="İl seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {turkiyeIlleri.map((il) => (
                          <SelectItem key={il} value={il}>{il}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.il && <p className="text-red-500 text-xs">{errors.il}</p>}
                  </div>
                </div>
              )}
              
              {formData.rol === "personel" && (
                <div className="space-y-2">
                  <Label htmlFor="isletme_kodu">İşletme Kodu (Opsiyonel)</Label>
                  <Input
                    id="isletme_kodu"
                    name="isletme_kodu"
                    value={formData.isletme_kodu}
                    onChange={handleInputChange}
                    placeholder="İşletme yöneticisinden alınan kod"
                    className={errors.isletme_kodu ? "border-red-500" : ""}
                  />
                  {errors.isletme_kodu && <p className="text-red-500 text-xs">{errors.isletme_kodu}</p>}
                  <p className="text-gray-500 text-xs">İşletme kodu girmezseniz, detaylı bilgilerinizi girerek işletme bulabilirsiniz.</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" 
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Profil Bilgilerini Tamamla"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
