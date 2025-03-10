import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kategoriServisi, islemServisi, siralamaServisi, personelIslemleriServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { toast } from "sonner";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { OperationPhotoUpload } from "@/components/operations/OperationPhotoUpload";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function StaffOperations() {
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState<number>(0);
  const [puan, setPuan] = useState<number>(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);
  const [dialogAcik, setDialogAcik] = useState(false);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);
  const [duzenleKategoriId, setDuzenleKategoriId] = useState<number | null>(null);
  const [duzenleKategoriAdi, setDuzenleKategoriAdi] = useState("");
  const [kategoriDuzenleDialogAcik, setKategoriDuzenleDialogAcik] = useState(false);
  const [puanlamaAktif, setPuanlamaAktif] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [photoUploadDialogOpen, setPhotoUploadDialogOpen] = useState(false);
  const { dukkanId } = useCustomerAuth();

  const queryClient = useQueryClient();

  const { data: kategoriler = [] } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: kategoriServisi.hepsiniGetir
  });

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const { data: personelIslemleri = [], isLoading: islemleriYukluyor } = useQuery({
    queryKey: ['personel-islemleri'],
    queryFn: personelIslemleriServisi.hepsiniGetir,
    enabled: true
  });

  const { mutate: islemEkle } = useMutation({
    mutationFn: islemServisi.islemEkle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla eklendi");
      formuSifirla();
    },
    onError: (error) => {
      console.error("İşlem eklenirken hata:", error);
      toast.error("İşlem eklenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: islemGuncelle } = useMutation({
    mutationFn: ({ id, islem }: { id: number; islem: any }) => 
      islemServisi.islemGuncelle(id, islem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla güncellendi");
      formuSifirla();
    },
    onError: (error) => {
      console.error("İşlem güncellenirken hata:", error);
      toast.error("İşlem güncellenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: islemSil } = useMutation({
    mutationFn: islemServisi.islemSil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla silindi");
    },
    onError: (error) => {
      console.error("İşlem silinirken hata:", error);
      toast.error("İşlem silinirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: kategoriEkle } = useMutation({
    mutationFn: async (kategoriAdi: string) => {
      return kategoriServisi.ekle({ kategori_adi: kategoriAdi });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori başarıyla eklendi");
      setYeniKategoriAdi("");
      setKategoriDialogAcik(false);
    },
    onError: (error) => {
      console.error("Kategori eklenirken hata:", error);
      toast.error("Kategori eklenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: kategoriGuncelle } = useMutation({
    mutationFn: ({ id, kategori }: { id: number; kategori: Partial<any> }) => 
      kategoriServisi.guncelle(id, kategori),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori başarıyla güncellendi");
      setDuzenleKategoriAdi("");
      setDuzenleKategoriId(null);
      setKategoriDuzenleDialogAcik(false);
    },
    onError: (error) => {
      console.error("Kategori güncellenirken hata:", error);
      toast.error("Kategori güncellenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: kategoriSil } = useMutation({
    mutationFn: kategoriServisi.sil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori başarıyla silindi");
    },
    onError: (error) => {
      console.error("Kategori silinirken hata:", error);
      toast.error("Kategori silinirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: islemSiralamaGuncelle } = useMutation({
    mutationFn: siralamaServisi.islemSiraGuncelle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem sıralaması güncellendi");
    },
    onError: (error) => {
      console.error("İşlem sıralaması güncellenirken hata:", error);
      toast.error("İşlem sıralaması güncellenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: kategoriSiralamaGuncelle } = useMutation({
    mutationFn: siralamaServisi.kategoriSiraGuncelle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori sıralaması güncellendi");
    },
    onError: (error) => {
      console.error("Kategori sıralaması güncellenirken hata:", error);
      toast.error("Kategori sıralaması güncellenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: updateOperationPhotos } = useMutation({
    mutationFn: ({ id, photos }: { id: number; photos: string[] }) => 
      personelIslemleriServisi.updatePhotos(id, photos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel-islemleri'] });
      toast.success("İşlem fotoğrafları güncellendi");
      setPhotoUploadDialogOpen(false);
    },
    onError: (error) => {
      console.error("Fotoğraf güncellenirken hata:", error);
      toast.error("Fotoğraf güncellenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const formuSifirla = () => {
    setIslemAdi("");
    setFiyat(0);
    setPuan(0);
    setKategoriId(null);
    setDuzenleId(null);
    setDialogAcik(false);
  };

  const handleServiceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const islem = {
      islem_adi: islemAdi,
      fiyat,
      puan: puanlamaAktif ? puan : 0,
      kategori_id: kategoriId
    };
    
    if (duzenleId) {
      islemGuncelle({ id: duzenleId, islem });
    } else {
      islemEkle(islem);
    }
  };

  const handleCategoryFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    kategoriEkle(yeniKategoriAdi);
  };

  const handleCategoryEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duzenleKategoriId) {
      kategoriGuncelle({ 
        id: duzenleKategoriId, 
        kategori: { kategori_adi: duzenleKategoriAdi } 
      });
    }
  };

  const handleSiralamaChange = async (yeniIslemler: any[]) => {
    try {
      islemSiralamaGuncelle(yeniIslemler);
    } catch (error) {
      console.error("Sıralama güncellenirken hata:", error);
      toast.error("Sıralama güncellenirken hata oluştu");
    }
  };

  const handleCategoryOrderChange = (yeniKategoriler: any[]) => {
    kategoriSiralamaGuncelle(yeniKategoriler);
  };

  const handleKategoriDuzenle = (kategori: any) => {
    setDuzenleKategoriId(kategori.id);
    setDuzenleKategoriAdi(kategori.kategori_adi);
    setKategoriDuzenleDialogAcik(true);
  };

  const handlePhotosUpdated = async (photos: string[]) => {
    if (selectedOperation) {
      updateOperationPhotos({ id: selectedOperation.id, photos });
    }
  };

  const handleOperationPhotosClick = (operation: any) => {
    setSelectedOperation(operation);
    setPhotoUploadDialogOpen(true);
  };

  useEffect(() => {
    const checkAndCreateBucket = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'operation-photos');
        
        if (!bucketExists) {
          const { error } = await supabase.storage.createBucket('operation-photos', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
          
          if (error) throw error;
          console.log("Created operation-photos bucket");
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
      }
    };
    
    checkAndCreateBucket();
  }, []);

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="hizmetler">
          <TabsList>
            <TabsTrigger value="hizmetler">Hizmetler</TabsTrigger>
            <TabsTrigger value="calisma-saatleri">Çalışma Saatleri</TabsTrigger>
          </TabsList>

          <TabsContent value="hizmetler">
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
              puan={puan}
              setPuan={setPuan}
              kategoriId={kategoriId}
              setKategoriId={setKategoriId}
              duzenleId={duzenleId}
              onServiceFormSubmit={handleServiceFormSubmit}
              onCategoryFormSubmit={handleCategoryFormSubmit}
              onCategoryEditFormSubmit={handleCategoryEditFormSubmit}
              onServiceEdit={(islem) => {
                setDuzenleId(islem.id);
                setIslemAdi(islem.islem_adi || "");
                setFiyat(islem.fiyat || 0);
                setPuan(islem.puan || 0);
                setKategoriId(islem.kategori_id || null);
                setDialogAcik(true);
              }}
              onServiceDelete={islemSil}
              onCategoryDelete={kategoriSil}
              onCategoryEdit={handleKategoriDuzenle}
              onSiralamaChange={handleSiralamaChange}
              onCategoryOrderChange={handleCategoryOrderChange}
              onRandevuAl={() => {}}
              formuSifirla={formuSifirla}
              puanlamaAktif={puanlamaAktif}
              setPuanlamaAktif={setPuanlamaAktif}
            />
          </TabsContent>

          <TabsContent value="calisma-saatleri">
            <WorkingHours isStaff={true} dukkanId={dukkanId} />
          </TabsContent>
        </Tabs>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>İşlem Geçmişi ve Fotoğraflar</CardTitle>
          </CardHeader>
          <CardContent>
            {islemleriYukluyor ? (
              <div className="flex justify-center p-6">
                <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
              </div>
            ) : personelIslemleri.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                Henüz işlem kaydı bulunmamaktadır.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fotoğraflar</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {personelIslemleri.map((islem) => (
                      <tr key={islem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(islem.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.personel?.ad_soyad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.aciklama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.tutar} TL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.odenen} TL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.photos && islem.photos.length > 0 ? (
                            <span>{islem.photos.length} Fotoğraf</span>
                          ) : (
                            <span className="text-gray-400">Fotoğraf yok</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button 
                            onClick={() => handleOperationPhotosClick(islem)} 
                            variant="outline" 
                            size="sm"
                          >
                            Fotoğraf Ekle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={photoUploadDialogOpen} onOpenChange={setPhotoUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafları</DialogTitle>
          </DialogHeader>
          
          {selectedOperation && (
            <OperationPhotoUpload
              existingPhotos={selectedOperation.photos || []}
              onPhotosUpdated={handlePhotosUpdated}
            />
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoUploadDialogOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffLayout>
  );
}
