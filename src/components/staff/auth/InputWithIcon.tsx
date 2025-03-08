
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputWithIconProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

export function InputWithIcon({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required,
  disabled
}: InputWithIconProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            "transition-all",
            icon ? "pl-10" : ""
          )}
        />
      </div>
    </div>
  );
}
