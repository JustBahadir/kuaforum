
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toast } from "sonner";
import { Sun, Moon, Bell, Mail, Phone } from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { resetSession } = useCustomerAuth();
  const { theme, setTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Wait for component to mount to access localStorage/theme
  useEffect(() => {
    setMounted(true);
    // Initialize dark mode state
    setIsDarkMode(theme === 'dark');
  }, [theme]);
  
  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? 'dark' : 'light');
  };
  
  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('appSettings', JSON.stringify({
      notifications,
      emailNotifications,
      smsNotifications
    }));
    
    toast.success("Ayarlar kaydedildi");
  };
  
  if (!mounted) {
    // Avoid hydration mismatch by only rendering when mounted
    return null;
  }
  
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
                <div className="space-y-0.5 flex items-center gap-2">
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-md">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <Label htmlFor="notifications">Bildirimler</Label>
                    <p className="text-sm text-muted-foreground">
                      Uygulama içi bildirimleri aktifleştir
                    </p>
                  </div>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-md">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <Label htmlFor="emailNotifications">E-posta Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Randevu ve güncellemeler için e-posta bildirimleri al
                    </p>
                  </div>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <div className="bg-green-100 text-green-600 p-2 rounded-md">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <Label htmlFor="smsNotifications">SMS Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Randevu hatırlatmaları için SMS bildirimleri al
                    </p>
                  </div>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-md">
                    {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </div>
                  <div>
                    <Label htmlFor="darkMode">Koyu Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Uygulamayı koyu tema ile görüntüle
                    </p>
                  </div>
                </div>
                <Switch
                  id="darkMode"
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeToggle}
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
