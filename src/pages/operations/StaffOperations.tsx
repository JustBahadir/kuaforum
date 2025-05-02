
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { kategorilerServisi, islemServisi } from "@/lib/supabase";
import { useShopData } from "@/hooks/useShopData";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { toast } from "sonner";

export default function StaffOperations() {
  const [activeTab, setActiveTab] = useState("services");
  const { isletmeData } = useShopData();
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
    queryFn: () => kategorilerServisi.hepsiniGetir(dukkanId),
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
      await kategorilerServisi.ekle({
        kategori_adi: yeniKategoriAdi,
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
      await kategorilerServisi.guncelle(duzenleKategoriId, {
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
      await kategorilerServisi.sil(kategoriId);
      refetchCategories();
      toast.success("Kategori başarıyla silindi");
      
      // Also refresh services since related services might be affected
      refetchServices();
    } catch (error: any) {
      console.error("Kategori silinirken hata:", error);
      toast.error(`Kategori silinirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle service add/edit
  const handleServiceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dukkanId) {
      toast.error("İşletme bilgisi bulunamadı");
      return;
    }
    
    try {
      const serviceData = {
        islem_adi: islemAdi,
        fiyat,
        maliyet,
        puan,
        kategori_id: kategoriId,
        dukkan_id: dukkanId
      };
      
      if (duzenleId) {
        await islemServisi.guncelle(duzenleId, serviceData);
        toast.success("Hizmet başarıyla güncellendi");
      } else {
        await islemServisi.ekle(serviceData);
        toast.success("Hizmet başarıyla eklendi");
      }
      
      refetchServices();
      setDialogAcik(false);
      formuSifirla();
    } catch (error: any) {
      console.error("Hizmet işlemi hatası:", error);
      toast.error(`İşlem hatası: ${error.message}`);
    }
  };
  
  // Handle service edit
  const handleServiceEdit = (service: any) => {
    setIslemAdi(service.islem_adi);
    setFiyat(service.fiyat);
    setMaliyet(service.maliyet || 0);
    setPuan(service.puan || 0);
    setKategoriId(service.kategori_id);
    setDuzenleId(service.id);
    setDialogAcik(true);
  };
  
  // Handle service delete
  const handleServiceDelete = async (serviceId: number) => {
    try {
      await islemServisi.sil(serviceId);
      refetchServices();
      toast.success("Hizmet başarıyla silindi");
    } catch (error: any) {
      console.error("Hizmet silinirken hata:", error);
      toast.error(`Hizmet silinirken hata oluştu: ${error.message}`);
    }
  };
  
  // Handle service order change
  const handleServiceOrderChange = async (items: any[]) => {
    try {
      const updatedItems = items.map((item, index) => ({
        ...item,
        sira: index
      }));
      
      await islemServisi.sirayiGuncelle(updatedItems);
      refetchServices();
    } catch (error: any) {
      console.error("Sıralama güncellenirken hata:", error);
      toast.error("Sıralama güncellenirken bir hata oluştu");
    }
  };
  
  // Handle category order change
  const handleCategoryOrderChange = async (items: any[]) => {
    try {
      const updatedItems = items.map((item, index) => ({
        id: item.id,
        sira: index
      }));
      
      await kategorilerServisi.sirayiGuncelle(updatedItems);
      refetchCategories();
    } catch (error: any) {
      console.error("Kategori sıralaması güncellenirken hata:", error);
      toast.error("Kategori sıralaması güncellenirken bir hata oluştu");
    }
  };
  
  // Reset form fields
  const formuSifirla = () => {
    setIslemAdi("");
    setFiyat(0);
    setMaliyet(0);
    setPuan(0);
    setKategoriId(null);
    setDuzenleId(null);
  };
  
  // Handle appointment from service
  const handleRandevuAl = (islemId: number) => {
    console.log("Randevu alınıyor, islem ID:", islemId);
  };
  
  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">İşlem Yönetimi</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="workinghours">Çalışma Saatleri</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-4">
            <ServicesContent
              isStaff={true}
              kategoriler={kategoriler}
              islemler={islemler}
              dialogAcik={dialogAcik}
              setDialogAcik={setDialogAcik}
              kategoriDialogAcik={kategoriDialogAcik}
              setKategoriDialogAcik={setKategoriDialogAcik}
              kategoriDuzenleDialogAcik={kategoriDuzenleDialogAcik}
              setKategoriDuzenleDialogAcik={setKategoriDuzenleDialogAcik}
              yeniKategoriAdi={yeniKategoriAdi}
              setYeniKategoriAdi={setYeniKategoriAdi}
              duzenleKategoriId={duzenleKategoriId}
              duzenleKategoriAdi={duzenleKategoriAdi}
              setDuzenleKategoriAdi={setDuzenleKategoriAdi}
              islemAdi={islemAdi}
              setIslemAdi={setIslemAdi}
              fiyat={fiyat}
              setFiyat={setFiyat}
              maliyet={maliyet}
              setMaliyet={setMaliyet}
              puan={puan}
              setPuan={setPuan}
              kategoriId={kategoriId}
              setKategoriId={setKategoriId}
              duzenleId={duzenleId}
              onServiceFormSubmit={handleServiceFormSubmit}
              onCategoryFormSubmit={handleAddCategory}
              onCategoryEditFormSubmit={handleUpdateCategory}
              onServiceEdit={handleServiceEdit}
              onServiceDelete={handleServiceDelete}
              onCategoryDelete={handleDeleteCategory}
              onCategoryEdit={handleEditCategory}
              onSiralamaChange={handleServiceOrderChange}
              onCategoryOrderChange={handleCategoryOrderChange}
              onRandevuAl={handleRandevuAl}
              formuSifirla={formuSifirla}
              dukkanId={dukkanId}
              puanlamaAktif={puanlamaAktif}
              setPuanlamaAktif={setPuanlamaAktif}
              hideTabBar={true} // Hide the inner tab bar
            />
          </TabsContent>
          
          <TabsContent value="workinghours">
            <WorkingHours dukkanId={dukkanId} />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
