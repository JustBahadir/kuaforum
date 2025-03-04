
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { User, Phone, Mail, Calendar, MapPin, CreditCard, Camera } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

const StaffProfile = () => {
  const { refreshProfile } = useCustomerAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: null as ("erkek" | "kadın" | null),
    birthdate: "",
    address: "",
    iban: "",
    avatarUrl: ""
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

        setFormData(prev => ({ ...prev, email: user.email || "" }));

        if (user.user_metadata) {
          const metaFirstName = user.user_metadata.first_name;
          const metaLastName = user.user_metadata.last_name;
          const metaPhone = user.user_metadata.phone;
          const metaGender = user.user_metadata.gender;
          const metaBirthdate = user.user_metadata.birthdate;
          const metaAddress = user.user_metadata.address;
          const metaIban = user.user_metadata.iban;
          const metaAvatarUrl = user.user_metadata.avatar_url;

          if (metaFirstName || metaLastName || metaPhone || metaGender || metaBirthdate) {
            console.log("Kullanıcı metadata'sından profil verisi kullanılıyor");
            let formattedPhone = metaPhone ? formatPhoneNumber(metaPhone) : "";

            setFormData({
              firstName: metaFirstName || "",
              lastName: metaLastName || "",
              phone: formattedPhone,
              email: user.email || "",
              gender: metaGender || null,
              birthdate: metaBirthdate || "",
              address: metaAddress || "",
              iban: metaIban || "",
              avatarUrl: metaAvatarUrl || ""
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
            phone: profile.phone ? formatPhoneNumber(profile.phone) : "",
            gender: profile.gender || null,
            birthdate: profile.birthdate || "",
            email: user.email || "",
            address: profile.address || "",
            iban: profile.iban || "",
            avatarUrl: profile.avatar_url || ""
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: "erkek" | "kadın" | "") => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === "" ? null : value
    }));
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value as "erkek" | "kadın" | null,
    }));
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      setIsUploading(true);
      
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      
      await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
      
      await profilServisi.guncelle({
        avatar_url: url
      });
      
      toast.success("Profil fotoğrafı başarıyla güncellendi");
      refreshProfile();
      
    } catch (error) {
      console.error("Avatar yükleme hatası:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const phoneForSaving = formData.phone.replace(/\s/g, '');

      await profilServisi.guncelle({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: phoneForSaving,
        gender: formData.gender,
        birthdate: formData.birthdate,
        address: formData.address,
        iban: formData.iban,
        avatar_url: formData.avatarUrl
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
    return (
      <StaffLayout>
        <div className="flex justify-center items-center h-64">
          <p>Yükleniyor...</p>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Profil Bilgilerim</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Profil Bilgilerini Düzenle</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload Section - Photo on right side now */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
                <div className="flex-1 order-2 md:order-1">
                  <h3 className="text-lg font-medium mb-2">Profil Fotoğrafı</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG, GIF dosyası yükleyin (max 5MB)
                  </p>
                  <Button 
                    variant="outline"
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById('avatar-upload-trigger')?.click()}
                  >
                    <Camera size={16} />
                    Fotoğraf Değiştir
                  </Button>
                </div>
                <div className="w-32 h-32 flex-shrink-0 relative rounded-full overflow-hidden border order-1 md:order-2">
                  <FileUpload
                    id="avatar-upload-trigger"
                    onUploadComplete={handleAvatarUpload}
                    currentImageUrl={formData.avatarUrl}
                    label=""
                    bucketName="photos"
                    folderPath="avatars"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User size={16} />
                    Ad
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Adınız"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User size={16} />
                    Soyad
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Soyadınız"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone size={16} />
                  Telefon
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                  maxLength={14}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="flex items-center gap-2">
                    <User size={16} />
                    Cinsiyet
                  </Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => handleSelectChange("gender", value as "erkek" | "kadın")}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Cinsiyet seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="erkek">Erkek</SelectItem>
                      <SelectItem value="kadın">Kadın</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthdate" className="flex items-center gap-2">
                    <Calendar size={16} />
                    Doğum Tarihi
                  </Label>
                  <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    value={formData.birthdate || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin size={16} />
                  Ev Adresi
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Açık adresinizi girin"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="iban" className="flex items-center gap-2">
                  <CreditCard size={16} />
                  IBAN
                </Label>
                <Input
                  id="iban"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
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
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">E-posta adresinizi değiştirmek için lütfen yetkili ile iletişime geçin.</p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-end">
            <Button 
              type="submit"
              form="profileForm"
              disabled={isSaving || isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? "Kaydediliyor..." : "Bilgilerimi Güncelle"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </StaffLayout>
  );
};

export default StaffProfile;
