
import { FormField } from "@/components/ui/form-elements";
import { PhoneInputField } from "./PhoneInputField";

interface CustomerFormFieldsProps {
  firstName: string;
  lastName: string;
  phone: string;
  birthdate?: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onBirthdateChange?: (value: string) => void;
  errors?: Record<string, string>;
}

export function CustomerFormFields({
  firstName,
  lastName,
  phone,
  birthdate,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onBirthdateChange,
  errors = {}
}: CustomerFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FormField
            id="firstName"
            label="Ad"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Müşteri adı"
            required
            error={errors.firstName}
          />
        </div>
        <div className="space-y-1.5">
          <FormField
            id="lastName"
            label="Soyad"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Müşteri soyadı"
            error={errors.lastName}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefon
        </label>
        <PhoneInputField
          value={phone}
          onChange={onPhoneChange}
          placeholder="05xx xxx xx xx"
          id="phone"
          error={errors.phone}
        />
      </div>
      
      {onBirthdateChange && (
        <div className="space-y-1.5">
          <FormField
            id="birthdate"
            label="Doğum Tarihi"
            type="date"
            value={birthdate || ""}
            onChange={(e) => onBirthdateChange(e.target.value)}
            placeholder="GG/AA/YYYY"
            error={errors.birthdate}
          />
        </div>
      )}
    </>
  );
}
