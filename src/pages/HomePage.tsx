import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Scissors, Search, User, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Home } from "lucide-react";
export default function HomePage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    userRole,
    loading
  } = useCustomerAuth();
  const [showCustomerDialog, setShowCustomerDialog] = React.useState(false);
  React.useEffect(() => {
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
  return <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-center">Güzellik Merkeziniz İçin
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
                
                
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button className="flex-1 h-12" variant="outline" onClick={() => navigate("/login")}>
                  <User className="mr-2" />
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
                    <Search className="mr-2" />
                    Ara
                  </Button>
                </div>
              </div>
            </div>
          </div>
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