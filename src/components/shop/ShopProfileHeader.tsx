import { Button } from "@/components/ui/button";
import { Edit, Trash2, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload";
interface ShopProfileHeaderProps {
  dukkanData: any;
  userRole: string;
  queryClient: QueryClient;
}
export function ShopProfileHeader({
  dukkanData,
  userRole
}: ShopProfileHeaderProps) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const handleRemovePhoto = async () => {
    if (!dukkanData?.id || !dukkanData?.logo_url) return;
    try {
      setRemoving(true);

      // Extract the path from the URL
      const urlParts = dukkanData.logo_url.split('/');
      const bucketName = urlParts[urlParts.indexOf('shop-photos') - 1];
      const pathParts = urlParts.slice(urlParts.indexOf('shop-photos'));
      const filePath = pathParts.join('/');

      // Remove the file from storage
      const {
        error: removeError
      } = await supabase.storage.from(bucketName).remove([filePath]);
      if (removeError) throw removeError;

      // Update the dukkan record
      const {
        error: updateError
      } = await supabase.from('dukkanlar').update({
        logo_url: null
      }).eq('id', dukkanData.id);
      if (updateError) throw updateError;
      toast.success('Dükkan logosu başarıyla kaldırıldı');

      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Logo kaldırma hatası:', error);
      toast.error('Logo kaldırılırken bir hata oluştu');
    } finally {
      setRemoving(false);
    }
  };
  return <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Logo section with larger size and better button placement */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-purple-200">
            {dukkanData?.logo_url ? <img src={dukkanData.logo_url} alt={dukkanData.isletme_adi || "İşletme Adı Girilmemiş"} className="w-full h-full object-cover" /> : <div className="text-3xl font-bold text-purple-500">
                {dukkanData?.isletme_adi ? dukkanData.isletme_adi[0].toUpperCase() : '?'}
              </div>}
          </div>
          
          {userRole === 'admin' && <div className="flex gap-2">
              <ShopProfilePhotoUpload dukkanId={dukkanData?.id} onSuccess={() => window.location.reload()} acceptVideoFiles={false} galleryMode={false}>
                <Button size="sm" variant="secondary" className="whitespace-nowrap">
                  <ImagePlus className="h-4 w-4 mr-1" />
                  {dukkanData?.logo_url ? 'Logoyu Değiştir' : 'Logo Ekle'}
                </Button>
              </ShopProfilePhotoUpload>

              {dukkanData?.logo_url && <Button variant="destructive" size="sm" onClick={handleRemovePhoto} disabled={removing}>
                  <Trash2 className="h-4 w-4" />
                </Button>}
            </div>}
        </div>
        
        {/* Info section */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-bold text-gray-800 text-3xl text-center">
                {dukkanData?.isletme_adi || "İşletme Adı Girilmemiş"}
              </h1>
              {dukkanData?.adres && <p className="text-muted-foreground text-center text-xl">{dukkanData.adres}</p>}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="lg" onClick={() => navigate("/appointments")} className="bg-purple-600 hover:bg-purple-700 text-white px-[4px] py-[12px]">
                Hemen Randevu Al
              </Button>
              
              {userRole === 'admin' && <Button variant="outline" onClick={() => navigate("/shop-settings")} className="px-0 py-[14px]">
                  <Edit className="mr-2 h-4 w-4" />
                  Dükkan Bilgilerini Düzenle
                </Button>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}