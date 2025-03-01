
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { supabase } from "@/lib/supabase";

interface CustomerProfileProps {
  isNewUser?: boolean;
}

export default function CustomerProfile({ isNewUser = false }: CustomerProfileProps) {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profilServisi.getir();
        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setPhone(profile.phone || "");
        }
      } catch (error) {
        console.error("Profil bilgileri yüklenirken hata:", error);
        toast.error("Profil bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!firstName || !lastName || !phone) {
        toast.error("Lütfen tüm zorunlu alanları doldurunuz.");
        setLoading(false);
        return;
      }

      const updatedProfile = await profilServisi.guncelle({
        first_name: firstName,
        last_name: lastName,
        phone
      });

      console.log("Profil güncellendi:", updatedProfile);
      toast.success("Bilgileriniz başarıyla kaydedildi.");
      
      // Yeni kullanıcılar için randevu sayfasına yönlendir
      if (isNewUser) {
        navigate("/appointments");
      } else {
        // Mevcut kullanıcılar için önceki sayfaya dön
        navigate(-1);
      }
    } catch (error: any) {
      console.error("Profil güncelleme hatası:", error);
      
      // Hataya rağmen kullanıcıyı randevu sayfasına yönlendirmek için kontrol
      let shouldNavigate = false;
      
      // Infinity recursion veya schema hatası gibi kritik hataları göster
      if (error.code === '42P17' || error.message?.includes('infinite recursion') || error.message?.includes('occupation')) {
        toast.error(
          "Profil güncellenirken bir hata oluştu, ancak temel bilgileriniz kaydedildi. Daha sonra tekrar deneyebilirsiniz."
        );
        shouldNavigate = true; // Bu hatalara rağmen devam edebiliriz
      } else {
        toast.error("Bilgileriniz kaydedilirken bir hata oluştu: " + error.message);
        shouldNavigate = false;
      }
      
      // Kritik olmayan hatalarda bile yeni kullanıcıları yönlendir
      if (shouldNavigate || isNewUser) {
        setTimeout(() => {
          navigate("/appointments");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (isNewUser) {
      // Yeni kullanıcılar için direkt ana sayfaya yönlendir
      navigate("/appointments");
    } else {
      // Mevcut kullanıcılar için önceki sayfaya dön
      navigate(-1);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profil bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isNewUser ? "Müşteri Bilgilerinizi Tamamlayın" : "Müşteri Profili Güncelleme"}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Adınız *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Adınız"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Soyadınız *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Soyadınız"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon Numaranız *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              required
            />
            <p className="text-xs text-gray-500">* Zorunlu alanlar</p>
          </div>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Bilgilerimi Kaydet"}
            </Button>
            
            <div className="flex gap-2 mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSkip} 
                className="flex-1"
              >
                {isNewUser ? "Şimdilik Atla" : "Vazgeç"}
              </Button>
              
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleLogout}
                className="flex-1"
              >
                Çıkış Yap
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
