import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileUpload } from "@/components/ui/file-upload";
import { LoadingButton } from "@/components/ui/loading-button";

interface PersonalInfoTabProps {
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    gender: "erkek" | "kadın" | null;
    avatarUrl?: string;
  };
  onSave: (updatedData: any) => Promise<void>;
  isLoading: boolean;
  onAvatarUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export const PersonalInfoTab = ({
  userProfile,
  onSave,
  isLoading,
  onAvatarUpload,
  isUploading
}: PersonalInfoTabProps) => {
  const [formData, setFormData] = useState({
    firstName: userProfile.firstName || "",
    lastName: userProfile.lastName || "",
    phone: userProfile.phone || "",
    address: userProfile.address || "",
    gender: userProfile.gender || null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGenderChange = (value: "erkek" | "kadın") => {
    setFormData(prev => ({
      ...prev,
      gender: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleFileUploadComplete = async (uploadedUrl: string) => {
    await onAvatarUpload(uploadedUrl);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24">
                {userProfile.avatarUrl ? (
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.firstName || 'User'} />
                ) : (
                  <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                    {userProfile.firstName?.[0] || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="mt-2">
                <FileUpload
                  onUploadComplete={handleFileUploadComplete}
                  isUploading={isUploading}
                  acceptedFileTypes="image/*"
                  label="Profil Fotoğrafı Yükle"
                  currentImageUrl={userProfile.avatarUrl}
                />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Adınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <Input
                    value={userProfile.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="5XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cinsiyet
                  </label>
                  <Select
                    value={formData.gender || undefined}
                    onValueChange={handleGenderChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cinsiyet seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="erkek">Erkek</SelectItem>
                      <SelectItem value="kadın">Kadın</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adres"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <LoadingButton 
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Bilgileri Kaydet
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
