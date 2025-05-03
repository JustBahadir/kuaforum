import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { kategorilerServisi, islemServisi } from "@/lib/supabase";
import { useShopData } from "@/hooks/useShopData";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { toast } from "sonner";

export default function Services() {
  const [activeTab, setActiveTab] = useState("services");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [kategoriDuzenleDialogAcik, setKategoriDuzenleDialogAcik] = useState(false);
  const [duzenleKategoriId, setDuzenleKategoriId] = useState<number | null>(null);
  const [duzenleKategoriAdi, setDuzenleKategoriAdi] = useState("");
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState(0);
  const [maliyet, setMaliyet] = useState(0);
  const [puan, setPuan] = useState(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);
  const [puanlamaAktif, setPuanlamaAktif] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const { isletmeData } = useShopData();
  const dukkanId = isletmeData?.id || 0;

  console.log("Services component - dukkanId:", dukkanId);

  // Fetch categories
  const {
    data: kategoriler = [],
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories", dukkanId],
    queryFn: async () => {
      console.log("Fetching categories with dukkanId:", dukkanId);
      try {
        const data = await kategorilerServisi.hepsiniGetir(dukkanId);
        console.log("Fetched categories:", data.length);
        return data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
    enabled: !!dukkanId,
  });

  // Fetch services 
  const {
    data: islemler = [],
    isLoading: isServicesLoading,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ["services", dukkanId],
    queryFn: async () => {
      console.log("Fetching services with dukkanId:", dukkanId);
      try {
        const data = await islemServisi.hepsiniGetir(dukkanId);
        console.log("Fetched services:", data.length);
        return data;
      } catch (error) {
        console.error("Error fetching services:", error);
        return [];
      }
    },
    enabled: !!dukkanId,
  });

  // Handle form reset
  const formuSifirla = () => {
    setIslemAdi("");
    setFiyat(0);
    setMaliyet(0);
    setPuan(0);
    setKategoriId(null);
    setDuzenleId(null);
  };

  // Handle adding a new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!yeniKategoriAdi.trim()) {
      toast.error("Kategori adı boş olamaz", {
        position: "bottom-right"
      });
      return;
    }

    try {
      console.log("Adding category with dukkanId:", dukkanId);
      await kategorilerServisi.ekle({
        kategori_adi: yeniKategoriAdi,
        dukkan_id: dukkanId,
      });
      
      setYeniKategoriAdi("");
      setIsAddingCategory(false);
      await refetchCategories();
      toast.success("Kategori başarıyla eklendi", {
        position: "bottom-right"
      });
    } catch (error: any) {
      console.error("Kategori eklenirken hata:", error);
      toast.error(`Kategori eklenirken hata oluştu: ${error.message}`, {
        position: "bottom-right"
      });
    }
  };

  // Handle editing a category
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!duzenleKategoriAdi.trim() || !duzenleKategoriId) {
      toast.error("Kategori adı boş olamaz", {
        position: "bottom-right"
      });
      return;
    }

    try {
      await kategorilerServisi.guncelle(duzenleKategoriId, {
        kategori_adi: duzenleKategoriAdi,
      });
      
      setDuzenleKategoriAdi("");
      setDuzenleKategoriId(null);
      setKategoriDuzenleDialogAcik(false);
      await refetchCategories();
      toast.success("Kategori başarıyla güncellendi", {
        position: "bottom-right"
      });
    } catch (error: any) {
      console.error("Kategori güncellenirken hata:", error);
      toast.error(`Kategori güncellenirken hata oluştu: ${error.message}`, {
        position: "bottom-right"
      });
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await kategorilerServisi.sil(categoryId);
      refetchCategories();
      toast.success("Kategori başarıyla silindi", {
        position: "bottom-right"
      });
    } catch (error: any) {
      console.error("Kategori silinirken hata:", error);
      toast.error(`Kategori silinirken hata oluştu: ${error.message}`, {
        position: "bottom-right"
      });
    }
  };

  // Handle adding or editing a service
  const handleServiceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!islemAdi.trim() || !kategoriId) {
      toast.error("Hizmet adı ve kategori seçimi zorunludur", {
        position: "bottom-right"
      });
      return;
    }

    try {
      if (duzenleId) {
        // Edit existing service
        await islemServisi.guncelle(duzenleId, {
          islem_adi: islemAdi,
          fiyat,
          maliyet,
          puan,
          kategori_id: kategoriId,
        });
        toast.success("Hizmet başarıyla güncellendi", {
          position: "bottom-right"
        });
      } else {
        // Add new service
        await islemServisi.ekle({
          islem_adi: islemAdi,
          fiyat,
          maliyet,
          puan,
          kategori_id: kategoriId,
          dukkan_id: dukkanId,
        });
        toast.success("Hizmet başarıyla eklendi", {
          position: "bottom-right"
        });
      }
      
      setIsAddingService(false);
      formuSifirla();
      await refetchServices();
    } catch (error: any) {
      console.error("Hizmet eklenirken/güncellenirken hata:", error);
      toast.error(`Hizmet işlemi sırasında hata oluştu: ${error.message}`, {
        position: "bottom-right"
      });
    }
  };

  // Handle editing a service
  const handleServiceEdit = (service: any) => {
    setIslemAdi(service.islem_adi);
    setFiyat(service.fiyat);
    setMaliyet(service.maliyet || 0);
    setPuan(service.puan || 0);
    setKategoriId(service.kategori_id);
    setDuzenleId(service.id);
    setIsAddingService(true);
  };

  // Handle deleting a service
  const handleServiceDelete = async (service: any) => {
    try {
      await islemServisi.sil(service.id);
      refetchServices();
      toast.success("Hizmet başarıyla silindi", {
        position: "bottom-right"
      });
    } catch (error: any) {
      console.error("Hizmet silinirken hata:", error);
      toast.error(`Hizmet silinirken hata oluştu: ${error.message}`, {
        position: "bottom-right"
      });
    }
  };

  // Handle updating category order
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

  // Handle updating service order
  const handleServiceOrderChange = async (items: any[]) => {
    try {
      const updatedItems = items.map((item, index) => ({
        id: item.id,
        sira: index
      }));
      
      await islemServisi.sirayiGuncelle(updatedItems);
      refetchServices();
    } catch (error: any) {
      console.error("Hizmet sıralaması güncellenirken hata:", error);
      toast.error("Hizmet sıralaması güncellenirken bir hata oluştu");
    }
  };

  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Hizmet Yönetimi</h1>
        
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
              dialogAcik={isAddingService}
              setDialogAcik={setIsAddingService}
              kategoriDialogAcik={isAddingCategory}
              setKategoriDialogAcik={setIsAddingCategory}
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
              onCategoryEditFormSubmit={handleEditCategory}
              onServiceEdit={handleServiceEdit}
              onServiceDelete={handleServiceDelete}
              onCategoryDelete={handleDeleteCategory}
              onCategoryEdit={(category) => {
                setDuzenleKategoriId(category.id);
                setDuzenleKategoriAdi(category.kategori_adi);
                setKategoriDuzenleDialogAcik(true);
              }}
              onSiralamaChange={(items) => {
                // İşlemler için sıralama değişikliği
                try {
                  const updatedItems = items.map((item, index) => ({
                    id: item.id,
                    sira: index
                  }));
                  
                  islemServisi.sirayiGuncelle(updatedItems);
                  refetchServices();
                } catch (error) {
                  console.error("İşlem sıralaması güncellenirken hata:", error);
                }
              }}
              onCategoryOrderChange={(items) => {
                // Kategoriler için sıralama değişikliği
                try {
                  const updatedItems = items.map((item, index) => ({
                    id: item.id,
                    sira: index
                  }));
                  
                  kategorilerServisi.sirayiGuncelle(updatedItems);
                  refetchCategories();
                } catch (error) {
                  console.error("Kategori sıralaması güncellenirken hata:", error);
                }
              }}
              onRandevuAl={() => {}}
              formuSifirla={formuSifirla}
              dukkanId={dukkanId}
              puanlamaAktif={puanlamaAktif}
              setPuanlamaAktif={setPuanlamaAktif}
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
