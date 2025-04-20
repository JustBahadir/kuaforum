
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
  // Correct placeholder passed down and formatting applied
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Remove all non-digit characters and limit maximum 11 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').substring(0, 11);

    onChange(digitsOnly);
  };

  // Note: formatPhoneNumber applies Turkish phone number grouping and placeholder style '05xx xxx xx xx'
  return (
    <div>
      {/* Label removed as user didn't want duplicate */}
      <Input
        id={id}
        value={formatPhoneNumber(value)}
        onChange={handleInputChange}
        placeholder={placeholder} // now properly set
        className={error ? "border-red-500" : ""}
        disabled={disabled}
        maxLength={15}
        type="tel"
        inputMode="tel"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
