
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload";
import { Camera, Edit } from "lucide-react";
import { UseQueryClient } from "@tanstack/react-query";

interface ShopProfileHeaderProps {
  dukkanData: any;
  userRole: string;
  queryClient: UseQueryClient;
}

export function ShopProfileHeader({ dukkanData, userRole, queryClient }: ShopProfileHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <Avatar className="h-32 w-32 rounded-lg border-2 border-purple-200">
            <AvatarImage src={dukkanData.logo_url || ''} alt={dukkanData.ad} />
            <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
              {dukkanData.ad?.substring(0, 2).toUpperCase() || "KU"}
            </AvatarFallback>
          </Avatar>
          
          {userRole === 'admin' && (
            <ShopProfilePhotoUpload 
              dukkanId={dukkanData.id}
              currentImageUrl={dukkanData.logo_url}
              onSuccess={(url) => {
                queryClient.invalidateQueries({ queryKey: ['dukkan'] });
              }}
              className="flex flex-col items-center"
            >
              <div className="absolute bottom-2 right-2 p-1 bg-white rounded-full shadow cursor-pointer">
                <Camera className="h-5 w-5 text-purple-600" />
              </div>
            </ShopProfilePhotoUpload>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800">{dukkanData.ad}</h1>
          <p className="text-gray-600 mt-2">{dukkanData.adres}</p>
          
          {userRole === 'admin' && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/shop-settings"}
              >
                <Edit className="h-4 w-4 mr-2" />
                Dükkan Bilgilerini Düzenle
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
