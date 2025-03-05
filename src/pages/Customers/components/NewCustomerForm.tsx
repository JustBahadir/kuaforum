
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { tr } from "date-fns/locale";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { toast } from "sonner";
import { refreshSupabaseSession } from "@/lib/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface NewCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewCustomerForm({ onSuccess, onCancel }: NewCustomerFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const [birthdateText, setBirthdateText] = useState('01.01.2000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const birthdateInputRef = useRef<HTMLInputElement>(null);
  
  // Form doğrulama - basitleştirildi
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'İsim alanı zorunludur';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Soyisim alanı zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Telefon formatı
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setPhone(formatPhoneNumber(digitsOnly));
  };
  
  // Telefon için supabase'e gönderim formatı
  const formatPhoneForSubmission = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Tarih formatı - nokta (.) ile ayırma
  const formatBirthdateInput = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '');
    
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    } else if (digitsOnly.length <= 4) {
      return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
    } else {
      return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
    }
  };

  // Doğum tarihi değişim fonksiyonu
  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formattedInput = formatBirthdateInput(input);
    setBirthdateText(formattedInput);
    
    // Tarih formatını doğrula
    if (formattedInput.length === 10) { // DD.MM.YYYY formatında
      const dateParts = formattedInput.split('.');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Date objesi 0-11 arası ay değeri alır
        const year = parseInt(dateParts[2], 10);
        const parsedDate = new Date(year, month, day);
        
        if (isValid(parsedDate)) {
          setBirthdate(parsedDate);
        }
      }
    }
  };

  // Input focus olduğunda placeholder'ı temizle
  const handleBirthdateFocus = () => {
    if (birthdateText === '01.01.2000') {
      setBirthdateText('');
    }
  };

  // Input blur olduğunda default değeri geri koy
  const handleBirthdateBlur = () => {
    if (!birthdateText) {
      setBirthdateText('01.01.2000');
    }
  };

  // Takvimden tarih seçildiğinde
  const handleCalendarSelect = (date: Date | undefined) => {
    setBirthdate(date);
    if (date) {
      setBirthdateText(format(date, 'dd.MM.yyyy'));
    }
    setCalendarOpen(false);
  };
  
  // Form gönderim işlemi - hızlandırıldı ve basitleştirildi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Toast ile bilgilendirme başla
    toast.loading("Müşteri ekleniyor...", { id: "customer-add" });
    
    try {
      // Bağlantıyı yenileme
      await refreshSupabaseSession();
      
      // Tarih formatını kontrol et
      let selectedDate = birthdate;
      if (!selectedDate && birthdateText && birthdateText !== '01.01.2000') {
        try {
          selectedDate = parse(birthdateText, 'dd.MM.yyyy', new Date());
          if (!isValid(selectedDate)) {
            toast.error("Lütfen geçerli bir tarih formatı girin (GG.AA.YYYY)", { id: "customer-add" });
            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          toast.error("Lütfen geçerli bir tarih formatı girin (GG.AA.YYYY)", { id: "customer-add" });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Müşteri verilerini hazırla
      const customerData = {
        first_name: firstName,
        last_name: lastName,
        phone: phone ? formatPhoneForSubmission(phone) : null,
        birthdate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
      };
      
      // Müşteri ekle - basitleştirilmiş servis
      const result = await musteriServisi.ekle(customerData);
      
      if (result) {
        toast.success("Müşteri başarıyla eklendi", { id: "customer-add" });
        onSuccess();
        
        // Formu sıfırla
        setFirstName('');
        setLastName('');
        setPhone('');
        setBirthdate(undefined);
        setBirthdateText('01.01.2000');
      } else {
        toast.error("Müşteri eklenemedi, tekrar deneyin", { id: "customer-add" });
      }
    } catch (error: any) {
      console.error("Müşteri eklenirken hata:", error);
      
      // Hata mesajlarını göster
      if (error.message?.includes('Invalid API key')) {
        toast.error("Bağlantı hatası. Lütfen tekrar deneyin.", { id: "customer-add" });
      } else {
        toast.error(`Müşteri eklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`, { id: "customer-add" });
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
          onChange={handlePhoneChange}
          placeholder="05XX XXX XX XX"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
      
      <div>
        <Label htmlFor="birthdate">Doğum Tarihi</Label>
        <div className="flex">
          <Input
            id="birthdate"
            ref={birthdateInputRef}
            value={birthdateText}
            onChange={handleBirthdateChange}
            onFocus={handleBirthdateFocus}
            onBlur={handleBirthdateBlur}
            placeholder="GG.AA.YYYY"
            className="flex-1"
          />
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="outline" 
                className="ml-2"
                onClick={() => setCalendarOpen(true)}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={birthdate}
                onSelect={handleCalendarSelect}
                initialFocus
                locale={tr}
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>
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
