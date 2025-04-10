
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
} from "@/components/ui/dialog";
import { InfoCircle } from "@/components/ui/custom-icons";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ServiceFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kategoriler: any[];
  islemAdi: string;
  setIslemAdi: (value: string) => void;
  fiyat: number;
  setFiyat: (value: number) => void;
  maliyet: number;
  setMaliyet: (value: number) => void;
  puan: number;
  setPuan: (value: number) => void;
  kategoriId: number | null;
  setKategoriId: (value: number | null) => void;
  duzenleId: number | null;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  puanlamaAktif: boolean;
  // Yeni prop: Kategori seçimini gösterip göstermeyeceğini belirler
  showCategorySelect?: boolean;
}

export function ServiceForm({
  isOpen,
  onOpenChange,
  kategoriler,
  islemAdi,
  setIslemAdi,
  fiyat,
  setFiyat,
  maliyet,
  setMaliyet,
  puan,
  setPuan,
  kategoriId,
  setKategoriId,
  duzenleId,
  onSubmit,
  onReset,
  puanlamaAktif,
  // Varsayılan değeri true olacak
  showCategorySelect = true,
}: ServiceFormProps) {
  // Önerilen maliyet için örnek değerler
  const [suggestedCost, setSuggestedCost] = useState<number | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // İsim değişince rastgele bir maliyet önerisi üret
  const generateCostSuggestion = () => {
    // Gerçek bir API çağrısı yapılacak olsaydı burada isteği yapardık
    // Bu örnekte basit bir simülasyon yapıyoruz
    const baseCost = Math.floor(fiyat * 0.4); // Fiyatın %40'ı
    const random = Math.floor(Math.random() * 20) - 10; // -10 ile +10 arası rastgele değer
    const suggested = Math.max(10, baseCost + random); // En az 10 TL olsun
    
    setSuggestedCost(suggested);
    setShowSuggestion(maliyet === 0); // Sadece maliyet girilmediyse göster
  };

  // Fiyat değişince maliyet önerisini güncelle
  const handlePriceChange = (value: number) => {
    setFiyat(value);
    if (value > 0 && maliyet === 0) {
      setShowSuggestion(true);
      generateCostSuggestion();
    }
  };

  // Önerilen maliyeti kullan
  const useSuggestedCost = () => {
    if (suggestedCost) {
      setMaliyet(suggestedCost);
      setShowSuggestion(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {duzenleId ? "Hizmet Düzenle" : "Yeni Hizmet Ekle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Kategori seçimi, showCategorySelect true ise gösterilir */}
          {showCategorySelect && (
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={kategoriId?.toString() || ""}
                onValueChange={(value) => setKategoriId(value ? Number(value) : null)}
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
          <div className="space-y-2">
            <Label htmlFor="islem_adi">Hizmet Adı</Label>
            <Input
              id="islem_adi"
              value={islemAdi}
              onChange={(e) => {
                setIslemAdi(e.target.value);
                if (e.target.value && !duzenleId) {
                  generateCostSuggestion();
                }
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fiyat">Fiyat (₺)</Label>
            <Input
              id="fiyat"
              type="number"
              value={fiyat}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maliyet">Maliyet (₺)</Label>
            <Input
              id="maliyet"
              type="number"
              value={maliyet}
              onChange={(e) => {
                setMaliyet(Number(e.target.value));
                setShowSuggestion(false);
              }}
              required
            />
            <p className="text-xs text-muted-foreground">
              Bir işlem için kullanılan malzeme maliyetleri (boya, maske, krem vb.)
            </p>

            {/* Maliyet Önerisi */}
            {showSuggestion && suggestedCost && (
              <Alert className="mt-2 bg-slate-50">
                <InfoCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-sm flex justify-between items-center">
                  <span>Bu hizmet için ortalama maliyet: {suggestedCost} ₺</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={useSuggestedCost}
                  >
                    Bu Değeri Kullan
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
          {puanlamaAktif && (
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
          )}
          <Button type="submit" className="w-full">
            {duzenleId ? "Güncelle" : "Ekle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
