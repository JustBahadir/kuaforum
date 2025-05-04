
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Scissors, LogIn } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && user) {
      navigate("/profil-olustur", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-center md:text-left">
              Güzellik Hizmetleriniz için Tek Adres
            </h1>
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

          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-full max-w-md aspect-square bg-white rounded-lg shadow-xl overflow-hidden relative">
              <img 
                src="/lovable-uploads/cf8eae5c-65fd-4218-ac7d-a65fbc142889.png" 
                alt="Salon görüntüsü"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col items-center justify-end p-8">
                <h3 className="text-white text-2xl font-bold mb-4">Kuaför Yönetim Sistemi</h3>
                <Button 
                  size="lg"
                  onClick={() => navigate("/giris")}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
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
