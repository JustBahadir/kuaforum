
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { islemServisi, islemKategoriServisi } from "@/lib/supabase";
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
  Save, 
  X,
  FileEdit, 
  Scissors
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

// Türkçe para formatı
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(amount);
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
    kategori_id: "",
    puan: ""
  });

  // İşlemleri ve kategorileri getir
  const { data: islemler = [], isLoading: islemlerLoading } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });
  
  const { data: kategoriler = [], isLoading: kategorilerLoading } = useQuery({
    queryKey: ['islem_kategorileri'],
    queryFn: islemKategoriServisi.hepsiniGetir
  });

  // İşlem ekleme mutasyonu
  const { mutate: addService, isPending: isAddingService } = useMutation({
    mutationFn: (service: any) => islemServisi.islemEkle(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      setIsAddDialogOpen(false);
      setNewService({
        islem_adi: "",
        fiyat: "",
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
  
  // Kategori ekleme mutasyonu
  const { mutate: addCategory, isPending: isAddingCategory } = useMutation({
    mutationFn: (category: any) => islemKategoriServisi.kategoriEkle(category),
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
  
  // İşlem güncelleme mutasyonu
  const { mutate: updateService, isPending: isUpdatingService } = useMutation({
    mutationFn: ({ id, service }: { id: number; service: any }) => 
      islemServisi.islemGuncelle(id, service),
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
  
  // İşlem silme mutasyonu
  const { mutate: deleteService, isPending: isDeletingService } = useMutation({
    mutationFn: (id: number) => islemServisi.islemSil(id),
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
    // Fiyat ve puan değerlerini sayıya çevir
    const serviceToAdd = {
      islem_adi: newService.islem_adi,
      fiyat: parseFloat(newService.fiyat),
      kategori_id: newService.kategori_id ? parseInt(newService.kategori_id) : null,
      puan: parseInt(newService.puan)
    };
    
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
      kategori_id: editService.kategori_id ? parseInt(editService.kategori_id) : null,
      puan: parseInt(editService.puan)
    };
    
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
      kategori_id: service.kategori_id ? service.kategori_id.toString() : "",
      puan: service.puan.toString()
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (service: any) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const isLoading = islemlerLoading || kategorilerLoading;

  // Kategoriye göre işlemleri grupla
  const groupedServices: Record<string, any[]> = {};
  
  if (islemler.length > 0) {
    // Önce "Kategorisiz" grup oluştur
    groupedServices["Kategorisiz"] = [];
    
    // Kategorilere göre grupla
    islemler.forEach(islem => {
      const kategori = islem.kategori_id 
        ? kategoriler.find(k => k.id === islem.kategori_id)?.kategori_adi 
        : "Kategorisiz";
      
      const kategoriAdi = kategori || "Kategorisiz";
      
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
              // "Kategorisiz" her zaman en sona
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
                        <TableHead className="text-right">Puan</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedServices[kategoriAdi].map((islem) => (
                        <TableRow key={islem.id}>
                          <TableCell className="font-medium">{islem.islem_adi}</TableCell>
                          <TableCell className="text-right">{formatCurrency(islem.fiyat)}</TableCell>
                          <TableCell className="text-right">{islem.puan}</TableCell>
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
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Hizmet Ekleme Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Hizmet Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="islem_adi">Hizmet Adı</Label>
                <Input
                  id="islem_adi"
                  value={newService.islem_adi}
                  onChange={(e) => setNewService({...newService, islem_adi: e.target.value})}
                  placeholder="Örn: Saç Kesimi"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fiyat">Fiyat (₺)</Label>
                <Input
                  id="fiyat"
                  type="number"
                  min="0"
                  value={newService.fiyat}
                  onChange={(e) => setNewService({...newService, fiyat: e.target.value})}
                  placeholder="Örn: 150"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="puan">Puan</Label>
                <Input
                  id="puan"
                  type="number"
                  min="0"
                  max="100"
                  value={newService.puan}
                  onChange={(e) => setNewService({...newService, puan: e.target.value})}
                  placeholder="Örn: 5"
                />
                <p className="text-xs text-muted-foreground">Müşterinin alacağı puan miktarı</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select 
                  value={newService.kategori_id} 
                  onValueChange={(value) => setNewService({...newService, kategori_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kategorisiz</SelectItem>
                    {kategoriler.map((kategori) => (
                      <SelectItem key={kategori.id} value={kategori.id.toString()}>
                        {kategori.kategori_adi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleAddService} 
                disabled={!newService.islem_adi || !newService.fiyat || isAddingService}
              >
                {isAddingService ? "Ekleniyor..." : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Kategori Ekleme Dialog */}
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
        
        {/* Hizmet Düzenleme Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hizmet Düzenle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_islem_adi">Hizmet Adı</Label>
                <Input
                  id="edit_islem_adi"
                  value={editService.islem_adi}
                  onChange={(e) => setEditService({...editService, islem_adi: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_fiyat">Fiyat (₺)</Label>
                <Input
                  id="edit_fiyat"
                  type="number"
                  min="0"
                  value={editService.fiyat}
                  onChange={(e) => setEditService({...editService, fiyat: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_puan">Puan</Label>
                <Input
                  id="edit_puan"
                  type="number"
                  min="0"
                  max="100"
                  value={editService.puan}
                  onChange={(e) => setEditService({...editService, puan: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_kategori">Kategori</Label>
                <Select 
                  value={editService.kategori_id} 
                  onValueChange={(value) => setEditService({...editService, kategori_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kategorisiz</SelectItem>
                    {kategoriler.map((kategori) => (
                      <SelectItem key={kategori.id} value={kategori.id.toString()}>
                        {kategori.kategori_adi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleUpdateService} 
                disabled={!editService.islem_adi || !editService.fiyat || isUpdatingService}
              >
                {isUpdatingService ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Hizmet Silme Dialog */}
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
      </div>
    </StaffLayout>
  );
}
