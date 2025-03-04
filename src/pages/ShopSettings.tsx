
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dukkanServisi } from "@/lib/supabase";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth/authService";
import { Textarea } from "@/components/ui/textarea";

export default function ShopSettings() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [shopCode, setShopCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("");
  const queryClient = useQueryClient();

  const { data: dukkan, isLoading, error } = useQuery({
    queryKey: ['dukkan', dukkanId],
    queryFn: () => dukkanId ? dukkanServisi.getirById(dukkanId) : null,
    enabled: !!dukkanId
  });

  useEffect(() => {
    if (dukkan) {
      setShopCode(dukkan.kod);
      setAddress(dukkan.adres || "");
    }
  }, [dukkan]);

  const handleCopyCode = () => {
    if (shopCode) {
      navigator.clipboard.writeText(shopCode);
      setCopied(true);
      toast.success("Dükkan kodu panoya kopyalandı");
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  const generateNewCode = async () => {
    if (!dukkan) return;
    
    try {
      const newCode = await authService.generateShopCode(dukkan.ad);
      const updatedShop = await dukkanServisi.dukkaniGuncelle(dukkanId!, {
        kod: newCode
      });
      
      if (updatedShop) {
        setShopCode(updatedShop.kod);
        toast.success("Yeni dükkan kodu oluşturuldu");
      }
    } catch (error) {
      toast.error("Kod oluşturulurken bir hata oluştu");
      console.error("Error generating shop code:", error);
    }
  };

  const updateShopAddress = useMutation({
    mutationFn: (newAddress: string) => {
      return dukkanServisi.dukkaniGuncelle(dukkanId!, {
        adres: newAddress
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dukkan', dukkanId] });
      toast.success("Dükkan adresi güncellendi");
    },
    onError: (error) => {
      toast.error("Adres güncellenirken bir hata oluştu");
      console.error("Error updating address:", error);
    }
  });

  const handleAddressUpdate = () => {
    updateShopAddress.mutate(address);
  };

  const openInMaps = () => {
    if (!address) {
      toast.error("Haritada göstermek için bir adres girilmelidir");
      return;
    }
    
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (userRole !== 'admin') {
    return (
      <StaffLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca yöneticiler dükkan ayarlarını düzenleyebilir.
          </AlertDescription>
        </Alert>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Dükkan Ayarları</h1>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dükkan bilgileri alınırken bir hata oluştu: {(error as Error).message}
            </AlertDescription>
          </Alert>
        ) : dukkan ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Dükkan Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle>Dükkan Bilgileri</CardTitle>
                <CardDescription>
                  Dükkanınızın temel bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Dükkan Adı</Label>
                    <Input id="shopName" value={dukkan.ad} readOnly />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shopAddress">Dükkan Adresi</Label>
                    <Textarea 
                      id="shopAddress" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Dükkanınızın açık adresini giriniz"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleAddressUpdate}>
                      Adresi Kaydet
                    </Button>
                    <Button variant="outline" onClick={openInMaps} className="flex items-center gap-2">
                      <MapPin size={16} />
                      Haritada Göster
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shopPhone">Telefon</Label>
                    <Input id="shopPhone" value={dukkan.telefon || "Telefon girilmemiş"} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Dükkan Kodu */}
            <Card>
              <CardHeader>
                <CardTitle>Dükkan Kodu</CardTitle>
                <CardDescription>
                  Bu kodu personelleriniz ile paylaşarak onların sisteme kaydolmalarını sağlayabilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Input 
                      value={shopCode} 
                      readOnly 
                      className="pr-12 bg-gray-50 font-mono text-center" 
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute right-1 top-1" 
                      onClick={handleCopyCode}
                    >
                      <Copy size={16} className={copied ? "text-green-500" : ""} />
                    </Button>
                  </div>
                  
                  <Button className="w-full" onClick={generateNewCode}>
                    Yeni Kod Oluştur
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    Not: Yeni kod oluşturduğunuzda eski kod geçerliliğini yitirir ve 
                    henüz katılmamış personellerinizin yeni kodu kullanması gerekir.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Dükkan bulunamadı. Lütfen dükkan kaydınızı tamamlayın.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </StaffLayout>
  );
}
