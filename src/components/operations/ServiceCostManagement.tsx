
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Edit, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { kategoriServisi, islemServisi, isletmeServisi } from "@/lib/supabase";
import { IslemKategorisi, Hizmet } from "@/lib/supabase/types";
import { toast } from "sonner";
import { CategoryForm, ServiceForm } from "./CategoryCard";

export function ServiceCostManagement() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<IslemKategorisi[]>([]);
  const [services, setServices] = useState<Hizmet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isletmeKimlik, setIsletmeKimlik] = useState<string>("");
  
  // Service form states
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Hizmet | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    islemAdi: "",
    sureDakika: "",
    fiyat: "",
    kategoriKimlik: "",
    puan: "1"
  });
  
  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);
  
  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user's business ID
      const isletme = await isletmeServisi.kullaniciIsletmesiniGetir();
      if (!isletme) {
        toast.error("İşletme bilgileriniz bulunamadı");
        return;
      }
      
      setIsletmeKimlik(isletme.kimlik);
      
      // Get categories
      const kategoriler = await kategoriServisi.isletmeyeGoreGetir(isletme.kimlik);
      setCategories(kategoriler);
      
      if (kategoriler.length > 0) {
        setSelectedCategory(kategoriler[0].kimlik);
        
        // Get services for first category
        const hizmetler = await islemServisi.kategoriyeGoreGetir(kategoriler[0].kimlik);
        setServices(hizmetler);
      }
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
      toast.error("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category change
  const handleCategoryChange = async (categoryId: string) => {
    try {
      setSelectedCategory(categoryId);
      setLoading(true);
      
      const hizmetler = await islemServisi.kategoriyeGoreGetir(categoryId);
      setServices(hizmetler);
    } catch (error) {
      console.error("Hizmetler yüklenirken hata:", error);
      toast.error("Hizmetler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  // Open service form for create/edit
  const openServiceForm = (service?: Hizmet) => {
    if (service) {
      // Edit mode
      setEditingService(service);
      setServiceFormData({
        islemAdi: service.hizmet_adi,
        sureDakika: String(service.sure_dakika),
        fiyat: String(service.fiyat),
        kategoriKimlik: service.kategori_kimlik,
        puan: "1" // Default puan value
      });
    } else {
      // Create mode
      setEditingService(null);
      setServiceFormData({
        islemAdi: "",
        sureDakika: "30",
        fiyat: "",
        kategoriKimlik: selectedCategory || "",
        puan: "1"
      });
    }
    
    setIsServiceDialogOpen(true);
  };
  
  // Save service
  const saveService = async () => {
    try {
      const { islemAdi, sureDakika, fiyat, kategoriKimlik, puan } = serviceFormData;
      
      if (!islemAdi.trim()) {
        toast.error("Hizmet adı boş olamaz");
        return;
      }
      
      if (!kategoriKimlik) {
        toast.error("Kategori seçilmelidir");
        return;
      }
      
      const serviceData = {
        hizmet_adi: islemAdi,
        sure_dakika: Number(sureDakika),
        fiyat: Number(fiyat),
        kategori_kimlik: kategoriKimlik,
        isletme_kimlik: isletmeKimlik,
        puan: Number(puan) || 1
      };
      
      if (editingService) {
        // Update existing service
        await islemServisi.guncelle(editingService.kimlik, serviceData);
        toast.success("Hizmet başarıyla güncellendi");
      } else {
        // Create new service
        await islemServisi.olustur(serviceData);
        toast.success("Yeni hizmet başarıyla eklendi");
      }
      
      setIsServiceDialogOpen(false);
      
      // Refresh services for current category
      if (selectedCategory) {
        const hizmetler = await islemServisi.kategoriyeGoreGetir(selectedCategory);
        setServices(hizmetler);
      }
    } catch (error) {
      console.error("Hizmet kaydedilirken hata:", error);
      toast.error("Hizmet kaydedilirken bir hata oluştu");
    }
  };
  
  // Delete service
  const deleteService = async (serviceId: string) => {
    try {
      await islemServisi.sil(serviceId);
      toast.success("Hizmet başarıyla silindi");
      
      // Refresh services for current category
      if (selectedCategory) {
        const hizmetler = await islemServisi.kategoriyeGoreGetir(selectedCategory);
        setServices(hizmetler);
      }
    } catch (error) {
      console.error("Hizmet silinirken hata:", error);
      toast.error("Hizmet silinirken bir hata oluştu");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Categories Column */}
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Kategoriler</CardTitle>
            <CardDescription>
              Hizmet kategorilerini yönetin
            </CardDescription>
          </div>
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">Kategori Ekle</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Kategori Ekle</DialogTitle>
              </DialogHeader>
              <CategoryForm 
                isletmeKimlik={isletmeKimlik}
                onSuccess={() => {
                  setIsCategoryDialogOpen(false);
                  loadData();
                }}
                onCancel={() => setIsCategoryDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading && categories.length === 0 ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  key={category.kimlik}
                  className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer ${
                    selectedCategory === category.kimlik
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleCategoryChange(category.kimlik)}
                >
                  <span>{category.baslik}</span>
                </div>
              ))}
              
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  Henüz kategori eklenmemiş
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Services Column */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Hizmetler</CardTitle>
            <CardDescription>
              Seçili kategori için hizmetleri yönetin
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            onClick={() => openServiceForm()}
            disabled={!selectedCategory}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Yeni Hizmet
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Bu kategoride henüz hizmet bulunmuyor
                </p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.kimlik}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <h4 className="font-medium">{service.hizmet_adi}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>{service.sure_dakika} dk</span>
                        <span>{service.fiyat} ₺</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openServiceForm(service)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Düzenle</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteService(service.kimlik)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Sil</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-2">
          <p className="text-xs text-muted-foreground">
            Hizmetlere tıklayarak düzenleyebilir veya silebilirsiniz
          </p>
        </CardFooter>
      </Card>
      
      {/* Service Form Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm 
            isOpen={isServiceDialogOpen}
            onOpenChange={setIsServiceDialogOpen}
            kategoriler={categories}
            islemAdi={serviceFormData.islemAdi}
            setIslemAdi={(value) => setServiceFormData(prev => ({ ...prev, islemAdi: value }))}
            sureDakika={serviceFormData.sureDakika}
            setSureDakika={(value) => setServiceFormData(prev => ({ ...prev, sureDakika: value }))}
            fiyat={serviceFormData.fiyat}
            setFiyat={(value) => setServiceFormData(prev => ({ ...prev, fiyat: value }))}
            kategoriKimlik={serviceFormData.kategoriKimlik}
            setKategoriKimlik={(value) => setServiceFormData(prev => ({ ...prev, kategoriKimlik: value }))}
            puan={serviceFormData.puan}
            setPuan={(value) => setServiceFormData(prev => ({ ...prev, puan: value }))}
            onSave={saveService}
            editing={!!editingService}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ServiceCostManagement;
