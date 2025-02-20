
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { islemServisi } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

export default function Operations() {
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState<number>(0);
  const [puan, setPuan] = useState<number>(0);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);
  const [dialogAcik, setDialogAcik] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: islemler = [], isLoading } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
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
    mutationFn: ({ id, islem }: { id: number; islem: { islem_adi: string; fiyat: number; puan: number } }) => 
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

  const formuSifirla = () => {
    setIslemAdi("");
    setFiyat(0);
    setPuan(0);
    setDuzenleId(null);
    setDialogAcik(false);
  };

  const islemDuzenle = (islem: { id: number; islem_adi: string; fiyat: number; puan: number }) => {
    setDuzenleId(islem.id);
    setIslemAdi(islem.islem_adi);
    setFiyat(islem.fiyat);
    setPuan(islem.puan);
    setDialogAcik(true);
  };

  const formGonder = (e: React.FormEvent) => {
    e.preventDefault();
    const islem = { islem_adi: islemAdi, fiyat, puan };
    
    if (duzenleId) {
      islemGuncelle({ id: duzenleId, islem });
    } else {
      islemEkle(islem);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hizmet Yönetimi</h1>
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

      {isLoading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {islemler.map((islem) => (
            <div
              key={islem.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{islem.islem_adi}</h3>
                  <p className="text-sm text-muted-foreground">
                    Fiyat: {islem.fiyat} TL | Puan: {islem.puan}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => islemDuzenle(islem)}
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
                          onClick={() => islemSil(islem.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
