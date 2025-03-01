
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    phone: "",
    age: "",
    occupation: ""
  });

  // Fetch user data if available
  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast({
          title: "Oturum hatası!",
          description: "Lütfen önce giriş yapın.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      const userId = sessionData.session.user.id;
      setUserData({ ...userData, id: userId });
      
      // Get existing profile data if any
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, age, occupation')
        .eq('id', userId)
        .single();
      
      if (profileData) {
        setUserData({
          id: userId,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          phone: profileData.phone || "",
          age: profileData.age?.toString() || "",
          occupation: profileData.occupation || ""
        });
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
        toast({
          title: "Eksik bilgi!",
          description: "Lütfen gerekli tüm alanları doldurun.",
          variant: "destructive",
        });
        return;
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          age: userData.age ? parseInt(userData.age) : null,
          occupation: userData.occupation
        })
        .eq('id', userData.id);
      
      if (error) throw error;
      
      toast({
        title: "Profil kaydedildi!",
        description: "Bilgileriniz başarıyla güncellendi.",
      });
      
      // Redirect to appointments page
      navigate("/appointments");
      
    } catch (error) {
      console.error("Profile save error:", error);
      toast({
        title: "Kayıt hatası!",
        description: "Profil bilgileriniz kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
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
                <Label htmlFor="age">Yaş</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={userData.age}
                  onChange={handleInputChange}
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
