
import { FormGroup, FormLabel, FormMessage } from "@/components/ui/form-elements";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmploymentDetailsInputsProps {
  percentage: number;
  setPercentage: (value: number) => void;
  salary: number;
  setSalary: (value: number) => void;
  personnelNumber: string;
  setPersonnelNumber: (value: string) => void;
  system: string;
  setSystem: (value: string) => void;
  errors: {[key: string]: string};
}

export function EmploymentDetailsInputs({
  percentage, setPercentage,
  salary, setSalary,
  personnelNumber, setPersonnelNumber,
  system, setSystem,
  errors
}: EmploymentDetailsInputsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup>
          <FormLabel>Prim Yüzdesi (%)</FormLabel>
          <Input 
            value={percentage} 
            onChange={(e) => setPercentage(Number(e.target.value) || 0)} 
            placeholder="0"
            type="number"
            min="0"
            max="100"
          />
        </FormGroup>
        
        <FormGroup>
          <FormLabel>Maaş (₺)</FormLabel>
          <Input 
            value={salary} 
            onChange={(e) => setSalary(Number(e.target.value) || 0)} 
            placeholder="0"
            type="number"
            min="0"
          />
        </FormGroup>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup>
          <FormLabel>Personel No</FormLabel>
          <Input 
            value={personnelNumber} 
            onChange={(e) => setPersonnelNumber(e.target.value)} 
            placeholder="Personel No"
          />
          {errors.personnelNumber && <FormMessage>{errors.personnelNumber}</FormMessage>}
        </FormGroup>
        
        <FormGroup>
          <FormLabel>Çalışma Sistemi</FormLabel>
          <Select value={system} onValueChange={setSystem}>
            <SelectTrigger>
              <SelectValue placeholder="Çalışma Sistemi Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tam_zamanli">Tam Zamanlı</SelectItem>
              <SelectItem value="yarim_zamanli">Yarı Zamanlı</SelectItem>
              <SelectItem value="sozlesmeli">Sözleşmeli</SelectItem>
              <SelectItem value="stajyer">Stajyer</SelectItem>
            </SelectContent>
          </Select>
          {errors.system && <FormMessage>{errors.system}</FormMessage>}
        </FormGroup>
      </div>
    </>
  );
}
