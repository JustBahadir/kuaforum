
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2Icon, Edit2Icon, Plus } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { ServiceForm } from "@/components/operations/ServiceForm";
import { CategoryForm } from "@/components/operations/CategoryForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { islemServisi, kategoriServisi } from "@/lib/supabase";
import { Hizmet, IslemKategorisi } from "@/lib/supabase/types";

interface ServiceCostManagementProps {
  isletmeKimlik: string;
}

export function ServiceCostManagement({ isletmeKimlik }: ServiceCostManagementProps) {
  const [activeTab, setActiveTab] = useState("hizmetler");
  const [hizmetler, setHizmetler] = useState<Hizmet[]>([]);
  const [kategoriler, setKategoriler] = useState<IslemKategorisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<"hizmet" | "kategori">("hizmet");

  // Veri yükleme
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Hizmetleri ve kategorileri yükle
        const [hizmetData, kategoriData] = await Promise.all([
          islemServisi.isletmeyeGoreGetir(isletmeKimlik),
          kategoriServisi.isletmeyeGoreGetir(isletmeKimlik)
        ]);

        setHizmetler(hizmetData);
        setKategoriler(kategoriData);
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
        toast.error("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (isletmeKimlik) {
      fetchData();
    }
  }, [isletmeKimlik]);

  // Veriyi yeniden yükle
  const refreshData = async () => {
    try {
      if (activeTab === "hizmetler" || activeTab === "all") {
        const hizmetData = await islemServisi.isletmeyeGoreGetir(isletmeKimlik);
        setHizmetler(hizmetData);
      }
      if (activeTab === "kategoriler" || activeTab === "all") {
        const kategoriData = await kategoriServisi.isletmeyeGoreGetir(isletmeKimlik);
        setKategoriler(kategoriData);
      }
    } catch (error) {
      console.error("Veri yenileme hatası:", error);
    }
  };

  // Kategori silme işlevi
  const handleKategoriSil = async (kategoriKimlik: string) => {
    if (window.confirm("Bu kategori silinecek. Devam etmek istiyor musunuz?")) {
      try {
        await kategoriServisi.sil(kategoriKimlik);
        toast.success("Kategori başarıyla silindi");
        refreshData();
      } catch (error) {
        console.error("Kategori silme hatası:", error);
        toast.error("Kategori silinirken bir hata oluştu");
      }
    }
  };

  // Hizmet silme işlevi
  const handleHizmetSil = async (hizmetKimlik: string) => {
    if (window.confirm("Bu hizmet silinecek. Devam etmek istiyor musunuz?")) {
      try {
        await islemServisi.sil(hizmetKimlik);
        toast.success("Hizmet başarıyla silindi");
        refreshData();
      } catch (error) {
        console.error("Hizmet silme hatası:", error);
        toast.error("Hizmet silinirken bir hata oluştu");
      }
    }
  };

  // Dialog açma işlevi
  const openDialog = (type: "hizmet" | "kategori", id: string | null = null) => {
    setDialogType(type);
    setEditingItem(id);
    setIsDialogOpen(true);
  };

  // Dialog içeriğini renderla
  const renderDialogContent = () => {
    if (dialogType === "hizmet") {
      return (
        <ServiceForm
          isletmeKimlik={isletmeKimlik}
          hizmetKimlik={editingItem || undefined}
          onSuccess={() => {
            setIsDialogOpen(false);
            refreshData();
          }}
          onCancel={() => setIsDialogOpen(false)}
        />
      );
    } else {
      return (
        <CategoryForm
          isletmeKimlik={isletmeKimlik}
          kategoriKimlik={editingItem || undefined}
          onSuccess={() => {
            setIsDialogOpen(false);
            refreshData();
          }}
          onCancel={() => setIsDialogOpen(false)}
        />
      );
    }
  };

  // Kategori tabının içeriği
  const renderKategoriTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openDialog("kategori")}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Kategori Ekle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : kategoriler.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz kategori bulunmuyor
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori Adı</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kategoriler.map((kategori) => (
                  <TableRow key={kategori.kimlik}>
                    <TableCell>{kategori.baslik}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog("kategori", kategori.kimlik)}
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleKategoriSil(kategori.kimlik)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Hizmet tabının içeriği
  const renderHizmetTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openDialog("hizmet")}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Hizmet Ekle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : hizmetler.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz hizmet bulunmuyor
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hizmet Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Fiyat (₺)</TableHead>
                  <TableHead className="text-right">Süre (dk)</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hizmetler.map((hizmet) => {
                  const kategori = kategoriler.find(k => k.kimlik === hizmet.kategori_kimlik);
                  return (
                    <TableRow key={hizmet.kimlik}>
                      <TableCell>{hizmet.hizmet_adi}</TableCell>
                      <TableCell>{kategori?.baslik || "Kategori Silinmiş"}</TableCell>
                      <TableCell className="text-right">{hizmet.fiyat.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{hizmet.sure_dakika}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog("hizmet", hizmet.kimlik)}
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleHizmetSil(hizmet.kimlik)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hizmet ve Fiyat Yönetimi</CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hizmetler">Hizmetler</TabsTrigger>
          <TabsTrigger value="kategoriler">Kategoriler</TabsTrigger>
        </TabsList>
        <TabsContent value="hizmetler" className="mt-6">
          {renderHizmetTab()}
        </TabsContent>
        <TabsContent value="kategoriler" className="mt-6">
          {renderKategoriTab()}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ServiceCostManagement;
