
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Calendar, Copy, Camera, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload"; 
import { toast } from "sonner";

export interface ProfileEditFormProps {
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
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleAvatarUpload: (file: File) => Promise<void | string>; // Updated to support both void and string returns
  handleSave: (formData: any) => Promise<void>;
  isSaving: boolean;
  isUploading: boolean;
}

// Format IBAN as TR00 0000 0000 0000 0000 0000 00 and limit to 26 characters (TR + 24 digits)
const formatIBAN = (value: string) => {
  // Start with TR
  let result = "TR";
  
  // Get only digits from the input (ignore the TR prefix if it exists)
  const digitsOnly = value.startsWith('TR') ? 
    value.substring(2).replace(/[^0-9]/g, '') : 
    value.replace(/[^0-9]/g, '');
  
  // Limit to 24 digits (plus 'TR' = 26 characters total)
  const limitedDigits = digitsOnly.substring(0, 24);
  
  // Format with spaces every 4 characters
  for (let i = 0; i < limitedDigits.length; i++) {
    if (i > 0 && i % 4 === 0) {
      result += ' ';
    }
    result += limitedDigits[i];
  }
  
  return result;
};

export function ProfileEditForm({ 
  profile, 
  handleChange, 
  handleSelectChange,
  handleAvatarUpload,
  handleSave, 
  isSaving,
  isUploading
}: ProfileEditFormProps) {
  // Create a local form state to track changes
  const [formData, setFormData] = useState({...profile});
  const [formattedIBAN, setFormattedIBAN] = useState<string>('');
  
  useEffect(() => {
    // Update local form data when profile props change
    setFormData({...profile});
    
    if (profile.iban) {
      setFormattedIBAN(formatIBAN(profile.iban));
    } else {
      setFormattedIBAN('TR');
    }
  }, [profile]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    toast.success("IBAN kopyalandı");
  };
  
  const isAdmin = profile.role === 'admin';
  const isStaff = profile.role === 'staff';
  
  const handleIBANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format the IBAN input value and apply strict 26 character limit
    const inputValue = e.target.value;
    
    // Strip all non-digits except for TR at beginning
    let cleaned = '';
    if (inputValue.startsWith('TR')) {
      cleaned = 'TR' + inputValue.substring(2).replace(/\D/g, '');
    } else {
      cleaned = 'TR' + inputValue.replace(/\D/g, '');
    }
    
    // Limit to exactly 26 characters (TR + 24 digits)
    cleaned = cleaned.substring(0, 26);
    
    // Format with spaces for display
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    setFormattedIBAN(formatted);
    
    // Create a synthetic event to pass to the parent's handleChange
    const syntheticEvent = {
      target: {
        name: 'iban',
        value: cleaned // Store without spaces
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Update local form data too
    setFormData({
      ...formData,
      iban: cleaned
    });
    
    // Call the parent handler
    handleChange(syntheticEvent);
  };

  // Wrapper for changes to update local form state
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Call the parent handler
    handleChange(e);
  };
  
  // Wrapper for select changes to update local form state
  const handleLocalSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Call the parent handler
    handleSelectChange(name, value);
  };

  // Wrapper for avatar upload
  const handleLocalAvatarUpload = async (url: string) => {
    try {
      // Update local form state
      setFormData({
        ...formData,
        avatarUrl: url
      });
      
      // Call the parent handler
      await handleAvatarUpload(new File([], "dummy")); // Just to match the expected signature
      
      return url;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  };

  // Local save handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSave(formData);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profili Düzenle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex-1 order-2 md:order-1">
              <h3 className="text-lg font-medium mb-2">Profil Fotoğrafı</h3>
              <p className="text-sm text-gray-500 mb-4">
                PNG, JPG, GIF dosyası yükleyin
              </p>
              <Button 
                type="button" 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Camera size={16} />
                Fotoğraf Değiştir
              </Button>
            </div>
            <div className="w-32 h-32 flex-shrink-0 relative rounded-full overflow-hidden border order-1 md:order-2">
              <ShopProfilePhotoUpload
                dukkanId={0}
                onSuccess={handleLocalAvatarUpload}
                currentImageUrl={formData.avatarUrl}
              >
                {formData.avatarUrl ? (
                  <img 
                    src={formData.avatarUrl} 
                    alt="Profil fotoğrafı" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                    <User size={40} />
                  </div>
                )}
              </ShopProfilePhotoUpload>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User size={16} />
                Adınız
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleLocalChange}
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
                value={formData.lastName || ""}
                onChange={handleLocalChange}
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
              value={formData.phone || ""}
              onChange={handleLocalChange}
              placeholder="05XX XXX XX XX"
              maxLength={14}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin size={16} />
              Adres
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleLocalChange}
              placeholder="Adres bilgileriniz"
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
                onValueChange={(value) => handleLocalSelectChange("gender", value)}
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
                onChange={handleLocalChange}
              />
            </div>
          </div>
          
          {(isStaff || isAdmin) && (
            <div className="space-y-2">
              <Label htmlFor="iban" className="flex items-center gap-2">
                <Mail size={16} />
                IBAN
              </Label>
              <div className="flex">
                <Input
                  id="iban"
                  name="iban"
                  value={formattedIBAN}
                  onChange={handleIBANChange}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="flex-1"
                  maxLength={36} // Max length includes spaces (26 chars + 6 spaces)
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(formattedIBAN)}
                  className="ml-2"
                  title="IBAN'ı kopyala"
                >
                  <Copy size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                IBAN değeri, boşluklar olmadan kopyalanacaktır.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 opacity-70">
              <Mail size={16} />
              E-posta (değiştirilemez)
            </Label>
            <Input
              id="email"
              name="email"
              value={formData.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">E-posta adresinizi değiştirmek için lütfen yetkili ile iletişime geçin.</p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            type="submit"
            disabled={isSaving || isUploading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSaving ? "Kaydediliyor..." : "Bilgilerimi Güncelle"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
