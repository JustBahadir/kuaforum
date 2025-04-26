
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

export default function ProfileSetup() {
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string>("");
  const [role, setRole] = useState("staff");
  const [shopCode, setShopCode] = useState("");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
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

    if (role === "admin" && !shopName) {
      toast.error("İşletme adı zorunludur.");
      return;
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
          active: true
        };
        
        const { error: shopError } = await supabase
          .from('dukkanlar')
          .insert([shopData]);
          
        if (shopError) throw shopError;
        
        navigate("/shop-home");
      } else if (role === 'staff') {
        // For staff, check if shop code exists
        if (shopCode) {
          // Try to find shop with the provided code
          const { data: shopData, error: shopError } = await supabase
            .from('dukkanlar')
            .select('id')
            .eq('kod', shopCode)
            .single();

          if (shopError || !shopData) {
            toast.error("Geçersiz işletme kodu.");
            navigate("/unassigned-staff");
            return;
          }

          // Update personel record with shop id
          await supabase
            .from('personel')
            .update({ dukkan_id: shopData.id })
            .eq('auth_id', userId);

          navigate("/staff-profile");
        } else {
          // If no shop code provided, redirect to unassigned staff page
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
              <div className="space-y-2">
                <Label htmlFor="shopName">İşletme Adı*</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="İşletmenizin adını girin"
                  required
                />
                <p className="text-xs text-gray-500">
                  (İşletme adını daha sonra değiştirebilirsiniz.)
                </p>
              </div>
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
