import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Personel, personelServisi } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function PersonnelList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [personelDuzenle, setPersonelDuzenle] = useState<Personel | null>(null);
  const [yeniPersonel, setYeniPersonel] = useState<Omit<Personel, 'id' | 'created_at'>>({
    ad_soyad: "",
    telefon: "",
    eposta: "",
    adres: "",
    personel_no: "",
    maas: 0,
    calisma_sistemi: "aylik",
    prim_yuzdesi: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: personeller = [], isLoading } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  const { mutate: personelEkle, isPending: isEklemeLoading } = useMutation({
    mutationFn: (data: Omit<Personel, 'id' | 'created_at'>) => personelServisi.ekle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast({
        title: "Başarılı",
        description: "Personel başarıyla eklendi.",
      });
      setYeniPersonel({
        ad_soyad: "",
        telefon: "",
        eposta: "",
        adres: "",
        personel_no: "",
        maas: 0,
        calisma_sistemi: "aylik",
        prim_yuzdesi: 0
      });
      setIsDialogOpen(false);
    },
  });

  const { mutate: personelGuncelle } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Personel> }) =>
      personelServisi.guncelle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast({
        title: "Başarılı",
        description: "Personel başarıyla güncellendi.",
      });
      setPersonelDuzenle(null);
    },
  });

  const { mutate: personelSil } = useMutation({
    mutationFn: (id: number) => personelServisi.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast({
        title: "Başarılı",
        description: "Personel başarıyla silindi.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    personelEkle(yeniPersonel);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (personelDuzenle) {
      const { id, created_at, ...guncellenecekVeriler } = personelDuzenle;
      personelGuncelle({ id, data: guncellenecekVeriler });
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2" />
            Yeni Personel Ekle
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Yeni Personel Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ad_soyad">Ad Soyad</Label>
                <Input
                  id="ad_soyad"
                  value={yeniPersonel.ad_soyad}
                  onChange={(e) =>
                    setYeniPersonel((prev) => ({
                      ...prev,
                      ad_soyad: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  type="tel"
                  value={yeniPersonel.telefon}
                  onChange={(e) =>
                    setYeniPersonel((prev) => ({
                      ...prev,
                      telefon: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eposta">E-posta</Label>
                <Input
                  id="eposta"
                  type="email"
                  value={yeniPersonel.eposta}
                  onChange={(e) =>
                    setYeniPersonel((prev) => ({
                      ...prev,
                      eposta: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adres">Adres</Label>
                <Input
                  id="adres"
                  value={yeniPersonel.adres}
                  onChange={(e) =>
                    setYeniPersonel((prev) => ({
                      ...prev,
                      adres: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personel_no">Personel No</Label>
                <Input
                  id="personel_no"
                  value={yeniPersonel.personel_no}
                  onChange={(e) =>
                    setYeniPersonel((prev) => ({
                      ...prev,
                      personel_no: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maas">Maaş</Label>
                <Input
                  id="maas"
                  type="number"
                  value={yeniPersonel.maas}
                  onChange={(e) =>
                    setYeniPersonel((prev) => ({
                      ...prev,
                      maas: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calisma_sistemi">Çalışma Sistemi</Label>
                <Select
                  onValueChange={(value) =>
                    setYeniPersonel((prev) => ({
                      ...prev,
                      calisma_sistemi: value as "haftalik" | "aylik",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Çalışma Sistemi Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haftalik">Haftalık</SelectItem>
                    <SelectItem value="aylik">Aylık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prim_yuzdesi">Prim Yüzdesi</Label>
                <Input
                  id="prim_yuzdesi"
                  type="number"
                  value={yeniPersonel.prim_yuzdesi}
                  onChange={(e) =>
                    setYeniPersonel((prev) => ({
                      ...prev,
                      prim_yuzdesi: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isEklemeLoading}>
                {isEklemeLoading ? "Ekleniyor..." : "Personel Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {personeller.map((personel) => (
        <div
          key={personel.id}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{personel.ad_soyad}</h3>
              <p className="text-sm text-muted-foreground">
                Telefon: {personel.telefon} | E-posta: {personel.eposta}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleUpdate}>
                    <DialogHeader>
                      <DialogTitle>Personel Düzenle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_ad_soyad">Ad Soyad</Label>
                        <Input
                          id="edit_ad_soyad"
                          value={personelDuzenle?.ad_soyad || personel.ad_soyad}
                          onChange={(e) =>
                            setPersonelDuzenle((prev) =>
                              prev ? { ...prev, ad_soyad: e.target.value } : personel
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_telefon">Telefon</Label>
                        <Input
                          id="edit_telefon"
                          type="tel"
                          value={personelDuzenle?.telefon || personel.telefon}
                          onChange={(e) =>
                            setPersonelDuzenle((prev) =>
                              prev ? { ...prev, telefon: e.target.value } : personel
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_eposta">E-posta</Label>
                        <Input
                          id="edit_eposta"
                          type="email"
                          value={personelDuzenle?.eposta || personel.eposta}
                          onChange={(e) =>
                            setPersonelDuzenle((prev) =>
                              prev ? { ...prev, eposta: e.target.value } : personel
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_adres">Adres</Label>
                        <Input
                          id="edit_adres"
                          value={personelDuzenle?.adres || personel.adres}
                          onChange={(e) =>
                            setPersonelDuzenle((prev) =>
                              prev ? { ...prev, adres: e.target.value } : personel
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_personel_no">Personel No</Label>
                        <Input
                          id="edit_personel_no"
                          value={personelDuzenle?.personel_no || personel.personel_no}
                          onChange={(e) =>
                            setPersonelDuzenle((prev) =>
                              prev ? { ...prev, personel_no: e.target.value } : personel
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_maas">Maaş</Label>
                        <Input
                          id="edit_maas"
                          type="number"
                          value={personelDuzenle?.maas || personel.maas}
                          onChange={(e) =>
                            setPersonelDuzenle((prev) =>
                              prev ? { ...prev, maas: Number(e.target.value) } : personel
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_calisma_sistemi">Çalışma Sistemi</Label>
                        <Select
                          onValueChange={(value) =>
                            setPersonelDuzenle((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    calisma_sistemi: value as "haftalik" | "aylik",
                                  }
                                : personel
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                personelDuzenle?.calisma_sistemi ||
                                personel.calisma_sistemi
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="haftalik">Haftalık</SelectItem>
                            <SelectItem value="aylik">Aylık</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_prim_yuzdesi">Prim Yüzdesi</Label>
                        <Input
                          id="edit_prim_yuzdesi"
                          type="number"
                          value={personelDuzenle?.prim_yuzdesi || personel.prim_yuzdesi}
                          onChange={(e) =>
                            setPersonelDuzenle((prev) =>
                              prev
                                ? { ...prev, prim_yuzdesi: Number(e.target.value) }
                                : personel
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
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu personeli silmek istediğinizden emin misiniz?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => personelSil(personel.id)}
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
  );
}
