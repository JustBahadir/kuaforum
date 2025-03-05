
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { tr } from "date-fns/locale";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { toast } from "sonner";
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
  const [birthdateText, setBirthdateText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Form validation
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
  
  // Phone format
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setPhone(formatPhoneNumber(digitsOnly));
  };
  
  // Format phone for submission
  const formatPhoneForSubmission = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Format date input
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

  // Birthdate change
  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formattedInput = formatBirthdateInput(input);
    setBirthdateText(formattedInput);
    
    if (formattedInput.length === 10) {
      try {
        const parsedDate = parse(formattedInput, 'dd.MM.yyyy', new Date());
        if (isValid(parsedDate)) {
          setBirthdate(parsedDate);
        }
      } catch (error) {
        console.error("Date parsing error:", error);
      }
    }
  };

  // Calendar select
  const handleCalendarSelect = (date: Date | undefined) => {
    setBirthdate(date);
    if (date) {
      setBirthdateText(format(date, 'dd.MM.yyyy'));
    }
    setCalendarOpen(false);
  };
  
  // Form submission - simplified
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    toast.loading("Müşteri ekleniyor...");
    
    try {
      // Parse date if entered via text
      let selectedDate = birthdate;
      if (!selectedDate && birthdateText) {
        try {
          selectedDate = parse(birthdateText, 'dd.MM.yyyy', new Date());
          if (!isValid(selectedDate)) {
            selectedDate = undefined;
          }
        } catch (error) {
          selectedDate = undefined;
        }
      }
      
      // Prepare customer data
      const customerData = {
        first_name: firstName,
        last_name: lastName,
        phone: phone ? formatPhoneForSubmission(phone) : null,
        birthdate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
      };
      
      // Add customer
      await musteriServisi.ekle(customerData);
      
      toast.dismiss();
      toast.success("Müşteri başarıyla eklendi");
      onSuccess();
      
      // Reset form
      setFirstName('');
      setLastName('');
      setPhone('');
      setBirthdate(undefined);
      setBirthdateText('');
      
    } catch (error: any) {
      console.error("Müşteri eklenirken hata:", error);
      
      toast.dismiss();
      toast.error(`Müşteri eklenemedi: ${error.message || 'Bir hata oluştu'}`);
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
        />
      </div>
      
      <div>
        <Label htmlFor="birthdate">Doğum Tarihi</Label>
        <div className="flex">
          <Input
            id="birthdate"
            value={birthdateText}
            onChange={handleBirthdateChange}
            placeholder="GG.AA.YYYY"
            className="flex-1"
          />
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="outline" 
                className="ml-2"
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
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Ekleniyor...
            </>
          ) : 'Müşteri Ekle'}
        </Button>
      </div>
    </form>
  );
}
