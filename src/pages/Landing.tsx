
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Scissors } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
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
              </ul>
            </div>
          </div>

          {/* Sağ Bölüm - Giriş */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  className="flex-1 h-12"
                  onClick={() => navigate("/auth")}
                >
                  <Scissors className="mr-2" />
                  Kuaför Girişi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
