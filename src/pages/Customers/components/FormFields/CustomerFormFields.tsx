
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormFieldsProps {
  firstName: string;
  lastName: string;
  phone?: string;
  birthdate?: string;
  onFirstNameChange?: (value: string) => void;
  onLastNameChange?: (value: string) => void;
  onPhoneChange?: (value: string) => void;
  onBirthdateChange?: (value: string) => void;
  // For backward compatibility with existing code
  setFirstName?: React.Dispatch<React.SetStateAction<string>>;
  setLastName?: React.Dispatch<React.SetStateAction<string>>;
  setPhone?: React.Dispatch<React.SetStateAction<string>>;
  setBirthdate?: React.Dispatch<React.SetStateAction<string | undefined>>;
  errors?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthdate?: string;
  };
}

export function CustomerFormFields({
  firstName,
  lastName,
  phone = "",
  birthdate,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onBirthdateChange,
  setFirstName,
  setLastName,
  setPhone,
  setBirthdate,
  errors = {}
}: CustomerFormFieldsProps) {
  // Helper function to handle both callback styles
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFirstNameChange) onFirstNameChange(e.target.value);
    if (setFirstName) setFirstName(e.target.value);
  };
  
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onLastNameChange) onLastNameChange(e.target.value);
    if (setLastName) setLastName(e.target.value);
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onPhoneChange) onPhoneChange(e.target.value);
    if (setPhone) setPhone(e.target.value);
  };
  
  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onBirthdateChange) onBirthdateChange(e.target.value);
    if (setBirthdate) setBirthdate(e.target.value);
  };
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="firstName">İsim*</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={handleFirstNameChange}
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
          onChange={handleLastNameChange}
          placeholder="Soyisim"
          className={errors.lastName ? "border-red-500" : ""}
        />
        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
      </div>
      
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="Telefon"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
      
      <div>
        <Label htmlFor="birthdate">Doğum Tarihi</Label>
        <Input
          id="birthdate"
          type="date"
          value={birthdate || ""}
          onChange={handleBirthdateChange}
          className={errors.birthdate ? "border-red-500" : ""}
        />
        {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
      </div>
    </div>
  );
}
