
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { musteriServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { NameInputField } from "./FormFields/NameInputField";
import { PhoneInputField } from "./FormFields/PhoneInputField";
import { DateInputField } from "./FormFields/DateInputField";

type NewCustomerFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
  dukkanId?: number;
};

export function NewCustomerForm({ onSuccess, onCancel, dukkanId }: NewCustomerFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dateError, setDateError] = useState("");
  const [nameError, setNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [dateIsValid, setDateIsValid] = useState(true);
  
  useEffect(() => {
    validateForm();
  }, [firstName, lastName, phone, birthDate, dateIsValid]);
  
  const validateForm = () => {
    let valid = true;
    
    // Validate name (required and must not be empty)
    if (!firstName.trim()) {
      setNameError("İsim alanı zorunludur");
      valid = false;
    } else {
      setNameError("");
    }
    
    // Validate last name (optional but if provided must be valid)
    if (lastName && !lastName.trim()) {
      setLastNameError("Soyisim geçerli değil");
      valid = false;
    } else {
      setLastNameError("");
    }
    
    // Validate phone (allow empty, but if provided must be numeric and minimum length)
    if (phone) {
      if (phone.length < 10) {
        setPhoneError("Telefon numarası en az 10 haneli olmalıdır");
        valid = false;
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
    
    // Validate birth date using the dateIsValid state from DateInputField
    if (birthDate && !dateIsValid) {
      setDateError("Geçerli bir tarih formatı giriniz (gg.aa.yyyy)");
      valid = false;
    } else {
      setDateError("");
    }
    
    setFormValid(valid);
    return valid;
  };

  const handleDateChange = (value: string, isValid: boolean) => {
    setBirthDate(value);
    setDateIsValid(isValid);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (customerData: any) => musteriServisi.ekle(customerData),
    onSuccess: () => {
      toast.success("Müşteri başarıyla eklendi");
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Müşteri eklenirken hata:", error);
      toast.error(`Müşteri eklenirken bir hata oluştu: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format date from DD.MM.YYYY to YYYY-MM-DD for database
    let formattedDate = null;
    if (birthDate) {
      const parts = birthDate.split('.');
      if (parts.length === 3 && parts[2].length === 4) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    
    const customerData = {
      first_name: firstName.trim(),
      last_name: lastName.trim() || null,
      phone: phone.trim() || null,
      birthdate: formattedDate,
      dukkan_id: dukkanId,
    };
    
    mutate(customerData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-right">
            İsim
            <span className="text-red-500">*</span>
          </Label>
          <NameInputField
            id="firstName"
            value={firstName}
            onChange={setFirstName}
            placeholder="İsim"
            error={nameError}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-right">
            Soyisim
          </Label>
          <NameInputField
            id="lastName"
            value={lastName}
            onChange={setLastName}
            placeholder="Soyisim"
            error={lastNameError}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-right">
          Telefon
        </Label>
        <PhoneInputField
          id="phone"
          value={phone}
          onChange={setPhone}
          error={phoneError}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate" className="text-right">
          Doğum Tarihi
        </Label>
        <DateInputField
          id="birthdate"
          value={birthDate}
          onChange={handleDateChange}
          error={dateError}
        />
        <p className="text-xs text-gray-500">
          Doğum tarihini gg.aa.yyyy formatında girin (Örn: 15.04.1990)
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isPending || !formValid}>
          {isPending ? "Ekleniyor..." : "Müşteri Ekle"}
        </Button>
      </div>
    </form>
  );
}
