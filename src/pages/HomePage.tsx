
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Scissors, Search, User, Users } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, loading } = useCustomerAuth();

  // Yönlendirme sadece loading tamamlandığında yapılır
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (userRole === 'admin' || userRole === 'staff') {
          navigate('/shop-home', { replace: true });
        } else if (userRole === 'customer') {
          navigate('/customer-dashboard', { replace: true });
        } else {
          // Belirsiz role durumunda (örneğin null) hiç bir şey yapma
        }
      } else {
        // Oturum yoksa ana sayfada kal, veya gerekirse login sayfasına gönderin
        // Navigate çağrısı yapma burada spinner yerine button gösteririz
      }
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  // loading durumunda spinner gösterilir
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-label="Yükleniyor">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

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
                  onClick={() => navigate("/login")}
                >
                  <User className="mr-2" />
                  Müşteri Girişi
                </Button>
                <Button 
                  className="flex-1 h-12"
                  onClick={() => navigate("/login")}
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
                  <Button className="w-full" onClick={() => {}}>
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
