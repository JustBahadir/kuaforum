
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { toast } from "sonner";

interface CreatePersonnelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePersonnelForm({ open, onOpenChange, onSuccess }: CreatePersonnelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await personelServisi.ekle(formData);
      toast.success("Personel başarıyla eklendi");
      
      // Reset form
      setFormData({
        ad_soyad: "",
        telefon: "",
        eposta: "",
        adres: "",
        personel_no: "",
        calisma_sistemi: "Tam Zamanlı",
        maas: 5000,
        prim_yuzdesi: 10,
      });
      
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Personel eklenirken hata:", error);
      toast.error("Personel eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Yeni Personel Ekle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="ad_soyad" className="text-sm font-medium">
                Ad Soyad *
              </label>
              <input
                id="ad_soyad"
                name="ad_soyad"
                type="text"
                required
                value={formData.ad_soyad}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="personel_no" className="text-sm font-medium">
                Personel No
              </label>
              <input
                id="personel_no"
                name="personel_no"
                type="text"
                value={formData.personel_no}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="P001"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="telefon" className="text-sm font-medium">
                Telefon *
              </label>
              <input
                id="telefon"
                name="telefon"
                type="tel"
                required
                value={formData.telefon}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="5xxxxxxxxx"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="eposta" className="text-sm font-medium">
                E-posta *
              </label>
              <input
                id="eposta"
                name="eposta"
                type="email"
                required
                value={formData.eposta}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="ornek@mail.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="adres" className="text-sm font-medium">
              Adres *
            </label>
            <textarea
              id="adres"
              name="adres"
              required
              value={formData.adres}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
            ></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="calisma_sistemi" className="text-sm font-medium">
                Çalışma Sistemi
              </label>
              <select
                id="calisma_sistemi"
                name="calisma_sistemi"
                value={formData.calisma_sistemi}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="Tam Zamanlı">Tam Zamanlı</option>
                <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                <option value="Günlük">Günlük</option>
                <option value="Sözleşmeli">Sözleşmeli</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="maas" className="text-sm font-medium">
                Maaş
              </label>
              <input
                id="maas"
                name="maas"
                type="number"
                value={formData.maas}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
                step="100"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="prim_yuzdesi" className="text-sm font-medium">
              Prim Yüzdesi (%)
            </label>
            <input
              id="prim_yuzdesi"
              name="prim_yuzdesi"
              type="number"
              value={formData.prim_yuzdesi}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
              step="1"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
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
