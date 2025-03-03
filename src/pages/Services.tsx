
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { toast } from "@/components/ui/use-toast";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { WorkingHoursForm } from "@/components/operations/WorkingHoursForm";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Services() {
  const { userRole, dukkanId } = useCustomerAuth();
  const isAdmin = userRole === 'admin';
  const queryClient = useQueryClient();
  const [isStaff, setIsStaff] = useState(true);
  
  // State for service management
  const [dialogAcik, setDialogAcik] = useState(false);
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState(0);
  const [puan, setPuan] = useState(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);

  // Update staff status based on user role
  useEffect(() => {
    setIsStaff(userRole === 'staff' || userRole === 'admin');
  }, [userRole]);

  // Fetch categories and services
  const { data: kategoriler = [], isLoading: kategoriYukleniyor } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: kategoriServisi.hepsiniGetir
  });

  const { data: islemler = [], isLoading: islemlerYukleniyor } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  // Mutations for CRUD operations - only available for admin
  const createServiceMutation = useMutation({
    mutationFn: islemServisi.ekle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast({ title: "Başarılı", description: "İşlem başarıyla eklendi" });
      formuSifirla();
      setDialogAcik(false);
    },
    onError: (error) => {
      console.error("İşlem eklenirken hata:", error);
      toast({ title: "Hata", description: "İşlem eklenirken bir hata oluştu", variant: "destructive" });
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, islem }: { id: number, islem: any }) => islemServisi.guncelle(id, islem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast({ title: "Başarılı", description: "İşlem başarıyla güncellendi" });
      formuSifirla();
      setDialogAcik(false);
    },
    onError: (error) => {
      console.error("İşlem güncellenirken hata:", error);
      toast({ title: "Hata", description: "İşlem güncellenirken bir hata oluştu", variant: "destructive" });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: islemServisi.sil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast({ title: "Başarılı", description: "İşlem başarıyla silindi" });
    },
    onError: (error) => {
      console.error("İşlem silinirken hata:", error);
      toast({ title: "Hata", description: "İşlem silinirken bir hata oluştu", variant: "destructive" });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: kategoriServisi.ekle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast({ title: "Başarılı", description: "Kategori başarıyla eklendi" });
      setYeniKategoriAdi("");
      setKategoriDialogAcik(false);
    },
    onError: (error) => {
      console.error("Kategori eklenirken hata:", error);
      toast({ title: "Hata", description: "Kategori eklenirken bir hata oluştu", variant: "destructive" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: kategoriServisi.sil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast({ title: "Başarılı", description: "Kategori başarıyla silindi" });
    },
    onError: (error) => {
      console.error("Kategori silinirken hata:", error);
      toast({ title: "Hata", description: "Kategori silinirken bir hata oluştu", variant: "destructive" });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: islemServisi.siraGuncelle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
    },
    onError: (error) => {
      console.error("Sıralama güncellenirken hata:", error);
      toast({ title: "Hata", description: "Sıralama güncellenirken bir hata oluştu", variant: "destructive" });
    }
  });

  // Event handlers
  const onServiceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({ 
        title: "Yetki Hatası", 
        description: "Bu işlemi gerçekleştirmek için yönetici yetkilerine sahip olmalısınız", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!islemAdi || !kategoriId) return;
    
    const islemData = {
      islem_adi: islemAdi,
      fiyat,
      puan,
      kategori_id: kategoriId
    };

    if (duzenleId) {
      updateServiceMutation.mutate({ id: duzenleId, islem: islemData });
    } else {
      createServiceMutation.mutate(islemData);
    }
  };

  const onCategoryFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({ 
        title: "Yetki Hatası", 
        description: "Bu işlemi gerçekleştirmek için yönetici yetkilerine sahip olmalısınız", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!yeniKategoriAdi) return;
    
    createCategoryMutation.mutate({ kategori_adi: yeniKategoriAdi });
  };

  const onServiceEdit = (islem: any) => {
    if (!isAdmin) {
      toast({ 
        title: "Yetki Hatası", 
        description: "Bu işlemi gerçekleştirmek için yönetici yetkilerine sahip olmalısınız", 
        variant: "destructive" 
      });
      return;
    }
    
    setIslemAdi(islem.islem_adi);
    setFiyat(islem.fiyat);
    setPuan(islem.puan);
    setKategoriId(islem.kategori_id);
    setDuzenleId(islem.id);
    setDialogAcik(true);
  };

  const onServiceDelete = (islem: any) => {
    if (!isAdmin) {
      toast({ 
        title: "Yetki Hatası", 
        description: "Bu işlemi gerçekleştirmek için yönetici yetkilerine sahip olmalısınız", 
        variant: "destructive" 
      });
      return;
    }
    
    if (window.confirm(`"${islem.islem_adi}" işlemini silmek istediğinize emin misiniz?`)) {
      deleteServiceMutation.mutate(islem.id);
    }
  };

  const onCategoryDelete = (kategoriId: number) => {
    if (!isAdmin) {
      toast({ 
        title: "Yetki Hatası", 
        description: "Bu işlemi gerçekleştirmek için yönetici yetkilerine sahip olmalısınız", 
        variant: "destructive" 
      });
      return;
    }
    
    if (window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      deleteCategoryMutation.mutate(kategoriId);
    }
  };

  const onSiralamaChange = (items: any[]) => {
    if (!isAdmin) {
      toast({ 
        title: "Yetki Hatası", 
        description: "Bu işlemi gerçekleştirmek için yönetici yetkilerine sahip olmalısınız", 
        variant: "destructive" 
      });
      return;
    }
    
    updateOrderMutation.mutate(items);
  };

  const onRandevuAl = (islemId: number) => {
    // Will be implemented when appointment functionality is ready
    console.log("Randevu alınacak işlem ID:", islemId);
  };

  const formuSifirla = () => {
    setIslemAdi("");
    setFiyat(0);
    setPuan(0);
    setKategoriId(null);
    setDuzenleId(null);
  };

  if (kategoriYukleniyor || islemlerYukleniyor) {
    return (
      <StaffLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList>
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="working-hours">Çalışma Saatleri</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Hizmetler</CardTitle>
              </CardHeader>
              <CardContent>
                {!kategoriler || kategoriler.length === 0 && isAdmin ? (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-medium mb-2">Henüz kategori eklenmemiş</h3>
                    <p className="text-gray-500 mb-4">Hizmet eklemek için önce kategori oluşturmalısınız.</p>
                    <Button onClick={() => setKategoriDialogAcik(true)}>Kategori Ekle</Button>
                  </div>
                ) : (
                  <ServicesContent 
                    isStaff={isStaff}
                    kategoriler={kategoriler}
                    islemler={islemler}
                    dialogAcik={dialogAcik}
                    setDialogAcik={setDialogAcik}
                    kategoriDialogAcik={kategoriDialogAcik}
                    setKategoriDialogAcik={setKategoriDialogAcik}
                    yeniKategoriAdi={yeniKategoriAdi}
                    setYeniKategoriAdi={setYeniKategoriAdi}
                    islemAdi={islemAdi}
                    setIslemAdi={setIslemAdi}
                    fiyat={fiyat}
                    setFiyat={setFiyat}
                    puan={puan}
                    setPuan={setPuan}
                    kategoriId={kategoriId}
                    setKategoriId={setKategoriId}
                    duzenleId={duzenleId}
                    onServiceFormSubmit={onServiceFormSubmit}
                    onCategoryFormSubmit={onCategoryFormSubmit}
                    onServiceEdit={onServiceEdit}
                    onServiceDelete={onServiceDelete}
                    onCategoryDelete={onCategoryDelete}
                    onSiralamaChange={onSiralamaChange}
                    onRandevuAl={onRandevuAl}
                    formuSifirla={formuSifirla}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="working-hours">
            <Card>
              <CardHeader>
                <CardTitle>Çalışma Saatleri</CardTitle>
              </CardHeader>
              <CardContent>
                {!isAdmin ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Çalışma saatleri yönetimi için yönetici yetkilerine sahip olmalısınız.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <WorkingHoursForm dukkanId={dukkanId} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
