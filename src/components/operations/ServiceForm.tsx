
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { islemServisi } from "@/lib/supabase";
import { toast } from "sonner";

export interface ServiceFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kategoriler: any[];
  islemAdi: string;
  setIslemAdi: (value: string) => void;
  fiyat: number | string;
  setFiyat: (value: number | string) => void;
  maliyet?: number | string;
  setMaliyet?: (value: number | string) => void;
  puan: number | string;
  setPuan: (value: number | string) => void;
  kategoriId: number | undefined;
  setKategoriId: (value: number | undefined) => void;
  isNewService?: boolean;
  serviceId?: number;
  puanlamaAktif: boolean;
  showCategorySelect?: boolean;
  duzenleId?: number | null;
  onSubmit?: (e: React.FormEvent) => void;
  onReset?: () => void;
}

export function ServiceForm({
  isOpen,
  onOpenChange,
  kategoriler,
  islemAdi,
  setIslemAdi,
  fiyat,
  setFiyat,
  maliyet = "",
  setMaliyet = () => {},
  puan,
  setPuan,
  kategoriId,
  setKategoriId,
  isNewService = true,
  serviceId,
  puanlamaAktif,
  showCategorySelect = true,
  duzenleId,
  onSubmit,
  onReset,
}: ServiceFormProps) {
  const queryClient = useQueryClient();

  // Use local states as string for controlled input handling
  const [localFiyat, setLocalFiyat] = useState<string>("");
  const [localMaliyet, setLocalMaliyet] = useState<string>("");
  const [localPuan, setLocalPuan] = useState<string>("");

  useEffect(() => {
    setLocalFiyat(fiyat === 0 ? "" : fiyat.toString());
  }, [fiyat]);

  useEffect(() => {
    setLocalMaliyet(maliyet === 0 ? "" : maliyet?.toString() || "");
  }, [maliyet]);

  useEffect(() => {
    setLocalPuan(puan === 0 ? "" : puan.toString());
  }, [puan]);

  const handleFiyatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setLocalFiyat(value);
      setFiyat(value === "" ? "" : parseFloat(value));
    }
  };

  const handleMaliyetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setLocalMaliyet(value);
      setMaliyet(value === "" ? "" : parseInt(value, 10));
    }
  };

  const handlePuanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setLocalPuan(value);
      setPuan(value === "" ? "" : parseInt(value, 10));
    }
  };

  const addServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return isNewService
        ? await islemServisi.ekle(data)
        : await islemServisi.guncelle(serviceId as number, data);
    },
    onSuccess: () => {
      toast.success(
        isNewService
          ? "Hizmet başarıyla eklendi!"
          : "Hizmet başarıyla güncellendi!"
      );
      queryClient.invalidateQueries({ queryKey: ["islemler"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Show detailed error message if present, fallback to generic
      console.error(error);
      toast.error(
        isNewService
          ? "Hizmet eklenirken bir hata oluştu."
          : "Hizmet güncellenirken bir hata oluştu."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
      return;
    }

    const serviceData: any = {
      islem_adi: islemAdi,
      fiyat: parseFloat(localFiyat) || 0,
      maliyet: parseInt(localMaliyet) || 0,
      puan: parseInt(localPuan) || 0,
    };

    if (kategoriId) {
      serviceData.kategori_id = kategoriId;
    }

    addServiceMutation.mutate(serviceData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{duzenleId ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="islemAdi">Hizmet Adı</Label>
              <Input
                id="islemAdi"
                value={islemAdi}
                onChange={(e) => setIslemAdi(e.target.value)}
                required
                placeholder="Örn: Saç Kesimi"
                spellCheck={false}
              />
            </div>

            {showCategorySelect && (
              <div className="grid gap-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select
                  value={kategoriId?.toString()}
                  onValueChange={(value) =>
                    setKategoriId(value ? parseInt(value) : undefined)
                  }
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
            )}

            <div className="grid gap-2">
              <Label htmlFor="fiyat">Fiyat (₺)</Label>
              <Input
                type="text"
                id="fiyat"
                value={localFiyat}
                onChange={handleFiyatChange}
                placeholder="Örn: 250"
                inputMode="decimal"
              />
              <small className="text-gray-500 text-xs mt-1">
                Lütfen fiyatı TL cinsinden, örn: 250
              </small>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maliyet">Süre (dakika)</Label>
              <Input
                type="text"
                id="maliyet"
                value={localMaliyet}
                onChange={handleMaliyetChange}
                placeholder="Örn: 30"
                inputMode="numeric"
              />
              <small className="text-gray-500 text-xs mt-1">
                Lütfen süreyi dakika cinsinden tam sayı olarak girin, örn: 30
              </small>
            </div>

            {puanlamaAktif && (
              <div className="grid gap-2">
                <Label htmlFor="puan">Puan</Label>
                <Input
                  type="text"
                  id="puan"
                  value={localPuan}
                  onChange={handlePuanChange}
                  placeholder="Örn: 18"
                  inputMode="numeric"
                />
                <small className="text-gray-500 text-xs mt-1">
                  Lütfen puanı tam sayı olarak girin, örn: 18
                </small>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (onReset) onReset();
                onOpenChange(false);
              }}
            >
              İptal
            </Button>
            <Button type="submit" disabled={addServiceMutation.isPending}>
              {addServiceMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
