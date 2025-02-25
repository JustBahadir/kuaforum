
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface ServiceFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kategoriler: any[];
  islemAdi: string;
  setIslemAdi: (value: string) => void;
  fiyat: number;
  setFiyat: (value: number) => void;
  puan: number;
  setPuan: (value: number) => void;
  kategoriId: number | null;
  setKategoriId: (value: number | null) => void;
  duzenleId: number | null;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export function ServiceForm({
  isOpen,
  onOpenChange,
  kategoriler,
  islemAdi,
  setIslemAdi,
  fiyat,
  setFiyat,
  puan,
  setPuan,
  kategoriId,
  setKategoriId,
  duzenleId,
  onSubmit,
  onReset,
}: ServiceFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onReset}>
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
        <form onSubmit={onSubmit} className="space-y-4">
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
  );
}
