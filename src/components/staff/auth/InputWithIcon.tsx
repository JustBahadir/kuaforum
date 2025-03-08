
import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputWithIconProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon: ReactNode;
  required?: boolean;
}

export function InputWithIcon({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required = false
}: InputWithIconProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="absolute left-3 top-3 text-gray-400">
          {icon}
        </div>
        <Input 
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="pl-10"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
}
