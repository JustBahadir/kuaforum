
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toast } from "sonner";

export default function Settings() {
  const { resetSession } = useCustomerAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const handleSaveSettings = () => {
    toast.success("Ayarlar kaydedildi");
  };
  
  return (
    <StaffLayout>
      <div className="container p-4">
        <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>
                Uygulama ayarlarınızı buradan özelleştirebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Bildirimler</Label>
                  <p className="text-sm text-muted-foreground">
                    Uygulama içi bildirimleri aktifleştir
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailUpdates">E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Güncellemeler ve yeni özellikler hakkında e-posta al
                  </p>
                </div>
                <Switch
                  id="emailUpdates"
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Koyu Tema</Label>
                  <p className="text-sm text-muted-foreground">
                    Uygulamayı koyu tema ile görüntüle
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <Button onClick={handleSaveSettings} className="w-full sm:w-auto mt-4">
                Ayarları Kaydet
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hesap Yönetimi</CardTitle>
              <CardDescription>
                Hesap yönetimi ile ilgili ayarlar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Oturumu Sıfırla</h3>
                <p className="text-sm text-muted-foreground">
                  Tüm oturum verilerini temizler ve sizi tekrar giriş sayfasına yönlendirir.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (confirm("Oturumu sıfırlamak istediğinize emin misiniz?")) {
                      resetSession();
                    }
                  }}
                >
                  Oturumu Sıfırla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
}
