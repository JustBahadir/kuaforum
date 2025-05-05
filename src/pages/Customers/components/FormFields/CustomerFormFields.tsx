
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-range-picker-adapter";
import { PhoneInput } from "@/components/ui/phone-input";

interface CustomerFormFieldsProps {
  formData: {
    ad: string;
    soyad: string;
    telefon: string;
    eposta: string;
    dogum_tarihi?: Date | string | null;
    cinsiyet: string;
    notlar?: string;
    adres?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
}

export function CustomerFormFields({ formData, setFormData, errors }: CustomerFormFieldsProps) {
  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev: any) => ({ ...prev, dogum_tarihi: date || null }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, telefon: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ad">Ad <span className="text-red-500">*</span></Label>
          <Input
            id="ad"
            value={formData.ad}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, ad: e.target.value }))}
            placeholder="Müşteri adı"
            error={errors.ad}
          />
          {errors.ad && <p className="text-xs text-red-500">{errors.ad}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="soyad">Soyad <span className="text-red-500">*</span></Label>
          <Input
            id="soyad"
            value={formData.soyad}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, soyad: e.target.value }))}
            placeholder="Müşteri soyadı"
            error={errors.soyad}
          />
          {errors.soyad && <p className="text-xs text-red-500">{errors.soyad}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefon">Telefon <span className="text-red-500">*</span></Label>
          <PhoneInput
            id="telefon"
            onChange={handlePhoneChange}
            defaultValue={formData.telefon}
            placeholder="05XX XXX XX XX"
          />
          {errors.telefon && <p className="text-xs text-red-500">{errors.telefon}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="eposta">E-posta</Label>
          <Input
            id="eposta"
            type="email"
            value={formData.eposta || ''}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, eposta: e.target.value }))}
            placeholder="örnek@email.com"
            error={errors.eposta}
          />
          {errors.eposta && <p className="text-xs text-red-500">{errors.eposta}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dogum-tarihi">Doğum Tarihi</Label>
          <DatePicker
            id="dogum-tarihi"
            date={formData.dogum_tarihi ? new Date(formData.dogum_tarihi) : undefined}
            onSelect={handleDateChange}
            placeholder="Tarih seçin"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cinsiyet">Cinsiyet</Label>
          <Select 
            value={formData.cinsiyet || ''} 
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, cinsiyet: value }))}
          >
            <SelectTrigger id="cinsiyet">
              <SelectValue placeholder="Cinsiyet seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="erkek">Erkek</SelectItem>
              <SelectItem value="kadin">Kadın</SelectItem>
              <SelectItem value="belirtilmedi">Belirtmek İstemiyorum</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="adres">Adres</Label>
        <Textarea
          id="adres"
          value={formData.adres || ''}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, adres: e.target.value }))}
          placeholder="Müşteri adresi"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notlar">Notlar</Label>
        <Textarea
          id="notlar"
          value={formData.notlar || ''}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, notlar: e.target.value }))}
          placeholder="Müşteri hakkında notlar"
          rows={3}
        />
      </div>
    </div>
  );
}
