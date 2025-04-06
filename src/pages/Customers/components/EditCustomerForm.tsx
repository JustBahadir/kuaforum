
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { musteriServisi } from "@/lib/supabase";

interface EditCustomerFormProps {
  customer: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerUpdated: () => void;
}

export function EditCustomerForm({
  customer,
  isOpen,
  onOpenChange,
  onCustomerUpdated,
}: EditCustomerFormProps) {
  const [firstName, setFirstName] = useState(customer?.first_name || "");
  const [lastName, setLastName] = useState(customer?.last_name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [birthdate, setBirthdate] = useState<Date | undefined>(
    customer?.birthdate ? new Date(customer.birthdate) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer?.id) {
      toast.error("Müşteri bilgileri bulunamadı");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updates = {
        id: customer.id,
        dukkan_id: customer.dukkan_id,
        first_name: firstName,
        last_name: lastName || null,
        phone: phone || null,
        birthdate: birthdate || null,
      };
      
      // Pass just the ID and the updates as separate parameters
      await musteriServisi.guncelle(customer.id, updates);
      
      toast.success("Müşteri bilgileri güncellendi");
      onCustomerUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Müşteri güncelleme hatası:", error);
      toast.error("Müşteri güncellenirken hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Müşteri Düzenle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Ad</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Soyad</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthdate">Doğum Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="birthdate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthdate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdate ? format(birthdate, "dd.MM.yyyy") : "Tarih Seç"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthdate}
                  onSelect={setBirthdate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
