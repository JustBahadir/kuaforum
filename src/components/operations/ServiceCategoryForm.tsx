
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { kategoriServisi } from "@/lib/supabase";

interface ServiceCategoryFormProps {
  dukkanId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ServiceCategoryForm({ 
  dukkanId, 
  open, 
  onOpenChange, 
  onSuccess 
}: ServiceCategoryFormProps) {
  const [kategoriAdi, setKategoriAdi] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategoriAdi.trim()) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kategori adı boş olamaz"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Updated to use 'ekle' instead of 'olustur'
      await kategoriServisi.ekle({
        dukkan_id: dukkanId,
        kategori_adi: kategoriAdi,
        sira: 999 // Will be reordered by the backend
      });
      
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla eklendi"
      });
      
      setKategoriAdi("");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Kategori ekleme hatası:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kategori eklenirken bir sorun oluştu"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Kategori Ekle</DialogTitle>
          <DialogDescription>
            Hizmetlerinizi organize edecek yeni bir kategori ekleyin.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kategori-adi">Kategori Adı</Label>
            <Input
              id="kategori-adi"
              placeholder="Örn: Saç Kesimi, Manikür"
              value={kategoriAdi}
              onChange={(e) => setKategoriAdi(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
