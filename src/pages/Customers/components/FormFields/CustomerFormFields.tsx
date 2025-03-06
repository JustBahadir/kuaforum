
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  errors?: {
    firstName?: string;
    lastName?: string;
  };
}

export function CustomerFormFields({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  errors = {}
}: CustomerFormFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="firstName">İsim</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          placeholder="İsim"
          className={errors.firstName ? "border-red-500" : ""}
        />
        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
      </div>
      
      <div>
        <Label htmlFor="lastName">Soyisim</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          placeholder="Soyisim"
          className={errors.lastName ? "border-red-500" : ""}
        />
        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
      </div>
    </div>
  );
}
