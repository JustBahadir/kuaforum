
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kategoriServisi, islemServisi, siralamaServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { toast } from "sonner";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { IslemDto } from "@/lib/supabase/types";

export default function StaffOperations() {
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState<number>(0);
  const [maliyet, setMaliyet] = useState<number>(0);
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

  const { mutate: islemEkle } = useMutation({
    mutationFn: (islem: Omit<IslemDto, 'id'>) => islemServisi.ekle(islem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla eklendi");
      formuSifirla();
    },
    onError: (error: any) => {
      console.error("İşlem eklenirken hata:", error);
      toast.error("İşlem eklenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: islemGuncelle } = useMutation({
    mutationFn: ({ id, islem }: { id: number; islem: Partial<IslemDto> }) => 
      islemServisi.guncelle(id, islem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla güncellendi");
      formuSifirla();
    },
    onError: (error: any) => {
      console.error("İşlem güncellenirken hata:", error);
      toast.error("İşlem güncellenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const { mutate: islemSil } = useMutation({
    mutationFn: (id: number) => islemServisi.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla silindi");
    },
    onError: (error: any) => {
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
    mutationFn: (yeniIslemler: any[]) => {
      return siralamaServisi.islemSiraGuncelle(yeniIslemler);
    },
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
    mutationFn: (yeniKategoriler: any[]) => {
      return siralamaServisi.kategoriSiraGuncelle(yeniKategoriler);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori sıralaması güncellendi");
    },
    onError: (error) => {
      console.error("Kategori sıralaması güncellenirken hata:", error);
      toast.error("Kategori sıralaması güncellenirken hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  });

  const formuSifirla = () => {
    setIslemAdi("");
    setFiyat(0);
    setMaliyet(0);
    setPuan(0);
    setKategoriId(null);
    setDuzenleId(null);
    setDialogAcik(false);
  };

  const handleServiceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const islem: Omit<IslemDto, 'id'> = {
      islem_adi: islemAdi,
      fiyat,
      maliyet,
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
              maliyet={maliyet}
              setMaliyet={setMaliyet}
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
                setMaliyet(islem.maliyet || 0);
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
      </div>
    </StaffLayout>
  );
}
