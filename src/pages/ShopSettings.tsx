
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { dukkanServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-elements";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ShopProfileHeader } from "@/components/shop/ShopProfileHeader";
import { ShopGalleryCard } from "@/components/shop/ShopGalleryCard";

export default function ShopSettings() {
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [shopName, setShopName] = useState<string>("");
  const [shopCode, setShopCode] = useState<string>("");
  const [shopPhone, setShopPhone] = useState<string>("");
  const [shopAddress, setShopAddress] = useState<string>("");

  useEffect(() => {
    const loadShopData = async () => {
      try {
        setLoading(true);

        if (!user) {
          navigate('/login');
          return;
        }

        const dukkan = await dukkanServisi.kullaniciDukkaniniGetir();
        if (!dukkan) {
          navigate('/create-shop');
          return;
        }

        setShopData(dukkan);
        // Initialize form state
        setShopName(dukkan.ad || "");
        setShopCode(dukkan.kod || "");
        setShopPhone(dukkan.telefon || "");
        setShopAddress(dukkan.adres || "");
      } catch (error) {
        console.error("Error loading shop data:", error);
        toast.error("İşletme bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [user, navigate]);

  // Check if form has any changes
  const hasChanges = () => {
    if (!shopData) return false;
    
    return (
      shopName !== (shopData.ad || "") ||
      shopCode !== (shopData.kod || "") ||
      shopPhone !== (shopData.telefon || "") ||
      shopAddress !== (shopData.adres || "")
    );
  };

  // Handle form submission
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopData || !shopData.id) {
      toast.error("İşletme bilgisi bulunamadı");
      return;
    }
    
    try {
      setSaving(true);
      
      // Create update payload
      const updateData = {
        ad: shopName,
        kod: shopCode,
        telefon: shopPhone,
        adres: shopAddress
      };
      
      // Update shop data function
      const updateShopData = async () => {
        // Check if dukkanServisi.guncelle exists, if not use a custom implementation
        if (typeof dukkanServisi.guncelle === 'function') {
          return await dukkanServisi.guncelle(shopData.id, updateData);
        } else {
          // Implement custom update function using Supabase directly
          const { supabase } = await import("@/lib/supabase/client");
          const { data, error } = await supabase
            .from('dukkanlar')
            .update(updateData)
            .eq('id', shopData.id)
            .select()
            .single();
            
          if (error) throw error;
          return data;
        }
      };
      
      // Call the update function
      const updatedShop = await updateShopData();
      
      // Update local state
      setShopData({...shopData, ...updateData});
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries(["dukkan"]);
      
      toast.success("İşletme bilgileri güncellendi");
    } catch (error: any) {
      console.error("Error updating shop:", error);
      toast.error(`İşletme bilgileri güncellenirken bir hata oluştu: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle logo updated event
  const handleLogoUpdated = (url: string) => {
    setShopData({...shopData, logo_url: url});
    // Here we would normally save to DB as well
    queryClient.invalidateQueries(["dukkan"]);
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-8 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </CardContent>
          </Card>
        </div>
      </StaffLayout>
    );
  }

  if (!shopData) {
    return (
      <StaffLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">İşletme Bulunamadı</h2>
                <p className="text-muted-foreground mb-4">Henüz bir işletmeniz bulunmuyor.</p>
                <Button onClick={() => navigate('/create-shop')}>İşletme Oluştur</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <ShopProfileHeader 
          shopData={shopData}
          isOwner={true}
          onLogoUpdated={handleLogoUpdated}
        />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="general">Genel Ayarlar</TabsTrigger>
              <TabsTrigger value="gallery">Galeri</TabsTrigger>
              <TabsTrigger value="social">Sosyal Medya</TabsTrigger>
              <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>İşletme Bilgileri</CardTitle>
                  <CardDescription>
                    İşletmenizin temel bilgilerini buradan düzenleyebilirsiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
                    <FormField
                      id="shop_name"
                      label="İşletme Adı"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="İşletmenizin adı"
                      required
                    />
                    
                    <FormField
                      id="shop_code"
                      label="İşletme Kodu"
                      value={shopCode}
                      onChange={(e) => setShopCode(e.target.value)}
                      placeholder="İşletme kodu"
                      required
                    />
                    
                    <FormField
                      id="shop_phone"
                      label="Telefon"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      placeholder="0xxx xxx xx xx"
                    />
                    
                    <FormField
                      id="shop_address"
                      label="Adres"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="İşletme adresi"
                    />
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={!hasChanges() || saving}
                      >
                        {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="gallery">
              <ShopGalleryCard shopId={shopData.id} />
            </TabsContent>
            
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Sosyal Medya Ayarları</CardTitle>
                  <CardDescription>
                    İşletmenizin sosyal medya bilgilerini buradan düzenleyebilirsiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Bu özellik yakında eklenecektir.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Gelişmiş Ayarlar</CardTitle>
                  <CardDescription>
                    İşletmenizin gelişmiş ayarlarını buradan düzenleyebilirsiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Bu özellik yakında eklenecektir.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StaffLayout>
  );
}
