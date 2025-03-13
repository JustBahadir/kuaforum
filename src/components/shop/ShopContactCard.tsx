
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface ShopContactCardProps {
  dukkanData: any;
}

export function ShopContactCard({ dukkanData }: ShopContactCardProps) {
  const openInMaps = () => {
    if (!dukkanData?.acik_adres) {
      toast.error("Haritada göstermek için bir açık adres girilmelidir");
      return;
    }
    
    const encodedAddress = encodeURIComponent(dukkanData.acik_adres);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
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
            <div>{dukkanData.adres || "Adres bilgisi bulunmuyor"}</div>
            {dukkanData.acik_adres && (
              <div className="text-gray-500 text-sm mt-1">{dukkanData.acik_adres}</div>
            )}
          </div>
        </div>
        
        {dukkanData.acik_adres && (
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
            {dukkanData.telefon 
              ? formatPhoneNumber(dukkanData.telefon) 
              : "Telefon bilgisi bulunmuyor"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
