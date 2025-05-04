
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Plus, CalendarDays, Users, Scissors, Bookmark } from "lucide-react";

export default function IsletmeAnasayfa() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isletme, setIsletme] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIsletmeData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("isletmeler")
          .select("*")
          .eq("sahip_kimlik", user.id)
          .maybeSingle();

        if (error) throw error;
        setIsletme(data);
      } catch (error) {
        console.error("İşletme bilgileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadIsletmeData();
    }
  }, [user, authLoading]);

  const handleCreateIsletme = () => {
    navigate("/isletme/olustur");
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // İşletme yoksa
  if (!isletme) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Hoş Geldiniz!</CardTitle>
            <CardDescription>
              Sistemi kullanmaya başlamak için bir işletme oluşturmalısınız.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button onClick={handleCreateIsletme} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> İşletme Oluştur
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // İşletme varsa
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{isletme.isletme_adi}</h1>
        <p className="text-muted-foreground">
          İşletme Kodu: <span className="font-mono">{isletme.isletme_kodu}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              Randevular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Randevuları görüntüleyin ve yönetin.</p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/isletme/randevular")}
            >
              Randevulara Git
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Müşteriler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Müşteri bilgilerini yönetin.</p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/isletme/musteriler")}
            >
              Müşterilere Git
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Scissors className="mr-2 h-5 w-5 text-primary" />
              Hizmetler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Hizmet ve kategorileri yönetin.</p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/isletme/hizmetler")}
            >
              Hizmetlere Git
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Bookmark className="mr-2 h-5 w-5 text-primary" />
              Personel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Personel ve başvuruları yönetin.</p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/isletme/personel")}
            >
              Personele Git
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
