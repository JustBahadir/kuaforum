
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface ShopGalleryCardProps {
  shopId: number;
}

export function ShopGalleryCard({ shopId }: ShopGalleryCardProps) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // This is a dummy function since it doesn't need to return a Promise<void>
  const handleUploadSuccess = () => {
    // Handle success
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşletme Galerisi</CardTitle>
        <CardDescription>
          İşletmenize ait fotoğrafları buradan ekleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="relative aspect-square rounded-md overflow-hidden border border-border"
            >
              <img
                src={image}
                alt={`Gallery image ${index+1}`}
                className="object-cover w-full h-full"
              />
              <button
                onClick={() => {
                  const newImages = [...images];
                  newImages.splice(index, 1);
                  setImages(newImages);
                }}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Upload placeholder */}
          <label className="aspect-square rounded-md border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer p-4 transition-colors">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-sm text-center text-muted-foreground">
              {uploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploading(true);
                  
                  // Simulate upload delay for demo
                  setTimeout(() => {
                    // Create object URL for preview
                    const imageUrl = URL.createObjectURL(file);
                    setImages([...images, imageUrl]);
                    setUploading(false);
                    toast.success("Fotoğraf galeriye eklendi");
                  }, 1500);
                }
              }}
            />
          </label>
        </div>
        
        {images.length > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" className="mr-2">
              İptal
            </Button>
            <Button>
              Değişiklikleri Kaydet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
