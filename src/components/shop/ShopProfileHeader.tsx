
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Phone } from "lucide-react";
import { ShopProfilePhotoUpload } from "./ShopProfilePhotoUpload";
import { toast } from "sonner";
import { useState } from "react";

export interface ShopProfileHeaderProps {
  shopData?: {
    id: number;
    ad: string;
    logo_url?: string;
    telefon?: string;
    adres?: string;
  };
  isletmeData?: {  // Add isletmeData as optional prop with same structure as shopData
    id: number;
    ad: string;
    logo_url?: string;
    telefon?: string;
    adres?: string;
  };
  isOwner?: boolean;
  userRole?: string; // Add userRole prop
  onLogoUpdated?: (url: string) => Promise<void> | void;
}

export function ShopProfileHeader({ 
  shopData, 
  isletmeData,  // Accept isletmeData prop
  isOwner = false,
  userRole,     // Accept userRole prop 
  onLogoUpdated 
}: ShopProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  // Use isletmeData if provided, otherwise use shopData
  const data = isletmeData || shopData;
  
  if (!data) {
    return <div>İşletme bilgisi bulunamadı</div>;
  }

  // Handle logo upload success
  const handleLogoUploadSuccess = (url: string) => {
    if (onLogoUpdated) {
      try {
        onLogoUpdated(url);
      } catch (error) {
        console.error("Error updating logo:", error);
      }
    }
  };
  
  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Cover photo - static gradient for now */}
      <div 
        className="h-40 md:h-60 bg-gradient-to-r from-purple-600 to-blue-500"
      ></div>
      
      <div className="container relative z-10 px-4 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo/Avatar */}
          <div className="relative">
            {isOwner ? (
              <ShopProfilePhotoUpload 
                dukkanId={data.id}
                onSuccess={handleLogoUploadSuccess}
                currentImageUrl={data.logo_url}
              >
                <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-white">
                  {data.logo_url ? (
                    <img 
                      src={data.logo_url} 
                      alt={data.ad} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <div className="text-2xl font-bold">
                        {data.ad?.charAt(0) || 'İ'}
                      </div>
                    </div>
                  )}
                </div>
              </ShopProfilePhotoUpload>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-white">
                {data.logo_url ? (
                  <img 
                    src={data.logo_url} 
                    alt={data.ad} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <div className="text-2xl font-bold">
                      {data.ad?.charAt(0) || 'İ'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Shop info */}
          <div className="flex-1 bg-card rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{data.ad}</h1>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  {data.telefon && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{data.telefon}</span>
                    </div>
                  )}
                  {data.adres && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{data.adres}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {isOwner && (
                <Button variant="outline" className="md:self-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
