
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ServicesContentProps {
  kategoriler: any[];
  islemler: any[];
  isKategorilerLoading: boolean;
  isIslemlerLoading: boolean;
  onKategoriEkle: (name: string) => Promise<void>;
  onKategoriGuncelle: (id: number, name: string) => Promise<void>;
  onKategoriSil: (id: number) => Promise<void>;
  onIslemEkle: (data: any) => Promise<void>;
  onIslemGuncelle: (id: number, data: any) => Promise<void>;
  onIslemSil: (id: number) => Promise<void>;
  puanlamaAktif: boolean;
  dukkanId: number;
}

export function ServicesContent({
  kategoriler,
  islemler,
  isKategorilerLoading,
  isIslemlerLoading,
  onKategoriEkle,
  onKategoriGuncelle,
  onKategoriSil,
  onIslemEkle,
  onIslemGuncelle,
  onIslemSil,
  puanlamaAktif,
  dukkanId
}: ServicesContentProps) {
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);
  const [islemDialogAcik, setIslemDialogAcik] = useState(false);
  const [kategoriDuzenleDialogAcik, setKategoriDuzenleDialogAcik] = useState(false);
  const [islemDuzenleDialogAcik, setIslemDuzenleDialogAcik] = useState(false);
  
  // State for new category
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  
  // State for edit category
  const [duzenleKategoriId, setDuzenleKategoriId] = useState<number | null>(null);
  const [duzenleKategoriAdi, setDuzenleKategoriAdi] = useState("");
  
  // State for new service
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState(0);
  const [maliyet, setMaliyet] = useState(0);
  const [puan, setPuan] = useState(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  
  // State for edit service
  const [duzenleIslemId, setDuzenleIslemId] = useState<number | null>(null);
  const [duzenleIslemAdi, setDuzenleIslemAdi] = useState("");
  const [duzenleFiyat, setDuzenleFiyat] = useState(0);
  const [duzenleMaliyet, setDuzenleMaliyet] = useState(0);
  const [duzenlePuan, setDuzenlePuan] = useState(0);
  const [duzenleKategoriIdForIslem, setDuzenleKategoriIdForIslem] = useState<number | null>(null);
  
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  
  // Function to toggle the expanded state of a category
  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Handle add category form submission
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!yeniKategoriAdi.trim()) return;
    
    await onKategoriEkle(yeniKategoriAdi);
    setYeniKategoriAdi("");
    setKategoriDialogAcik(false);
  };
  
  // Handle edit category form submission
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!duzenleKategoriId || !duzenleKategoriAdi.trim()) return;
    
    await onKategoriGuncelle(duzenleKategoriId, duzenleKategoriAdi);
    setKategoriDuzenleDialogAcik(false);
  };
  
  // Handle delete category
  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) return;
    await onKategoriSil(categoryId);
  };
  
  // Open edit category dialog
  const openEditCategoryDialog = (category: any) => {
    setDuzenleKategoriId(category.id);
    setDuzenleKategoriAdi(category.kategori_adi);
    setKategoriDuzenleDialogAcik(true);
  };
  
  // Handle add service form submission
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!islemAdi.trim() || !kategoriId) return;
    
    const serviceData = {
      islem_adi: islemAdi,
      fiyat: fiyat,
      maliyet: maliyet,
      puan: puanlamaAktif ? puan : 0,
      kategori_id: kategoriId
    };
    
    await onIslemEkle(serviceData);
    
    setIslemAdi("");
    setFiyat(0);
    setMaliyet(0);
    setPuan(0);
    setKategoriId(null);
    setIslemDialogAcik(false);
  };
  
  // Open edit service dialog
  const openEditServiceDialog = (service: any) => {
    setDuzenleIslemId(service.id);
    setDuzenleIslemAdi(service.islem_adi);
    setDuzenleFiyat(service.fiyat);
    setDuzenleMaliyet(service.maliyet || 0);
    setDuzenlePuan(service.puan || 0);
    setDuzenleKategoriIdForIslem(service.kategori_id);
    setIslemDuzenleDialogAcik(true);
  };
  
  // Handle edit service form submission
  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!duzenleIslemId || !duzenleIslemAdi.trim()) return;
    
    const serviceData = {
      islem_adi: duzenleIslemAdi,
      fiyat: duzenleFiyat,
      maliyet: duzenleMaliyet,
      puan: puanlamaAktif ? duzenlePuan : 0,
      kategori_id: duzenleKategoriIdForIslem
    };
    
    await onIslemGuncelle(duzenleIslemId, serviceData);
    setIslemDuzenleDialogAcik(false);
  };
  
  // Handle delete service
  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) return;
    await onIslemSil(serviceId);
  };
  
  // Get services for a specific category
  const getServicesByCategory = (categoryId: number) => {
    return islemler.filter(islem => islem.kategori_id === categoryId);
  };
  
  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isKategorilerLoading || isIslemlerLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <Button 
          onClick={() => setKategoriDialogAcik(true)} 
          variant="outline"
          className="mb-2 sm:mb-0 mr-0 sm:mr-2"
        >
          <Plus className="h-4 w-4 mr-2" /> Kategori Ekle
        </Button>
        
        <Button onClick={() => setIslemDialogAcik(true)}>
          <Plus className="h-4 w-4 mr-2" /> Hizmet Ekle
        </Button>
      </div>

      {kategoriler.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Henüz hiç kategori eklenmemiş.</p>
            <Button onClick={() => setKategoriDialogAcik(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Kategori Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {kategoriler.map((kategori) => {
            const categoryServices = getServicesByCategory(kategori.id);
            const isExpanded = expandedCategories[kategori.id] ?? true;
            
            return (
              <Card key={kategori.id}>
                <Collapsible open={isExpanded}>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30" onClick={() => toggleExpanded(kategori.id)}>
                      <div className="flex items-center">
                        {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                        <h3 className="text-lg font-semibold">{kategori.kategori_adi}</h3>
                        <span className="text-sm text-muted-foreground ml-2">({categoryServices.length})</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCategoryDialog(kategori);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(kategori.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    {categoryServices.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <p>Bu kategoride hizmet bulunmuyor.</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setKategoriId(kategori.id);
                            setIslemDialogAcik(true);
                          }}
                        >
                          Hizmet Ekle
                        </Button>
                      </div>
                    ) : (
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {categoryServices.map((islem) => (
                            <div 
                              key={islem.id} 
                              className="p-3 border rounded-md flex justify-between items-center"
                            >
                              <div>
                                <h4 className="font-medium">{islem.islem_adi}</h4>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <span>{formatPrice(islem.fiyat)}</span>
                                  {puanlamaAktif && islem.puan > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{islem.puan} puan</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => openEditServiceDialog(islem)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteService(islem.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setKategoriId(kategori.id);
                              setIslemDialogAcik(true);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Bu Kategoriye Hizmet Ekle
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Add Category Dialog */}
      <Dialog open={kategoriDialogAcik} onOpenChange={setKategoriDialogAcik}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kategori Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kategori_adi">Kategori Adı</Label>
                <Input
                  id="kategori_adi"
                  placeholder="Örn: Saç Bakımı"
                  value={yeniKategoriAdi}
                  onChange={(e) => setYeniKategoriAdi(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setKategoriDialogAcik(false)}>
                İptal
              </Button>
              <Button type="submit">Ekle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog open={kategoriDuzenleDialogAcik} onOpenChange={setKategoriDuzenleDialogAcik}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duzenle_kategori_adi">Kategori Adı</Label>
                <Input
                  id="duzenle_kategori_adi"
                  value={duzenleKategoriAdi}
                  onChange={(e) => setDuzenleKategoriAdi(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setKategoriDuzenleDialogAcik(false)}>
                İptal
              </Button>
              <Button type="submit">Güncelle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Service Dialog */}
      <Dialog open={islemDialogAcik} onOpenChange={setIslemDialogAcik}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Hizmet Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddService}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kategori_id">Kategori</Label>
                <Select 
                  value={kategoriId?.toString() || ""} 
                  onValueChange={(value) => setKategoriId(parseInt(value))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriler.map((kategori) => (
                      <SelectItem key={kategori.id} value={kategori.id.toString()}>
                        {kategori.kategori_adi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="islem_adi">Hizmet Adı</Label>
                <Input
                  id="islem_adi"
                  placeholder="Örn: Saç Kesimi"
                  value={islemAdi}
                  onChange={(e) => setIslemAdi(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fiyat">Fiyat (TL)</Label>
                <Input
                  id="fiyat"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={fiyat || ""}
                  onChange={(e) => setFiyat(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maliyet">Maliyet (TL)</Label>
                <Input
                  id="maliyet"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={maliyet || ""}
                  onChange={(e) => setMaliyet(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              {puanlamaAktif && (
                <div className="space-y-2">
                  <Label htmlFor="puan">Puan Değeri</Label>
                  <Input
                    id="puan"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={puan || ""}
                    onChange={(e) => setPuan(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIslemDialogAcik(false)}>
                İptal
              </Button>
              <Button type="submit">Ekle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={islemDuzenleDialogAcik} onOpenChange={setIslemDuzenleDialogAcik}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hizmet Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditService}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duzenle_kategori_id">Kategori</Label>
                <Select 
                  value={duzenleKategoriIdForIslem?.toString() || ""} 
                  onValueChange={(value) => setDuzenleKategoriIdForIslem(parseInt(value))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriler.map((kategori) => (
                      <SelectItem key={kategori.id} value={kategori.id.toString()}>
                        {kategori.kategori_adi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duzenle_islem_adi">Hizmet Adı</Label>
                <Input
                  id="duzenle_islem_adi"
                  value={duzenleIslemAdi}
                  onChange={(e) => setDuzenleIslemAdi(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duzenle_fiyat">Fiyat (TL)</Label>
                <Input
                  id="duzenle_fiyat"
                  type="number"
                  min="0"
                  step="0.01"
                  value={duzenleFiyat || ""}
                  onChange={(e) => setDuzenleFiyat(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duzenle_maliyet">Maliyet (TL)</Label>
                <Input
                  id="duzenle_maliyet"
                  type="number"
                  min="0"
                  step="0.01"
                  value={duzenleMaliyet || ""}
                  onChange={(e) => setDuzenleMaliyet(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              {puanlamaAktif && (
                <div className="space-y-2">
                  <Label htmlFor="duzenle_puan">Puan Değeri</Label>
                  <Input
                    id="duzenle_puan"
                    type="number"
                    min="0"
                    step="1"
                    value={duzenlePuan || ""}
                    onChange={(e) => setDuzenlePuan(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIslemDuzenleDialogAcik(false)}>
                İptal
              </Button>
              <Button type="submit">Güncelle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
