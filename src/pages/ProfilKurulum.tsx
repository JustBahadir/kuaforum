
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { KullaniciRol } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilKurulum() {
  const navigate = useNavigate();
  
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
  
  // Error state
  const [errors, setErrors] = useState<{
    ad?: string;
    soyad?: string;
    telefon?: string;
    rol?: string;
    isletme_adi?: string;
    il?: string;
    isletme_kodu?: string;
    general?: string;
  }>({});
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle phone input change, strip non-digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").substring(0, 11);
    setFormData({ ...formData, telefon: value });
  };
  
  // Format phone number for display
  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    
    // Remove non-digits
    const phoneNumber = value.replace(/[^\d]/g, "");
    
    // Format with spaces based on length
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
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Required fields
    if (!formData.ad.trim()) {
      newErrors.ad = "Ad alanı zorunludur";
    }
    
    if (!formData.soyad.trim()) {
      newErrors.soyad = "Soyad alanı zorunludur";
    }
    
    if (!formData.rol) {
      newErrors.rol = "Kullanıcı türü seçmelisiniz";
    }
    
    // Role-specific validations
    if (formData.rol === "isletme_sahibi") {
      if (!formData.isletme_adi?.trim()) {
        newErrors.isletme_adi = "İşletme adı zorunludur";
      }
      
      if (!formData.il) {
        newErrors.il = "İl seçmelisiniz";
      }
    }
    
    // Phone number validation if provided
    if (formData.telefon && formData.telefon.length < 10) {
      newErrors.telefon = "Telefon numarası en az 10 haneli olmalıdır";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save profile data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Kullanıcı bilgilerinize erişilemedi. Lütfen tekrar giriş yapın.");
      }
      
      // Update user profile
      const { error: profileError } = await supabase
        .from("kullanicilar")
        .update({
          ad: formData.ad,
          soyad: formData.soyad,
          telefon: formData.telefon || null,
          rol: formData.rol,
          profil_tamamlandi: true
        } as any)
        .eq("kimlik", user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Handle business owner workflow
      if (formData.rol === "isletme_sahibi") {
        // Generate a random business code (6 digits)
        const businessCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Create business record
        const { error: businessError } = await supabase
          .from("isletmeler")
          .insert({
            isletme_adi: formData.isletme_adi,
            isletme_kodu: businessCode,
            sahip_kimlik: user.id,
            adres: formData.il ? `${formData.il}` : null
          } as any);
        
        if (businessError) {
          throw businessError;
        }
        
        toast.success("Profil bilgileri kaydedildi. İşletme bilgilerinizi tamamlamak için yönlendiriliyorsunuz.");
        navigate("/isletme/olustur", { replace: true });
        return;
      } 
      // Handle personnel workflow
      else if (formData.rol === "personel") {
        // Create personnel record
        const { error: personnelError } = await supabase
          .from("personeller")
          .insert({
            kullanici_kimlik: user.id,
            durum: "atanmadi"
          } as any);
        
        if (personnelError) {
          throw personnelError;
        }
        
        // If business code provided, create an application
        if (formData.isletme_kodu?.trim()) {
          // Check if business code exists
          const { data: business, error: businessCheckError } = await supabase
            .from("isletmeler")
            .select("kimlik")
            .eq("isletme_kodu", formData.isletme_kodu.trim())
            .single();
          
          if (businessCheckError) {
            toast.error("Belirtilen işletme kodu bulunamadı");
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
            } as any);
          
          if (applicationError) {
            throw applicationError;
          }
          
          toast.success("Başvuru gönderildi. İşletme sahibi başvurunuzu değerlendirdikten sonra bilgilendirileceksiniz.");
          navigate("/personel/beklemede", { replace: true });
          return;
        } else {
          toast.success("Profil bilgileri kaydedildi. Personel bilgilerinizi tamamlamak için yönlendiriliyorsunuz.");
          navigate("/personel/atanmamis", { replace: true });
          return;
        }
      }
    } catch (error: any) {
      console.error("Profile save error:", error);
      setErrors({
        general: `Bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      });
      
      toast.error("Profil bilgileri kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };
  
  // List of Turkish cities
  const iller = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
    "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="w-8 h-8 p-0" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} />
            </Button>
            <CardTitle className="text-2xl text-center flex-1">
              Profil Bilgilerini Tamamla
            </CardTitle>
            <div className="w-8"></div>
          </div>
          <CardDescription className="text-center">
            Hesabınızı oluşturmak için lütfen aşağıdaki bilgileri doldurun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="ad">Ad <span className="text-red-500">*</span></Label>
              <Input
                id="ad"
                name="ad"
                value={formData.ad}
                onChange={handleInputChange}
                placeholder="Adınız"
                autoComplete="given-name"
                className={errors.ad ? "border-red-500" : ""}
              />
              {errors.ad && <p className="text-sm text-red-500">{errors.ad}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soyad">Soyad <span className="text-red-500">*</span></Label>
              <Input
                id="soyad"
                name="soyad"
                value={formData.soyad}
                onChange={handleInputChange}
                placeholder="Soyadınız"
                autoComplete="family-name"
                className={errors.soyad ? "border-red-500" : ""}
              />
              {errors.soyad && <p className="text-sm text-red-500">{errors.soyad}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon Numarası</Label>
              <Input
                id="telefon"
                name="telefon"
                value={formatPhoneNumber(formData.telefon)}
                onChange={handlePhoneChange}
                placeholder="05xx xxx xx xx"
                autoComplete="tel"
                className={errors.telefon ? "border-red-500" : ""}
              />
              {errors.telefon && <p className="text-sm text-red-500">{errors.telefon}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cinsiyet">Cinsiyet</Label>
              <Select value={formData.cinsiyet} onValueChange={(value) => handleSelectChange("cinsiyet", value)}>
                <SelectTrigger id="cinsiyet">
                  <SelectValue placeholder="Cinsiyet seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kadin">Kadın</SelectItem>
                  <SelectItem value="erkek">Erkek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rol">Kullanıcı Türü <span className="text-red-500">*</span></Label>
              <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value as KullaniciRol)}>
                <SelectTrigger id="rol" className={errors.rol ? "border-red-500" : ""}>
                  <SelectValue placeholder="Kullanıcı türü seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="isletme_sahibi">İşletme Sahibi</SelectItem>
                  <SelectItem value="personel">Personel</SelectItem>
                </SelectContent>
              </Select>
              {errors.rol && <p className="text-sm text-red-500">{errors.rol}</p>}
            </div>
            
            {/* İşletme sahibi için ek alanlar */}
            {formData.rol === "isletme_sahibi" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="isletme_adi">İşletme Adı <span className="text-red-500">*</span></Label>
                  <Input
                    id="isletme_adi"
                    name="isletme_adi"
                    value={formData.isletme_adi}
                    onChange={handleInputChange}
                    placeholder="İşletmenizin adı"
                    className={errors.isletme_adi ? "border-red-500" : ""}
                  />
                  {errors.isletme_adi && <p className="text-sm text-red-500">{errors.isletme_adi}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="il">İl <span className="text-red-500">*</span></Label>
                  <Select value={formData.il} onValueChange={(value) => handleSelectChange("il", value)}>
                    <SelectTrigger id="il" className={errors.il ? "border-red-500" : ""}>
                      <SelectValue placeholder="İl seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {iller.map((il) => (
                        <SelectItem key={il} value={il}>{il}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.il && <p className="text-sm text-red-500">{errors.il}</p>}
                </div>
              </>
            )}
            
            {/* Personel için ek alan */}
            {formData.rol === "personel" && (
              <div className="space-y-2">
                <Label htmlFor="isletme_kodu">İşletme Kodu (Opsiyonel)</Label>
                <Input
                  id="isletme_kodu"
                  name="isletme_kodu"
                  value={formData.isletme_kodu}
                  onChange={handleInputChange}
                  placeholder="İşletme kodunu biliyorsanız giriniz"
                />
                <p className="text-xs text-gray-500">
                  İşletme kodunu bilmiyorsanız, boş bırakabilir ve daha sonra ekleyebilirsiniz.
                </p>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            className="w-full" 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Profil Bilgilerini Tamamla
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
