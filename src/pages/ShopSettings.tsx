
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isletmeServisi, dukkanServisi } from "@/lib/supabase";
import { useShopData } from "@/hooks/useShopData";
import { useNavigate } from "react-router-dom";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload";
import { useQuery } from "@tanstack/react-query";

export default function ShopSettings() {
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Use ReactQuery directly for refetch capability
  const { data: isletmeData, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['isletme'],
    queryFn: async () => {
      const user = await isletmeServisi.getCurrentUserId();
      if (!user) return null;
      return await dukkanServisi.kullanicininIsletmesi(user);
    }
  });

  useEffect(() => {
    if (isletmeData) {
      setShopName(isletmeData.ad || "");
      setShopAddress(isletmeData.acik_adres || "");
      setShopPhone(isletmeData.telefon || "");
      // Store this in localStorage for fallback use
      localStorage.setItem('dukkanId', String(isletmeData.id));
    }
  }, [isletmeData]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (!isletmeData?.id) {
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      // Use dukkanServisi methods instead
      const result = await dukkanServisi.guncelle(isletmeData.id, {
        ad: shopName,
        acik_adres: shopAddress,
        telefon: shopPhone
      });

      if (result) {
        toast.success("İşletme bilgileri başarıyla güncellendi", {
          position: "bottom-right"
        });
        await refetch();
      } else {
        toast.error("İşletme bilgileri güncellenirken bir hata oluştu", {
          position: "bottom-right"
        });
      }
    } catch (err: any) {
      console.error("İşletme güncelleme hatası:", err);
      toast.error(`İşletme güncellenirken bir hata oluştu: ${err.message}`, {
        position: "bottom-right"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      // Use dukkanServisi methods
      const result = await dukkanServisi.olustur({
        ad: shopName,
        acik_adres: shopAddress,
        telefon: shopPhone,
      });

      if (result) {
        toast.success("İşletme başarıyla oluşturuldu", {
          position: "bottom-right"
        });
        // Store this in localStorage for fallback use
        localStorage.setItem('dukkanId', String(result.id));
        navigate("/shop-home-page");
      } else {
        toast.error("İşletme oluşturulurken bir hata oluştu", {
          position: "bottom-right"
        });
      }
    } catch (err: any) {
      console.error("İşletme oluşturma hatası:", err);
      toast.error(`İşletme oluşturulurken bir hata oluştu: ${err.message}`, {
        position: "bottom-right"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (url: string) => {
    try {
      if (isletmeData) {
        await dukkanServisi.guncelle(isletmeData.id, { logo_url: url });
        toast.success("Logo başarıyla güncellendi", {
          position: "bottom-right"
        });
        await refetch();
      }
    } catch (err: any) {
      console.error("Logo güncelleme hatası:", err);
      toast.error(`Logo güncellenirken bir hata oluştu: ${err.message}`, {
        position: "bottom-right"
      });
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </StaffLayout>
    );
  }

  if (error) {
    return (
      <StaffLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Bir hata oluştu</h2>
            <p className="text-red-500 mb-4">{String(error)}</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">İşletme Ayarları</h1>

        <Card>
          <CardHeader>
            <CardTitle>İşletme Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="shopName" className="text-right inline-block">
                  İşletme Adı
                </label>
                <Input
                  type="text"
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="shopAddress" className="text-right inline-block">
                  İşletme Adresi
                </label>
                <Input
                  type="text"
                  id="shopAddress"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="shopPhone" className="text-right inline-block">
                  İşletme Telefonu
                </label>
                <Input
                  type="text"
                  id="shopPhone"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              {isletmeData ? (
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              ) : (
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>İşletme Logosu</CardTitle>
          </CardHeader>
          <CardContent>
            <ShopProfilePhotoUpload
              dukkanId={isletmeData?.id}
              onSuccess={handleLogoUpload}
              currentImageUrl={isletmeData?.logo_url}
            >
              {isletmeData?.logo_url ? (
                <img 
                  src={isletmeData.logo_url} 
                  alt="İşletme Logosu"
                  className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 cursor-pointer"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                  <span className="text-gray-500">Logo Yükle</span>
                </div>
              )}
            </ShopProfilePhotoUpload>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
