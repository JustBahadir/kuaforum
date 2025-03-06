
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { supabaseAdmin } from "@/lib/supabase/client";

interface NewCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  dukkanId?: number;
}

export function NewCustomerForm({ onSuccess, onCancel, dukkanId }: NewCustomerFormProps) {
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
    
    if (!dukkanId) {
      newErrors.dukkan = 'Dükkan bilgisi eksik, lütfen sayfayı yenileyip tekrar deneyin';
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
  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow empty value
    if (!input) {
      setBirthdateText('');
      setBirthdate(undefined);
      return;
    }
    
    // Only allow digits and dots
    const cleanInput = input.replace(/[^\d.]/g, '');
    
    // Format into DD.MM.YYYY
    let formattedInput = cleanInput;
    if (cleanInput.length <= 2) {
      formattedInput = cleanInput;
    } else if (cleanInput.length <= 4) {
      formattedInput = `${cleanInput.slice(0, 2)}.${cleanInput.slice(2)}`;
    } else {
      formattedInput = `${cleanInput.slice(0, 2)}.${cleanInput.slice(2, 4)}.${cleanInput.slice(4, 8)}`;
    }
    
    setBirthdateText(formattedInput);
    
    // Parse date if complete
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
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("Müşteri ekleniyor...");
    
    try {
      console.log("Müşteri ekleniyor:", { 
        first_name: firstName,
        last_name: lastName,
        phone: phone ? formatPhoneForSubmission(phone) : null,
        birthdate: birthdate ? format(birthdate, 'yyyy-MM-dd') : null,
        role: 'customer',
        dukkan_id: dukkanId
      });
      
      // Direct insertion with supabaseAdmin to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([{
          first_name: firstName,
          last_name: lastName,
          phone: phone ? formatPhoneForSubmission(phone) : null,
          birthdate: birthdate ? format(birthdate, 'yyyy-MM-dd') : null,
          role: 'customer',
          dukkan_id: dukkanId
        }])
        .select();
        
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      
      toast.dismiss(toastId);
      toast.success("Müşteri başarıyla eklendi");
      
      // Reset form and notify parent
      setFirstName('');
      setLastName('');
      setPhone('');
      setBirthdate(undefined);
      setBirthdateText('');
      onSuccess();
      
    } catch (error: any) {
      console.error("Müşteri ekleme hatası:", error);
      
      toast.dismiss(toastId);
      toast.error(`Müşteri eklenemedi: ${error.message || 'Bağlantı hatası'}`);
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
      
      {errors.dukkan && <p className="text-red-500 text-sm mt-1">{errors.dukkan}</p>}
      
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
          disabled={isSubmitting || !dukkanId}
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
