
import { Input } from "@/components/ui/input";

interface NameInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function NameInputField({
  value,
  onChange,
  placeholder = "İsim",
  id = "name",
  error,
  disabled = false,
  required = false
}: NameInputFieldProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // Only allow alphabetical characters, spaces, and some special characters used in Turkish names
    // Removed digits and most special characters
    const filteredValue = e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s.'"-]/g, '');
    
    onChange(filteredValue);
  };

  return (
    <div>
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        disabled={disabled}
        required={required}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
