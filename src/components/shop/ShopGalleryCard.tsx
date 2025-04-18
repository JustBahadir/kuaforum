
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface ShopGalleryCardProps {
  dukkanId: number;
  userRole: string | null;
  canEdit?: boolean;
  queryClient: any;
}

export function ShopGalleryCard({ dukkanId, userRole, queryClient, canEdit = false }: ShopGalleryCardProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Dosya boyutu 2MB'dan küçük olmalıdır.");
      return;
    }
    
    // Check file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      setUploadError("Sadece resim dosyaları yükleyebilirsiniz (JPEG, PNG, GIF, WEBP).");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `dukkan_${dukkanId}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('dukkan_galeri')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dukkan_galeri')
        .getPublicUrl(filePath);
      
      // Update dukkan_galeri table
      const { error: dbError } = await supabase
        .from('dukkan_galeri')
        .insert({
          dukkan_id: dukkanId,
          foto_url: publicUrl,
          dosya_yolu: filePath
        });
      
      if (dbError) throw dbError;
      
      // Add to local state
      setPhotos([...photos, publicUrl]);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(["shopGallery", dukkanId]);
      
      toast.success("Fotoğraf başarıyla yüklendi");
      setIsOpen(false);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(`Yükleme hatası: ${error.message}`);
      toast.error("Fotoğraf yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dükkan Galerisi</CardTitle>
        {canEdit && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1" variant="outline" size="sm">
                <Plus className="h-4 w-4" /> Medya Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Galeri Fotoğrafı Yükle</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Dosya seçmek için tıklayın veya sürükleyip bırakın
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    PNG, JPG, GIF, WEBP (max. 2MB)
                  </p>
                  <Input
                    type="file"
                    className="mt-4"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-500">{uploadError}</p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setIsOpen(false)} variant="outline">
                  İptal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <Image className="h-10 w-10 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Henüz galeri fotoğrafı veya videosu eklenmemiş.
            </p>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-1" /> Fotoğraf Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                <img
                  src={photo}
                  alt={`Dükkan fotoğrafı ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {canEdit && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => {
                      // Delete photo logic here
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
