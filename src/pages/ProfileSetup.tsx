
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Home } from "lucide-react";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("staff");
  const [shopCode, setShopCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Check if the user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // If not authenticated, redirect to login
        navigate("/login");
        return;
      }
      setUserId(data.session.user.id);
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !phone || !gender || !role) {
      toast.error("Lütfen tüm zorunlu alanları doldurunuz.");
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
      
      // Create or update profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          phone,
          gender,
          role
        });
      
      if (profileError) {
        throw profileError;
      }
      
      toast.success("Profiliniz başarıyla oluşturuldu!");
      
      // If staff role and has shop code, handle shop connection
      if (role === 'staff' && shopCode) {
        // TODO: Implement shop code verification
      }
      
      // Redirect based on role
      if (role === 'admin') {
        navigate("/shop-home");
      } else if (role === 'staff') {
        navigate("/staff-profile");
      } else {
        navigate("/shop-home"); // Default redirect
      }
      
    } catch (error: any) {
      console.error("Profile setup error:", error);
      toast.error(`Profil oluşturulamadı: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNavigateHome = () => {
    navigate("/");
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
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Adınız"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad*</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Soyadınız"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon*</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXXX"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Cinsiyet*</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger>
                  <SelectValue placeholder="Cinsiyet seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erkek">Erkek</SelectItem>
                  <SelectItem value="kadın">Kadın</SelectItem>
                  <SelectItem value="diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Kayıt Türü*</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Kayıt türü seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Personel</SelectItem>
                  <SelectItem value="admin">İşletme Sahibi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shopCode">İşletme Kodu (Opsiyonel)</Label>
              <Input
                id="shopCode"
                value={shopCode}
                onChange={(e) => setShopCode(e.target.value)}
                placeholder="Dükkan yöneticisinden alınan kod"
              />
              <p className="text-xs text-gray-500">Personel iseniz ve bir işletmeye bağlanmak istiyorsanız girin.</p>
            </div>
            
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
          <Button variant="ghost" onClick={handleNavigateHome} className="flex items-center gap-2">
            <Home size={16} />
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
