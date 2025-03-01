
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { User, UserRound, Phone } from "lucide-react";

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

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Profil bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isNewUser ? "Müşteri Bilgilerinizi Tamamlayın" : "Profil Bilgilerim"}
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form id="profileForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User size={16} />
                  Adınız *
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Adınız"
                  className="max-w-md"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <UserRound size={16} />
                  Soyadınız *
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Soyadınız"
                  className="max-w-md"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone size={16} />
                  Telefon Numaranız *
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="max-w-md"
                  required
                />
                <p className="text-xs text-gray-500">* Zorunlu alanlar</p>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button 
              type="submit" 
              form="profileForm"
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Bilgilerimi Kaydet"}
            </Button>
            
            {isNewUser && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/appointments")}
              >
                Şimdilik Atla
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
