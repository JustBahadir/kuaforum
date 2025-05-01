
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { kategoriServisi, islemServisi } from "@/lib/supabase";
import { useShopData } from "@/hooks/useShopData";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { toast } from "sonner";

export default function StaffOperations() {
  const [activeTab, setActiveTab] = useState("services");
  const { isletmeData } = useShopData(null);
  const dukkanId = isletmeData?.id ?? 0;
  
  // State for ServicesContent component
  const [kategoriler, setKategoriler] = useState<any[]>([]);
  const [islemler, setIslemler] = useState<any[]>([]);
  const [dialogAcik, setDialogAcik] = useState(false);
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);
  const [kategoriDuzenleDialogAcik, setKategoriDuzenleDialogAcik] = useState(false);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [duzenleKategoriId, setDuzenleKategoriId] = useState<number | null>(null);
  const [duzenleKategoriAdi, setDuzenleKategoriAdi] = useState("");
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState(0);
  const [maliyet, setMaliyet] = useState(0);
  const [puan, setPuan] = useState(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);
  const [puanlamaAktif, setPuanlamaAktif] = useState(false);

  // Fetch categories
  const {
    data: fetchedCategories = [],
    isLoading: isCategoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ["categories", dukkanId],
    queryFn: () => kategoriServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId,
  });

  // Fetch services
  const {
    data: fetchedServices = [],
    isLoading: isServicesLoading,
    refetch: refetchServices
  } = useQuery({
    queryKey: ["services", dukkanId],
    queryFn: () => islemServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId,
  });

  // Update state when data is fetched
  useEffect(() => {
    setKategoriler(fetchedCategories);
  }, [fetchedCategories]);

  useEffect(() => {
    setIslemler(fetchedServices);
  }, [fetchedServices]);
  
  // Handle category add
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dukkanId) {
      toast.error("İşletme bilgisi bulunamadı");
      return;
    }
    
    try {
      await kategoriServisi.ekle({
        kategori_adi: yeniKategoriAdi,
        sira: kategoriler.length,
        dukkan_id: dukkanId
      });
      
      refetchCategories();
      toast.success("Kategori başarıyla eklendi");
      setKategoriDialogAcik(false);
      setYeniKategoriAdi("");
    } catch (error: any) {
      console.error("Kategori eklenirken hata:", error);
      toast.error(`Kategori eklenirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle category edit
  const handleEditCategory = (kategori: any) => {
    setDuzenleKategoriId(kategori.id);
    setDuzenleKategoriAdi(kategori.kategori_adi);
    setKategoriDuzenleDialogAcik(true);
  };
  
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!duzenleKategoriId) return;
    
    try {
      await kategoriServisi.guncelle(duzenleKategoriId, {
        kategori_adi: duzenleKategoriAdi
      });
      
      refetchCategories();
      toast.success("Kategori başarıyla güncellendi");
      setKategoriDuzenleDialogAcik(false);
    } catch (error: any) {
      console.error("Kategori güncellenirken hata:", error);
      toast.error(`Kategori güncellenirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle category delete
  const handleDeleteCategory = async (kategoriId: number) => {
    try {
      await kategoriServisi.sil(kategoriId);
      refetchCategories();
      toast.success("Kategori başarıyla silindi");
      
      // Also refresh services since related services might be affected
      refetchServices();
    } catch (error: any) {
      console.error("Kategori silinirken hata:", error);
      toast.error(`Kategori silinirken hata oluştu: ${error.message}`);
    }
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Hizmet Yönetimi</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2 mb-8">
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="hours">Çalışma Saatleri</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-4">
            <ServicesContent 
              kategoriler={kategoriler}
              islemler={islemler}
              isCategoriesLoading={isCategoriesLoading}
              isServicesLoading={isServicesLoading}
              onCategoryAdd={handleAddCategory}
              onCategoryEdit={handleEditCategory}
              onCategoryDelete={handleDeleteCategory}
              onServiceRefresh={refetchServices}
              kategoriDialogAcik={kategoriDialogAcik}
              setKategoriDialogAcik={setKategoriDialogAcik}
              kategoriDuzenleDialogAcik={kategoriDuzenleDialogAcik}
              setKategoriDuzenleDialogAcik={setKategoriDuzenleDialogAcik}
              yeniKategoriAdi={yeniKategoriAdi}
              setYeniKategoriAdi={setYeniKategoriAdi}
              duzenleKategoriAdi={duzenleKategoriAdi}
              setDuzenleKategoriAdi={setDuzenleKategoriAdi}
              dukkanId={dukkanId}
              puanlamaAktif={puanlamaAktif}
            />
          </TabsContent>
          
          <TabsContent value="hours">
            <WorkingHours isStaff={true} dukkanId={dukkanId} />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
