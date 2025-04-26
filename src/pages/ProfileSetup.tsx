
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, LogOut } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUserProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          setError("Kullanıcı bilgileri alınamıyor. Lütfen giriş yapın.");
          setLoading(false);
          return;
        }

        if (!user) {
          setError("Oturum açılmamış. Lütfen giriş yapın.");
          setLoading(false);
          return;
        }

        setUser(user);

        // Profil bilgilerini alıyoruz
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, first_name, last_name, phone, gender, shopname")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setError("Profil bilgileri alınırken bir hata oluştu. Lütfen tekrar giriş yapın.");
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError("Hesabınız bulunamadı. Lütfen kayıt olun.");
          setLoading(false);
          return;
        }

        // We have a profile, continue with normal flow
        let normalizedRole = profileData.role;
        // Eğer role "isletmeci" ise "admin" veya uygun başka bir enum ile değiştiriyoruz
        if (normalizedRole === "isletmeci") {
          normalizedRole = "admin"; 
        }

        // Eğer profil tamamlanmışsa rolüne göre yönlendirme
        if (
          profileData.first_name &&
          profileData.last_name &&
          profileData.phone &&
          profileData.gender &&
          (normalizedRole === "admin" ? profileData.shopname : true)
        ) {
          if (normalizedRole === "admin") {
            navigate("/shop-home");
          } else if (normalizedRole === "staff") {
            navigate("/staff-profile");
          } else {
            // customer ya da diğer rollerin anasayfası
            navigate("/");
          }
        } else {
          // Profil tamamlanmamışsa bu sayfada kal
          setLoading(false);
        }
      } catch (error) {
        console.error("Oturum kontrolü sırasında hata:", error);
        setError("Sistem hatası oluştu. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      }
    }

    checkUserProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Hata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profil Bulunamadı</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Giriş Yap
              </Button>
              
              <Button 
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Ana Sayfa
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-gray-500 text-center">
              Hesabınız bulunamadı. Eğer yeni bir kullanıcıysanız lütfen kayıt olun.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Profil Kurulumu</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Profilinizi tamamlamanız gerekmektedir.
            </AlertDescription>
          </Alert>
          
          {/* Form will be implemented here */}
          <p className="text-center text-gray-600">
            Profil bilgilerinizi doldurmak için gerekli alanları ekleyeceğiz.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleLogout}>
            Çıkış Yap
          </Button>
          <Button onClick={() => navigate("/")}>
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
