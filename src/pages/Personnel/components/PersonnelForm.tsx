
import { useState, useEffect } from "react";
import { Personel } from "@/lib/supabase";
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
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface PersonnelFormProps {
  onSubmit: (data: Omit<Personel, 'id' | 'created_at'>) => void;
  isLoading: boolean;
}

export function PersonnelForm({ onSubmit, isLoading }: PersonnelFormProps) {
  const { dukkanId } = useCustomerAuth();
  const [yeniPersonel, setYeniPersonel] = useState<Omit<Personel, 'id' | 'created_at'>>({
    ad_soyad: "",
    telefon: "",
    eposta: "",
    adres: "",
    personel_no: "",
    maas: 0,
    calisma_sistemi: "aylik",
    prim_yuzdesi: 0,
    dukkan_id: dukkanId || undefined
  });

  // Update dukkan_id when it changes in auth context
  useEffect(() => {
    if (dukkanId) {
      setYeniPersonel(prev => ({
        ...prev,
        dukkan_id: dukkanId
      }));
    }
  }, [dukkanId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure dukkan_id is set
    const personelData = {
      ...yeniPersonel,
      dukkan_id: dukkanId || undefined
    };
    onSubmit(personelData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <Button type="submit" disabled={isLoading || !dukkanId} className="w-full">
        {isLoading ? "Ekleniyor..." : "Personel Ekle"}
      </Button>
      {!dukkanId && (
        <p className="text-xs text-red-500 text-center">
          Personel eklemek için bir dükkana bağlı olmanız gerekmektedir.
        </p>
      )}
    </form>
  );
}
