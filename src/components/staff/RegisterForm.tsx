
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";
import { isletmeServisi, personelServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { EmploymentDetailsInputs } from "./EmploymentDetailsInputs";
import { ShopCodeInput } from "./ShopCodeInput";
import { RegisterSuccessModal } from "./RegisterSuccessModal";
import { validateStaffForm } from "@/utils/formValidation";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [percentage, setPercentage] = useState<number>(0);
  const [salary, setSalary] = useState<number>(0);
  const [personnelNumber, setPersonnelNumber] = useState("");
  const [system, setSystem] = useState("");
  const [shopCode, setShopCode] = useState("");
  
  // UI state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoadingShopCode, setIsLoadingShopCode] = useState(true);
  const [userShopCode, setUserShopCode] = useState<string | null>(null);
  
  // Fetch user's shop code if they are an admin
  useEffect(() => {
    const fetchUserShop = async () => {
      setIsLoadingShopCode(true);
      try {
        const userShop = await isletmeServisi.kullaniciIsletmesiniGetir();
        if (userShop) {
          setUserShopCode(userShop.kod);
          setShopCode(userShop.kod);
        }
      } catch (error) {
        console.error("İşletme kodu yüklenirken hata:", error);
      } finally {
        setIsLoadingShopCode(false);
      }
    };
    
    fetchUserShop();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name, phone, email, address, birthDate, personnelNumber, system, shopCode
    };
    const { errors: validationErrors, isValid } = validateStaffForm(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let shop;
      
      try {
        // First check if shop exists with the given code
        shop = await isletmeServisi.getirByKod(shopCode);
      } catch (error) {
        // Handle shop not found
        setErrors({
          shopCode: "İşletme bulunamadı. Lütfen geçerli bir işletme kodu giriniz."
        });
        setIsLoading(false);
        return;
      }
      
      if (!shop) {
        setErrors({
          shopCode: "İşletme bulunamadı. Lütfen geçerli bir işletme kodu giriniz."
        });
        setIsLoading(false);
        return;
      }
      
      // Now register the staff member
      await personelServisi.register({
        ad_soyad: name,
        telefon: phone,
        eposta: email,
        adres: address,
        birth_date: birthDate,
        prim_yuzdesi: percentage,
        maas: salary,
        personel_no: personnelNumber,
        calisma_sistemi: system,
        isletme_id: shop.kimlik,
        isletme_kodu: shopCode
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(`Kayıt sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <PersonalInfoInputs 
          name={name} setName={setName}
          phone={phone} setPhone={setPhone}
          email={email} setEmail={setEmail}
          address={address} setAddress={setAddress}
          birthDate={birthDate} setBirthDate={setBirthDate}
          errors={errors}
        />
        
        <EmploymentDetailsInputs
          percentage={percentage} setPercentage={setPercentage}
          salary={salary} setSalary={setSalary}
          personnelNumber={personnelNumber} setPersonnelNumber={setPersonnelNumber}
          system={system} setSystem={setSystem}
          errors={errors}
        />
        
        <ShopCodeInput
          isLoadingShopCode={isLoadingShopCode}
          userShopCode={userShopCode}
          shopCode={shopCode}
          setShopCode={setShopCode}
          errorMessage={errors.shopCode}
        />
        
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Personel kaydı oluştuktan sonra, personele davetiye e-postası gönderilecektir. Personel için hesap oluşturulması ve sisteme girişi için bu adımın tamamlanması gereklidir.
          </AlertDescription>
        </Alert>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor
            </>
          ) : (
            'Personel Ekle'
          )}
        </Button>
      </form>
      
      <RegisterSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        onSuccess={onSuccess || (() => {})}
      />
    </>
  );
}
