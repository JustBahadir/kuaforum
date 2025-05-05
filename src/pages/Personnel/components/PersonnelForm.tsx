
import { useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { Personel, PersonnelFormProps } from "@/types/personnel";

export function PersonnelForm({
  personel,
  onSubmit,
  onCancel,
  isLoading = false
}: PersonnelFormProps) {
  const { isletmeId } = useAuth();
  const [formData, setFormData] = useState<Omit<Personel, "id" | "created_at">>({
    dukkan_id: isletmeId || "",
    eposta: "",
    telefon: "",
    adres: "",
    ad_soyad: "",
    maas: 0,
    prim_yuzdesi: 0,
    personel_no: "",
    calisma_sistemi: "tam_zamanli",
  });

  // Load existing personnel data if provided
  useEffect(() => {
    if (personel) {
      setFormData({
        dukkan_id: typeof personel.dukkan_id === 'number' ? personel.dukkan_id.toString() : personel.dukkan_id,
        eposta: personel.eposta || "",
        telefon: personel.telefon || "",
        adres: personel.adres || "",
        ad_soyad: personel.ad_soyad || "",
        maas: personel.maas || 0,
        prim_yuzdesi: personel.prim_yuzdesi || 0,
        personel_no: personel.personel_no || "",
        iban: personel.iban || "",
        calisma_sistemi: personel.calisma_sistemi || "tam_zamanli",
        birth_date: personel.birth_date,
        auth_id: personel.auth_id,
        avatar_url: personel.avatar_url
      });
    }
  }, [personel]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "maas" || name === "prim_yuzdesi" 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  // Handle form dropdown select changes
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ad_soyad">Ad Soyad</Label>
          <Input 
            id="ad_soyad" 
            name="ad_soyad" 
            value={formData.ad_soyad} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="eposta">E-posta</Label>
          <Input 
            id="eposta" 
            name="eposta" 
            type="email" 
            value={formData.eposta} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefon">Telefon</Label>
          <Input 
            id="telefon" 
            name="telefon" 
            value={formData.telefon} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="personel_no">Personel No</Label>
          <Input 
            id="personel_no" 
            name="personel_no" 
            value={formData.personel_no} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maas">Maaş</Label>
          <Input 
            id="maas" 
            name="maas" 
            type="number" 
            value={formData.maas} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="prim_yuzdesi">Prim Yüzdesi (%)</Label>
          <Input 
            id="prim_yuzdesi" 
            name="prim_yuzdesi" 
            type="number" 
            value={formData.prim_yuzdesi} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="iban">IBAN</Label>
          <Input 
            id="iban" 
            name="iban" 
            value={formData.iban || ""} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="calisma_sistemi">Çalışma Sistemi</Label>
          <Select 
            value={formData.calisma_sistemi} 
            onValueChange={(value) => handleSelectChange(value, "calisma_sistemi")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Çalışma sistemi seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tam_zamanli">Tam Zamanlı</SelectItem>
              <SelectItem value="yari_zamanli">Yarı Zamanlı</SelectItem>
              <SelectItem value="sozlesmeli">Sözleşmeli</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="adres">Adres</Label>
        <Input 
          id="adres" 
          name="adres" 
          value={formData.adres} 
          onChange={handleChange} 
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : (personel ? "Güncelle" : "Kaydet")}
        </Button>
      </div>
    </form>
  );
}
