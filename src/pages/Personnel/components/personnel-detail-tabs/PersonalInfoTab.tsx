
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { toast } from "sonner";

interface PersonalInfoTabProps {
  personel: any;
  onRefresh: () => void;
}

export function PersonalInfoTab({ personel, onRefresh }: PersonalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ad_soyad: personel.ad_soyad || "",
    telefon: personel.telefon || "",
    eposta: personel.eposta || "",
    adres: personel.adres || "",
    personel_no: personel.personel_no || "",
    birth_date: personel.birth_date || "",
    iban: personel.iban || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await personelServisi.guncelle(personel.id, formData);
      onRefresh();
      setIsEditing(false);
      toast.success("Personel bilgileri güncellendi");
    } catch (error) {
      console.error("Personel bilgisi güncellenirken hata:", error);
      toast.error("Bilgiler güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="ad_soyad" className="block text-sm font-medium">
              Ad Soyad
            </label>
            <input
              id="ad_soyad"
              name="ad_soyad"
              type="text"
              value={formData.ad_soyad}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="personel_no" className="block text-sm font-medium">
              Personel No
            </label>
            <input
              id="personel_no"
              name="personel_no"
              type="text"
              value={formData.personel_no}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="telefon" className="block text-sm font-medium">
              Telefon
            </label>
            <input
              id="telefon"
              name="telefon"
              type="tel"
              value={formData.telefon}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="eposta" className="block text-sm font-medium">
              E-posta
            </label>
            <input
              id="eposta"
              name="eposta"
              type="email"
              value={formData.eposta}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="birth_date" className="block text-sm font-medium">
              Doğum Tarihi
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              value={formData.birth_date ? new Date(formData.birth_date).toISOString().split('T')[0] : ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="iban" className="block text-sm font-medium">
              IBAN
            </label>
            <input
              id="iban"
              name="iban"
              type="text"
              value={formData.iban}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="TR..."
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="adres" className="block text-sm font-medium">
            Adres
          </label>
          <textarea
            id="adres"
            name="adres"
            value={formData.adres}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
          >
            İptal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Düzenle
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Ad Soyad</p>
            <p>{personel.ad_soyad || "-"}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Personel No</p>
            <p>{personel.personel_no || "-"}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Telefon</p>
            <p>{personel.telefon || "-"}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">E-posta</p>
            <p>{personel.eposta || "-"}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Doğum Tarihi</p>
            <p>
              {personel.birth_date
                ? new Date(personel.birth_date).toLocaleDateString("tr-TR")
                : "-"}
            </p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">IBAN</p>
            <p className="font-mono text-sm break-all">{personel.iban || "-"}</p>
          </div>
        </Card>
      </div>
      
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Adres</p>
          <p>{personel.adres || "-"}</p>
        </div>
      </Card>
    </div>
  );
}
