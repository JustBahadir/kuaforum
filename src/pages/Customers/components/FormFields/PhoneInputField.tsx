
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
  placeholder = "05xx xxx xx xx",
  id = "phone",
  error,
  disabled = false
}: PhoneInputFieldProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const digitsOnly = e.target.value.replace(/\D/g, '').substring(0, 11);
    onChange(digitsOnly);
  };

  return (
    <div>
      {/* Label removed as user didn't want duplicate */}
      <Input
        id={id}
        value={formatPhoneNumber(value)}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        disabled={disabled}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
