
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { ShopGallery } from "@/components/shop/ShopGallery";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload";
import { QueryClient } from "@tanstack/react-query";

interface ShopGalleryCardProps {
  isletmeId: number;
  userRole: string;
  queryClient: QueryClient;
}

export function ShopGalleryCard({ isletmeId, userRole, queryClient }: ShopGalleryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>İşletme Galerisi</CardTitle>
        {userRole === 'admin' && (
          <ShopProfilePhotoUpload 
            dukkanId={isletmeId} 
            galleryMode
            acceptVideoFiles={false}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['shop-photos', isletmeId] });
            }}
          >
            <Button variant="outline" size="sm">
              <ImagePlus className="h-4 w-4 mr-2" />
              Fotoğraf Ekle
            </Button>
          </ShopProfilePhotoUpload>
        )}
      </CardHeader>
      <CardContent>
        <ShopGallery dukkanId={isletmeId} />
      </CardContent>
    </Card>
  );
}

