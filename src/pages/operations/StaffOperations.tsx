
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kategoriServisi, islemServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { toast } from "sonner";

export default function StaffOperations() {
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState<number>(0);
  const [puan, setPuan] = useState<number>(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);
  const [dialogAcik, setDialogAcik] = useState(false);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);

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
    mutationFn: islemServisi.ekle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla eklendi");
      formuSifirla();
    }
  });

  const { mutate: islemGuncelle } = useMutation({
    mutationFn: ({ id, islem }: { id: number; islem: any }) => 
      islemServisi.guncelle(id, islem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla güncellendi");
      formuSifirla();
    }
  });

  const { mutate: islemSil } = useMutation({
    mutationFn: islemServisi.sil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("İşlem başarıyla silindi");
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
    }
  });

  const { mutate: kategoriSil } = useMutation({
    mutationFn: kategoriServisi.sil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori başarıyla silindi");
    }
  });

  const { mutate: kategoriSiralamaGuncelle } = useMutation({
    mutationFn: kategoriServisi.siraGuncelle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori sıralaması güncellendi");
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
      puan,
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

  const handleSiralamaChange = async (yeniIslemler: any[]) => {
    try {
      await islemServisi.siraGuncelle(yeniIslemler);
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("Sıralama güncellendi");
    } catch (error) {
      toast.error("Sıralama güncellenirken hata oluştu");
    }
  };

  const handleCategoryOrderChange = (yeniKategoriler: any[]) => {
    kategoriSiralamaGuncelle(yeniKategoriler);
  };

  return (
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
            onServiceFormSubmit={handleServiceFormSubmit}
            onCategoryFormSubmit={handleCategoryFormSubmit}
            onServiceEdit={(islem) => {
              setDuzenleId(islem.id);
              setIslemAdi(islem.islem_adi);
              setFiyat(islem.fiyat);
              setPuan(islem.puan);
              setKategoriId(islem.kategori_id);
              setDialogAcik(true);
            }}
            onServiceDelete={islemSil}
            onCategoryDelete={kategoriSil}
            onSiralamaChange={handleSiralamaChange}
            onCategoryOrderChange={handleCategoryOrderChange}
            onRandevuAl={() => {}}
            formuSifirla={formuSifirla}
          />
        </TabsContent>

        <TabsContent value="calisma-saatleri">
          <WorkingHours isStaff={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
