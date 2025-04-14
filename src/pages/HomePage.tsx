
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Scissors, Search, User, Users } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, loading } = useCustomerAuth();

  // Handle redirects based on authentication status
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (userRole === 'admin') {
        navigate('/shop-home');
      } else if (userRole === 'staff') {
        navigate('/shop-home');
      } else if (userRole === 'customer') {
        navigate('/customer-dashboard');
      }
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  // Handle login button clicks
  const handleCustomerAuthClick = () => navigate("/login");
  const handleStaffAuthClick = () => navigate("/staff-login");

  // If still loading, show a spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
                  onClick={handleCustomerAuthClick}
                >
                  <User className="mr-2" />
                  Müşteri Girişi
                </Button>
                <Button 
                  className="flex-1 h-12"
                  onClick={handleStaffAuthClick}
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
