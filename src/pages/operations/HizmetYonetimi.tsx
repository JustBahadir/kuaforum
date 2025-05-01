
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffLayout } from "@/components/ui/staff-layout";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { useQuery } from "@tanstack/react-query";
import { kategoriServisi, islemServisi } from "@/lib/supabase";
import { useShopData } from "@/hooks/useShopData";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function HizmetYonetimi() {
  const [activeTab, setActiveTab] = useState("hizmetler");
  const [puanlamaAktif, setPuanlamaAktif] = useState(false);
  
  const { isletmeData } = useShopData(null);
  const dukkanId = isletmeData?.id ?? 0;
  
  // Fetch categories
  const {
    data: kategoriler = [],
    isLoading: kategorilerLoading,
    refetch: kategoriRefetch
  } = useQuery({
    queryKey: ["kategoriler", dukkanId],
    queryFn: async () => {
      try {
        return await kategoriServisi.hepsiniGetir(dukkanId);
      } catch (error) {
        console.error("Kategorileri getirme hatası:", error);
        return [];
      }
    },
    enabled: !!dukkanId,
    staleTime: 60 * 1000
  });

  // Fetch services
  const {
    data: islemler = [],
    isLoading: islemlerLoading,
    refetch: islemlerRefetch
  } = useQuery({
    queryKey: ["islemler", dukkanId],
    queryFn: async () => {
      try {
        return await islemServisi.hepsiniGetir(dukkanId);
      } catch (error) {
        console.error("İşlemleri getirme hatası:", error);
        return [];
      }
    },
    enabled: !!dukkanId,
    staleTime: 60 * 1000
  });
  
  // Handle category add
  const handleKategoriEkle = async (kategoriAdi: string) => {
    if (!dukkanId) {
      toast.error("İşletme bilgisi bulunamadı");
      return;
    }
    
    try {
      await kategoriServisi.ekle({
        kategori_adi: kategoriAdi,
        sira: kategoriler.length,
        dukkan_id: dukkanId
      });
      
      kategoriRefetch();
      toast.success("Kategori başarıyla eklendi");
    } catch (error: any) {
      console.error("Kategori ekleme hatası:", error);
      toast.error(`Kategori eklenirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle category edit
  const handleKategoriGuncelle = async (id: number, kategoriAdi: string) => {
    try {
      await kategoriServisi.guncelle(id, {
        kategori_adi: kategoriAdi
      });
      
      kategoriRefetch();
      toast.success("Kategori başarıyla güncellendi");
    } catch (error: any) {
      console.error("Kategori güncelleme hatası:", error);
      toast.error(`Kategori güncellenirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle category delete
  const handleKategoriSil = async (id: number) => {
    try {
      await kategoriServisi.sil(id);
      kategoriRefetch();
      islemlerRefetch();
      toast.success("Kategori başarıyla silindi");
    } catch (error: any) {
      console.error("Kategori silme hatası:", error);
      toast.error(`Kategori silinirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle service add
  const handleIslemEkle = async (islemData: any) => {
    try {
      await islemServisi.ekle({
        ...islemData,
        dukkan_id: dukkanId
      });
      
      islemlerRefetch();
      toast.success("Hizmet başarıyla eklendi");
    } catch (error: any) {
      console.error("Hizmet ekleme hatası:", error);
      toast.error(`Hizmet eklenirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle service edit
  const handleIslemGuncelle = async (id: number, islemData: any) => {
    try {
      await islemServisi.guncelle(id, islemData);
      
      islemlerRefetch();
      toast.success("Hizmet başarıyla güncellendi");
    } catch (error: any) {
      console.error("Hizmet güncelleme hatası:", error);
      toast.error(`Hizmet güncellenirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle service delete
  const handleIslemSil = async (id: number) => {
    try {
      await islemServisi.sil(id);
      islemlerRefetch();
      toast.success("Hizmet başarıyla silindi");
    } catch (error: any) {
      console.error("Hizmet silme hatası:", error);
      toast.error(`Hizmet silinirken hata oluştu: ${error.message}`);
    }
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Hizmet Yönetimi</h1>
          
          {activeTab === "hizmetler" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="puanlama-sistemi"
                checked={puanlamaAktif}
                onCheckedChange={setPuanlamaAktif}
              />
              <Label htmlFor="puanlama-sistemi">Puanlama Sistemi</Label>
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="hizmetler">Hizmetler</TabsTrigger>
            <TabsTrigger value="calisma-saatleri">Çalışma Saatleri</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hizmetler">
            <ServicesContent
              kategoriler={kategoriler}
              islemler={islemler}
              isKategorilerLoading={kategorilerLoading}
              isIslemlerLoading={islemlerLoading}
              onKategoriEkle={handleKategoriEkle}
              onKategoriGuncelle={handleKategoriGuncelle}
              onKategoriSil={handleKategoriSil}
              onIslemEkle={handleIslemEkle}
              onIslemGuncelle={handleIslemGuncelle}
              onIslemSil={handleIslemSil}
              puanlamaAktif={puanlamaAktif}
              dukkanId={dukkanId}
            />
          </TabsContent>
          
          <TabsContent value="calisma-saatleri">
            <WorkingHours dukkanId={dukkanId} />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}

export default HizmetYonetimi;
