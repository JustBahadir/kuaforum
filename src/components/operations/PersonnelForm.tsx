
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface PersonnelFormProps {
  personnel: any;
  onChange?: (field: string, value: any) => void;
  readOnly?: boolean;
  showWorkInfo?: boolean;
  showPersonalInfo?: boolean;
}

export function PersonnelForm({ 
  personnel, 
  onChange, 
  readOnly = false,
  showWorkInfo = true,
  showPersonalInfo = true
}: PersonnelFormProps) {
  const handleInputChange = (field: string, value: any) => {
    if (onChange) {
      onChange(field, value);
    }
  };

  return (
    <div className="space-y-6">
      {showPersonalInfo && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ad_soyad">Ad Soyad</Label>
              <Input
                id="ad_soyad"
                value={personnel.ad_soyad}
                onChange={(e) => handleInputChange("ad_soyad", e.target.value)}
                readOnly={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birth_date">Doğum Tarihi</Label>
              {readOnly ? (
                <Input
                  id="birth_date"
                  value={personnel.birth_date ? format(new Date(personnel.birth_date), "dd.MM.yyyy", { locale: tr }) : ""}
                  readOnly
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !personnel.birth_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {personnel.birth_date ? format(new Date(personnel.birth_date), "PPP", { locale: tr }) : <span>Tarih seçin</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={personnel.birth_date ? new Date(personnel.birth_date) : undefined}
                      onSelect={(date) => handleInputChange("birth_date", date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                value={personnel.telefon}
                onChange={(e) => handleInputChange("telefon", e.target.value)}
                readOnly={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eposta">E-posta</Label>
              <Input
                id="eposta"
                type="email"
                value={personnel.eposta}
                onChange={(e) => handleInputChange("eposta", e.target.value)}
                readOnly={readOnly}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adres">Adres</Label>
            <Textarea
              id="adres"
              value={personnel.adres}
              onChange={(e) => handleInputChange("adres", e.target.value)}
              readOnly={readOnly}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              value={personnel.iban}
              onChange={(e) => handleInputChange("iban", e.target.value)}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              readOnly={readOnly}
            />
          </div>
        </div>
      )}
      
      {showWorkInfo && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Çalışma Bilgileri</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personel_no">Personel No</Label>
              <Input
                id="personel_no"
                value={personnel.personel_no}
                onChange={(e) => handleInputChange("personel_no", e.target.value)}
                readOnly={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calisma_sistemi">Çalışma Sistemi</Label>
              {readOnly ? (
                <Input
                  id="calisma_sistemi"
                  value={personnel.calisma_sistemi}
                  readOnly
                />
              ) : (
                <Select
                  value={personnel.calisma_sistemi}
                  onValueChange={(value) => handleInputChange("calisma_sistemi", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Çalışma sistemi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maaşlı">Maaşlı</SelectItem>
                    <SelectItem value="yüzdelik">Yüzdelik</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maas">Maaş (₺)</Label>
              <Input
                id="maas"
                type="number"
                value={personnel.maas}
                onChange={(e) => handleInputChange("maas", Number(e.target.value))}
                disabled={readOnly || personnel.calisma_sistemi !== "maaşlı"}
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prim_yuzdesi">Prim Yüzdesi (%)</Label>
              <Input
                id="prim_yuzdesi"
                type="number"
                value={personnel.prim_yuzdesi}
                onChange={(e) => handleInputChange("prim_yuzdesi", Number(e.target.value))}
                disabled={readOnly || personnel.calisma_sistemi !== "yüzdelik"}
                step="0.01"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
