
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { musteriServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";

type NewCustomerFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
  dukkanId?: number;
};

export function NewCustomerForm({ onSuccess, onCancel, dukkanId }: NewCustomerFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [phoneError, setPhoneError] = useState("");
  const [dateError, setDateError] = useState("");
  const [formValid, setFormValid] = useState(false);
  
  useEffect(() => {
    validateForm();
  }, [firstName, phone, birthDate]);
  
  const validateForm = () => {
    let valid = true;
    
    // Validate phone (allow empty, but if provided must be numeric)
    if (phone) {
      const phoneRegex = /^[0-9+\s()-]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        setPhoneError("Telefon numarası geçerli bir format olmalıdır");
        valid = false;
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
    
    // Validate birth date if provided
    if (birthDate) {
      if (!isValid(birthDate)) {
        setDateError("Geçerli bir tarih seçin");
        valid = false;
      } else {
        const today = new Date();
        if (birthDate > today) {
          setDateError("Doğum tarihi bugünden sonra olamaz");
          valid = false;
        } else {
          setDateError("");
        }
      }
    } else {
      setDateError("");
    }
    
    // First name is required
    valid = valid && firstName.trim().length > 0;
    
    setFormValid(valid);
    return valid;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (customerData: any) => musteriServisi.ekle(customerData),
    onSuccess: () => {
      toast.success("Müşteri başarıyla eklendi");
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Müşteri eklenirken hata:", error);
      toast.error(`Müşteri eklenirken bir hata oluştu: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const customerData = {
      first_name: firstName.trim(),
      last_name: lastName.trim() || null,
      phone: phone.trim() || null,
      birthdate: birthDate ? format(birthDate, "yyyy-MM-dd") : null,
      dukkan_id: dukkanId,
    };
    
    mutate(customerData);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-right">
            İsim
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="İsim"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-right">
            Soyisim
          </Label>
          <Input
            id="lastName"
            placeholder="Soyisim"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-right">
          Telefon
        </Label>
        <Input
          id="phone"
          placeholder="Telefon"
          value={phone}
          onChange={handlePhoneChange}
        />
        {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate" className="text-right">
          Doğum Tarihi
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !birthDate && "text-muted-foreground"
              )}
            >
              {birthDate ? format(birthDate, "dd.MM.yyyy") : <span>Tarih seçin</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={birthDate}
              onSelect={setBirthDate}
              disabled={(date) => {
                return date > new Date();
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {dateError && <p className="text-sm text-red-500">{dateError}</p>}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isPending || !formValid}>
          {isPending ? "Ekleniyor..." : "Müşteri Ekle"}
        </Button>
      </div>
    </form>
  );
}
