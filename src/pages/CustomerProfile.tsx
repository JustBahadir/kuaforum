
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { profilServisi } from "@/lib/supabase/services/profilServisi";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    phone: "",
    occupation: "",
    role: "customer" // Default role
  });

  // Fetch user data if available
  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast("Lütfen önce giriş yapın.");
        navigate("/");
        return;
      }
      
      const userId = sessionData.session.user.id;
      setUserData(prev => ({ ...prev, id: userId }));
      
      try {
        // Get existing profile data if any
        const profileData = await profilServisi.getir();
        
        if (profileData) {
          setUserData({
            id: userId,
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            phone: profileData.phone || "",
            occupation: profileData.occupation || "",
            role: profileData.role || "customer"
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Profil bilgileri alınırken bir hata oluştu.");
      }
      
      setLoading(false);
    };
    
    getUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Check if all required fields are filled
      if (!userData.first_name || !userData.last_name || !userData.phone) {
        toast.error("Lütfen gerekli tüm alanları doldurun.");
        setSaving(false);
        return;
      }
      
      console.log("Saving profile data:", userData);
      
      // Use the updated profile service
      await profilServisi.guncelle({
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        occupation: userData.occupation,
        role: userData.role // Should be 'customer'
      });
      
      toast.success("Profil kaydedildi!");
      
      // Redirect to appointments page
      navigate("/appointments");
      
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error("Profil bilgileriniz kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Müşteri Profili</CardTitle>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </div>
            <CardDescription>
              Lütfen kişisel bilgilerinizi tamamlayın
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Ad *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={userData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Soyad *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={userData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation">Meslek</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={userData.occupation}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={saving}
              >
                {saving ? "Kaydediliyor..." : "Profili Kaydet"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
