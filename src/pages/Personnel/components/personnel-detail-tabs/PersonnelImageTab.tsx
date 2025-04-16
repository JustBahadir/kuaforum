
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Loader2, X, Upload } from "lucide-react";

interface PersonnelImageTabProps {
  personnel: any;
  onSave: () => void;
}

export function PersonnelImageTab({ personnel, onSave }: PersonnelImageTabProps) {
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      return await personelServisi.guncelle(personnel.id, { avatar_url: avatarUrl });
    },
    onSuccess: () => {
      toast.success("Profil fotoğrafı başarıyla güncellendi!");
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      queryClient.invalidateQueries({ queryKey: ["personel-list"] });
      queryClient.invalidateQueries({ queryKey: ["personnel-detail", personnel.id] });
      setImageFile(null);
      setPreviewUrl(null);
      if (onSave) onSave();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Profil fotoğrafı güncellenirken bir hata oluştu.");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    
    setIsUploading(true);
    try {
      // Normally we would upload to storage and get a URL back
      // This is a placeholder for the actual upload logic
      // In a real scenario, you would use something like:
      // const { data, error } = await supabaseClient.storage
      //   .from("avatars")
      //   .upload(`personnel/${personnel.id}/${Date.now()}.${imageFile.name.split('.').pop()}`, imageFile);
      
      // Simulate upload delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock URL for demonstration
      const mockAvatarUrl = previewUrl;
      
      // Update personnel record with new avatar URL
      await updateMutation.mutateAsync(mockAvatarUrl as string);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fotoğraf yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center">
        <Avatar className="w-32 h-32 border-2 border-primary">
          <AvatarImage 
            src={previewUrl || personnel.avatar_url} 
            alt={personnel.ad_soyad} 
          />
          <AvatarFallback className="text-2xl">{getInitials(personnel.ad_soyad)}</AvatarFallback>
        </Avatar>
        
        <div className="mt-6">
          {!imageFile ? (
            <div className="flex flex-col items-center space-y-4">
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('profile-pic-upload')?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Fotoğraf Seç
              </Button>
              <input
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground text-center">
                JPG, PNG veya GIF formatında dosya yükleyebilirsiniz.<br />
                Maksimum dosya boyutu 2MB olmalıdır.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  İptal
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="gap-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
