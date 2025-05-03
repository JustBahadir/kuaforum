import { Button } from "@/components/ui/button";
import { Edit, MapPin, Phone, Trash } from "lucide-react";
import { ShopProfilePhotoUpload } from "./ShopProfilePhotoUpload";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
export interface ShopProfileHeaderProps {
  shopData?: {
    id: number;
    ad: string;
    logo_url?: string;
    telefon?: string;
    adres?: string;
  };
  isletmeData?: {
    id: number;
    ad: string;
    logo_url?: string;
    telefon?: string;
    adres?: string;
  };
  isOwner?: boolean;
  userRole?: string;
  onLogoUpdated?: (url: string) => Promise<void> | void;
}
export function ShopProfileHeader({
  shopData,
  isletmeData,
  isOwner = false,
  userRole,
  onLogoUpdated
}: ShopProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle logo delete
  const handleDeleteLogo = async () => {
    if (!data.id || !data.logo_url || isDeleting) return;
    try {
      setIsDeleting(true);

      // Extract filename from URL
      const urlParts = data.logo_url.split('/');
      const fileNameWithParams = urlParts[urlParts.length - 1];
      const fileName = fileNameWithParams.split('?')[0];

      // Delete from storage
      const {
        error: storageError
      } = await supabase.storage.from('shop-photos').remove([`shop-logos/${data.id}/${fileName}`]);
      if (storageError) throw storageError;

      // Update dukkan record
      const {
        error: updateError
      } = await supabase.from('dukkanlar').update({
        logo_url: null
      }).eq('id', data.id);
      if (updateError) throw updateError;

      // Update local state via callback
      if (onLogoUpdated) {
        await onLogoUpdated('');
      }
      toast.success('Logo başarıyla kaldırıldı');
    } catch (error) {
      console.error('Logo silme hatası:', error);
      toast.error('Logo silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };
  return <div className="relative rounded-lg overflow-hidden">
      {/* Cover photo - static gradient for now */}
      <div className="h-40 md:h-60 bg-gradient-to-r from-purple-600 to-blue-500 px-0"></div>
      
      <div className="container relative z-10 px-4 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo/Avatar */}
          <div className="relative">
            {isOwner ? <div className="relative">
                <ShopProfilePhotoUpload dukkanId={data.id} onSuccess={handleLogoUploadSuccess} currentImageUrl={data.logo_url}>
                  <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-white">
                    {data.logo_url ? <img src={data.logo_url} alt={data.ad} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <div className="text-2xl font-bold">
                          {data.ad?.charAt(0) || 'İ'}
                        </div>
                      </div>}
                  </div>
                </ShopProfilePhotoUpload>
                
                {/* Logo actions buttons */}
                <div className="flex gap-1 mt-2 justify-center">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => document.getElementById('logo-upload-trigger')?.click()}>
                    <Edit className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                  
                  <Button variant="destructive" size="sm" className="flex-1" onClick={handleDeleteLogo} disabled={!data.logo_url || isDeleting}>
                    <Trash className="h-3 w-3 mr-1" />
                    Kaldır
                  </Button>
                </div>
              </div> : <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-white">
                {data.logo_url ? <img src={data.logo_url} alt={data.ad} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <div className="text-2xl font-bold">
                      {data.ad?.charAt(0) || 'İ'}
                    </div>
                  </div>}
              </div>}
          </div>
          
          {/* Shop info */}
          <div className="flex-1 bg-card rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{data.ad}</h1>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  {data.telefon && <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{data.telefon}</span>
                    </div>}
                  {data.adres && <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{data.adres}</span>
                    </div>}
                </div>
              </div>
              
              {isOwner && <Button variant="outline" className="md:self-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}