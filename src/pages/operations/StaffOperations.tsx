
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { kategorilerServisi, islemServisi } from "@/lib/supabase";
import { useShopData } from "@/hooks/useShopData";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { toast } from "sonner";

export default function StaffOperations() {
  const [activeTab, setActiveTab] = useState("services");
  const { isletmeData } = useShopData();
  const dukkanId = isletmeData?.id ?? 0;
  
  // Fetch categories
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ["categories", dukkanId],
    queryFn: () => dukkanId ? kategorilerServisi.hepsiniGetir(dukkanId) : Promise.resolve([]),
    enabled: !!dukkanId,
  });

  // Fetch services
  const {
    data: services = [],
    isLoading: isServicesLoading,
    refetch: refetchServices
  } = useQuery({
    queryKey: ["services", dukkanId],
    queryFn: () => dukkanId ? islemServisi.hepsiniGetir(dukkanId) : Promise.resolve([]),
    enabled: !!dukkanId,
  });
  
  // Handle category add
  const handleAddCategory = async (kategori_adi: string) => {
    if (!dukkanId) {
      toast.error("İşletme bilgisi bulunamadı");
      return;
    }
    
    try {
      await kategorilerServisi.ekle({
        kategori_adi,
        sira: categories.length,
        dukkan_id: dukkanId
      });
      refetchCategories();
      toast.success("Kategori başarıyla eklendi");
    } catch (error: any) {
      console.error("Kategori eklenirken hata:", error);
      toast.error(`Kategori eklenirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle service add
  const handleAddService = async (serviceData: any) => {
    if (!dukkanId) {
      toast.error("İşletme bilgisi bulunamadı");
      return;
    }
    
    try {
      const data = {
        ...serviceData,
        dukkan_id: dukkanId
      };
      await islemServisi.ekle(data);
      refetchServices();
      toast.success("Hizmet başarıyla eklendi");
    } catch (error: any) {
      console.error("Hizmet eklenirken hata:", error);
      toast.error(`Hizmet eklenirken hata oluştu: ${error.message}`);
    }
  };
  
  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">İşlem Yönetimi</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="products">Ürünler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-4">
            <ServicesContent
              categories={categories}
              services={services} 
              isCategoriesLoading={isCategoriesLoading}
              isServicesLoading={isServicesLoading}
              onAddCategory={handleAddCategory}
              onAddService={handleAddService}
              onCategoryChange={refetchCategories}
              onServiceChange={refetchServices}
            />
          </TabsContent>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Ürün Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Bu özellik yakında eklenecektir.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
