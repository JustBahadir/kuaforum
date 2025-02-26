
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Calendar, Scissors, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<'none' | 'customer' | 'personnel'>('none');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Ana Seçim Butonları */}
        {selectedSection === 'none' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Müşteri Seçeneği */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setSelectedSection('customer')}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <User className="h-8 w-8 text-primary" />
                  Müşteri İşlemleri
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Randevu alma ve müşteri hizmetleri için tıklayın
              </CardContent>
            </Card>

            {/* Personel Seçeneği */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedSection('personnel')}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-8 w-8 text-primary" />
                  Personel İşlemleri
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Personel ve işletme yönetimi için tıklayın
              </CardContent>
            </Card>
          </div>
        )}

        {/* Müşteri Menüsü */}
        {selectedSection === 'customer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Müşteri İşlemleri</h2>
              <Button variant="outline" onClick={() => setSelectedSection('none')}>
                Geri Dön
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/operations')}
              >
                <Scissors className="mr-2 h-6 w-6" />
                Hizmetlerimiz
              </Button>
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/appointments')}
              >
                <Calendar className="mr-2 h-6 w-6" />
                Randevu Al
              </Button>
            </div>
          </div>
        )}

        {/* Personel Menüsü */}
        {selectedSection === 'personnel' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Personel İşlemleri</h2>
              <Button variant="outline" onClick={() => setSelectedSection('none')}>
                Geri Dön
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/personnel')}
              >
                <Users className="mr-2 h-6 w-6" />
                Personel Yönetimi
              </Button>
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/customers')}
              >
                <User className="mr-2 h-6 w-6" />
                Müşteri Listesi
              </Button>
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/operations/staff')}
              >
                <Settings className="mr-2 h-6 w-6" />
                İşletme Ayarları
              </Button>
              <Button 
                className="h-24 text-lg"
                onClick={() => navigate('/appointments')}
              >
                <Calendar className="mr-2 h-6 w-6" />
                Randevu Takvimi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
