
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { kategoriServisi, islemServisi } from "@/lib/supabase";
import { Hizmet, IslemKategorisi } from "@/lib/supabase/types";

interface ServiceFormProps {
  isletmeKimlik: string;
  hizmetKimlik?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServiceForm({ isletmeKimlik, hizmetKimlik, onSuccess, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [kategoriler, setKategoriler] = useState<IslemKategorisi[]>([]);
  const [formData, setFormData] = useState<Partial<Hizmet>>({
    hizmet_adi: '',
    kategori_kimlik: '',
    fiyat: 0,
    sure_dakika: 0,
    siralama: 0,
    isletme_kimlik: isletmeKimlik
  });

  // Kategorileri yükle
  useEffect(() => {
    const kategoriYukle = async () => {
      try {
        const data = await kategoriServisi.isletmeyeGoreGetir(isletmeKimlik);
        setKategoriler(data);
      } catch (error) {
        console.error('Kategori yükleme hatası:', error);
        toast.error('Kategoriler yüklenirken bir hata oluştu');
      }
    };

    kategoriYukle();
  }, [isletmeKimlik]);

  // Düzenleme modu ise hizmet bilgilerini yükle
  useEffect(() => {
    const hizmetDetayGetir = async () => {
      if (!hizmetKimlik) return;
      
      setLoading(true);
      try {
        const hizmet = await islemServisi.getir(hizmetKimlik);
        if (hizmet) {
          setFormData({
            kimlik: hizmet.kimlik,
            hizmet_adi: hizmet.hizmet_adi,
            kategori_kimlik: hizmet.kategori_kimlik,
            fiyat: hizmet.fiyat,
            sure_dakika: hizmet.sure_dakika,
            siralama: hizmet.siralama,
            isletme_kimlik: hizmet.isletme_kimlik
          });
        }
      } catch (error) {
        console.error('Hizmet detay getirme hatası:', error);
        toast.error('Hizmet bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    hizmetDetayGetir();
  }, [hizmetKimlik]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Sayısal alanlar için dönüşümü yap
    if (name === 'fiyat' || name === 'sure_dakika' || name === 'siralama') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit validasyon
    if (!formData.hizmet_adi?.trim() || !formData.kategori_kimlik) {
      toast.error('Lütfen gerekli alanları doldurunuz');
      return;
    }
    
    setLoading(true);
    try {
      let sonuc;
      
      if (hizmetKimlik) {
        // Güncelleme
        sonuc = await islemServisi.guncelle(hizmetKimlik, formData);
      } else {
        // Yeni kayıt
        sonuc = await islemServisi.olustur(formData);
      }
      
      if (sonuc) {
        toast.success(hizmetKimlik ? 'Hizmet güncellendi' : 'Hizmet eklendi');
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Hizmet kaydetme hatası:', error);
      toast.error('Hizmet kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hizmetKimlik ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hizmet_adi">Hizmet Adı</Label>
              <Input
                id="hizmet_adi"
                name="hizmet_adi"
                value={formData.hizmet_adi}
                onChange={handleInputChange}
                placeholder="Hizmet adını giriniz"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori_kimlik">Kategori</Label>
              <Select
                value={formData.kategori_kimlik}
                onValueChange={(value) => handleSelectChange('kategori_kimlik', value)}
                disabled={loading || kategoriler.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçiniz" />
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fiyat">Fiyat (₺)</Label>
                <Input
                  id="fiyat"
                  name="fiyat"
                  type="number"
                  value={formData.fiyat}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sure_dakika">Süre (Dakika)</Label>
                <Input
                  id="sure_dakika"
                  name="sure_dakika"
                  type="number"
                  value={formData.sure_dakika}
                  onChange={handleInputChange}
                  placeholder="30"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siralama">Sıralama</Label>
              <Input
                id="siralama"
                name="siralama"
                type="number"
                value={formData.siralama}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">Düşük sayılar üstte gösterilir</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              İptal
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hizmetKimlik ? 'Güncelle' : 'Ekle'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default ServiceForm;
