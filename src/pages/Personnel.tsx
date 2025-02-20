
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Personel, PersonelIslemi, Islem, personelServisi, islemServisi, personelIslemleriServisi } from "@/lib/supabase";
import { UserPlus, Search, User, Star, Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type YeniPersonel = Omit<Personel, 'id' | 'created_at'>;

export default function Personnel() {
  const [aramaMetni, setAramaMetni] = useState("");
  const [secilenPersonel, setSecilenPersonel] = useState<Personel | null>(null);
  const [puanlar, setPuanlar] = useState<Record<number, number>>({});
  const [yeniPersonel, setYeniPersonel] = useState<YeniPersonel>({
    ad_soyad: "",
    telefon: "",
    eposta: "",
    adres: "",
    personel_no: "",
    maas: 0,
    calisma_sistemi: "haftalik",
    prim_yuzdesi: 0,
  });
  const [secilenIslem, setSecilenIslem] = useState<Islem | null>(null);
  const [yeniPersonelIslemi, setYeniPersonelIslemi] = useState<Omit<PersonelIslemi, 'id' | 'created_at' | 'islem'>>({
    personel_id: 0,
    islem_id: 0,
    aciklama: "",
    tutar: 0,
    prim_yuzdesi: 0,
    odenen: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: personeller = [], isLoading } = useQuery({
    queryKey: ["personeller", aramaMetni],
    queryFn: () => aramaMetni ? personelServisi.ara(aramaMetni) : personelServisi.hepsiniGetir()
  });

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const { data: personelIslemleri = [] } = useQuery({
    queryKey: ['personelIslemleri', secilenPersonel?.id],
    queryFn: () => secilenPersonel ? personelIslemleriServisi.hepsiniGetir(secilenPersonel.id) : Promise.resolve([]),
    enabled: !!secilenPersonel
  });

  const { mutate: personelEkle, isPending } = useMutation({
    mutationFn: personelServisi.ekle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
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
        calisma_sistemi: "haftalik",
        prim_yuzdesi: 0,
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Personel eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const { mutate: personelGuncelle } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Personel> }) =>
      personelServisi.guncelle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      toast({
        title: "Başarılı",
        description: "Personel başarıyla güncellendi.",
      });
      setSecilenPersonel(null);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Personel güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const { mutate: personelSil } = useMutation({
    mutationFn: personelServisi.sil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      toast({
        title: "Başarılı",
        description: "Personel başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Personel silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const { mutate: islemEkle } = useMutation({
    mutationFn: personelIslemleriServisi.ekle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personelIslemleri'] });
      toast({
        title: "Başarılı",
        description: "İşlem başarıyla eklendi.",
      });
      setSecilenIslem(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    personelEkle(yeniPersonel);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (secilenPersonel) {
      const { id, created_at, ...guncellenecekVeriler } = secilenPersonel;
      personelGuncelle({ id, data: guncellenecekVeriler });
    }
  };

  const handlePuanla = (personelId: number, puan: number) => {
    setPuanlar(prev => ({ ...prev, [personelId]: puan }));
    toast({
      title: "Puan Verildi",
      description: "Personel başarıyla puanlandı.",
    });
  };

  const handleIslemEkle = (e: React.FormEvent) => {
    e.preventDefault();
    if (secilenPersonel && secilenIslem) {
      const yeniIslem = {
        ...yeniPersonelIslemi,
        personel_id: secilenPersonel.id,
        islem_id: secilenIslem.id,
        tutar: secilenIslem.fiyat,
        prim_yuzdesi: secilenPersonel.prim_yuzdesi
      };
      islemEkle(yeniIslem);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <UserPlus className="mr-2" />
              Yeni Personel
            </Button>
          </SheetTrigger>
          <SheetContent>
            <form onSubmit={handleSubmit}>
              <SheetHeader>
                <SheetTitle>Yeni Personel Ekle</SheetTitle>
              </SheetHeader>
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
                    value={yeniPersonel.calisma_sistemi}
                    onValueChange={(value: 'haftalik' | 'aylik') =>
                      setYeniPersonel((prev) => ({
                        ...prev,
                        calisma_sistemi: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Çalışma sistemi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haftalik">Haftalık</SelectItem>
                      <SelectItem value="aylik">Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prim_yuzdesi">Prim Yüzdesi (%)</Label>
                  <Input
                    id="prim_yuzdesi"
                    type="number"
                    min="0"
                    max="100"
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
              <SheetFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Ekleniyor..." : "Personel Ekle"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Personel ara..."
            className="pl-8"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personeller.map((personel: Personel) => (
            <div
              key={personel.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{personel.ad_soyad}</h3>
                    <p className="text-sm text-muted-foreground">{personel.telefon}</p>
                  </div>
                </div>
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
                        Bu işlem geri alınamaz. Personeli silmek istediğinizden emin misiniz?
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
              <div className="mt-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Çalışma Sistemi:</span>{" "}
                  {personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Prim Yüzdesi:</span> %{personel.prim_yuzdesi}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((puan) => (
                    <Button
                      key={puan}
                      variant="ghost"
                      size="icon"
                      className={`p-1 ${
                        puanlar[personel.id] >= puan ? "text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => handlePuanla(personel.id, puan)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSecilenPersonel(personel)}
                >
                  Detayları Görüntüle
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!secilenPersonel} onOpenChange={(open) => !open && setSecilenPersonel(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Personel Detayları</DialogTitle>
          </DialogHeader>
          {secilenPersonel && (
            <Tabs defaultValue="bilgiler">
              <TabsList>
                <TabsTrigger value="bilgiler">Kişisel Bilgiler</TabsTrigger>
                <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
              </TabsList>
              <TabsContent value="bilgiler">
                <form onSubmit={handleUpdate}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_ad_soyad">Ad Soyad</Label>
                      <Input
                        id="edit_ad_soyad"
                        value={secilenPersonel.ad_soyad}
                        onChange={(e) =>
                          setSecilenPersonel((prev) =>
                            prev ? { ...prev, ad_soyad: e.target.value } : null
                          )
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_telefon">Telefon</Label>
                      <Input
                        id="edit_telefon"
                        value={secilenPersonel.telefon}
                        onChange={(e) =>
                          setSecilenPersonel((prev) =>
                            prev ? { ...prev, telefon: e.target.value } : null
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
                        value={secilenPersonel.eposta}
                        onChange={(e) =>
                          setSecilenPersonel((prev) =>
                            prev ? { ...prev, eposta: e.target.value } : null
                          )
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_adres">Adres</Label>
                      <Input
                        id="edit_adres"
                        value={secilenPersonel.adres}
                        onChange={(e) =>
                          setSecilenPersonel((prev) =>
                            prev ? { ...prev, adres: e.target.value } : null
                          )
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_personel_no">Personel No</Label>
                      <Input
                        id="edit_personel_no"
                        value={secilenPersonel.personel_no}
                        onChange={(e) =>
                          setSecilenPersonel((prev) =>
                            prev ? { ...prev, personel_no: e.target.value } : null
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
                        value={secilenPersonel.maas}
                        onChange={(e) =>
                          setSecilenPersonel((prev) =>
                            prev ? { ...prev, maas: Number(e.target.value) } : null
                          )
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_calisma_sistemi">Çalışma Sistemi</Label>
                      <Select
                        value={secilenPersonel.calisma_sistemi}
                        onValueChange={(value: 'haftalik' | 'aylik') =>
                          setSecilenPersonel((prev) =>
                            prev ? { ...prev, calisma_sistemi: value } : null
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Çalışma sistemi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="haftalik">Haftalık</SelectItem>
                          <SelectItem value="aylik">Aylık</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_prim_yuzdesi">Prim Yüzdesi (%)</Label>
                      <Input
                        id="edit_prim_yuzdesi"
                        type="number"
                        min="0"
                        max="100"
                        value={secilenPersonel.prim_yuzdesi}
                        onChange={(e) =>
                          setSecilenPersonel((prev) =>
                            prev ? { ...prev, prim_yuzdesi: Number(e.target.value) } : null
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
              </TabsContent>
              <TabsContent value="islemler">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">İşlem Geçmişi</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Yeni İşlem
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Yeni İşlem Ekle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleIslemEkle}>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>İşlem</Label>
                              <Select onValueChange={(value) => {
                                const islem = islemler.find(i => i.id === parseInt(value));
                                setSecilenIslem(islem || null);
                              }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="İşlem seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {islemler.map((islem) => (
                                    <SelectItem key={islem.id} value={islem.id.toString()}>
                                      {islem.islem_adi} - {islem.fiyat} TL
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Açıklama</Label>
                              <Input
                                value={yeniPersonelIslemi.aciklama}
                                onChange={(e) =>
                                  setYeniPersonelIslemi((prev) => ({
                                    ...prev,
                                    aciklama: e.target.value,
                                  }))
                                }
                                placeholder="İşlem açıklaması..."
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button type="submit" disabled={!secilenIslem}>
                              İşlem Ekle
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="space-y-4">
                    {personelIslemleri.map((islem) => (
                      <div
                        key={islem.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{islem.islem?.islem_adi}</h4>
                          <p className="text-sm text-muted-foreground">{islem.aciklama}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{islem.tutar} TL</p>
                          <p className="text-sm text-muted-foreground">
                            Prim: {islem.prim_yuzdesi}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
