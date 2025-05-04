
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatPhoneNumber, stripPhoneFormatting } from "@/utils/phoneFormatter";
import { CityISOCodes } from "@/utils/cityISOCodes";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    role: "",
    businessName: "",
    city: "",
    businessCode: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle phone input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = stripPhoneFormatting(rawValue);
    
    // Limit to 11 digits
    if (digitsOnly.length <= 11) {
      setFormData({ ...formData, phone: digitsOnly });
      
      // Clear error for this field
      if (errors.phone) {
        setErrors({ ...errors, phone: "" });
      }
    }
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Ad alanı zorunludur";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Soyad alanı zorunludur";
    }
    
    if (!formData.gender) {
      newErrors.gender = "Cinsiyet seçimi zorunludur";
    }
    
    if (!formData.role) {
      newErrors.role = "Kayıt türü seçimi zorunludur";
    }
    
    // Role-specific validations
    if (formData.role === "admin") {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "İşletme adı zorunludur";
      }
      
      if (!formData.city) {
        newErrors.city = "İşletme ili zorunludur";
      }
    }
    
    // Phone validation - if provided
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Telefon numarası en az 10 haneli olmalıdır";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Kullanıcı oturumu bulunamadı");
        navigate("/login");
        return;
      }
      
      // Create or update user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
          phone: formData.phone || null,
          role: formData.role,
        });
        
      if (profileError) {
        throw profileError;
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
        }
      });
      
      // Handle based on role
      if (formData.role === "admin") {
        // Get city code
        const cityCode = CityISOCodes[formData.city as keyof typeof CityISOCodes] || "";
        
        // Generate shop code (first 2 letters of business name + city code + 2 random digits)
        const businessNamePrefix = formData.businessName.substring(0, 2).toUpperCase();
        const randomDigits = Math.floor(10 + Math.random() * 90).toString();
        const shopCode = `${businessNamePrefix}${cityCode}${randomDigits}`;
        
        // Create business record
        const { error: businessError } = await supabase
          .from("dukkanlar")
          .insert({
            ad: formData.businessName,
            kod: shopCode,
            sahibi_id: user.id,
            il: formData.city
          });
        
        if (businessError) {
          throw businessError;
        }
        
        toast.success("İşletme bilgileri kaydedildi");
        navigate("/isletme-anasayfa");
      } 
      else if (formData.role === "staff") {
        // Create personnel record
        const { error: personnelError } = await supabase
          .from("personel")
          .insert({
            auth_id: user.id,
            ad_soyad: `${formData.firstName} ${formData.lastName}`,
            telefon: formData.phone || null,
          });
        
        if (personnelError) {
          throw personnelError;
        }
        
        // If business code provided, create join request
        if (formData.businessCode.trim()) {
          // Check if business code exists
          const { data: businessData, error: businessCheckError } = await supabase
            .from("dukkanlar")
            .select("id")
            .eq("kod", formData.businessCode)
            .maybeSingle();
            
          if (businessCheckError || !businessData) {
            toast.error("Belirtilen işletme kodu bulunamadı");
          } else {
            // Get personnel id
            const { data: personnelData } = await supabase
              .from("personel")
              .select("id")
              .eq("auth_id", user.id)
              .single();
              
            // Create join request
            if (personnelData) {
              const { error: joinRequestError } = await supabase
                .from("staff_join_requests")
                .insert({
                  personel_id: personnelData.id,
                  dukkan_id: businessData.id,
                  durum: "pending"
                });
                
              if (joinRequestError) {
                console.error("Join request error:", joinRequestError);
                toast.error("İşletmeye katılma isteği gönderilirken bir hata oluştu");
              } else {
                toast.success("İşletmeye katılma isteği gönderildi");
              }
            }
          }
        }
        
        navigate("/atanmamis-personel");
      }
      
    } catch (error: any) {
      console.error("Profile setup error:", error);
      toast.error("Profil oluşturulurken bir hata oluştu: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profil Bilgilerinizi Tamamlayın</CardTitle>
          <CardDescription>
            Uygulamayı kullanmaya başlamak için lütfen bilgilerinizi girin
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Adınız"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Soyadınız"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
              
              <div>
                <Label htmlFor="gender">Cinsiyet</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="erkek">Erkek</SelectItem>
                    <SelectItem value="kadın">Kadın</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
              
              <div>
                <Label htmlFor="phone">Telefon Numarası (İsteğe Bağlı)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formatPhoneNumber(formData.phone)}
                  onChange={handlePhoneChange}
                  placeholder="05xx xxx xx xx"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div>
                <Label htmlFor="role">Kayıt Türü</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Kayıt türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">İşletme Sahibi</SelectItem>
                    <SelectItem value="staff">Personel</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
            </div>
            
            {/* Conditional fields based on role */}
            {formData.role === "admin" && (
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-sm font-medium">İşletme Bilgileri</h3>
                
                <div>
                  <Label htmlFor="businessName">İşletme Adı</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="İşletmenizin adı"
                    className={errors.businessName ? "border-red-500" : ""}
                  />
                  {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                </div>
                
                <div>
                  <Label htmlFor="city">İşletmenin İli</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => handleSelectChange("city", value)}
                  >
                    <SelectTrigger className={errors.city ? "border-red-500" : ""}>
                      <SelectValue placeholder="İl seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CityISOCodes).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
              </div>
            )}
            
            {formData.role === "staff" && (
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-sm font-medium">Personel Bilgileri</h3>
                
                <div>
                  <Label htmlFor="businessCode">İşletme Kodu (İsteğe Bağlı)</Label>
                  <Input
                    id="businessCode"
                    name="businessCode"
                    value={formData.businessCode}
                    onChange={handleInputChange}
                    placeholder="Örn: AB1234"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    İşletme kodunu biliyorsanız girebilirsiniz. Boş bırakırsanız daha sonra bir işletmeye katılabilirsiniz.
                  </p>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Profili Tamamla"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
