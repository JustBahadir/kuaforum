
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { islemServisi } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/utils/auth";
import { CategoryCard } from "@/components/operations/CategoryCard";
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

  const { data: kategoriler = [], isLoading: kategorilerYukleniyor } = useQuery({
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

  const { data: islemler = [], isLoading: islemlerYukleniyor } = useQuery({
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

  const handleRandevuAl = (islemId: number) => {
    navigate(`/appointments?service=${islemId}`);
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
          {isStaff && (
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Hizmet Yönetimi</h1>
              <div className="flex gap-2">
                <Dialog open={kategoriDialogAcik} onOpenChange={setKategoriDialogAcik}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2" />
                      Yeni Kategori
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Kategori Ekle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      kategoriEkle(yeniKategoriAdi);
                    }}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="kategori_adi">Kategori Adı</Label>
                          <Input
                            id="kategori_adi"
                            value={yeniKategoriAdi}
                            onChange={(e) => setYeniKategoriAdi(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">Ekle</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={dialogAcik} onOpenChange={setDialogAcik}>
                  <DialogTrigger asChild>
                    <Button onClick={formuSifirla}>
                      <Plus className="mr-2" />
                      Yeni Hizmet
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {duzenleId ? "Hizmet Düzenle" : "Yeni Hizmet Ekle"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
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
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori</Label>
                        <Select
                          value={kategoriId?.toString()}
                          onValueChange={(value) => setKategoriId(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {kategoriler.map((kategori) => (
                              <SelectItem
                                key={kategori.id}
                                value={kategori.id.toString()}
                              >
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
                          value={islemAdi}
                          onChange={(e) => setIslemAdi(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fiyat">Fiyat</Label>
                        <Input
                          id="fiyat"
                          type="number"
                          value={fiyat}
                          onChange={(e) => setFiyat(Number(e.target.value))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="puan">Puan</Label>
                        <Input
                          id="puan"
                          type="number"
                          value={puan}
                          onChange={(e) => setPuan(Number(e.target.value))}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {duzenleId ? "Güncelle" : "Ekle"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {kategoriler.map((kategori) => (
              <CategoryCard
                key={kategori.id}
                kategori={kategori}
                islemler={islemler.filter((islem: any) => islem.kategori_id === kategori.id)}
                isStaff={isStaff}
                onEdit={(islem) => {
                  setDuzenleId(islem.id);
                  setIslemAdi(islem.islem_adi);
                  setFiyat(islem.fiyat);
                  setPuan(islem.puan);
                  setKategoriId(islem.kategori_id);
                  setDialogAcik(true);
                }}
                onDelete={islemSil}
                onKategoriDelete={kategoriSil}
                onSiralamaChange={handleSiralamaChange}
                onRandevuAl={handleRandevuAl}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calisma-saatleri">
          <WorkingHours isStaff={isStaff} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
