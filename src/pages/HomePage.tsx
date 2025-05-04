
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Scissors, Search, User } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { signInWithGoogle, user, userRole, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && user) {
      if (userRole === "isletme_sahibi") {
        navigate("/isletme/anasayfa", { replace: true });
      } else if (userRole === "personel") {
        navigate("/personel/anasayfa", { replace: true });
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-center">
              Güzellik Merkeziniz İçin Tek Adres
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

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button className="flex-1 h-12" onClick={() => signInWithGoogle()}>
                  <User className="mr-2" />
                  Google ile Giriş Yap
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
