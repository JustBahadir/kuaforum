
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormGroup, FormLabel, FormMessage } from "@/components/ui/form-elements";
import { InfoIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dukkanServisi, personelServisi } from "@/lib/supabase";
import { toast } from "sonner";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Loading state for shop code
  const [isLoadingShopCode, setIsLoadingShopCode] = useState(true);
  const [userShopCode, setUserShopCode] = useState<string | null>(null);
  
  // Fetch user's shop code if they are an admin
  useEffect(() => {
    const fetchUserShop = async () => {
      setIsLoadingShopCode(true);
      try {
        const userShop = await dukkanServisi.kullaniciDukkaniniGetir();
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
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name) newErrors.name = "Ad soyad zorunludur";
    if (!phone) newErrors.phone = "Telefon zorunludur";
    if (!email) newErrors.email = "E-posta zorunludur";
    if (email && !isValidEmail(email)) newErrors.email = "Geçerli bir e-posta adresi giriniz";
    if (!address) newErrors.address = "Adres zorunludur";
    if (!birthDate) newErrors.birthDate = "Doğum tarihi zorunludur";
    if (!personnelNumber) newErrors.personnelNumber = "Personel no zorunludur";
    if (!system) newErrors.system = "Çalışma sistemi zorunludur";
    if (!shopCode) newErrors.shopCode = "İşletme kodu zorunludur";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      let shop;
      
      try {
        // First check if shop exists with the given code
        shop = await dukkanServisi.getirByKod(shopCode);
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
        dukkan_id: shop.id,
        dukkan_kod: shopCode
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(`Kayıt sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    if (onSuccess) onSuccess();
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <FormGroup>
            <FormLabel>Personel No</FormLabel>
            <Input 
              value={personnelNumber} 
              onChange={(e) => setPersonnelNumber(e.target.value)} 
              placeholder="Personel No"
            />
            {errors.personnelNumber && <FormMessage>{errors.personnelNumber}</FormMessage>}
          </FormGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <FormGroup>
            <FormLabel>İşletme Kodu</FormLabel>
            {isLoadingShopCode ? (
              <div className="flex items-center space-x-2 h-10 px-3 rounded-md border border-input">
                <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                <Loader2 className="h-4 w-4 animate-spin ml-auto" />
              </div>
            ) : userShopCode ? (
              <div className="flex items-center space-x-2 h-10 px-3 rounded-md border border-input">
                <span>{userShopCode}</span>
              </div>
            ) : (
              <Input 
                value={shopCode} 
                onChange={(e) => setShopCode(e.target.value)} 
                placeholder="İşletme Kodu"
              />
            )}
            {errors.shopCode && <FormMessage>{errors.shopCode}</FormMessage>}
          </FormGroup>
        </div>
        
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
      
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personel Kaydı Başarılı</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Personel kaydı başarıyla oluşturulmuştur. Personelin sisteme giriş yapabilmesi için hesabını oluşturması gerekmektedir. Bu işlem için bir davetiye e-postası gönderilmiştir.
          </p>
          <DialogFooter>
            <Button onClick={handleCloseSuccessModal} className="w-full">
              Tamam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
