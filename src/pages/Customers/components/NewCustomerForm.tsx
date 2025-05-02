
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { musteriServisi } from "@/lib/supabase";
import { DatePickerField } from "./FormFields/DatePickerField";
import { PhoneInputField } from "./FormFields/PhoneInputField";
import { CustomerFormActions } from "./FormFields/CustomerFormActions";
import { CustomerFormFields } from "./FormFields/CustomerFormFields";
import { useAuth } from "@/hooks/useAuth";
import { dukkanServisi } from "@/lib/supabase";

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
  const [currentDukkanId, setCurrentDukkanId] = useState<number | undefined>(dukkanId);
  const { user } = useAuth();
  
  // If dukkanId was not provided, try to get it
  useEffect(() => {
    async function fetchDukkanId() {
      if (!currentDukkanId && user) {
        try {
          const dukkan = await dukkanServisi.kullaniciDukkaniniGetir();
          if (dukkan && dukkan.id) {
            setCurrentDukkanId(dukkan.id);
          }
        } catch (error) {
          console.error("Dükkan ID alınırken hata:", error);
        }
      }
    }
    
    fetchDukkanId();
  }, [currentDukkanId, user]);
  
  // Form validation - Check if any field has a value
  const isFormValid = firstName.trim() !== '' || lastName.trim() !== '' || phone.trim() !== '' || birthdate !== undefined;

  // Format phone for submission
  const formatPhoneForSubmission = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) {
      newErrors.firstName = 'İsim alanı zorunludur';
    }
    
    if (!currentDukkanId) {
      newErrors.dukkan = 'Dükkan bilgisi eksik, lütfen sayfayı yenileyip tekrar deneyin';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        dukkan_id: currentDukkanId // Include dukkan_id in the customer data
      };
      
      console.log("Müşteri verileri:", customerData);
      
      // Call the service to add customer
      const result = await musteriServisi.ekle(customerData);
      
      if (result) {
        toast.success("Müşteri başarıyla eklendi");
        
        // Reset form and notify parent
        setFirstName('');
        setLastName('');
        setPhone('');
        setBirthdate(undefined);
        setBirthdateText('');
        setErrors({});
        onSuccess();
      } else {
        toast.error("Müşteri eklenirken bir hata oluştu");
      }
    } catch (error: any) {
      console.error("Müşteri ekleme hatası (form):", error);
      toast.error(`Müşteri eklenemedi: ${error.message || "Bir hata oluştu"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer form fields */}
      <CustomerFormFields 
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onPhoneChange={setPhone}
        errors={errors}
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
        disabled={!isFormValid} // Enable button if any field has a value
      />
    </form>
  );
}
