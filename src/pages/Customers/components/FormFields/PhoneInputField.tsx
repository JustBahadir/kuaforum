
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
}

export function PhoneInputField({
  value,
  onChange,
  label = "Telefon Numarası",
  placeholder = "05XX XXX XX XX",
  id = "phone",
  error,
  disabled = false
}: PhoneInputFieldProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // Allow exactly 11 digits (including the leading 0)
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.substring(0, 11);
    
    // Format and update the phone number
    onChange(limitedDigits);
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={formatPhoneNumber(value)}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        disabled={disabled}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
