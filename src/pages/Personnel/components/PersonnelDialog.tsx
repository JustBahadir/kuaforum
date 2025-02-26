
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Personel, supabase } from "@/lib/supabase";
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

interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonnelDialog({ open, onOpenChange }: PersonnelDialogProps) {
  const queryClient = useQueryClient();
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

  const { mutate: personelEkle, isPending: isEklemeLoading } = useMutation({
    mutationFn: async (data: Omit<Personel, 'id' | 'created_at'>) => {
      try {
        // İlk önce varolan kullanıcıyı kontrol et
        const { data: existingUser } = await supabase
          .from('personel')
          .select('eposta')
          .eq('eposta', data.eposta)
          .single();

        if (existingUser) {
          throw new Error('Bu e-posta adresi ile kayıtlı personel bulunmaktadır');
        }

        // Auth kaydı oluştur
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.eposta,
          password: 'gecici123',
          options: {
            data: {
              first_name: data.ad_soyad.split(' ')[0],
              last_name: data.ad_soyad.split(' ').slice(1).join(' '),
              role: 'staff'
            }
          }
        });

        if (authError) {
          console.error('Auth Error:', authError);
          if (authError.message.includes('already registered')) {
            throw new Error('Bu e-posta adresi zaten kayıtlı');
          }
          throw authError;
        }

        if (!authData.user) {
          throw new Error('Kullanıcı kaydı oluşturulamadı');
        }

        // Personel kaydı oluştur
        const personelData = {
          ...data,
          auth_id: authData.user.id,
          personel_no: `P${Math.floor(Math.random() * 10000)}`
        };

        const { data: personel, error: personelError } = await supabase
          .from('personel')
          .insert([personelData])
          .select()
          .single();

        if (personelError) {
          // Personel kaydı başarısız olursa auth kaydını da sil
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error('Personel kaydı oluşturulurken bir hata oluştu');
        }

        return personel;
      } catch (error: any) {
        console.error('Error:', error);
        throw new Error(error.message || 'Personel kaydı sırasında bir hata oluştu');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success('Personel başarıyla eklendi');
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
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Hata: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    personelEkle(yeniPersonel);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}
