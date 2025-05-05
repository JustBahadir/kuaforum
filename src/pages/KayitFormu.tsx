
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormGroup, FormLabel, FormMessage } from "@/components/ui/form-elements";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function KayitFormu() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    rol: "musteri", // Default rol
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          console.error("Kullanıcı bilgisi alınamadı:", error);
          navigate("/login", { replace: true });
          return;
        }

        // User is logged in, now check if they have an existing profile
        const { data: existingProfile } = await supabase
          .from("kullanicilar")
          .select("*")
          .eq("auth_id", data.user.id)
          .maybeSingle();
        
        if (existingProfile) {
          // User already has a profile, redirect to appropriate page
          if (existingProfile.rol === "isletme_sahibi") {
            navigate("/isletme/anasayfa", { replace: true });
          } else if (existingProfile.rol === "personel") {
            navigate("/personel/anasayfa", { replace: true });
          } else {
            navigate("/musteri/anasayfa", { replace: true });
          }
          return;
        }

        // Populate form with user data from Google if available
        setUserData(data.user);
        if (data.user.user_metadata) {
          const { name = "", email = "" } = data.user.user_metadata;
          const nameParts = name.split(" ");
          
          setFormData(prev => ({
            ...prev,
            ad: nameParts[0] || "",
            soyad: nameParts.slice(1).join(" ") || "",
            email: email
          }));
        }
      } catch (error) {
        console.error("Profile setup error:", error);
        toast.error("Profil bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.ad) newErrors.ad = "Ad zorunludur";
    if (!formData.soyad) newErrors.soyad = "Soyad zorunludur";
    if (!formData.telefon) newErrors.telefon = "Telefon numarası zorunludur";
    if (!formData.rol) newErrors.rol = "Kullanıcı rolü zorunludur";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userData) return;
    
    setSubmitting(true);
    
    try {
      // Create user profile in kullanicilar table
      const { data, error } = await supabase
        .from("kullanicilar")
        .insert({
          auth_id: userData.id,
          ad: formData.ad,
          soyad: formData.soyad,
          telefon: formData.telefon,
          rol: formData.rol,
          profil_tamamlandi: true,
          email: userData.email,
          kimlik: userData.id, // Using auth ID as kimlik
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Profiliniz başarıyla oluşturuldu");
      
      // Redirect based on user role
      if (formData.rol === "isletme_sahibi") {
        navigate("/isletme/anasayfa", { replace: true });
      } else if (formData.rol === "personel") {
        navigate("/personel/anasayfa", { replace: true });
      } else {
        navigate("/musteri/anasayfa", { replace: true });
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      toast.error(`Profil kaydedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600">Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md border shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Profil Oluşturma</CardTitle>
          <CardDescription className="text-center">
            Hesabınızı tamamlamak için lütfen aşağıdaki bilgileri doldurun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormGroup>
              <FormLabel>Ad</FormLabel>
              <Input
                value={formData.ad}
                onChange={(e) => setFormData({...formData, ad: e.target.value})}
                placeholder="Adınız"
              />
              {errors.ad && <FormMessage>{errors.ad}</FormMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Soyad</FormLabel>
              <Input
                value={formData.soyad}
                onChange={(e) => setFormData({...formData, soyad: e.target.value})}
                placeholder="Soyadınız"
              />
              {errors.soyad && <FormMessage>{errors.soyad}</FormMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Telefon</FormLabel>
              <Input
                value={formData.telefon}
                onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                placeholder="05XX XXX XX XX"
              />
              {errors.telefon && <FormMessage>{errors.telefon}</FormMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Kayıt Tipi</FormLabel>
              <Select
                value={formData.rol}
                onValueChange={(value) => setFormData({...formData, rol: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kayıt tipini seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="musteri">Müşteri</SelectItem>
                  <SelectItem value="isletme_sahibi">İşletme Sahibi</SelectItem>
                  <SelectItem value="personel">Personel</SelectItem>
                </SelectContent>
              </Select>
              {errors.rol && <FormMessage>{errors.rol}</FormMessage>}
            </FormGroup>
            
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor
                </>
              ) : 'Profili Tamamla'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-sm">
            Vazgeç ve Giriş Sayfasına Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
