
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { islemServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/utils/auth";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { WorkingHours } from "@/components/operations/WorkingHours";
import { toast } from "sonner";

export default function Operations() {
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(false);
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState<number>(0);
  const [puan, setPuan] = useState<number>(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);
  const [dialogAcik, setDialogAcik] = useState(false);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkRole = async () => {
      const role = await getUserRole();
      setIsStaff(role === 'staff' || role === 'admin');
    };
    checkRole();
  }, []);

  const { data: kategoriler = [] } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .order('sira');
      if (error) throw error;
      return data;
    }
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
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([{ kategori_adi: kategoriAdi }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori başarıyla eklendi");
      setYeniKategoriAdi("");
      setKategoriDialogAcik(false);
    }
  });

  const { mutate: kategoriSil } = useMutation({
    mutationFn: async (kategoriId: number) => {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', kategoriId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategoriler'] });
      toast.success("Kategori başarıyla silindi");
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
      for (let i = 0; i < yeniIslemler.length; i++) {
        await supabase
          .from('islemler')
          .update({ sira: i })
          .eq('id', yeniIslemler[i].id);
      }
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast.success("Sıralama güncellendi");
    } catch (error) {
      toast.error("Sıralama güncellenirken hata oluştu");
    }
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
            onRandevuAl={(islemId) => navigate(`/appointments?service=${islemId}`)}
            formuSifirla={formuSifirla}
          />
        </TabsContent>

        <TabsContent value="calisma-saatleri">
          <WorkingHours isStaff={isStaff} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
