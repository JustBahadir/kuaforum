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
import { Textarea } from "@/components/ui/textarea";

export default function ShopSettings() {
  const { userRole, dukkanId } = useCustomerAuth();
  const [shopCode, setShopCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("");
  const [fullAddress, setFullAddress] = useState("");
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
      setFullAddress(dukkan.acik_adres || "");
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

  const updateShopAddress = useMutation({
    mutationFn: async (newFullAddress: string) => {
      if (!dukkanId) {
        throw new Error("Dükkan ID bulunamadı");
      }
      
      try {
        console.log("Açık adres güncelleniyor:", newFullAddress);
        
        const result = await dukkanServisi.dukkaniGuncelle(dukkanId, {
          acik_adres: newFullAddress
        });
        
        console.log("Güncelleme sonucu:", result);
        return result;
      } catch (err) {
        console.error("Adres güncelleme mutasyon hatası:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dukkan', dukkanId] });
      toast.success("Dükkan açık adresi güncellendi");
      setFullAddress(data.acik_adres || "");
    },
    onError: (error) => {
      console.error("Açık adres güncelleme hatası:", error);
      toast.error(`Açık adres güncellenirken bir hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
    }
  });

  const handleAddressUpdate = () => {
    updateShopAddress.mutate(fullAddress);
  };

  const openInMaps = () => {
    if (!fullAddress) {
      toast.error("Haritada göstermek için bir açık adres girilmelidir");
      return;
    }
    
    const encodedAddress = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (!userRole) {
    return (
      <StaffLayout>
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </div>
      </StaffLayout>
    );
  }

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
                    <Label htmlFor="shopAddress">İl/İlçe Bilgisi</Label>
                    <Input 
                      id="shopAddress" 
                      value={address} 
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Bu bilgi kayıt esnasında alınmıştır ve değiştirilemez.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shopFullAddress">Dükkan Açık Adresi</Label>
                    <Textarea 
                      id="shopFullAddress" 
                      value={fullAddress} 
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="Dükkanınızın açık adresini giriniz"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={handleAddressUpdate}
                      disabled={updateShopAddress.isPending}
                    >
                      {updateShopAddress.isPending ? "Kaydediliyor..." : "Açık Adresi Kaydet"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={openInMaps} 
                      className="flex items-center gap-2"
                      disabled={!fullAddress}
                    >
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
                  
                  <div className="text-sm text-muted-foreground">
                    Not: Bu kod dükkanınıza özeldir ve değiştirilemez. Personellerinizin
                    sisteme kaydolabilmesi için bu kodu kullanmaları gerekir.
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
