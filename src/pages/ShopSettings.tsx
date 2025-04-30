
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isletmeServisi } from "@/lib/supabase";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CityISOCodes } from "@/utils/cityISOCodes";
import { shopService } from "@/lib/auth/services/shopService";

export default function ShopSettings() {
  const {
    userRole,
    dukkanId
  } = useCustomerAuth();
  const [isletmeKodu, setIsletmeKodu] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [shopName, setShopName] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const queryClient = useQueryClient();

  // List of Turkish cities from CityISOCodes
  const cities = Object.keys(CityISOCodes).map(city => ({
    value: city,
    label: city
  })).sort((a, b) => a.label.localeCompare(b.label));
  
  const {
    data: isletme,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dukkan', dukkanId],
    queryFn: () => dukkanId ? isletmeServisi.getirById(dukkanId) : null,
    enabled: !!dukkanId
  });
  
  useEffect(() => {
    if (isletme) {
      setIsletmeKodu(isletme.kod);
      setAddress(isletme.adres || "");
      setFullAddress(isletme.acik_adres || "");
      setShopName(isletme.ad || "");

      // Try to extract city from address or set it to empty
      if (isletme.adres) {
        const parts = isletme.adres.split(',');
        if (parts.length > 0) {
          const cityPart = parts[parts.length - 1].trim().toUpperCase();
          if (CityISOCodes[cityPart]) {
            setSelectedCity(cityPart);
          }
        }
      }
    }
  }, [isletme]);
  
  const handleCopyCode = () => {
    if (isletmeKodu) {
      navigator.clipboard.writeText(isletmeKodu);
      setCopied(true);
      toast.success("İşletme kodu panoya kopyalandı");
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };
  
  const updateShopAddress = useMutation({
    mutationFn: async (updates: {
      acik_adres?: string;
      adres?: string;
      ad?: string;
      kod?: string;
    }) => {
      if (!dukkanId) {
        throw new Error("İşletme ID bulunamadı");
      }
      try {
        console.log("İşletme bilgileri güncelleniyor:", updates);
        const result = await isletmeServisi.guncelle(dukkanId, updates);
        console.log("Güncelleme sonucu:", result);
        return result;
      } catch (err) {
        console.error("İşletme bilgileri güncelleme mutasyon hatası:", err);
        throw err;
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['dukkan', dukkanId]
      });
      toast.success("İşletme bilgileri güncellendi");
      setFullAddress(data.acik_adres || "");

      // Update isletmeKodu if it was set
      if (data.kod && data.kod !== isletmeKodu) {
        setIsletmeKodu(data.kod);
      }
    },
    onError: error => {
      console.error("İşletme bilgileri güncelleme hatası:", error);
      toast.error(`İşletme bilgileri güncellenirken bir hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
    }
  });
  
  const handleAddressUpdate = () => {
    updateShopAddress.mutate({
      acik_adres: fullAddress
    });
  };
  
  const handleShopNameUpdate = () => {
    if (!shopName || shopName.trim().length < 2) {
      toast.error("İşletme adı en az 2 karakter olmalıdır");
      return;
    }
    updateShopAddress.mutate({
      ad: shopName
    });
  };
  
  const handleCityUpdate = async () => {
    if (!selectedCity) {
      toast.error("Lütfen bir il seçin");
      return;
    }
    const cityName = selectedCity;

    // If shop doesn't have a code yet, generate one
    if (!isletmeKodu && shopName) {
      try {
        const cityCode = CityISOCodes[selectedCity];
        const newKod = await shopService.generateShopCode(shopName, cityCode);

        // Update both the city and code
        updateShopAddress.mutate({
          adres: cityName,
          kod: newKod
        });
      } catch (error) {
        console.error("Kod oluşturma hatası:", error);
        toast.error("İşletme kodu oluşturulurken bir hata oluştu");
        // Still update the city if code generation fails
        updateShopAddress.mutate({
          adres: cityName
        });
      }
    } else {
      // Just update the city
      updateShopAddress.mutate({
        adres: cityName
      });
    }
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
    return <StaffLayout>
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </div>
      </StaffLayout>;
  }
  
  if (userRole !== 'admin') {
    return <StaffLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca İşletme Sahipleri işletme ayarlarını düzenleyebilir.
          </AlertDescription>
        </Alert>
      </StaffLayout>;
  }
  
  return <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">İşletme Ayarları</h1>
        
        {isLoading ? <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div> : error ? <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              İşletme bilgileri alınırken bir hata oluştu: {(error as Error).message}
            </AlertDescription>
          </Alert> : isletme ? <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>İşletme Bilgileri</CardTitle>
                <CardDescription>
                  İşletmenizin temel bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">İşletme Adı</Label>
                    <Input id="shopName" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="İşletmenizin adını giriniz" />
                    <div className="flex justify-end">
                      <Button onClick={handleShopNameUpdate} size="sm" variant="outline" disabled={updateShopAddress.isPending || !shopName || shopName === isletme.ad}>
                        İşletme Adını Güncelle
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shopCity">İl</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger id="shopCity">
                        <SelectValue placeholder="İl seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end">
                      <Button onClick={handleCityUpdate} size="sm" variant="outline" disabled={updateShopAddress.isPending || !selectedCity || isletme.adres && isletme.adres.toUpperCase().includes(selectedCity)}>
                        İl Bilgisini Güncelle
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shopFullAddress">İşletme Açık Adresi</Label>
                    <Textarea id="shopFullAddress" value={fullAddress} onChange={e => setFullAddress(e.target.value)} placeholder="İşletmenizin açık adresini giriniz" rows={3} />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleAddressUpdate} disabled={updateShopAddress.isPending}>
                      {updateShopAddress.isPending ? "Kaydediliyor..." : "Açık Adresi Kaydet"}
                    </Button>
                    <Button variant="outline" onClick={openInMaps} className="flex items-center gap-2" disabled={!fullAddress}>
                      <MapPin size={16} />
                      Haritada Göster
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shopPhone">Telefon</Label>
                    <Input id="shopPhone" value={isletme.telefon || "Telefon girilmemiş"} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>İşletme Kodu</CardTitle>
                <CardDescription>
                  Bu kodu personelleriniz ile paylaşarak onların sisteme kaydolmalarını sağlayabilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Input value={isletmeKodu} readOnly className="pr-12 bg-gray-50 font-mono text-center" />
                    <Button size="sm" variant="ghost" className="absolute right-1 top-1" onClick={handleCopyCode}>
                      <Copy size={16} className={copied ? "text-green-500" : ""} />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4">Personelleriniz bu kodu kullanarak işletmenize kayıt olabilirler.</div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      İşletme kodu, işletme adınız ve il bilgilerinize göre otomatik olarak oluşturulmuştur ve kalıcıdır. Lütfen bu kodu güvenli bir şekilde paylaşın.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div> : <Alert>
            <AlertDescription>
              İşletme bulunamadı. Lütfen işletme kaydınızı tamamlayın.
            </AlertDescription>
          </Alert>}
      </div>
    </StaffLayout>;
}
