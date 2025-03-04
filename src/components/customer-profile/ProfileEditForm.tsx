
import React from "react";
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
import { User, Phone, Mail, Calendar, Copy, Camera } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";

export interface ProfileEditFormProps {
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    gender: "erkek" | "kadın" | null;
    birthdate: string;
    avatarUrl?: string;
    iban?: string;
    role?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleAvatarUpload: (url: string) => void;
  handleSave: () => Promise<void>;
  isSaving: boolean;
  isUploading: boolean;
}

export function ProfileEditForm({ 
  profile, 
  handleChange, 
  handleSelectChange,
  handleAvatarUpload,
  handleSave, 
  isSaving,
  isUploading
}: ProfileEditFormProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopyalandı");
  };
  
  const isAdmin = profile.role === 'admin';
  const isStaff = profile.role === 'staff';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profili Düzenle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload Section - Improved layout */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Profil Fotoğrafı</h3>
            <p className="text-sm text-gray-500 mb-4">
              PNG, JPG, GIF dosyası yükleyin (max 5MB)
            </p>
            <Button 
              variant="outline"
              type="button"
              className="mb-4 flex items-center gap-2"
              onClick={() => document.getElementById('profile-avatar-upload-trigger')?.click()}
            >
              <Camera size={16} />
              Fotoğraf Değiştir
            </Button>
          </div>
          <div className="w-32 h-32 flex-shrink-0 relative rounded-full overflow-hidden border">
            <FileUpload
              id="profile-avatar-upload-trigger"
              onUploadComplete={handleAvatarUpload}
              currentImageUrl={profile.avatarUrl}
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
              value={profile.gender || ""}
              onValueChange={(value) => handleSelectChange("gender", value)}
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
              value={profile.birthdate || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        
        {/* Only show IBAN for staff profiles, not for admin/shop owner */}
        {isStaff && (
          <div className="space-y-2">
            <Label htmlFor="iban" className="flex items-center gap-2">
              <Mail size={16} />
              IBAN
            </Label>
            <div className="flex">
              <Input
                id="iban"
                name="iban"
                value={profile.iban || ""}
                onChange={handleChange}
                placeholder="TRXX XXXX XXXX XXXX XXXX XX"
                className="flex-1"
              />
              {profile.iban && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(profile.iban || "")}
                  className="ml-2"
                >
                  <Copy size={16} />
                </Button>
              )}
            </div>
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
          disabled={isSaving || isUploading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSaving ? "Kaydediliyor..." : "Bilgilerimi Güncelle"}
        </Button>
      </CardFooter>
    </Card>
  );
}
