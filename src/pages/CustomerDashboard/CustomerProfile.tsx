
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Calendar } from "lucide-react";

export default function CustomerProfile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    async function fetchProfileData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Get email from auth
        setProfile(prev => ({ ...prev, email: user.email || "" }));
        
        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Profil bilgileri alınırken bir hata oluştu");
        } else if (data) {
          setProfile({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
            email: user.email || ""
          });
        }
      } catch (error) {
        console.error("Error in fetchProfileData:", error);
        toast.error("Profil bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileData();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Kullanıcı bilgisi bulunamadı");
        return;
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone
        })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Profil bilgileri güncellenirken bir hata oluştu");
      } else {
        toast.success("Profil bilgileriniz başarıyla güncellendi");
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("İşlem sırasında bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Profil bilgileri yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
        <p className="text-gray-600 mt-1">Kişisel bilgilerinizi güncelleyin</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Bilgilerim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-gray-500">AD SOYAD</p>
              <p>{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="flex-1 space-y-1 mt-4 md:mt-0">
              <p className="text-sm font-medium text-gray-500">E-POSTA ADRESİ</p>
              <p>{profile.email}</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-gray-500">TELEFON</p>
              <p>{profile.phone || "Belirtilmemiş"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Profili Düzenle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User size={16} />
                Adınız
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                placeholder="Adınız"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User size={16} />
                Soyadınız
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                placeholder="Soyadınız"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone size={16} />
              Telefon Numaranız
            </Label>
            <Input
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="05XX XXX XX XX"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 opacity-70">
              <Mail size={16} />
              E-posta (değiştirilemez)
            </Label>
            <Input
              id="email"
              name="email"
              value={profile.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">E-posta adresinizi değiştirmek için lütfen yetkili ile iletişime geçin.</p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? "Kaydediliyor..." : "Bilgilerimi Güncelle"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
