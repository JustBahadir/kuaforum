
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function CustomerProfile() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }
        
        setUserId(user.id);
        
        // Try to get profile from service
        try {
          const profile = await profilServisi.getir();
          if (profile) {
            setFirstName(profile.first_name || "");
            setLastName(profile.last_name || "");
            setPhone(profile.phone || "");
          } else {
            // Fallback to user metadata if profile service fails
            setFirstName(user.user_metadata?.first_name || "");
            setLastName(user.user_metadata?.last_name || "");
            setPhone(user.user_metadata?.phone || "");
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
          // Fallback to user metadata
          setFirstName(user.user_metadata?.first_name || "");
          setLastName(user.user_metadata?.last_name || "");
          setPhone(user.user_metadata?.phone || "");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading profile:", error);
        setErrorMessage("Profil bilgileriniz yüklenirken bir hata oluştu.");
        setShowErrorDialog(true);
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !phone) {
      toast.error("Lütfen tüm alanları doldurunuz.");
      return;
    }
    
    setSaving(true);
    
    try {
      if (!userId) {
        toast.error("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
        navigate("/");
        return;
      }
      
      // Try to update profile
      try {
        // Update profile data
        await profilServisi.guncelle({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: "customer"
        });
        
        toast.success("Bilgileriniz başarıyla kaydedildi.");
        
        // Redirect to appointments page after successful profile update
        navigate("/appointments");
      } catch (error: any) {
        console.error("Error saving profile:", error);
        
        // If profile update fails, try to update auth user metadata directly
        try {
          await supabase.auth.updateUser({
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: phone
            }
          });
          
          toast.success("Bilgileriniz kaydedildi, ancak bazı özellikler sınırlı olabilir.");
          navigate("/appointments");
        } catch (secondError) {
          console.error("Second error during fallback:", secondError);
          setErrorMessage("Profil bilgileriniz kaydedilemedi. Lütfen daha sonra tekrar deneyin.");
          setShowErrorDialog(true);
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage("Bilgileriniz kaydedilirken bir hata oluştu.");
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSkip = () => {
    navigate("/appointments");
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profil bilgileriniz yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Müşteri Bilgileriniz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Adınız</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Soyadınız</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon Numaranız</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={saving}
              >
                {saving ? "Kaydediliyor..." : "Bilgileri Kaydet"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleSkip}
          >
            Şimdilik Geç
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-red-500" 
            onClick={handleLogout}
          >
            Çıkış Yap
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hata</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogAction 
              className="w-full" 
              onClick={() => {
                setShowErrorDialog(false);
              }}
            >
              Tamam
            </AlertDialogAction>
            <AlertDialogAction 
              className="w-full" 
              onClick={handleLogout}
            >
              Çıkış Yap
            </AlertDialogAction>
            <AlertDialogAction 
              className="w-full" 
              onClick={handleSkip}
            >
              Ana Sayfaya Git
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
