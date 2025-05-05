// Importing required dependencies and components
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { kategoriServisi, islemServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { IslemKategorisi } from "@/lib/supabase/types";

// ServiceForm component interface
interface ServiceFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kategoriler: IslemKategorisi[];
  islemAdi: string;
  setIslemAdi: (value: string) => void;
  sureDakika: string | number;
  setSureDakika: (value: string) => void;
  fiyat: string | number;
  setFiyat: (value: string) => void;
  kategoriKimlik: string;
  setKategoriKimlik: (value: string) => void;
  puan: string | number;
  setPuan: (value: string) => void;
  onSave: () => void;
  editing: boolean;
  showCategorySelect?: boolean;
}

// ServiceForm component
export function ServiceForm({
  isOpen,
  onOpenChange,
  kategoriler,
  islemAdi,
  setIslemAdi,
  sureDakika,
  setSureDakika,
  fiyat,
  setFiyat,
  kategoriKimlik,
  setKategoriKimlik,
  puan,
  setPuan,
  onSave,
  editing,
  showCategorySelect = true
}: ServiceFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Hizmet Düzenle" : "Yeni Hizmet Ekle"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="islemAdi">Hizmet Adı</Label>
            <Input
              id="islemAdi"
              value={islemAdi}
              onChange={(e) => setIslemAdi(e.target.value)}
              placeholder="Örn: Saç Kesimi"
            />
          </div>
          
          {/* Category Selection */}
          {showCategorySelect && (
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={kategoriKimlik} onValueChange={setKategoriKimlik}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriler.map((kategori) => (
                    <SelectItem key={kategori.kimlik} value={kategori.kimlik}>
                      {kategori.baslik}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="sureDakika">Süre (dakika)</Label>
            <Input
              id="sureDakika"
              type="number"
              min="1"
              value={sureDakika}
              onChange={(e) => setSureDakika(e.target.value)}
              placeholder="30"
            />
          </div>
          
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="fiyat">Fiyat (₺)</Label>
            <Input
              id="fiyat"
              type="number"
              min="0"
              step="0.01"
              value={fiyat}
              onChange={(e) => setFiyat(e.target.value)}
              placeholder="100"
            />
          </div>
          
          {/* Points */}
          <div className="space-y-2">
            <Label htmlFor="puan">Puan</Label>
            <Input
              id="puan"
              type="number"
              min="0"
              value={puan}
              onChange={(e) => setPuan(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>
        <DialogFooter className="flex space-x-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">İptal</Button>
          </DialogClose>
          <Button onClick={onSave}>{editing ? "Güncelle" : "Ekle"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// CategoryForm component interface
interface CategoryFormProps {
  isletmeKimlik: string;
  kategoriKimlik?: string;
  kategoriAdi?: string;
  aciklama?: string;
  onSuccess: () => void;
  onCancel: () => void;
  editing?: boolean;
}

// CategoryForm component
export function CategoryForm({
  isletmeKimlik,
  kategoriKimlik,
  kategoriAdi = "",
  aciklama = "",
  onSuccess,
  onCancel,
  editing = false,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    kategoriAdi,
    aciklama,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kategoriAdi.trim()) {
      toast.error("Kategori adı boş olamaz");
      return;
    }
    
    setLoading(true);
    
    try {
      if (editing && kategoriKimlik) {
        // Update existing category
        await kategoriServisi.guncelle(kategoriKimlik, {
          baslik: formData.kategoriAdi,
          aciklama: formData.aciklama || null,
        });
        toast.success("Kategori başarıyla güncellendi");
      } else {
        // Create new category
        await kategoriServisi.olustur({
          isletme_kimlik: isletmeKimlik,
          baslik: formData.kategoriAdi,
          aciklama: formData.aciklama || null,
        });
        toast.success("Yeni kategori başarıyla oluşturuldu");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Kategori işlemi hatası:", error);
      toast.error("Bir hata oluştu, lütfen tekrar deneyin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kategoriAdi">Kategori Adı</Label>
        <Input
          id="kategoriAdi"
          name="kategoriAdi"
          value={formData.kategoriAdi}
          onChange={handleChange}
          placeholder="Örn: Saç Bakımı"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="aciklama">Açıklama (Opsiyonel)</Label>
        <Input
          id="aciklama"
          name="aciklama"
          value={formData.aciklama}
          onChange={handleChange}
          placeholder="Kategori hakkında kısa açıklama"
        />
      </div>
      
      <div className="flex space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          İptal
        </Button>
        <Button 
          type="submit"
          disabled={loading}
        >
          {loading 
            ? `${editing ? "Güncelleniyor" : "Oluşturuluyor"}...` 
            : editing 
              ? "Güncelle" 
              : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}

// CategoryCard component
export function CategoryCard() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori İşlemleri</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Kategori eklemek, düzenlemek veya silmek için aşağıdaki butona tıklayın.</p>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Kategori İşlemleri</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kategori İşlemleri</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default CategoryCard;
