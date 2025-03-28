
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kategoriAdi: string;
  setKategoriAdi: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CategoryForm({
  isOpen,
  onOpenChange,
  kategoriAdi,
  setKategoriAdi,
  onSubmit,
}: CategoryFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Kategori Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kategori_adi">Kategori Adı</Label>
              <Input
                id="kategori_adi"
                value={kategoriAdi}
                onChange={(e) => setKategoriAdi(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Ekle</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
