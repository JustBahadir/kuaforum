import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Scissors, Search, Store, User, Users, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Home } from "lucide-react";
import { useCityDistricts } from "@/hooks/useCityDistricts";
import { CustomerSection } from "@/components/home/CustomerSection";
import { toast } from "sonner";

export default function HomePage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    userRole,
    loading
  } = useCustomerAuth();
  
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const { cities, districts, selectedCity, setSelectedCity, selectedDistrict, setSelectedDistrict } = useCityDistricts();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (userRole === 'admin' || userRole === 'staff') {
          navigate('/shop-home', {
            replace: true
          });
        } else if (userRole === 'customer') {
          navigate('/customer-dashboard', {
            replace: true
          });
        } else {
          // Belirsiz role durumunda (örneğin null) hiç bir şey yapma
        }
      } else {
        // Oturum yoksa ana sayfada kal, veya gerekirse login sayfasına gönderin
        // Navigate çağrısı yapma burada spinner yerine button gösteririz
      }
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" aria-label="Yükleniyor">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>;
  }

  const handleCustomerLoginClick = () => {
    setShowCustomerDialog(true);
  };

  const handleFindSalons = () => {
    // This will be implemented in the future
    toast.info("Bu özellik yakında eklenecektir.");
  };

  return <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Kuaför Randevu</h1>
          <div className="flex gap-2">
            {isAuthenticated ? (
              <Button variant="outline" onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profilim
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate("/login")}>
                <User className="mr-2 h-4 w-4" />
                Giriş Yap
              </Button>
            )}
            <Button variant="default" onClick={() => navigate("/staff-login")}>
              <Store className="mr-2 h-4 w-4" />
              Kuaför Girişi
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-12rem)]">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold">Güzellik Merkeziniz İçin
Tek Adres</h1>
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

          <CustomerSection 
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            cities={cities}
            districts={districts}
            handleFindSalons={handleFindSalons}
          />
        </div>
      </div>

      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bilgilendirme</DialogTitle>
            <DialogDescription className="py-4">
              Bu bölüm gelecek sürümlerde eklenecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
            setShowCustomerDialog(false);
          }} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}
