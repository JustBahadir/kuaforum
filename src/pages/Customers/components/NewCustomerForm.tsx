
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface NewCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewCustomerForm({ onSuccess, onCancel }: NewCustomerFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'İsim alanı zorunludur';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Soyisim alanı zorunludur';
    }
    
    if (phone && !/^\d+$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const formatPhoneInput = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const customerData = {
        first_name: firstName,
        last_name: lastName,
        phone: phone ? formatPhoneInput(phone) : null,
        birthdate: birthdate ? format(birthdate, 'yyyy-MM-dd') : null
      };
      
      const result = await musteriServisi.ekle(customerData);
      
      if (result) {
        onSuccess();
        setFirstName('');
        setLastName('');
        setPhone('');
        setBirthdate(undefined);
      }
    } catch (error: any) {
      console.error("Müşteri eklenirken hata:", error);
      
      if (error.message?.includes('Invalid API key')) {
        toast.error("Bağlantı hatası. Oturum yenileniyor, lütfen bekleyin...");
        
        try {
          await supabase.auth.refreshSession();
          toast.info("Oturum yenilendi. Lütfen tekrar deneyin.");
        } catch (refreshError) {
          console.error("Oturum yenileme hatası:", refreshError);
          toast.error("Oturum yenilenemedi. Lütfen sayfayı yenileyin.");
        }
      } else {
        toast.error(`Müşteri eklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">İsim</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="İsim"
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <Label htmlFor="lastName">Soyisim</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Soyisim"
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="phone">Telefon Numarası</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon numarası"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
      
      <div>
        <Label htmlFor="birthdate">Doğum Tarihi</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${!birthdate ? "text-muted-foreground" : ""}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {birthdate ? format(birthdate, "dd MMMM yyyy", { locale: tr }) : <span>Doğum tarihi seçin</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={birthdate}
              onSelect={setBirthdate}
              initialFocus
              locale={tr}
              captionLayout="dropdown-buttons"
              fromYear={1900}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          İptal
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ekleniyor...' : 'Müşteri Ekle'}
        </Button>
      </div>
    </form>
  );
}
