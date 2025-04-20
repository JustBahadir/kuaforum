
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface CategoryEditFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kategoriAdi: string;
  setKategoriAdi: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CategoryEditForm({
  isOpen,
  onOpenChange,
  kategoriAdi,
  setKategoriAdi,
  onSubmit,
}: CategoryEditFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kategori Adını Düzenle</DialogTitle>
          <DialogDescription>
            Kategori adını değiştirmek için aşağıdaki formu kullanın.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kategori_adi_duzenle">Kategori Adı</Label>
              <Input
                id="kategori_adi_duzenle"
                value={kategoriAdi}
                onChange={(e) => setKategoriAdi(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit">Güncelle</Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
