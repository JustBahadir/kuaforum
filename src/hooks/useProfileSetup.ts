
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { KullaniciRol } from "@/lib/supabase/types";

interface ProfileFormData {
  ad: string;
  soyad: string;
  telefon: string;
  cinsiyet: string;
  rol: KullaniciRol;
  isletme_adi?: string;
  il?: string;
  isletme_kodu?: string;
}

interface FormErrors {
  ad?: string;
  soyad?: string;
  telefon?: string;
  rol?: string;
  isletme_adi?: string;
  il?: string;
  isletme_kodu?: string;
  general?: string;
}

export function useProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileFormData>({
    ad: "",
    soyad: "",
    telefon: "",
    cinsiyet: "",
    rol: "" as KullaniciRol,
    isletme_adi: "",
    il: "",
    isletme_kodu: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Format phone number for display
  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    
    // Remove non-digits
    const phoneNumber = value.replace(/[^\d]/g, "");
    
    // Format with spaces based on length
    if (phoneNumber.length <= 4) {
      return phoneNumber;
    } else if (phoneNumber.length <= 7) {
      return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4)}`;
    } else if (phoneNumber.length <= 9) {
      return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
    } else {
      return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7, 9)} ${phoneNumber.slice(9, 11)}`;
    }
  };

  // Handle phone input change, strip non-digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").substring(0, 11);
    setFormData({ ...formData, telefon: value });
  };

  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.ad.trim()) {
      newErrors.ad = "Ad alanı zorunludur";
    }

    if (!formData.soyad.trim()) {
      newErrors.soyad = "Soyad alanı zorunludur";
    }

    if (!formData.rol) {
      newErrors.rol = "Kullanıcı türü seçmelisiniz";
    }

    // Role-specific validations
    if (formData.rol === "isletme_sahibi") {
      if (!formData.isletme_adi?.trim()) {
        newErrors.isletme_adi = "İşletme adı zorunludur";
      }

      if (!formData.il) {
        newErrors.il = "İl seçmelisiniz";
      }
    }

    // Phone number validation if provided
    if (formData.telefon && formData.telefon.length < 10) {
      newErrors.telefon = "Telefon numarası en az 10 haneli olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile data
  const saveProfile = async (userId: string): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }
    
    setLoading(true);
    
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from("kullanicilar")
        .update({
          ad: formData.ad,
          soyad: formData.soyad,
          telefon: formData.telefon || null,
          rol: formData.rol,
          profil_tamamlandi: true
        })
        .eq("kimlik", userId);
      
      if (profileError) {
        throw profileError;
      }
      
      // Handle business owner workflow
      if (formData.rol === "isletme_sahibi") {
        // Generate a random business code (6 digits)
        const businessCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Create business record
        const { error: businessError } = await supabase
          .from("isletmeler")
          .insert({
            isletme_adi: formData.isletme_adi,
            isletme_kodu: businessCode,
            sahip_kimlik: userId,
            adres: formData.il ? `${formData.il}` : null
          });
        
        if (businessError) {
          throw businessError;
        }
        
        toast.success("Profil bilgileri kaydedildi. İşletme bilgilerinizi tamamlamak için yönlendiriliyorsunuz.");
        navigate("/isletme/olustur", { replace: true });
      } 
      // Handle personnel workflow
      else if (formData.rol === "personel") {
        // Create personnel record
        const { error: personnelError } = await supabase
          .from("personeller")
          .insert({
            kullanici_kimlik: userId,
            durum: "atanmadi"
          });
        
        if (personnelError) {
          throw personnelError;
        }
        
        // If business code provided, create an application
        if (formData.isletme_kodu?.trim()) {
          // Check if business code exists
          const { data: business, error: businessCheckError } = await supabase
            .from("isletmeler")
            .select("kimlik")
            .eq("isletme_kodu", formData.isletme_kodu.trim())
            .single();
          
          if (businessCheckError) {
            toast.error("Belirtilen işletme kodu bulunamadı");
            navigate("/personel/atanmamis", { replace: true });
            return true;
          }
          
          // Create application
          const { error: applicationError } = await supabase
            .from("personel_basvurulari")
            .insert({
              kullanici_kimlik: userId,
              isletme_kodu: formData.isletme_kodu.trim(),
              durum: "beklemede",
              tarih: new Date().toISOString().split('T')[0]
            });
          
          if (applicationError) {
            throw applicationError;
          }
          
          toast.success("Başvuru gönderildi. İşletme sahibi başvurunuzu değerlendirdikten sonra bilgilendirileceksiniz.");
          navigate("/personel/beklemede", { replace: true });
        } else {
          toast.success("Profil bilgileri kaydedildi. Personel bilgilerinizi tamamlamak için yönlendiriliyorsunuz.");
          navigate("/personel/atanmamis", { replace: true });
        }
      }
      
      return true;
    } catch (error: any) {
      console.error("Profile save error:", error);
      setErrors({
        general: `Bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      });
      
      toast.error("Profil bilgileri kaydedilemedi");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    loading,
    formatPhoneNumber,
    handlePhoneChange,
    handleInputChange,
    handleSelectChange,
    validateForm,
    saveProfile
  };
}
