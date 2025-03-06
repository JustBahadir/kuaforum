
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { DatePickerField } from "./FormFields/DatePickerField";
import { PhoneInputField } from "./FormFields/PhoneInputField";
import { CustomerFormActions } from "./FormFields/CustomerFormActions";
import { CustomerFormFields } from "./FormFields/CustomerFormFields";

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
    
    try {
      console.log("Form onaylandı, müşteri ekleme işlemi başlatılıyor...");
      
      // Prepare customer data
      const customerData = {
        first_name: firstName,
        last_name: lastName || null,
        phone: phone ? formatPhoneForSubmission(phone) : null,
        birthdate: birthdate ? format(birthdate, 'yyyy-MM-dd') : null,
      };
      
      console.log("Müşteri verileri:", customerData);
      console.log("Dükkan ID:", dukkanId);
      
      // Call the service to add customer
      await musteriServisi.ekle(customerData, dukkanId);
        
      toast.success("Müşteri başarıyla eklendi");
      
      // Reset form and notify parent
      setFirstName('');
      setLastName('');
      setPhone('');
      setBirthdate(undefined);
      setBirthdateText('');
      setErrors({});
      onSuccess();
      
    } catch (error: any) {
      console.error("Müşteri ekleme hatası (form):", error);
      
      // More specific error messages based on the error type
      let errorMessage = "Bağlantı hatası";
      
      if (error.message) {
        if (error.message.includes("API anahtarı geçersiz")) {
          errorMessage = "API anahtarı geçersiz. Lütfen sistem yöneticinize başvurun.";
        } else if (error.message.includes("Yetkilendirme hatası")) {
          errorMessage = "Yetkilendirme hatası. RLS politikalarını kontrol edin.";
        } else if (error.message.includes("zaten mevcut")) {
          errorMessage = "Bu müşteri zaten kayıtlı.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`Müşteri eklenemedi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CustomerFormFields 
        firstName={firstName}
        lastName={lastName}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        errors={errors}
      />
      
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
