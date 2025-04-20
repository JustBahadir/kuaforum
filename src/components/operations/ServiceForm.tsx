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
  fiyat: number;
  setFiyat: (value: number) => void;
  maliyet?: number;
  setMaliyet?: (value: number) => void;
  puan: number;
  setPuan: (value: number) => void;
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
  maliyet = 0,
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

  const handleFiyatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFiyat(isNaN(value) ? 0 : value);
  };

  const handleMaliyetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setMaliyet(isNaN(value) ? 0 : value);
  };

  const handlePuanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPuan(isNaN(value) ? 0 : value);
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
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onOpenChange(false);
    },
    onError: (error) => {
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
      fiyat,
      maliyet,
      puan,
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
          <DialogTitle>{isNewService ? "Yeni Hizmet Ekle" : "Hizmet Düzenle"}</DialogTitle>
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
                type="number"
                id="fiyat"
                value={fiyat}
                onChange={handleFiyatChange}
                min="0"
                step="0.01"
                required
                placeholder="Örn: 250 TL"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maliyet">Süre (dakika)</Label>
              <Input
                type="number"
                id="maliyet"
                value={maliyet}
                onChange={handleMaliyetChange}
                min="0"
                step="1"
                placeholder="Örn: 30 dakika"
              />
            </div>

            {puanlamaAktif && (
              <div className="grid gap-2">
                <Label htmlFor="puan">Puan</Label>
                <Input
                  type="number"
                  id="puan"
                  value={puan}
                  onChange={handlePuanChange}
                  min="0"
                  step="1"
                />
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
