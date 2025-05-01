
import { createContext, useContext, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { toast } from "sonner";

interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PersonnelDialog({ open, onOpenChange, onSuccess }: PersonnelDialogProps) {
  const [formData, setFormData] = useState({
    ad_soyad: "",
    telefon: "",
    eposta: "",
    adres: "",
    personel_no: "",
    calisma_sistemi: "Tam Zamanlı",
    maas: 5000,
    prim_yuzdesi: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await personelServisi.ekle(formData);
      toast.success("Personel başarıyla eklendi");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Personel eklerken hata:", error);
      toast.error("Personel eklerken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Personel Ekle</DialogTitle>
          <DialogDescription>
            Personel bilgilerini girin. Daha sonra da güncellenebilir.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="ad_soyad">Ad Soyad *</Label>
              <Input
                id="ad_soyad"
                name="ad_soyad"
                value={formData.ad_soyad}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefon">Telefon *</Label>
                <Input
                  id="telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  required
                  placeholder="5xxxxxxxxx"
                />
              </div>
              
              <div>
                <Label htmlFor="personel_no">Personel No</Label>
                <Input
                  id="personel_no"
                  name="personel_no"
                  value={formData.personel_no}
                  onChange={handleChange}
                  placeholder="P001"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="eposta">E-posta *</Label>
              <Input
                id="eposta"
                name="eposta"
                type="email"
                value={formData.eposta}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="adres">Adres *</Label>
              <Textarea
                id="adres"
                name="adres"
                value={formData.adres}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="calisma_sistemi">Çalışma Sistemi</Label>
                <Select
                  value={formData.calisma_sistemi}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, calisma_sistemi: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tam Zamanlı">Tam Zamanlı</SelectItem>
                    <SelectItem value="Yarı Zamanlı">Yarı Zamanlı</SelectItem>
                    <SelectItem value="Günlük">Günlük</SelectItem>
                    <SelectItem value="Sözleşmeli">Sözleşmeli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="maas">Maaş</Label>
                <Input
                  id="maas"
                  name="maas"
                  type="number"
                  value={formData.maas}
                  onChange={handleChange}
                  min={0}
                  step={100}
                />
              </div>
              
              <div>
                <Label htmlFor="prim_yuzdesi">Prim Yüzdesi (%)</Label>
                <Input
                  id="prim_yuzdesi"
                  name="prim_yuzdesi"
                  type="number"
                  value={formData.prim_yuzdesi}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ekleniyor..." : "Personel Ekle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
