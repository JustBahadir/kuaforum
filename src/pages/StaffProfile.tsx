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
import { User, Phone, Mail, Calendar, MapPin, CreditCard, Camera, Trash2, Copy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
            console.log("Kullanıcı metadata'sinden profil verisi kullanılıyor");
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

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Lütfen sadece resim dosyası yükleyin');
        return;
      }

      // File size check (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'ı geçemez');
        return;
      }
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file, { upsert: true });
      
      if (error) {
        if (error.message.includes('Bucket not found')) {
          throw new Error('Depolama alanı bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
        } else {
          throw error;
        }
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
      
      // Update form and user metadata
      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      // Also update profile to ensure consistency
      const { error: updateError } = await supabase.from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);
      
      if (updateError && !updateError.message.includes('Could not find the') && !updateError.message.includes('column')) {
        console.error("Profil güncelleme hatası:", updateError);
      }
      
      toast.success("Profil fotoğrafı başarıyla güncellendi");
      refreshProfile();
    } catch (error) {
      console.error("Avatar yükleme hatası:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveAvatar = async () => {
    try {
      setIsUploading(true);
      
      // Update user metadata to remove avatar_url
      await supabase.auth.updateUser({
        data: { avatar_url: '' }
      });
      
      // Update form state
      setFormData(prev => ({ ...prev, avatarUrl: '' }));
      
      // Also update profile to ensure consistency
      const { error: updateError } = await supabase.from('profiles')
        .update({ avatar_url: null })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);
      
      if (updateError && !updateError.message.includes('Could not find the') && !updateError.message.includes('column')) {
        console.error("Profil güncelleme hatası:", updateError);
      }
      
      toast.success("Profil fotoğrafı başarıyla kaldırıldı");
      refreshProfile();
    } catch (error) {
      console.error("Avatar silme hatası:", error);
      toast.error("Profil fotoğrafı kaldırılırken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
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
        iban: formData.iban
      });

      // Update user metadata for consistency
      await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: phoneForSaving,
          gender: formData.gender,
          birthdate: formData.birthdate,
          address: formData.address,
          iban: formData.iban
        }
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

  const formatIBAN = (value: string) => {
    // Remove all non-digit characters, but keep TR prefix if it exists
    let cleaned = value.replace(/[^0-9TR]/gi, '');
    
    // Ensure it starts with TR
    if (!cleaned.startsWith('TR')) {
      cleaned = 'TR' + cleaned.replace(/\D/g, '');
    } else {
      // Keep TR but remove any non-digits after that
      cleaned = 'TR' + cleaned.substring(2).replace(/\D/g, '');
    }
    
    // Limit to 26 characters (TR + 24 digits)
    cleaned = cleaned.substring(0, 26);
    
    // Format with spaces every 4 characters for readability
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    return formatted;
  };

  const handleIBANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatIBAN(e.target.value);
    setFormData(prev => ({ ...prev, iban: formattedValue.replace(/\s/g, '') }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopyalandı");
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
              {/* Avatar Upload Section */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
                <div className="flex-1 order-2 md:order-1">
                  <h3 className="text-lg font-medium mb-2">Profil Fotoğrafı</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG, GIF dosyası yükleyin (max 5MB)
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      disabled={isUploading}
                    >
                      <Camera size={16} />
                      Fotoğraf {formData.avatarUrl ? "Değiştir" : "Ekle"}
                    </Button>
                    
                    {formData.avatarUrl && (
                      <Button
                        variant="destructive"
                        type="button"
                        className="flex items-center gap-2"
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                      >
                        <Trash2 size={16} />
                        Fotoğrafı Kaldır
                      </Button>
                    )}
                    
                    <input
                      type="file"
                      id="avatar-input"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarInputChange}
                      disabled={isUploading}
                    />
                  </div>
                </div>
                <div className="w-32 h-32 flex-shrink-0 relative rounded-full overflow-hidden border order-1 md:order-2">
                  {isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
                    </div>
                  ) : formData.avatarUrl ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage src={formData.avatarUrl} alt="Profil Fotoğrafı" className="object-cover" />
                      <AvatarFallback>
                        {formData.firstName && formData.lastName 
                          ? formData.firstName[0] + formData.lastName[0] 
                          : "KU"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <User size={40} />
                    </div>
                  )}
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
                <div className="relative flex">
                  <Input
                    id="iban"
                    name="iban"
                    value={formatIBAN(formData.iban)}
                    onChange={handleIBANChange}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="flex-1"
                    maxLength={36}
                  />
                  {formData.iban && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(formatIBAN(formData.iban))}
                      className="ml-2"
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">IBAN bilginiz dükkan yöneticisiyle otomatik olarak paylaşılacaktır.</p>
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
