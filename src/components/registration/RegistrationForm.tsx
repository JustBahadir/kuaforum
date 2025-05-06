
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormGroup, FormLabel, FormMessage } from "@/components/ui/form-elements";
import { Loader2 } from "lucide-react";
import { KullaniciRol } from "@/lib/supabase/types";

interface RegistrationFormProps {
  submitting: boolean;
  formData: {
    ad: string;
    soyad: string;
    telefon: string;
    rol: KullaniciRol;
  };
  errors: {
    ad?: string;
    soyad?: string;
    telefon?: string;
    rol?: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (value: string) => void;
  onCancel: () => void;
}

export function RegistrationForm({
  submitting,
  formData,
  errors,
  onSubmit,
  onInputChange,
  onSelectChange,
  onCancel
}: RegistrationFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormGroup>
        <FormLabel>Ad</FormLabel>
        <Input
          name="ad"
          value={formData.ad}
          onChange={onInputChange}
          placeholder="Adınız"
        />
        {errors.ad && <FormMessage>{errors.ad}</FormMessage>}
      </FormGroup>
      
      <FormGroup>
        <FormLabel>Soyad</FormLabel>
        <Input
          name="soyad"
          value={formData.soyad}
          onChange={onInputChange}
          placeholder="Soyadınız"
        />
        {errors.soyad && <FormMessage>{errors.soyad}</FormMessage>}
      </FormGroup>
      
      <FormGroup>
        <FormLabel>Telefon</FormLabel>
        <Input
          name="telefon"
          value={formData.telefon}
          onChange={onInputChange}
          placeholder="05XX XXX XX XX"
        />
        {errors.telefon && <FormMessage>{errors.telefon}</FormMessage>}
      </FormGroup>
      
      <FormGroup>
        <FormLabel>Kayıt Tipi</FormLabel>
        <Select
          value={formData.rol}
          onValueChange={onSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kayıt tipini seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="musteri">Müşteri</SelectItem>
            <SelectItem value="isletme_sahibi">İşletme Sahibi</SelectItem>
            <SelectItem value="personel">Personel</SelectItem>
          </SelectContent>
        </Select>
        {errors.rol && <FormMessage>{errors.rol}</FormMessage>}
      </FormGroup>
      
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor
          </>
        ) : 'Profili Tamamla'}
      </Button>
    </form>
  );
}
