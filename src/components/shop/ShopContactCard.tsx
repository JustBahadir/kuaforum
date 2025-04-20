
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Copy, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface ShopContactCardProps {
  isletmeData: any; // changed prop name from dukkanData to isletmeData
}

export function ShopContactCard({ isletmeData }: ShopContactCardProps) {
  const openInMaps = () => {
    if (!isletmeData?.acik_adres) {
      toast.error("Haritada göstermek için bir açık adres girilmelidir");
      return;
    }
    
    const encodedAddress = encodeURIComponent(isletmeData.acik_adres);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const callPhone = () => {
    if (!isletmeData?.telefon) {
      toast.error("Telefon numarası bulunamadı");
      return;
    }
    
    // Format for tel: link - remove all non-digit characters
    const phoneNumber = isletmeData.telefon.replace(/\D/g, '');
    window.location.href = `tel:${phoneNumber}`;
  };

  const copyPhoneNumber = () => {
    if (!isletmeData?.telefon) {
      toast.error("Telefon numarası bulunamadı");
      return;
    }
    
    navigator.clipboard.writeText(isletmeData.telefon);
    toast.success("Telefon numarası kopyalandı");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>İletişim Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <div>{isletmeData.adres || "Adres bilgisi bulunmuyor"}</div>
            {isletmeData.acik_adres && (
              <div className="text-gray-500 text-sm mt-1">{isletmeData.acik_adres}</div>
            )}
          </div>
        </div>
        
        {isletmeData.acik_adres && (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full flex items-center gap-2" 
            onClick={openInMaps}
          >
            <ExternalLink className="h-4 w-4" />
            Haritada Göster
          </Button>
        )}
        
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <span>
            {isletmeData.telefon 
              ? formatPhoneNumber(isletmeData.telefon) 
              : "Telefon bilgisi bulunmuyor"}
          </span>
        </div>
        
        {isletmeData.telefon && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 flex items-center gap-2" 
              onClick={callPhone}
            >
              <PhoneCall className="h-4 w-4" />
              Ara
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 flex items-center gap-2" 
              onClick={copyPhoneNumber}
            >
              <Copy className="h-4 w-4" />
              Kopyala
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
