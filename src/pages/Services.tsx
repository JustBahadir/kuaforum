
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit, Search, Plus, Trash } from "lucide-react";
import { Toaster } from "sonner";
import { formatCurrency } from "@/utils/currencyFormatter";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    islem_adi: "",
    fiyat: "",
    maliyet: "",
    puan: "",
    kategori_id: "",
  });
  
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kategoriler sorgusu
  const { 
    data: categories = [], 
    isLoading: categoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        console.log("Fetching categories");
        const data = await kategoriServisi.hepsiniGetir();
        console.log("Categories fetched:", data);
        return data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
  });

  // İşlemler/Hizmetler sorgusu
  const { 
    data: services = [], 
    isLoading: servicesLoading,
    refetch: refetchServices
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        const data = await islemServisi.hepsiniGetir();
        return data;
      } catch (error) {
        console.error("Error fetching services:", error);
        return [];
      }
    },
  });

  // Dialog için form reset
  const resetForm = () => {
    setFormData({
      islem_adi: "",
      fiyat: "",
      maliyet: "",
      puan: "",
      kategori_id: "",
    });
    setEditServiceId(null);
  };

  // Dialog açma
  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Dialog açma (düzenleme için)
  const openEditDialog = (service: any) => {
    setFormData({
      islem_adi: service.islem_adi,
      fiyat: service.fiyat.toString(),
      maliyet: service.maliyet ? service.maliyet.toString() : "0",
      puan: service.puan.toString(),
      kategori_id: service.kategori_id ? service.kategori_id.toString() : "",
    });
    setEditServiceId(service.id);
    setDialogOpen(true);
  };

  // Form input değişikliklerini yakala
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Select değişikliğini yakala
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, kategori_id: value }));
  };

  // Hizmet ekleme/düzenleme
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceData = {
        islem_adi: formData.islem_adi,
        fiyat: parseFloat(formData.fiyat),
        maliyet: parseFloat(formData.maliyet || "0"),
        puan: parseFloat(formData.puan),
        kategori_id: formData.kategori_id ? parseInt(formData.kategori_id) : null,
      };

      if (editServiceId) {
        await islemServisi.guncelle(editServiceId, serviceData);
        toast.success("Hizmet başarıyla güncellendi");
      } else {
        await islemServisi.ekle(serviceData);
        toast.success("Hizmet başarıyla eklendi");
      }

      refetchServices();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Service save error:", error);
      toast.error(error.message || "Hizmet kaydedilirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kategori ekleme
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast.error("Kategori adı boş olamaz");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await kategoriServisi.ekle({
        kategori_adi: categoryName,
        sira: categories.length + 1,
      });
      
      toast.success("Kategori başarıyla eklendi");
      setCategoryName("");
      setCategoryDialogOpen(false);
      refetchCategories();
    } catch (error: any) {
      console.error("Category save error:", error);
      toast.error(error.message || "Kategori eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hizmet silme
  const handleDeleteService = async (id: number) => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) {
      return;
    }
    
    try {
      await islemServisi.islemSil(id);
      toast.success("Hizmet başarıyla silindi");
      refetchServices();
    } catch (error: any) {
      console.error("Service delete error:", error);
      toast.error(error.message || "Hizmet silinirken bir hata oluştu");
    }
  };

  // Filtreleme
  const getFilteredServices = () => {
    return services.filter(service => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        service.islem_adi.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tab filter
      if (activeTab === "all") {
        return matchesSearch;
      } else {
        return matchesSearch && service.kategori_id?.toString() === activeTab;
      }
    });
  };

  const filteredServices = getFilteredServices();

  // Kategori adı getirme yardımcı fonksiyon
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.kategori_adi : "Kategorisiz";
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Hizmetler</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Kategori Ekle
            </Button>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" /> Hizmet Ekle
            </Button>
          </div>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Hizmet ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tümü</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {category.kategori_adi}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeTab}>
            {servicesLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Bu kategoride hizmet bulunamadı.</p>
                <Button onClick={openAddDialog} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Hizmet Ekle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{service.islem_adi}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {service.kategori_id ? getCategoryName(service.kategori_id) : "Kategorisiz"}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-lg">
                          {formatCurrency(service.fiyat)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground">Puan:</span>
                          <span className="font-medium">{service.puan}</span>
                        </div>
                      </div>
                      {service.maliyet > 0 && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          Maliyet: {formatCurrency(service.maliyet)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Service Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editServiceId ? "Hizmet Düzenle" : "Yeni Hizmet Ekle"}
              </DialogTitle>
              <DialogDescription>
                Hizmet detaylarını girerek {editServiceId ? "düzenleyin" : "ekleyin"}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="islem_adi">Hizmet Adı</Label>
                <Input
                  id="islem_adi"
                  name="islem_adi"
                  value={formData.islem_adi}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kategori_id">Kategori</Label>
                <Select
                  value={formData.kategori_id}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Yükleniyor...
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Kategori bulunamadı
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.kategori_adi}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiyat">Fiyat (₺)</Label>
                  <Input
                    id="fiyat"
                    name="fiyat"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fiyat}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maliyet">Maliyet (₺)</Label>
                  <Input
                    id="maliyet"
                    name="maliyet"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maliyet}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="puan">Puan Değeri</Label>
                <Input
                  id="puan"
                  name="puan"
                  type="number"
                  min="0"
                  value={formData.puan}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Kaydediliyor..."
                    : editServiceId
                    ? "Güncelle"
                    : "Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Category Add Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kategori Ekle</DialogTitle>
              <DialogDescription>
                Hizmetlerinizi gruplamak için yeni bir kategori oluşturun.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kategori_adi">Kategori Adı</Label>
                <Input
                  id="kategori_adi"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCategoryDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Ekleniyor..." : "Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Toaster richColors position="bottom-right" />
      </div>
    </StaffLayout>
  );
}
