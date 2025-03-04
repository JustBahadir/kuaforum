
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StaffProfile() {
  const navigate = useNavigate();
  const { refreshProfile } = useCustomerAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: null as "erkek" | "kadın" | null,
    birthdate: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Kullanıcı bilgisi alınamadı");
          return;
        }

        // Get email from auth
        setFormData(prev => ({ ...prev, email: user.email || "" }));

        // First check user metadata
        if (user.user_metadata) {
          const metaFirstName = user.user_metadata.first_name;
          const metaLastName = user.user_metadata.last_name;
          const metaPhone = user.user_metadata.phone;
          const metaGender = user.user_metadata.gender;
          const metaBirthdate = user.user_metadata.birthdate;

          if (metaFirstName || metaLastName || metaPhone || metaGender || metaBirthdate) {
            console.log("Using profile data from user metadata");
            let formattedPhone = metaPhone ? formatPhoneNumber(metaPhone) : "";

            setFormData({
              firstName: metaFirstName || "",
              lastName: metaLastName || "",
              phone: formattedPhone,
              email: user.email || "",
              gender: metaGender || null,
              birthdate: metaBirthdate || ""
            });

            setLoading(false);
            return;
          }
        }

        const profile = await profilServisi.getir();
        if (profile) {
          setFormData({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            phone: profile.phone || "",
            gender: profile.gender || null,
            birthdate: profile.birthdate || "",
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("Profil bilgileri alınırken hata:", error);
        toast.error("Profil bilgileri alınırken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: "erkek" | "kadın" | "") => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === "" ? null : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Format phone number for saving - remove spaces
      const phoneForSaving = formData.phone.replace(/\s/g, '');

      await profilServisi.guncelle({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: phoneForSaving,
        gender: formData.gender,
        birthdate: formData.birthdate,
      });

      toast.success("Profil bilgileriniz başarıyla güncellendi");
      refreshProfile();
    } catch (error: any) {
      console.error("Profil güncelleme hatası:", error);
      toast.error(error.message || "Profil güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Personel Profilini Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">Ad</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Soyad</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="gender">Cinsiyet</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("gender", value as "erkek" | "kadın")}
                value={formData.gender || ""}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cinsiyet Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erkek">Erkek</SelectItem>
                  <SelectItem value="kadın">Kadın</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="birthdate">Doğum Tarihi</Label>
              <Input
                type="date"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
