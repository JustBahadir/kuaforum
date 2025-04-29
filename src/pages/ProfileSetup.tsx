
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Home } from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { CityISOCodes } from "@/utils/cityISOCodes";

export default function ProfileSetup() {
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string>("");
  const [role, setRole] = useState("staff");
  const [shopCode, setShopCode] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopCity, setShopCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cities, setCities] = useState<{name: string, value: string}[]>([]);
  
  // Prepare cities list from CityISOCodes
  useEffect(() => {
    const cityList = Object.keys(CityISOCodes).map(cityCode => ({
      name: cityCode.charAt(0) + cityCode.slice(1).toLowerCase(),
      value: cityCode
    }));
    
    // Sort cities alphabetically
    cityList.sort((a, b) => a.name.localeCompare(b.name));
    setCities(cityList);
  }, []);
  
  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
        return;
      }
      setUserId(data.session.user.id);
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    // Only allow letters and spaces
    const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
    setter(value);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const numbers = e.target.value.replace(/\D/g, '').substring(0, 11);
    setPhone(numbers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !phone || !role) {
      toast.error("Lütfen zorunlu alanları doldurunuz.");
      return;
    }

    if (phone.length !== 11) {
      toast.error("Lütfen geçerli bir telefon numarası giriniz (11 haneli).");
      return;
    }

    if (role === "admin") {
      if (!shopName) {
        toast.error("İşletme adı zorunludur.");
        return;
      }
      
      if (!shopCity) {
        toast.error("İşletmenin olduğu il seçimi zorunludur.");
        return;
      }
    }
    
    setLoading(true);
    
    try {
      if (!userId) {
        toast.error("Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.");
        navigate("/login");
        return;
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      });
      
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          phone,
          gender: gender || null,
          role
        });
      
      if (profileError) {
        throw profileError;
      }
      
      if (role === 'admin') {
        const shopData = {
          ad: shopName,
          sahibi_id: userId,
          kod: Math.random().toString(36).substring(7).toUpperCase(),
          active: true,
          adres: shopCity // Store the city in the adres field
        };
        
        const { error: shopError } = await supabase
          .from('dukkanlar')
          .insert([shopData]);
          
        if (shopError) throw shopError;

        toast.success("İşletme kaydınız oluşturuldu!");
        navigate("/shop-home");
      } else if (role === 'staff') {
        // For staff, try to create a personel record whether or not there's a shop code
        try {
          let dukkanId = null;
          
          // Check if shop code exists, if provided
          if (shopCode) {
            const { data: shopData } = await supabase
              .from('dukkanlar')
              .select('id')
              .eq('kod', shopCode)
              .maybeSingle();
            
            if (shopData) {
              dukkanId = shopData.id;
            }
          }
          
          // Create personel record
          const personelData = {
            auth_id: userId,
            ad_soyad: `${firstName} ${lastName}`,
            telefon: phone,
            eposta: '',
            adres: '',
            personel_no: `P${Date.now().toString().substring(8)}`,
            calisma_sistemi: 'Tam Zamanlı',
            maas: 0,
            prim_yuzdesi: 0
          };
          
          // Add dukkanId if it exists
          if (dukkanId) {
            Object.assign(personelData, { dukkan_id: dukkanId });
          }
          
          const { error: personelError } = await supabase
            .from('personel')
            .insert([personelData]);
          
          if (personelError) {
            console.error("Personel kaydı oluşturma hatası:", personelError);
            // Even with error, continue to redirect
          }
          
          if (dukkanId) {
            // With shop id, redirect to staff profile
            toast.success("İşletmeye başarıyla kaydoldunuz!");
            navigate("/staff-profile");
          } else {
            // Without shop id, redirect to unassigned staff
            toast.success("Profiliniz oluşturuldu!");
            navigate("/unassigned-staff");
          }
        } catch (err) {
          console.error("Personel kaydı oluşturma hatası:", err);
          toast.success("Profiliniz oluşturuldu, ancak personel kaydınız tam olarak tamamlanamadı.");
          navigate("/unassigned-staff");
        }
      }
      
    } catch (error: any) {
      console.error("Profile setup error:", error);
      toast.error(`Profil oluşturulamadı: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-t-lg">
            Profil Bilgilerinizi Tamamlayın
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad*</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => handleNameInput(e, setFirstName)}
                  placeholder="Adınız"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad*</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => handleNameInput(e, setLastName)}
                  placeholder="Soyadınız"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon*</Label>
              <Input
                id="phone"
                value={formatPhoneNumber(phone)}
                onChange={handlePhoneInput}
                placeholder="05XX XXX XX XX"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Cinsiyet</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Cinsiyet seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kadın">Kadın</SelectItem>
                  <SelectItem value="erkek">Erkek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Kayıt Türü*</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Kayıt türü seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Personel</SelectItem>
                  <SelectItem value="admin">İşletme Sahibi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "staff" ? (
              <div className="space-y-2">
                <Label htmlFor="shopCode">İşletme Kodu (Opsiyonel)</Label>
                <Input
                  id="shopCode"
                  value={shopCode}
                  onChange={(e) => setShopCode(e.target.value)}
                  placeholder="Dükkan yöneticisinden alınan kod"
                />
                <p className="text-xs text-gray-500">
                  Personel iseniz ve bir işletmeye bağlanmak istiyorsanız girin.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="shopName">İşletme Adı*</Label>
                  <Input
                    id="shopName"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="İşletmenizin adını girin"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shopCity">İşletmenin Olduğu İl*</Label>
                  <Select value={shopCity} onValueChange={setShopCity} required>
                    <SelectTrigger>
                      <SelectValue placeholder="İl seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              disabled={loading}
            >
              {loading ? "İşleniyor..." : "Profili Tamamla"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
            <Home size={16} />
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
