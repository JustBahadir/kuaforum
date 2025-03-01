
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { profilServisi } from "@/lib/supabase/services/profilServisi";

export default function CustomerProfile() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }
        
        setUserId(user.id);
        
        const profile = await profilServisi.getir();
        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setPhone(profile.phone || "");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Profil bilgileriniz yüklenirken bir hata oluştu.");
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
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Bilgileriniz kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
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
      </Card>
    </div>
  );
}
