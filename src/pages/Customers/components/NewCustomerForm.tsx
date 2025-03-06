
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { DatePickerField } from "./FormFields/DatePickerField";
import { PhoneInputField } from "./FormFields/PhoneInputField";
import { CustomerFormActions } from "./FormFields/CustomerFormActions";

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
  
  // Format phone for submission
  const formatPhoneForSubmission = (value: string) => {
    return value.replace(/\D/g, '');
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
      // Direct insertion with supabase client
      const { data, error } = await supabase
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
        toast.dismiss(toastId);
        toast.error(`Müşteri eklenemedi: ${error.message || 'Bağlantı hatası'}`);
        return;
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
      
      <PhoneInputField 
        value={phone}
        onChange={setPhone}
      />
      
      <DatePickerField
        value={birthdate}
        onChange={setBirthdate}
        textValue={birthdateText}
        onTextChange={setBirthdateText}
        label="Doğum Tarihi"
        id="birthdate"
      />
      
      {errors.dukkan && <p className="text-red-500 text-sm mt-1">{errors.dukkan}</p>}
      
      <CustomerFormActions
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        disabled={!dukkanId}
      />
    </form>
  );
}
