
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Copy, Map, PhoneCall } from "lucide-react";
import { toast } from "sonner";

interface ShopContactCardProps {
  isletmeData?: {
    ad?: string;
    telefon?: string;
    adres?: string;
  };
  shopData?: {
    ad?: string;
    telefon?: string;
    adres?: string;
  };
}

export function ShopContactCard({ isletmeData, shopData }: ShopContactCardProps) {
  // Use either isletmeData or shopData, whichever is provided
  const data = isletmeData || shopData || {};

  // Handle copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${type} başarıyla kopyalandı`);
      })
      .catch(() => {
        toast.error(`${type} kopyalanamadı`);
      });
  };

  // Handle map open
  const openInMaps = (address: string) => {
    if (!address) return;
    
    // Create a Google Maps URL with the address
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  // Handle phone call
  const callPhone = (phoneNumber: string) => {
    if (!phoneNumber) return;
    
    // Create a tel: URL
    window.location.href = `tel:${phoneNumber.replace(/\s/g, '')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>İletişim Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.adres && (
          <div className="space-y-2">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Adres</p>
                <p className="text-sm text-muted-foreground">{data.adres}</p>
                
                <div className="flex mt-2 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => openInMaps(data.adres || "")}
                  >
                    <Map className="h-3.5 w-3.5 mr-1" />
                    Haritada Göster
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => copyToClipboard(data.adres || "", "Adres")}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Kopyala
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.telefon && (
          <div className="space-y-2">
            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Telefon</p>
                <p className="text-sm text-muted-foreground">{data.telefon}</p>
                
                <div className="flex mt-2 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => callPhone(data.telefon || "")}
                  >
                    <PhoneCall className="h-3.5 w-3.5 mr-1" />
                    Ara
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => copyToClipboard(data.telefon || "", "Telefon")}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Kopyala
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!data.adres && !data.telefon && (
          <p className="text-center text-muted-foreground py-2">
            İletişim bilgisi bulunamadı
          </p>
        )}
      </CardContent>
    </Card>
  );
}
