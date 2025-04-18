
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus, VideoIcon } from "lucide-react";
import { ShopGallery } from "@/components/shop/ShopGallery";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload";
import { QueryClient } from "@tanstack/react-query";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShopGalleryCardProps {
  dukkanId: number;
  userRole: string;
  queryClient: QueryClient;
}

export function ShopGalleryCard({ dukkanId, userRole, queryClient }: ShopGalleryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dükkan Galerisi</CardTitle>
        {userRole === 'admin' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ImagePlus className="h-4 w-4 mr-2" />
                Medya Ekle
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ShopProfilePhotoUpload 
                dukkanId={dukkanId} 
                galleryMode
                acceptVideoFiles={false}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['shop-photos', dukkanId] });
                }}
              >
                <DropdownMenuItem>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Fotoğraf Ekle
                </DropdownMenuItem>
              </ShopProfilePhotoUpload>
              
              <ShopProfilePhotoUpload 
                dukkanId={dukkanId} 
                galleryMode
                acceptVideoFiles={true}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['shop-photos', dukkanId] });
                }}
              >
                <DropdownMenuItem>
                  <VideoIcon className="h-4 w-4 mr-2" />
                  Video Ekle
                </DropdownMenuItem>
              </ShopProfilePhotoUpload>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        <ShopGallery dukkanId={dukkanId} />
      </CardContent>
    </Card>
  );
}
