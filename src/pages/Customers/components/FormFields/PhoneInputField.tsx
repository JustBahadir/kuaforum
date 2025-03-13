
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
}

export function PhoneInputField({
  value,
  onChange,
  label = "Telefon Numarası",
  placeholder = "05XX XXX XX XX",
  id = "phone",
  error
}: PhoneInputFieldProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    onChange(formatPhoneNumber(digitsOnly));
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
