
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
import { supabase } from "@/lib/supabase/client";
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
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setPhone(formatPhoneNumber(digitsOnly));
  };
  
  const formatPhoneForSubmission = (value: string) => {
    // Remove all non-digit characters for submission
    return value.replace(/\D/g, '');
  };

  const formatBirthdateInput = (input: string) => {
    // Remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, '');
    
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    } else if (digitsOnly.length <= 4) {
      return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
    } else {
      return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
    }
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formattedInput = formatBirthdateInput(input);
    setBirthdateText(formattedInput);
    
    // Try to parse the date
    if (formattedInput.length === 10) { // Complete date format: DD.MM.YYYY
      const dateParts = formattedInput.split('.');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in Date
        const year = parseInt(dateParts[2], 10);
        const parsedDate = new Date(year, month, day);
        
        if (isValid(parsedDate)) {
          setBirthdate(parsedDate);
        }
      }
    }
  };

  const handleBirthdateFocus = () => {
    // Clear the text when focused
    setBirthdateText('');
  };

  const handleBirthdateBlur = () => {
    // If empty when blur, reset to placeholder
    if (!birthdateText) {
      setBirthdateText('01.01.2000');
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setBirthdate(date);
    if (date) {
      setBirthdateText(format(date, 'dd.MM.yyyy'));
    }
    setCalendarOpen(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate the date format from text input if not selected from calendar
      let selectedDate = birthdate;
      if (!selectedDate && birthdateText && birthdateText !== '01.01.2000') {
        try {
          selectedDate = parse(birthdateText, 'dd.MM.yyyy', new Date());
          if (!isValid(selectedDate)) {
            toast.error("Lütfen geçerli bir tarih formatı girin (GG.AA.YYYY)");
            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          toast.error("Lütfen geçerli bir tarih formatı girin (GG.AA.YYYY)");
          setIsSubmitting(false);
          return;
        }
      }
      
      const customerData = {
        first_name: firstName,
        last_name: lastName,
        phone: phone ? formatPhoneForSubmission(phone) : null,
        birthdate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
      };
      
      console.log("Gönderilecek müşteri verileri:", customerData);
      
      // Kullanıcıya işlemin başladığını bildir
      toast.loading("Müşteri ekleniyor...", { id: "customer-add" });
      
      const result = await musteriServisi.ekle(customerData);
      
      toast.dismiss("customer-add");
      
      if (result) {
        toast.success("Müşteri başarıyla eklendi");
        onSuccess();
        setFirstName('');
        setLastName('');
        setPhone('');
        setBirthdate(undefined);
        setBirthdateText('01.01.2000');
      } else {
        toast.error("Müşteri eklenemedi");
      }
    } catch (error: any) {
      toast.dismiss("customer-add");
      console.error("Müşteri eklenirken hata:", error);
      
      if (error.message?.includes('Invalid API key')) {
        toast.error("Bağlantı hatası. Oturum yenileniyor, lütfen bekleyin...");
        
        try {
          // Oturumu yenile ve bekle
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Oturum yenileme hatası:", refreshError);
            toast.error("Oturum yenilenemedi. Lütfen sayfayı yenileyin.");
            setIsSubmitting(false);
            return;
          }
          
          if (data.session) {
            // Yeni seanslı tekrar dene
            toast.loading("Tekrar deneniyor...", { id: "retry-add" });
            
            // Biraz bekleyelim yeni token için
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              const customerData = {
                first_name: firstName,
                last_name: lastName,
                phone: phone ? formatPhoneForSubmission(phone) : null,
                birthdate: birthdate ? format(birthdate, 'yyyy-MM-dd') : null
              };
              
              const result = await musteriServisi.ekle(customerData);
              
              toast.dismiss("retry-add");
              
              if (result) {
                toast.success("Müşteri başarıyla eklendi");
                onSuccess();
                setFirstName('');
                setLastName('');
                setPhone('');
                setBirthdate(undefined);
                setBirthdateText('01.01.2000');
              } else {
                toast.error("Müşteri eklenemedi. Sunucu hatası.");
              }
            } catch (retryError: any) {
              toast.dismiss("retry-add");
              console.error("Tekrar denemede hata:", retryError);
              toast.error("Müşteri eklenirken bir hata oluştu: " + (retryError.message || "Bilinmeyen hata"));
            }
          } else {
            toast.error("Oturum bilgisi alınamadı. Lütfen sayfayı yenileyin.");
          }
        } catch (refreshError) {
          console.error("Oturum yenileme işleminde hata:", refreshError);
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
