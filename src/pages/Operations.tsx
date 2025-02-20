
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Islem, islemServisi } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  const [islemDuzenle, setIslemDuzenle] = useState<Islem | null>(null);
  const [yeniIslem, setYeniIslem] = useState<Omit<Islem, 'id' | 'created_at'>>({
    islem_adi: "",
    fiyat: 0,
    puan: 0
  });

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
      toast({
        title: "Başarılı",
        description: "İşlem başarıyla eklendi.",
      });
      setYeniIslem({
        islem_adi: "",
        fiyat: 0,
        puan: 0
      });
    },
  });

  const { mutate: islemGuncelle } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Islem> }) =>
      islemServisi.guncelle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast({
        title: "Başarılı",
        description: "İşlem başarıyla güncellendi.",
      });
      setIslemDuzenle(null);
    },
  });

  const { mutate: islemSil } = useMutation({
    mutationFn: islemServisi.sil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['islemler'] });
      toast({
        title: "Başarılı",
        description: "İşlem başarıyla silindi.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    islemEkle(yeniIslem);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (islemDuzenle) {
      const { id, created_at, ...guncellenecekVeriler } = islemDuzenle;
      islemGuncelle({ id, data: guncellenecekVeriler });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">İşlem Yönetimi</h1>
        <Dialog>
          <Button asChild>
            <Label htmlFor="new-operation">
              <Plus className="mr-2" />
              Yeni İşlem
            </Label>
          </Button>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Yeni İşlem Ekle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="islem_adi">İşlem Adı</Label>
                  <Input
                    id="islem_adi"
                    value={yeniIslem.islem_adi}
                    onChange={(e) =>
                      setYeniIslem((prev) => ({
                        ...prev,
                        islem_adi: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiyat">Fiyat</Label>
                  <Input
                    id="fiyat"
                    type="number"
                    value={yeniIslem.fiyat}
                    onChange={(e) =>
                      setYeniIslem((prev) => ({
                        ...prev,
                        fiyat: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="puan">Puan</Label>
                  <Input
                    id="puan"
                    type="number"
                    value={yeniIslem.puan}
                    onChange={(e) =>
                      setYeniIslem((prev) => ({
                        ...prev,
                        puan: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">İşlem Ekle</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {islemler.map((islem: Islem) => (
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
                    onClick={() => setIslemDuzenle(islem)}
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
                        <AlertDialogTitle>İşlemi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlemi silmek istediğinizden emin misiniz?
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

      <Dialog open={!!islemDuzenle} onOpenChange={(open) => !open && setIslemDuzenle(null)}>
        <DialogContent>
          {islemDuzenle && (
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>İşlem Düzenle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_islem_adi">İşlem Adı</Label>
                  <Input
                    id="edit_islem_adi"
                    value={islemDuzenle.islem_adi}
                    onChange={(e) =>
                      setIslemDuzenle((prev) =>
                        prev ? { ...prev, islem_adi: e.target.value } : null
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_fiyat">Fiyat</Label>
                  <Input
                    id="edit_fiyat"
                    type="number"
                    value={islemDuzenle.fiyat}
                    onChange={(e) =>
                      setIslemDuzenle((prev) =>
                        prev ? { ...prev, fiyat: Number(e.target.value) } : null
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_puan">Puan</Label>
                  <Input
                    id="edit_puan"
                    type="number"
                    value={islemDuzenle.puan}
                    onChange={(e) =>
                      setIslemDuzenle((prev) =>
                        prev ? { ...prev, puan: Number(e.target.value) } : null
                      )
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Değişiklikleri Kaydet</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
