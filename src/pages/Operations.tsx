
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { islemServisi } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: number;
  islem: any;
  onEdit: (islem: any) => void;
  onDelete: (islem: any) => void;
}

function SortableItem({ id, islem, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-lg shadow-sm mb-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners}>
          <GripVertical className="text-gray-400" />
        </button>
        <div>
          <h3 className="font-medium">{islem.islem_adi}</h3>
          <p className="text-sm text-muted-foreground">
            Fiyat: {islem.fiyat} TL | Puan: {islem.puan}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit(islem)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
              <AlertDialogDescription>
                Bu hizmeti silmek istediğinizden emin misiniz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(islem)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function Operations() {
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState<number>(0);
  const [puan, setPuan] = useState<number>(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);
  const [dialogAcik, setDialogAcik] = useState(false);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const { data: calismaSaatleri = [], isLoading: saatlerYukleniyor } = useQuery({
    queryKey: ['calisma_saatleri'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .order('id');
      if (error) throw error;
      return data;
    }
  });

  const { mutate: islemEkle } = useMutation({
    mutationFn: islemServisi.ekle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast({ description: "İşlem başarıyla eklendi" });
      formuSifirla();
    },
    onError: () => {
      toast({ description: "İşlem eklenirken hata oluştu", variant: "destructive" });
    }
  });

  const { mutate: islemGuncelle } = useMutation({
    mutationFn: ({ id, islem }: { id: number; islem: { islem_adi: string; fiyat: number; puan: number; kategori_id: number | null } }) => 
      islemServisi.guncelle(id, islem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast({ description: "İşlem başarıyla güncellendi" });
      formuSifirla();
    },
    onError: () => {
      toast({ description: "İşlem güncellenirken hata oluştu", variant: "destructive" });
    }
  });

  const { mutate: islemSil } = useMutation({
    mutationFn: islemServisi.sil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast({ description: "İşlem başarıyla silindi" });
    },
    onError: () => {
      toast({ description: "İşlem silinirken hata oluştu", variant: "destructive" });
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
      toast({ description: "Kategori başarıyla eklendi" });
      setYeniKategoriAdi("");
      setKategoriDialogAcik(false);
    },
    onError: () => {
      toast({ description: "Kategori eklenirken hata oluştu", variant: "destructive" });
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

  const islemDuzenle = (islem: { id: number; islem_adi: string; fiyat: number; puan: number; kategori_id: number }) => {
    setDuzenleId(islem.id);
    setIslemAdi(islem.islem_adi);
    setFiyat(islem.fiyat);
    setPuan(islem.puan);
    setKategoriId(islem.kategori_id);
    setDialogAcik(true);
  };

  const formGonder = (e: React.FormEvent) => {
    e.preventDefault();
    const islem = { islem_adi: islemAdi, fiyat, puan, kategori_id: kategoriId };
    
    if (duzenleId) {
      islemGuncelle({ id: duzenleId, islem });
    } else {
      islemEkle(islem);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = islemler.findIndex((i: any) => i.id === active.id);
      const newIndex = islemler.findIndex((i: any) => i.id === over.id);
      
      const newIslemler = arrayMove(islemler, oldIndex, newIndex);
      
      // Sıralamayı veritabanında güncelle
      try {
        for (let i = 0; i < newIslemler.length; i++) {
          await supabase
            .from('islemler')
            .update({ sira: i })
            .eq('id', newIslemler[i].id);
        }
        
        queryClient.invalidateQueries({ queryKey: ['islemler'] });
        toast({ description: "Sıralama güncellendi" });
      } catch (error) {
        toast({ description: "Sıralama güncellenirken hata oluştu", variant: "destructive" });
      }
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
                  <form onSubmit={formGonder} className="space-y-4">
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

          <div className="space-y-6">
            {kategoriler.map((kategori) => {
              const kategoriIslemleri = islemler.filter(
                (islem: any) => islem.kategori_id === kategori.id
              );

              return (
                <div key={kategori.id} className="border rounded-lg p-4 space-y-4">
                  <h2 className="text-lg font-semibold">{kategori.kategori_adi}</h2>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={kategoriIslemleri.map((islem: any) => islem.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {kategoriIslemleri.map((islem: any) => (
                        <SortableItem
                          key={islem.id}
                          id={islem.id}
                          islem={islem}
                          onEdit={islemDuzenle}
                          onDelete={islemSil}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calisma-saatleri">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gün</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açılış</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kapanış</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calismaSaatleri.map((saat) => (
                  <tr key={saat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {saat.gun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {saat.kapali ? "-" : saat.acilis}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {saat.kapali ? "-" : saat.kapanis}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {saat.kapali ? "Kapalı" : "Açık"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
