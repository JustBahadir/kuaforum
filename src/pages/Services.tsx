
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicesList } from "@/components/operations/ServicesList";
import { ServiceCategoriesList } from "@/components/operations/ServiceCategoriesList";
import { ServiceForm } from "@/components/operations/ServiceForm";
import { ServiceCategoryForm } from "@/components/operations/ServiceCategoryForm";
import { useAuth } from "@/hooks/useAuth";
import { useShopData } from "@/hooks/useShopData";
import { kategoriServisi, islemServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { Hizmet, IslemKategorisi } from "@/lib/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlusCircle } from "lucide-react";

export default function Services() {
  const { user, userRole } = useAuth();
  const { isletme, loading } = useShopData();
  const [activeTab, setActiveTab] = useState("hizmetler");
  const [kategoriler, setKategoriler] = useState<IslemKategorisi[]>([]);
  const [islemler, setIslemler] = useState<Hizmet[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<IslemKategorisi | null>(null);
  const [loadingKategoriler, setLoadingKategoriler] = useState(true);
  const [loadingIslemler, setLoadingIslemler] = useState(true);
  const [isletmeId, setIsletmeId] = useState<string>("");
  const [dialogAcik, setDialogAcik] = useState(false);
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);
  const [silmeDialogAcik, setSilmeDialogAcik] = useState(false);
  const [kategoriSilmeDialogAcik, setKategoriSilmeDialogAcik] = useState(false);
  const [seciliIslem, setSeciliIslem] = useState<Hizmet | null>(null);
  const [seciliKategori, setSeciliKategori] = useState<IslemKategorisi | null>(null);
  const [puanlamaAktif, setPuanlamaAktif] = useState(false);

  // Load services and categories
  useEffect(() => {
    if (isletme?.id) {
      setIsletmeId(isletme.id);
      loadServices(isletme.id);
      loadCategories(isletme.id);
    }
  }, [isletme]);

  const loadCategories = async (id: string) => {
    setLoadingKategoriler(true);
    try {
      const data = await kategoriServisi.isletmeyeGoreGetir(id);
      setKategoriler(data);
      if (data.length > 0 && !selectedKategori) {
        setSelectedKategori(data[0]);
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
      toast.error("Kategoriler yüklenirken bir hata oluştu");
    } finally {
      setLoadingKategoriler(false);
    }
  };

  const loadServices = async (id: string) => {
    setLoadingIslemler(true);
    try {
      const data = await islemServisi.isletmeyeGoreGetir(id);
      setIslemler(data);
    } catch (error) {
      console.error("İşlemler yüklenirken hata:", error);
      toast.error("İşlemler yüklenirken bir hata oluştu");
    } finally {
      setLoadingIslemler(false);
    }
  };

  const handleKategoriSelect = (kategori: IslemKategorisi) => {
    setSelectedKategori(kategori);
  };

  const handleIslemEkle = () => {
    setSeciliIslem(null);
    setDialogAcik(true);
  };

  const handleKategoriEkle = () => {
    setSeciliKategori(null);
    setKategoriDialogAcik(true);
  };

  const handleIslemDuzenle = (islem: Hizmet) => {
    setSeciliIslem(islem);
    setDialogAcik(true);
  };

  const handleKategoriDuzenle = (kategori: IslemKategorisi) => {
    setSeciliKategori(kategori);
    setKategoriDialogAcik(true);
  };

  const handleIslemSil = (islem: Hizmet) => {
    setSeciliIslem(islem);
    setSilmeDialogAcik(true);
  };

  const handleKategoriSil = (kategori: IslemKategorisi) => {
    setSeciliKategori(kategori);
    setKategoriSilmeDialogAcik(true);
  };

  const onSilmeOnay = async () => {
    if (!seciliIslem) return;
    
    try {
      await islemServisi.sil(String(seciliIslem.id) || seciliIslem.kimlik);
      toast.success("İşlem başarıyla silindi");
      loadServices(isletmeId);
    } catch (error) {
      console.error("İşlem silinirken hata:", error);
      toast.error("İşlem silinirken bir hata oluştu");
    } finally {
      setSilmeDialogAcik(false);
      setSeciliIslem(null);
    }
  };

  const onKategoriSilmeOnay = async () => {
    if (!seciliKategori) return;
    
    try {
      await kategoriServisi.sil(String(seciliKategori.id) || seciliKategori.kimlik);
      toast.success("Kategori başarıyla silindi");
      loadCategories(isletmeId);
      
      // Eğer silinen kategori seçili kategoriyse, seçimi temizle
      if (selectedKategori && (selectedKategori.id === seciliKategori.id || selectedKategori.kimlik === seciliKategori.kimlik)) {
        setSelectedKategori(null);
      }
    } catch (error) {
      console.error("Kategori silinirken hata:", error);
      toast.error("Kategori silinirken bir hata oluştu. Kategoride işlemler olabilir.");
    } finally {
      setKategoriSilmeDialogAcik(false);
      setSeciliKategori(null);
    }
  };

  const handleIslemFormSuccess = async () => {
    setDialogAcik(false);
    await loadServices(isletmeId);
    toast.success(seciliIslem ? "İşlem güncellendi" : "İşlem eklendi");
  };

  const handleKategoriFormSuccess = async () => {
    setKategoriDialogAcik(false);
    await loadCategories(isletmeId);
    toast.success(seciliKategori ? "Kategori güncellendi" : "Kategori eklendi");
  };

  // Filter services by selected category
  const filteredServices = selectedKategori 
    ? islemler.filter(islem => 
        islem.kategori_id === selectedKategori.id || 
        islem.kategori_kimlik === selectedKategori.kimlik
      )
    : islemler;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isStaff = userRole === 'staff' || userRole === 'personel';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hizmet Yönetimi</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="hizmetler">Hizmetler</TabsTrigger>
          <TabsTrigger value="kategoriler">Kategoriler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hizmetler">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Kategoriler</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingKategoriler ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ServiceCategoriesList
                      kategoriler={kategoriler}
                      onCategorySelect={handleKategoriSelect}
                      selectedCategory={selectedKategori?.id || selectedKategori?.kimlik}
                      onAddCategory={!isStaff ? handleKategoriEkle : undefined}
                      onEditCategory={!isStaff ? handleKategoriDuzenle : undefined}
                      onDeleteCategory={!isStaff ? handleKategoriSil : undefined}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {selectedKategori ? (
                      `${selectedKategori.kategori_adi || selectedKategori.baslik} Hizmetleri`
                    ) : (
                      "Tüm Hizmetler"
                    )}
                  </CardTitle>
                  {!isStaff && (
                    <Button 
                      variant="outline" 
                      onClick={handleIslemEkle}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" /> Hizmet Ekle
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loadingIslemler ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ServicesList 
                      islemler={filteredServices}
                      onItemSelect={!isStaff ? handleIslemDuzenle : undefined}
                      isSelectable={!isStaff}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="kategoriler">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Kategoriler</CardTitle>
              {!isStaff && (
                <Button 
                  variant="outline" 
                  onClick={handleKategoriEkle}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Kategori Ekle
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loadingKategoriler ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <ServiceCategoriesList 
                  kategoriler={kategoriler}
                  onEditCategory={!isStaff ? handleKategoriDuzenle : undefined}
                  onDeleteCategory={!isStaff ? handleKategoriSil : undefined}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Service Form Dialog */}
      <Dialog open={dialogAcik} onOpenChange={setDialogAcik}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {seciliIslem ? "Hizmet Düzenle" : "Yeni Hizmet Ekle"}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm 
            isletmeId={isletmeId}
            kategoriler={kategoriler}
            islem={seciliIslem || undefined}
            onSuccess={handleIslemFormSuccess}
            onCancel={() => setDialogAcik(false)}
            puanlamaAktif={puanlamaAktif}
            setPuanlamaAktif={setPuanlamaAktif}
          />
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={kategoriDialogAcik} onOpenChange={setKategoriDialogAcik}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {seciliKategori ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
            </DialogTitle>
          </DialogHeader>
          <ServiceCategoryForm 
            isletmeId={isletmeId}
            onSuccess={handleKategoriFormSuccess}
            onCancel={() => setKategoriDialogAcik(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Service Alert */}
      <AlertDialog open={silmeDialogAcik} onOpenChange={setSilmeDialogAcik}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hizmet Silme</AlertDialogTitle>
            <AlertDialogDescription>
              "{seciliIslem?.islem_adi || seciliIslem?.hizmet_adi}" hizmetini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={onSilmeOnay} className="bg-destructive text-destructive-foreground">
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Alert */}
      <AlertDialog open={kategoriSilmeDialogAcik} onOpenChange={setKategoriSilmeDialogAcik}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategori Silme</AlertDialogTitle>
            <AlertDialogDescription>
              "{seciliKategori?.kategori_adi || seciliKategori?.baslik}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve kategorideki tüm işlemleri de etkileyecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={onKategoriSilmeOnay} className="bg-destructive text-destructive-foreground">
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
