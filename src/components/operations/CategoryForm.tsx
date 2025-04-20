
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

interface CategoryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kategoriAdi: string;
  setKategoriAdi: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing?: boolean; // yeni prop
}

export function CategoryForm({
  isOpen,
  onOpenChange,
  kategoriAdi,
  setKategoriAdi,
  onSubmit,
  isEditing = false,
}: CategoryFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Kategori Adı Düzenleniyor" : "Kategori Ekle"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Mevcut kategori adını düzenleyin."
              : "Yeni kategori oluşturmak için formu doldurun."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kategori_adi">{isEditing ? "Kategori Adı (Güncelle)" : "Kategori Adı"}</Label>
              <Input
                id="kategori_adi"
                value={kategoriAdi}
                onChange={(e) => setKategoriAdi(e.target.value)}
                required
                placeholder="Kategori adını girin"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit">{isEditing ? "Güncelle" : "Ekle"}</Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
