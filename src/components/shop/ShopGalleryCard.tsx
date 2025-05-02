
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { uploadToSupabase } from "@/lib/supabase/storage";

export interface ShopGalleryCardProps {
  shopId?: number;
  isletmeId?: number;  // Add isletmeId as alternative prop
  userRole?: string;   // Add userRole prop
  queryClient?: QueryClient;
}

export function ShopGalleryCard({ 
  shopId, 
  isletmeId,  // Accept isletmeId prop
  userRole = "staff", 
  queryClient 
}: ShopGalleryCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Use either shopId or isletmeId
  const dukkanId = shopId || isletmeId;

  // Dummy images for now, can be replaced with actual gallery images
  const isAdmin = userRole === "admin";
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error("Lütfen sadece JPEG, PNG ve GIF formatında resimler yükleyin");
      return;
    }
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Resim dosyası 2MB'dan küçük olmalıdır");
      return;
    }
    
    setIsUploading(true);
    try {
      if (!dukkanId) {
        toast.error("İşletme bilgisi bulunamadı");
        return;
      }
      
      // Create a folder path for shop galleries
      const folderPath = `shop-galleries/${dukkanId}`;
      const fileName = `gallery-${Date.now()}`;
      
      // Upload the file to Supabase Storage
      const url = await uploadToSupabase(file, folderPath, fileName);
      
      // Add the new image to the state
      setImages(prev => [...prev, url]);
      
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: [`shop-${dukkanId}-gallery`] });
      }
      
      toast.success("Resim başarıyla yüklendi");
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
      toast.error(`Yükleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeImage = async (imageUrl: string) => {
    // Extract the path from the URL
    const urlParts = imageUrl.split('/');
    const fileNameWithParams = urlParts[urlParts.length - 1];
    const fileName = fileNameWithParams.split('?')[0];
    const filePath = `shop-galleries/${dukkanId}/${fileName}`;
    
    try {
      // Delete the file from Supabase Storage
      const { error } = await supabase.storage
        .from('shop-photos')
        .remove([filePath]);
        
      if (error) throw error;
      
      // Remove the image from the state
      setImages(prev => prev.filter(img => img !== imageUrl));
      
      if (selectedImage === imageUrl) {
        setSelectedImage(null);
      }
      
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: [`shop-${dukkanId}-gallery`] });
      }
      
      toast.success("Resim başarıyla silindi");
    } catch (error) {
      console.error("Resim silme hatası:", error);
      toast.error(`Silme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>İşletme Galerisi</CardTitle>
          <CardDescription>
            İşletmenize ait resimler müşterilerinize görüntülenecektir.
          </CardDescription>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => document.getElementById('gallery-upload')?.click()}>
            <Plus className="h-4 w-4 mr-2" />
            Resim Ekle
            <input
              id="gallery-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif"
              disabled={isUploading}
            />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={image}
                alt={`İşletme Resmi ${index + 1}`}
                className="w-full h-full object-cover rounded-md cursor-pointer"
                onClick={() => setSelectedImage(image)}
              />
              {isAdmin && (
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          
          {isAdmin && (
            <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 h-full min-h-[150px] cursor-pointer hover:bg-gray-50 transition-colors">
              <Plus className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">Resim Ekle</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif"
                disabled={isUploading}
              />
              {isUploading && (
                <div className="mt-2">
                  <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                </div>
              )}
            </label>
          )}
        </div>
        
        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl max-h-[90vh] relative">
              <img 
                src={selectedImage}
                alt="İşletme Resmi"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
