
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Scissors, Search, User, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();

  // Eğer kullanıcı oturum açmışsa dashboard'a yönlendir
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          {/* Sol Bölüm - Hizmet Açıklaması */}
          <div className="space-y-8">
            <h1 className="text-4xl font-bold">Güzellik Hizmetleriniz için Tek Adres</h1>
            <p className="text-lg text-muted-foreground">
              Online randevu sistemi ile güzellik hizmetlerinizi kolayca yönetin
            </p>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Sunduğumuz Hizmetler:</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  Online randevu yönetimi
                </li>
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  Personel ve müşteri takibi
                </li>
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  Gelir-gider raporlaması
                </li>
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  SMS ile bilgilendirme
                </li>
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  Müşteri memnuniyeti takibi
                </li>
              </ul>
            </div>
          </div>

          {/* Sağ Bölüm - Giriş ve Arama */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  className="flex-1 h-12" 
                  variant="outline"
                  onClick={() => navigate("/auth")}
                >
                  <User className="mr-2" />
                  Müşteri Girişi
                </Button>
                <Button 
                  className="flex-1 h-12"
                  onClick={() => navigate("/auth")}
                >
                  <Users className="mr-2" />
                  Kuaför Girişi
                </Button>
              </div>

              <div className="p-6 bg-card rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Hizmet Ara</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input placeholder="Hizmet veya salon adı" />
                    </div>
                    <div className="flex-1">
                      <Input placeholder="Şehir seçin" />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Search className="mr-2" />
                    Ara
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
