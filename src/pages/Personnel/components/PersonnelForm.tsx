
import { useState, useEffect } from "react";
import { Personel } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PersonnelFormProps {
  onSubmit: (data: Omit<Personel, 'id' | 'created_at'>) => void;
  isLoading: boolean;
}

export function PersonnelForm({ onSubmit, isLoading }: PersonnelFormProps) {
  const { dukkanId, userRole } = useCustomerAuth();
  const [yeniPersonel, setYeniPersonel] = useState<Omit<Personel, 'id' | 'created_at'>>({
    ad_soyad: "",
    telefon: "",
    eposta: "",
    adres: "",
    personel_no: "",
    maas: 0,
    calisma_sistemi: "aylik",
    prim_yuzdesi: 0,
    dukkan_id: dukkanId || undefined
  });
  
  // For staff joining via invitation
  const [dukkanKodu, setDukkanKodu] = useState("");
  const [dogrulamaYapiliyor, setDogrulamaYapiliyor] = useState(false);
  const [dogrulanmisDukkan, setDogrulanmisDukkan] = useState<{id: number, ad: string} | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Update dukkan_id when it changes in auth context
  useEffect(() => {
    if (dukkanId) {
      setYeniPersonel(prev => ({
        ...prev,
        dukkan_id: dukkanId
      }));
    }
  }, [dukkanId]);
  
  // Verify shop code
  const handleVerifyShopCode = async () => {
    if (!dukkanKodu) {
      toast.error("Lütfen dükkan kodunu girin");
      return;
    }
    
    setDogrulamaYapiliyor(true);
    setFormError(null);
    
    try {
      const dukkan = await authService.verifyShopCode(dukkanKodu);
      
      if (dukkan) {
        setDogrulanmisDukkan(dukkan);
        setYeniPersonel(prev => ({
          ...prev,
          dukkan_id: dukkan.id
        }));
        toast.success(`"${dukkan.ad}" dükkanı doğrulandı!`);
      } else {
        setDogrulanmisDukkan(null);
        toast.error("Geçersiz dükkan kodu");
        setFormError("Girdiğiniz dükkan kodu sistemde bulunamadı. Lütfen kodu kontrol edip tekrar deneyiniz.");
      }
    } catch (error) {
      console.error("Dükkan kodu doğrulama hatası:", error);
      toast.error("Dükkan kodu doğrulanırken bir hata oluştu");
      setFormError("Dükkan kodu doğrulanırken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
    } finally {
      setDogrulamaYapiliyor(false);
    }
  };

  const validateFormFields = () => {
    // Reset form error
    setFormError(null);
    
    // Admin form validation
    if (userRole === 'admin') {
      if (!dukkanId) {
        setFormError("Personel eklemek için bir dükkana bağlı olmanız gerekmektedir.");
        return false;
      }
      
      if (!yeniPersonel.ad_soyad) {
        setFormError("Ad Soyad alanı gereklidir.");
        return false;
      }
      
      if (!yeniPersonel.telefon) {
        setFormError("Telefon alanı gereklidir.");
        return false;
      }
      
      if (!yeniPersonel.eposta) {
        setFormError("E-posta alanı gereklidir.");
        return false;
      }
    } 
    // Staff form validation
    else {
      if (!dogrulanmisDukkan) {
        setFormError("Lütfen önce dükkan kodunu doğrulayın.");
        return false;
      }
      
      if (!yeniPersonel.ad_soyad) {
        setFormError("Ad Soyad alanı gereklidir.");
        return false;
      }
      
      if (!yeniPersonel.telefon) {
        setFormError("Telefon alanı gereklidir.");
        return false;
      }
      
      if (!yeniPersonel.eposta) {
        setFormError("E-posta alanı gereklidir.");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!validateFormFields()) {
      return;
    }
    
    // For admin adding staff to their own shop
    if (userRole === 'admin') {
      // Ensure dukkan_id is set
      const personelData = {
        ...yeniPersonel,
        dukkan_id: dukkanId || undefined
      };
      
      if (!personelData.dukkan_id) {
        setFormError("Personel eklemek için bir dükkana bağlı olmanız gerekmektedir.");
        return;
      }
      
      onSubmit(personelData);
      return;
    }
    
    // For staff joining via invitation
    if (!dogrulanmisDukkan) {
      setFormError("Lütfen önce dükkan kodunu doğrulayın");
      return;
    }
    
    // Personnel joining with shop code
    const personelData = {
      ...yeniPersonel,
      dukkan_id: dogrulanmisDukkan.id
    };
    
    onSubmit(personelData);
  };

  // Show different form based on role
  if (userRole === 'admin') {
    // Admin adding personnel to their shop
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="ad_soyad">Ad Soyad</Label>
          <Input
            id="ad_soyad"
            value={yeniPersonel.ad_soyad}
            onChange={(e) =>
              setYeniPersonel((prev) => ({
                ...prev,
                ad_soyad: e.target.value,
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefon">Telefon</Label>
          <Input
            id="telefon"
            type="tel"
            value={yeniPersonel.telefon}
            onChange={(e) =>
              setYeniPersonel((prev) => ({
                ...prev,
                telefon: e.target.value,
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eposta">E-posta</Label>
          <Input
            id="eposta"
            type="email"
            value={yeniPersonel.eposta}
            onChange={(e) =>
              setYeniPersonel((prev) => ({
                ...prev,
                eposta: e.target.value,
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adres">Adres</Label>
          <Input
            id="adres"
            value={yeniPersonel.adres}
            onChange={(e) =>
              setYeniPersonel((prev) => ({
                ...prev,
                adres: e.target.value,
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maas">Maaş</Label>
          <Input
            id="maas"
            type="number"
            value={yeniPersonel.maas}
            onChange={(e) =>
              setYeniPersonel((prev) => ({
                ...prev,
                maas: Number(e.target.value),
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="calisma_sistemi">Çalışma Sistemi</Label>
          <Select
            value={yeniPersonel.calisma_sistemi}
            onValueChange={(value) =>
              setYeniPersonel((prev) => ({
                ...prev,
                calisma_sistemi: value as "haftalik" | "aylik",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Çalışma Sistemi Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="haftalik">Haftalık</SelectItem>
              <SelectItem value="aylik">Aylık</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prim_yuzdesi">Prim Yüzdesi</Label>
          <Input
            id="prim_yuzdesi"
            type="number"
            value={yeniPersonel.prim_yuzdesi}
            onChange={(e) =>
              setYeniPersonel((prev) => ({
                ...prev,
                prim_yuzdesi: Number(e.target.value),
              }))
            }
            required
          />
        </div>
        <Button type="submit" disabled={isLoading || !dukkanId} className="w-full">
          {isLoading ? "Ekleniyor..." : "Personel Ekle"}
        </Button>
        {!dukkanId && (
          <p className="text-xs text-red-500 text-center">
            Personel eklemek için bir dükkana bağlı olmanız gerekmektedir.
          </p>
        )}
      </form>
    );
  } else {
    // Personnel joining via invitation
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2 mb-6">
          <Label htmlFor="dukkan_kodu">Dükkan Kodu</Label>
          <div className="flex space-x-2">
            <Input
              id="dukkan_kodu"
              value={dukkanKodu}
              onChange={(e) => setDukkanKodu(e.target.value)}
              placeholder="Dükkan yöneticisinden alınan kod"
              disabled={!!dogrulanmisDukkan}
              required
            />
            <Button 
              type="button" 
              onClick={handleVerifyShopCode} 
              disabled={dogrulamaYapiliyor || !!dogrulanmisDukkan || !dukkanKodu}
              variant="outline"
            >
              {dogrulamaYapiliyor ? "..." : "Doğrula"}
            </Button>
          </div>
          {dogrulanmisDukkan && (
            <p className="text-sm text-green-600 mt-1">
              "{dogrulanmisDukkan.ad}" dükkanına bağlanacaksınız.
            </p>
          )}
        </div>

        {dogrulanmisDukkan && (
          <>
            <div className="space-y-2">
              <Label htmlFor="ad_soyad">Ad Soyad</Label>
              <Input
                id="ad_soyad"
                value={yeniPersonel.ad_soyad}
                onChange={(e) =>
                  setYeniPersonel((prev) => ({
                    ...prev,
                    ad_soyad: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                value={yeniPersonel.telefon}
                onChange={(e) =>
                  setYeniPersonel((prev) => ({
                    ...prev,
                    telefon: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eposta">E-posta</Label>
              <Input
                id="eposta"
                type="email"
                value={yeniPersonel.eposta}
                onChange={(e) =>
                  setYeniPersonel((prev) => ({
                    ...prev,
                    eposta: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adres">Adres</Label>
              <Input
                id="adres"
                value={yeniPersonel.adres}
                onChange={(e) =>
                  setYeniPersonel((prev) => ({
                    ...prev,
                    adres: e.target.value,
                  }))
                }
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full"
            >
              {isLoading ? "Kaydediliyor..." : "Personel Kaydı Oluştur"}
            </Button>
          </>
        )}
      </form>
    );
  }
}
