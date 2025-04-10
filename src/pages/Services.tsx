
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { islemServisi, kategoriServisi } from "@/lib/supabase";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  FileEdit, 
  Scissors,
  AlertTriangle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServiceForm } from "@/components/operations/ServiceForm";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(amount);
};

// Kârlılık oranına göre renk belirleme
const getProfitColor = (profitPercent: number) => {
  if (profitPercent <= 10) return "text-red-500 bg-red-50";
  if (profitPercent <= 25) return "text-orange-500 bg-orange-50";
  if (profitPercent <= 40) return "text-yellow-500 bg-yellow-50";
  if (profitPercent <= 60) return "text-green-500 bg-green-50";
  return "text-emerald-600 bg-emerald-50 font-medium";
};

export default function Services() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  const [newService, setNewService] = useState({
    islem_adi: "",
    fiyat: "",
    maliyet: "",
    kategori_id: "",
    puan: "5"
  });
  
  const [newCategory, setNewCategory] = useState({
    kategori_adi: "",
    sira: "0"
  });
  
  const [editService, setEditService] = useState({
    id: "",
    islem_adi: "",
    fiyat: "",
    maliyet: "",
    kategori_id: "",
    puan: ""
  });

  const [showLowProfitWarning, setShowLowProfitWarning] = useState(false);

  const { data: islemler = [], isLoading: islemlerLoading } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });
  
  const { data: kategoriler = [], isLoading: kategorilerLoading } = useQuery({
    queryKey: ['islem_kategorileri'],
    queryFn: kategoriServisi.hepsiniGetir
  });

  const { mutate: addService, isPending: isAddingService } = useMutation({
    mutationFn: (service: any) => islemServisi.ekle(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      setIsAddDialogOpen(false);
      setNewService({
        islem_adi: "",
        fiyat: "",
        maliyet: "",
        kategori_id: "",
        puan: "5"
      });
      toast.success("İşlem başarıyla eklendi");
    },
    onError: (error) => {
      console.error("İşlem eklenirken hata:", error);
      toast.error("İşlem eklenirken bir hata oluştu");
    }
  });
  
  const { mutate: addCategory, isPending: isAddingCategory } = useMutation({
    mutationFn: (category: any) => kategoriServisi.ekle(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islem_kategorileri'] });
      setIsCategoryDialogOpen(false);
      setNewCategory({
        kategori_adi: "",
        sira: "0"
      });
      toast.success("Kategori başarıyla eklendi");
    },
    onError: (error) => {
      console.error("Kategori eklenirken hata:", error);
      toast.error("Kategori eklenirken bir hata oluştu");
    }
  });
  
  const { mutate: updateService, isPending: isUpdatingService } = useMutation({
    mutationFn: ({ id, service }: { id: number; service: any }) => 
      islemServisi.guncelle(id, service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      setIsEditDialogOpen(false);
      toast.success("İşlem başarıyla güncellendi");
    },
    onError: (error) => {
      console.error("İşlem güncellenirken hata:", error);
      toast.error("İşlem güncellenirken bir hata oluştu");
    }
  });
  
  const { mutate: deleteService, isPending: isDeletingService } = useMutation({
    mutationFn: (id: number) => islemServisi.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      setIsDeleteDialogOpen(false);
      toast.success("İşlem başarıyla silindi");
    },
    onError: (error) => {
      console.error("İşlem silinirken hata:", error);
      toast.error("İşlem silinirken bir hata oluştu");
    }
  });

  const handleAddService = () => {
    const serviceToAdd = {
      islem_adi: newService.islem_adi,
      fiyat: parseFloat(newService.fiyat),
      maliyet: parseFloat(newService.maliyet) || 0,
      kategori_id: newService.kategori_id ? parseInt(newService.kategori_id) : null,
      puan: parseInt(newService.puan)
    };
    
    // Düşük kârlılık kontrolü
    const profitMargin = calculateProfitMargin(
      parseFloat(newService.fiyat),
      parseFloat(newService.maliyet)
    );
    
    if (profitMargin < 15) {
      setShowLowProfitWarning(true);
      return;
    }
    
    addService(serviceToAdd);
  };
  
  const handleAddCategory = () => {
    const categoryToAdd = {
      kategori_adi: newCategory.kategori_adi,
      sira: parseInt(newCategory.sira)
    };
    
    addCategory(categoryToAdd);
  };
  
  const handleUpdateService = () => {
    const serviceToUpdate = {
      islem_adi: editService.islem_adi,
      fiyat: parseFloat(editService.fiyat),
      maliyet: parseFloat(editService.maliyet) || 0,
      kategori_id: editService.kategori_id ? parseInt(editService.kategori_id) : null,
      puan: parseInt(editService.puan)
    };
    
    // Düşük kârlılık kontrolü
    const profitMargin = calculateProfitMargin(
      parseFloat(editService.fiyat),
      parseFloat(editService.maliyet)
    );
    
    if (profitMargin < 15) {
      setShowLowProfitWarning(true);
      return;
    }
    
    updateService({ id: parseInt(editService.id), service: serviceToUpdate });
  };
  
  const handleDeleteService = () => {
    if (selectedService) {
      deleteService(selectedService.id);
    }
  };
  
  const openEditDialog = (service: any) => {
    setEditService({
      id: service.id.toString(),
      islem_adi: service.islem_adi,
      fiyat: service.fiyat.toString(),
      maliyet: service.maliyet?.toString() || "0",
      kategori_id: service.kategori_id ? service.kategori_id.toString() : "",
      puan: service.puan.toString()
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (service: any) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };
  
  const calculateProfit = (price: number, cost: number) => {
    return price - (cost || 0);
  };
  
  const calculateProfitMargin = (price: number, cost: number) => {
    if (!price || price === 0) return 0;
    const profit = calculateProfit(price, cost);
    return (profit / price) * 100;
  };

  const isLoading = islemlerLoading || kategorilerLoading;

  const groupedServices: Record<string, any[]> = {};
  
  if (islemler && islemler.length > 0) {
    groupedServices["Kategorisiz"] = [];
    
    islemler.forEach(islem => {
      let kategoriAdi = "Kategorisiz";
      
      if (islem.kategori_id && kategoriler && Array.isArray(kategoriler)) {
        const kategori = kategoriler.find(k => k.id === islem.kategori_id);
        if (kategori) {
          kategoriAdi = kategori.kategori_adi;
        }
      }
      
      if (!groupedServices[kategoriAdi]) {
        groupedServices[kategoriAdi] = [];
      }
      
      groupedServices[kategoriAdi].push(islem);
    });
  }

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hizmet Yönetimi</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(true)}
            >
              Kategori Ekle
            </Button>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Yeni Hizmet Ekle
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : islemler.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Henüz hiç hizmet eklenmemiş.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                İlk Hizmeti Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedServices).sort((a, b) => {
              if (a === "Kategorisiz") return 1;
              if (b === "Kategorisiz") return -1;
              return a.localeCompare(b);
            }).map((kategoriAdi) => (
              <Card key={kategoriAdi}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Scissors className="mr-2 h-5 w-5 text-purple-500" />
                    {kategoriAdi}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hizmet Adı</TableHead>
                        <TableHead className="text-right">Fiyat</TableHead>
                        <TableHead className="text-right">Maliyet</TableHead>
                        <TableHead className="text-right">Net Kâr</TableHead>
                        <TableHead className="text-right">Kârlılık</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedServices[kategoriAdi].map((islem) => {
                        const netProfit = calculateProfit(islem.fiyat, islem.maliyet || 0);
                        const profitMargin = calculateProfitMargin(islem.fiyat, islem.maliyet || 0);
                        const profitColorClass = getProfitColor(profitMargin);
                        
                        return (
                          <TableRow key={islem.id}>
                            <TableCell className="font-medium">{islem.islem_adi}</TableCell>
                            <TableCell className="text-right">{formatCurrency(islem.fiyat)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(islem.maliyet || 0)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(netProfit)}</TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant="outline" 
                                className={`${profitColorClass} whitespace-nowrap`}
                              >
                                %{profitMargin.toFixed(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">İşlemler</span>
                                    <FileEdit className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(islem)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Düzenle</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => openDeleteDialog(islem)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Sil</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Yeni Hizmet Ekleme Diyalogu */}
        <ServiceForm
          isOpen={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            setShowLowProfitWarning(false);
          }}
          kategoriler={kategoriler}
          islemAdi={newService.islem_adi}
          setIslemAdi={(value) => setNewService({...newService, islem_adi: value})}
          fiyat={parseFloat(newService.fiyat) || 0}
          setFiyat={(value) => setNewService({...newService, fiyat: value.toString()})}
          maliyet={parseFloat(newService.maliyet) || 0}
          setMaliyet={(value) => setNewService({...newService, maliyet: value.toString()})}
          puan={parseInt(newService.puan) || 5}
          setPuan={(value) => setNewService({...newService, puan: value.toString()})}
          kategoriId={newService.kategori_id ? parseInt(newService.kategori_id) : null}
          setKategoriId={(value) => setNewService({...newService, kategori_id: value ? value.toString() : ""})}
          duzenleId={null}
          onSubmit={(e) => {
            e.preventDefault();
            handleAddService();
          }}
          onReset={() => {
            setNewService({
              islem_adi: "",
              fiyat: "",
              maliyet: "",
              kategori_id: "",
              puan: "5"
            });
          }}
          puanlamaAktif={true}
        />
        
        {/* Hizmet Düzenleme Diyalogu */}
        <ServiceForm
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            setShowLowProfitWarning(false);
          }}
          kategoriler={kategoriler}
          islemAdi={editService.islem_adi}
          setIslemAdi={(value) => setEditService({...editService, islem_adi: value})}
          fiyat={parseFloat(editService.fiyat) || 0}
          setFiyat={(value) => setEditService({...editService, fiyat: value.toString()})}
          maliyet={parseFloat(editService.maliyet) || 0}
          setMaliyet={(value) => setEditService({...editService, maliyet: value.toString()})}
          puan={parseInt(editService.puan) || 0}
          setPuan={(value) => setEditService({...editService, puan: value.toString()})}
          kategoriId={editService.kategori_id ? parseInt(editService.kategori_id) : null}
          setKategoriId={(value) => setEditService({...editService, kategori_id: value ? value.toString() : ""})}
          duzenleId={parseInt(editService.id)}
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateService();
          }}
          onReset={() => {
            setEditService({
              id: "",
              islem_adi: "",
              fiyat: "",
              maliyet: "",
              kategori_id: "",
              puan: ""
            });
          }}
          puanlamaAktif={true}
        />
        
        {/* Kategori Ekleme Diyalogu */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kategori Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="kategori_adi">Kategori Adı</Label>
                <Input
                  id="kategori_adi"
                  value={newCategory.kategori_adi}
                  onChange={(e) => setNewCategory({...newCategory, kategori_adi: e.target.value})}
                  placeholder="Örn: Saç Bakım"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sira">Sıra Numarası</Label>
                <Input
                  id="sira"
                  type="number"
                  min="0"
                  value={newCategory.sira}
                  onChange={(e) => setNewCategory({...newCategory, sira: e.target.value})}
                  placeholder="Örn: 1"
                />
                <p className="text-xs text-muted-foreground">Kategorinin görüntülenme sırası</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleAddCategory} 
                disabled={!newCategory.kategori_adi || isAddingCategory}
              >
                {isAddingCategory ? "Ekleniyor..." : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Hizmet Silme Diyalogu */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hizmet Sil</DialogTitle>
              <DialogDescription>
                Bu işlemi geri alamazsınız. Silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>
                <strong>{selectedService?.islem_adi}</strong> hizmetini silmek üzeresiniz.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                İptal
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteService} 
                disabled={isDeletingService}
              >
                {isDeletingService ? "Siliniyor..." : "Sil"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Düşük Kârlılık Uyarısı */}
        <Dialog open={showLowProfitWarning} onOpenChange={setShowLowProfitWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Düşük Kârlılık Uyarısı
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Alert className="bg-yellow-50 border-yellow-100">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription>
                  Bu işlem %15'ten daha düşük kâr sağlıyor. Bu hizmet için maliyetleri veya fiyatlandırmayı gözden geçirmeniz önerilir.
                </AlertDescription>
              </Alert>
              <p className="mt-4">
                Yine de devam etmek istiyor musunuz?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLowProfitWarning(false)}>
                İptal
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  setShowLowProfitWarning(false);
                  if (editService.id) {
                    updateService({ 
                      id: parseInt(editService.id), 
                      service: {
                        islem_adi: editService.islem_adi,
                        fiyat: parseFloat(editService.fiyat),
                        maliyet: parseFloat(editService.maliyet) || 0,
                        kategori_id: editService.kategori_id ? parseInt(editService.kategori_id) : null,
                        puan: parseInt(editService.puan)
                      } 
                    });
                  } else {
                    addService({
                      islem_adi: newService.islem_adi,
                      fiyat: parseFloat(newService.fiyat),
                      maliyet: parseFloat(newService.maliyet) || 0,
                      kategori_id: newService.kategori_id ? parseInt(newService.kategori_id) : null,
                      puan: parseInt(newService.puan)
                    });
                  }
                }}
              >
                Yine de Devam Et
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
}
