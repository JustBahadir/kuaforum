
import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { CustomerFormFields } from "./FormFields/CustomerFormFields";
import { CustomerFormActions } from "./FormFields/CustomerFormActions";
import { musteriServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { Musteri } from "@/lib/supabase/types";

export interface EditCustomerFormProps {
  customer: Musteri;
  open?: boolean; // Support both open and isOpen
  isOpen?: boolean; // Support both open and isOpen
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  dukkanId?: number;
}

export function EditCustomerForm({ 
  customer, 
  open, 
  isOpen,
  onOpenChange, 
  onSuccess,
  dukkanId
}: EditCustomerFormProps) {
  // Use either open or isOpen prop
  const dialogOpen = open !== undefined ? open : isOpen;
  
  const [firstName, setFirstName] = useState(customer.first_name || "");
  const [lastName, setLastName] = useState(customer.last_name || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [birthdate, setBirthdate] = useState<string | undefined>(
    customer.birthdate ? new Date(customer.birthdate).toISOString().split('T')[0] : undefined
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset form when customer changes
  useEffect(() => {
    setFirstName(customer.first_name || "");
    setLastName(customer.last_name || "");
    setPhone(customer.phone || "");
    setBirthdate(
      customer.birthdate ? new Date(customer.birthdate).toISOString().split('T')[0] : undefined
    );
  }, [customer]);

  const handleSave = async () => {
    if (!firstName) {
      toast.error("Lütfen müşteri adı girin");
      setErrors({ firstName: "Ad alanı zorunludur" });
      return;
    }

    try {
      setLoading(true);
      
      // If dukkanId is not passed, use the customer's existing dukkanId
      const shopId = dukkanId || customer.dukkan_id;

      await musteriServisi.guncelle(customer.id, {
        first_name: firstName,
        last_name: lastName || null,
        phone: phone || null,
        birthdate: birthdate || null,
        dukkan_id: shopId,
      });
      
      toast.success("Müşteri bilgileri güncellendi");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Müşteri güncellenirken hata:", error);
      toast.error("Müşteri bilgileri güncellenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (errors.firstName) setErrors({ ...errors, firstName: '' });
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (errors.lastName) setErrors({ ...errors, lastName: '' });
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errors.phone) setErrors({ ...errors, phone: '' });
  };

  const handleBirthdateChange = (value: string) => {
    setBirthdate(value);
    if (errors.birthdate) setErrors({ ...errors, birthdate: '' });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Müşteri Düzenle</DialogTitle>
        </DialogHeader>

        <CustomerFormFields
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          birthdate={birthdate}
          onFirstNameChange={handleFirstNameChange}
          onLastNameChange={handleLastNameChange}
          onPhoneChange={handlePhoneChange}
          onBirthdateChange={handleBirthdateChange}
          errors={errors}
        />

        <CustomerFormActions
          onCancel={() => onOpenChange(false)}
          actionText="Güncelle"
          isSubmitting={loading}
          disabled={!firstName}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
}
