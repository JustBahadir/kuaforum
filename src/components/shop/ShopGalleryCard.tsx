
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { ShopGallery } from "@/components/shop/ShopGallery";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload";
import { UseQueryClient } from "@tanstack/react-query";

interface ShopGalleryCardProps {
  dukkanId: number;
  userRole: string;
  queryClient: UseQueryClient;
}

export function ShopGalleryCard({ dukkanId, userRole, queryClient }: ShopGalleryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dükkan Galerisi</CardTitle>
        {userRole === 'admin' && (
          <ShopProfilePhotoUpload 
            dukkanId={dukkanId} 
            galleryMode
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['shop-photos', dukkanId] });
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
        <ShopGallery dukkanId={dukkanId} />
      </CardContent>
    </Card>
  );
}
