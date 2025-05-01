
import { useEffect, useState, useRef } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useAuth } from "@/hooks/useAuth";
import { useProfileManagement } from "@/hooks/auth/useProfileManagement";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    profileData,
    updateProfileField,
    loadProfileData,
    saveProfile,
    isSaving,
    uploadAvatar,
    isUploadingAvatar,
    avatarUrl
  } = useProfileManagement();
  
  // Load profile data on mount
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);
  
  if (!user) {
    return null;
  }
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir resim dosyası seçin.');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'den küçük olmalıdır.');
      return;
    }
    
    uploadAvatar(file);
  };
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    const first = profileData.first_name?.charAt(0) || user.email?.charAt(0) || '?';
    const last = profileData.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  };
  
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <Toaster position="bottom-right" richColors />
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Profilim</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgilerim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="relative group">
                  <Avatar className="h-24 w-24 cursor-pointer group-hover:opacity-75 transition-opacity">
                    <AvatarImage src={avatarUrl || ""} alt={user.email || ""} />
                    <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <Camera className="h-6 w-6" />
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {isUploadingAvatar && (
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                      Yükleniyor...
                    </div>
                  )}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input 
                        id="email" 
                        value={user.email || ""} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Adınız</Label>
                      <Input 
                        id="first_name" 
                        value={profileData.first_name} 
                        onChange={(e) => updateProfileField("first_name", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Soyadınız</Label>
                      <Input 
                        id="last_name" 
                        value={profileData.last_name} 
                        onChange={(e) => updateProfileField("last_name", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone} 
                        onChange={(e) => updateProfileField("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Doğum Tarihi</Label>
                  <Input 
                    id="birthdate" 
                    type="date" 
                    value={profileData.birthdate} 
                    onChange={(e) => updateProfileField("birthdate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Cinsiyet</Label>
                  <Select 
                    value={profileData.gender} 
                    onValueChange={(value) => updateProfileField("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="male">Erkek</SelectItem>
                        <SelectItem value="female">Kadın</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input 
                    id="address" 
                    value={profileData.address || ""} 
                    onChange={(e) => updateProfileField("address", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input 
                    id="iban" 
                    value={profileData.iban || ""} 
                    onChange={(e) => updateProfileField("iban", e.target.value)}
                    placeholder="TR__ ____ ____ ____ ____ ____"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                disabled={isSaving} 
                onClick={saveProfile}
              >
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
}
