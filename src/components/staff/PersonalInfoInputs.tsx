
import { FormGroup, FormLabel, FormMessage } from "@/components/ui/form-elements";
import { Input } from "@/components/ui/input";

interface PersonalInfoInputsProps {
  name: string;
  setName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  birthDate: string;
  setBirthDate: (value: string) => void;
  errors: {[key: string]: string};
}

export function PersonalInfoInputs({
  name, setName,
  phone, setPhone,
  email, setEmail,
  address, setAddress,
  birthDate, setBirthDate,
  errors
}: PersonalInfoInputsProps) {
  return (
    <>
      <FormGroup>
        <FormLabel>Ad Soyad</FormLabel>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Ad Soyad"
        />
        {errors.name && <FormMessage>{errors.name}</FormMessage>}
      </FormGroup>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup>
          <FormLabel>Telefon</FormLabel>
          <Input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="05XX XXX XX XX"
          />
          {errors.phone && <FormMessage>{errors.phone}</FormMessage>}
        </FormGroup>
        
        <FormGroup>
          <FormLabel>E-Posta</FormLabel>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="ornek@email.com"
            type="email"
          />
          {errors.email && <FormMessage>{errors.email}</FormMessage>}
        </FormGroup>
      </div>
      
      <FormGroup>
        <FormLabel>Adres</FormLabel>
        <Input 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder="Adres"
        />
        {errors.address && <FormMessage>{errors.address}</FormMessage>}
      </FormGroup>
      
      <FormGroup>
        <FormLabel>Doğum Tarihi</FormLabel>
        <Input 
          value={birthDate} 
          onChange={(e) => setBirthDate(e.target.value)} 
          placeholder="YYYY-MM-DD"
          type="date"
        />
        {errors.birthDate && <FormMessage>{errors.birthDate}</FormMessage>}
      </FormGroup>
    </>
  );
}
