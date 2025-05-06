import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isletmeServisi, personelServisi, kategoriServisi, islemServisi } from "@/lib/supabase";
import { ServicesList } from "@/components/operations/ServicesList";
import { ServiceCategoriesList } from "@/components/operations/ServiceCategoriesList";
import { ServiceForm } from "@/components/operations/ServiceForm";
import { CategoryForm } from "@/components/operations/CategoryForm";
import { WorkingHours } from "@/components/operations/WorkingHours";

export default function StaffOperations() {
  // State variables
  const [kategoriler, setKategoriler] = useState<any[]>([]);
  const [islemler, setIslemler] = useState<any[]>([]);
  const [dialogAcik, setDialogAcik] = useState(false);
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);
  const [seciliKategori, setSeciliKategori] = useState<any>(null);
  const [seciliIslem, setSeciliIslem] = useState<any>(null);
  const [modeIsAdd, setModeIsAdd] = useState(true);
  const [activeTab, setActiveTab] = useState("hizmetler");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [inactiveKategoriler, setInactiveKategoriler] = useState<any[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [puanlamaAktif, setPuanlamaAktif] = useState(false);

  const { toast } = useToast();
  const { isletmeId } = useAuth();

  // Fetch categories and services
  useEffect(() => {
    if (!isletmeId) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const kategorilerData = await kategoriServisi.isletmeyeGoreGetir(isletmeId);
        const aktifKategoriler = kategorilerData.filter((k: any) => k.aktif !== false);
        const inaktifKategoriler = kategorilerData.filter((k: any) => k.aktif === false);
        
        setKategoriler(aktifKategoriler);
        setInactiveKategoriler(inaktifKategoriler);
        
        // Fetch services
        const islemlerData = await islemServisi.isletmeyeGoreGetir(isletmeId);
        setIslemler(islemlerData);
        
        // Check if points are enabled
        const { data: isletme } = await isletmeServisi.getir(isletmeId);
        setPuanlamaAktif(isletme?.puan_sistemi_aktif || false);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Veri çekilirken bir sorun oluştu.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isletmeId, refreshTrigger]);

  // Handle add service
  const handleAddService = () => {
    setSeciliIslem(null);
    setModeIsAdd(true);
    setDialogAcik(true);
  };

  // Handle edit service
  const handleEditService = (islem: any) => {
    setSeciliIslem(islem);
    setModeIsAdd(false);
    setDialogAcik(true);
  };

  // Handle service form success
  const handleServiceSuccess = async () => {
    setDialogAcik(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle add category
  const handleAddCategory = () => {
    setSeciliKategori(null);
    setModeIsAdd(true);
    setKategoriDialogAcik(true);
  };

  // Handle edit category
  const handleEditCategory = (kategori: any) => {
    setSeciliKategori(kategori);
    setModeIsAdd(false);
    setKategoriDialogAcik(true);
  };

  // Handle category form success
  const handleCategorySuccess = () => {
    setKategoriDialogAcik(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle delete category
  const handleDeleteCategory = async (kategoriId: string) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    
    try {
      await kategoriServisi.sil(kategoriId);
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla silindi.",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Kategori silme hatası:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kategori silinirken bir sorun oluştu.",
      });
    }
  };

  // Handle delete service
  const handleDeleteService = async (islemId: string) => {
    if (!window.confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    
    try {
      await islemServisi.sil(islemId);
      toast({
        title: "Başarılı",
        description: "Hizmet başarıyla silindi.",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Hizmet silme hatası:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Hizmet silinirken bir sorun oluştu.",
      });
    }
  };

  // Handle changes to category order
  const handleCategoryOrderChange = async (newOrder: any[]) => {
    try {
      const updateData = newOrder.map((item, index) => ({
        id: item.id,
        sira: index
      }));
      
      await kategoriServisi.sirayiGuncelle(updateData);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Kategori sıralaması güncellenirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kategori sıralaması güncellenirken bir sorun oluştu.",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">İşlemler Yönetimi</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hizmetler">Hizmetler</TabsTrigger>
          <TabsTrigger value="kategoriler">Kategoriler</TabsTrigger>
          <TabsTrigger value="calisma-saatleri">Çalışma Saatleri</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hizmetler" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Salon Hizmetleri</h2>
            <Button onClick={handleAddService}>Yeni Hizmet Ekle</Button>
          </div>
          
          <ServicesList 
            isStaff={true}
            kategoriler={kategoriler}
            islemler={islemler}
            dialogAcik={dialogAcik}
            setDialogAcik={setDialogAcik}
            kategoriDialogAcik={kategoriDialogAcik}
            setKategoriDialogAcik={setKategoriDialogAcik}
            seciliKategori={seciliKategori}
            setSeciliKategori={setSeciliKategori}
            seciliIslem={seciliIslem}
            setSeciliIslem={setSeciliIslem}
            modeIsAdd={modeIsAdd}
            setModeIsAdd={setModeIsAdd}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            inactiveKategoriler={inactiveKategoriler}
            setInactiveKategoriler={setInactiveKategoriler}
            showInactive={showInactive}
            setShowInactive={setShowInactive}
            handleAddService={handleAddService}
            handleEditService={handleEditService}
            handleServiceSuccess={handleServiceSuccess}
            handleAddCategory={handleAddCategory}
            handleEditCategory={handleEditCategory}
            handleCategorySuccess={handleCategorySuccess}
            handleDeleteCategory={handleDeleteCategory}
            handleDeleteService={handleDeleteService}
            handleCategoryOrderChange={handleCategoryOrderChange}
            puanlamaAktif={puanlamaAktif}
            setPuanlamaAktif={setPuanlamaAktif}
          />
          
          {dialogAcik && (
            <ServiceForm
              isletmeId={isletmeId}
              kategoriler={kategoriler}
              islem={seciliIslem}
              onSuccess={handleServiceSuccess}
              onCancel={() => setDialogAcik(false)}
              puanlamaAktif={puanlamaAktif}
              setPuanlamaAktif={setPuanlamaAktif}
            />
          )}
        </TabsContent>
        
        <TabsContent value="kategoriler" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Hizmet Kategorileri</h2>
            <Button onClick={handleAddCategory}>Yeni Kategori Ekle</Button>
          </div>
          
          <ServiceCategoriesList 
            kategoriler={kategoriler}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onOrderChange={handleCategoryOrderChange}
            inactiveKategoriler={inactiveKategoriler}
            showInactive={showInactive}
            setShowInactive={setShowInactive}
          />
          
          {kategoriDialogAcik && (
            <CategoryForm
              dukkanId={isletme?.id || ""}
              kategori={seciliKategori}
              onSuccess={handleCategorySuccess}
              onCancel={() => setKategoriDialogAcik(false)}
            />
          )}
        </TabsContent>
        
        <TabsContent value="calisma-saatleri">
          <WorkingHours />
        </TabsContent>
      </Tabs>
    </div>
  );
}
