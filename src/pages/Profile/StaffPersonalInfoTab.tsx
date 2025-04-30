
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface StaffPersonalInfoTabProps {
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    gender?: "erkek" | "kadın" | null;
    birthdate?: string;
    avatarUrl?: string;
    iban?: string;
    address?: string;
    role?: string;
  };
  onSave: (data: any) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSelectChange?: (name: string, value: string) => void;
  isSaving?: boolean;
  isUploading?: boolean;
}

const StaffPersonalInfoTab = ({
  profile,
  onSave,
  onAvatarUpload,
  handleChange: propHandleChange,
  handleSelectChange: propHandleSelectChange,
  isSaving = false,
  isUploading = false
}: StaffPersonalInfoTabProps) => {
  const [formData, setFormData] = useState({...profile});
  const [shopId, setShopId] = useState<number | null>(null);

  useEffect(() => {
    // Get current dukkan_id
    const getUserDukkanId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('dukkan_id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileData?.dukkan_id) {
          setShopId(profileData.dukkan_id);
        }
      } catch (error) {
        console.error("Error getting user's dukkan_id:", error);
      }
    };
    
    getUserDukkanId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (propHandleChange) {
      propHandleChange(e);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (propHandleSelectChange) {
      propHandleSelectChange(name, value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Profil kaydedilirken bir hata oluştu");
    }
  };
  
  const handleFileUpload = async (file: File) => {
    try {
      await onAvatarUpload(file);
      toast.success("Profil fotoğrafı başarıyla yüklendi");
    } catch (error) {
      console.error("Error uploading profile photo:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="relative mb-4 sm:mb-0">
          <ShopProfilePhotoUpload
            dukkanId={shopId || 0}
            onSuccess={(url) => {
              setFormData(prev => ({
                ...prev,
                avatarUrl: url
              }));
            }}
            className="w-32 h-32 mx-auto relative"
            currentImageUrl={formData.avatarUrl}
          >
            <Avatar className="w-32 h-32 border-2 border-gray-200">
              {formData.avatarUrl ? (
                <AvatarImage src={formData.avatarUrl} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
          </ShopProfilePhotoUpload>
        </div>

        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Adınız</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                value={formData.firstName || ''} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <Label htmlFor="lastName">Soyadınız</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                value={formData.lastName || ''} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="email">E-posta (değiştirilemez)</Label>
              <Input 
                id="email" 
                name="email" 
                value={formData.email || ''} 
                onChange={handleChange}
                disabled 
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon Numaranız</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone || ''} 
                onChange={handleChange} 
                placeholder="05XX XXX XX XX"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Cinsiyet</Label>
          <Select 
            name="gender"
            value={formData.gender || ''}
            onValueChange={(value) => handleSelectChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçiniz" />
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
            id="birthdate" 
            name="birthdate" 
            type="date" 
            value={formData.birthdate || ''} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Adres</Label>
        <Input 
          id="address" 
          name="address" 
          value={formData.address || ''} 
          onChange={handleChange} 
        />
      </div>

      <div>
        <Label htmlFor="iban">IBAN</Label>
        <Input 
          id="iban" 
          name="iban" 
          value={formData.iban || ''} 
          onChange={handleChange} 
          placeholder="TR"
        />
        <p className="text-xs text-muted-foreground mt-1">IBAN değeri, boşluklar olmadan kopyalanacaktır.</p>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
          {isSaving ? "Kaydediliyor..." : "Bilgileri Kaydet"}
        </Button>
      </div>
    </form>
  );
};

export default StaffPersonalInfoTab;
