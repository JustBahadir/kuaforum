
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Personel, personelServisi } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PersonnelEditDialogProps {
  personelId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonnelEditDialog({ personelId, open, onOpenChange }: PersonnelEditDialogProps) {
  const [personelDuzenle, setPersonelDuzenle] = useState<Personel | null>(null);
  const queryClient = useQueryClient();

  // Fetch personel data based on personelId
  const { data: personel, isLoading } = useQuery({
    queryKey: ['personel', personelId],
    queryFn: () => personelServisi.getirById(personelId),
    enabled: open && personelId > 0
  });

  // Update personelDuzenle state when personel data is loaded
  useEffect(() => {
    if (personel) {
      setPersonelDuzenle(personel);
    }
  }, [personel]);

  const { mutate: personelGuncelle } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Personel> }) =>
      personelServisi.guncelle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success("Personel başarıyla güncellendi.");
      onOpenChange(false);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (personelDuzenle) {
      const { id, created_at, dukkan, ...guncellenecekVeriler } = personelDuzenle;
      personelGuncelle({ id, data: guncellenecekVeriler });
    }
  };

  if (isLoading || !personelDuzenle) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personel Düzenle</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <span className="loading loading-spinner"></span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                value={personelDuzenle.ad_soyad}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
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
                type="tel"
                value={personelDuzenle.telefon}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
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
                value={personelDuzenle.eposta}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
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
                value={personelDuzenle.adres}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
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
                value={personelDuzenle.personel_no}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
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
                value={personelDuzenle.maas}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev ? { ...prev, maas: Number(e.target.value) } : null
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
                      : null
                  )
                }
                value={personelDuzenle.calisma_sistemi}
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
              <Label htmlFor="edit_prim_yuzdesi">Prim Yüzdesi</Label>
              <Input
                id="edit_prim_yuzdesi"
                type="number"
                value={personelDuzenle.prim_yuzdesi}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev
                      ? { ...prev, prim_yuzdesi: Number(e.target.value) }
                      : null
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
  );
}
