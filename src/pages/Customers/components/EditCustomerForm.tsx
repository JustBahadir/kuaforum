
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
import { DatePickerField } from "./FormFields/DatePickerField";
import { useShopData } from "@/hooks/useShopData";

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
  dukkanId: propDukkanId
}: EditCustomerFormProps) {
  // Use either open or isOpen prop
  const dialogOpen = open !== undefined ? open : isOpen;
  const { isletmeData } = useShopData();
  
  const [firstName, setFirstName] = useState(customer.first_name || "");
  const [lastName, setLastName] = useState(customer.last_name || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [birthdate, setBirthdate] = useState<Date | undefined>(
    customer.birthdate ? new Date(customer.birthdate) : undefined
  );
  const [birthdateText, setBirthdateText] = useState<string>(
    customer.birthdate ? new Date(customer.birthdate).toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '.') : ''
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use dukkanId from props, customer, or from isletmeData
  const dukkanId = propDukkanId || customer.dukkan_id || isletmeData?.id;
  
  // Reset form when customer changes
  useEffect(() => {
    setFirstName(customer.first_name || "");
    setLastName(customer.last_name || "");
    setPhone(customer.phone || "");
    setBirthdate(
      customer.birthdate ? new Date(customer.birthdate) : undefined
    );
    setBirthdateText(
      customer.birthdate ? new Date(customer.birthdate).toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '.') : ''
    );
  }, [customer]);

  const handleSave = async () => {
    if (!firstName) {
      toast.error("Lütfen müşteri adı girin", {
        position: "bottom-right"
      });
      setErrors({ firstName: "Ad alanı zorunludur" });
      return;
    }

    try {
      setLoading(true);
      
      // If dukkanId is not passed, use the customer's existing dukkanId
      const shopId = dukkanId || customer.dukkan_id;
      
      if (!shopId) {
        toast.error("İşletme bilgisi bulunamadı", {
          position: "bottom-right"
        });
        return;
      }

      const updatePayload = {
        first_name: firstName,
        last_name: lastName || null,
        phone: phone || null,
        birthdate: birthdate ? birthdate.toISOString().split('T')[0] : null,
        dukkan_id: shopId,
      };

      console.log("Güncelleme verisi:", updatePayload);

      await musteriServisi.guncelle(customer.id, updatePayload);

      toast.success("Müşteri bilgileri başarıyla güncellendi", {
        position: "bottom-right"
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Müşteri güncellenirken hata:", JSON.stringify(error, null, 2));
      toast.error("Müşteri bilgileri güncellenemedi: " + (error.message || "Bilinmeyen hata"), {
        position: "bottom-right"
      });
    } finally {
      setLoading(false);
    }
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
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onPhoneChange={setPhone}
          errors={errors}
        />

        <DatePickerField
          value={birthdate}
          onChange={setBirthdate}
          textValue={birthdateText}
          onTextChange={setBirthdateText}
          label="Doğum Tarihi"
          id="birthdate"
          error={errors.birthdate}
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
