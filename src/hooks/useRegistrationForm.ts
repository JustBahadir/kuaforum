
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { KullaniciRol } from "@/lib/supabase/types";

interface RegistrationFormData {
  ad: string;
  soyad: string;
  telefon: string;
  rol: KullaniciRol;
}

interface RegistrationFormErrors {
  ad?: string;
  soyad?: string;
  telefon?: string;
  rol?: string;
  general?: string;
}

export function useRegistrationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    ad: "",
    soyad: "",
    telefon: "",
    rol: "musteri", // Default role
  });
  const [errors, setErrors] = useState<RegistrationFormErrors>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          console.error("Kullanıcı bilgisi alınamadı:", error);
          navigate("/login", { replace: true });
          return;
        }

        // User is logged in, now check if they have an existing profile
        const { data: existingProfile } = await supabase
          .from("kullanicilar")
          .select("*")
          .eq("auth_id", data.user.id)
          .maybeSingle();
        
        if (existingProfile) {
          // User already has a profile, redirect to appropriate page
          if (existingProfile.rol === "isletme_sahibi") {
            navigate("/isletme/anasayfa", { replace: true });
          } else if (existingProfile.rol === "personel") {
            navigate("/personel/anasayfa", { replace: true });
          } else {
            navigate("/musteri/anasayfa", { replace: true });
          }
          return;
        }

        // Populate form with user data from Google if available
        setUserData(data.user);
        if (data.user.user_metadata) {
          const { name = "", email = "" } = data.user.user_metadata;
          const nameParts = name.split(" ");
          
          setFormData(prev => ({
            ...prev,
            ad: nameParts[0] || "",
            soyad: nameParts.slice(1).join(" ") || "",
          }));
        }
      } catch (error) {
        console.error("Profile setup error:", error);
        toast.error("Profil bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: RegistrationFormErrors = {};
    
    if (!formData.ad) newErrors.ad = "Ad zorunludur";
    if (!formData.soyad) newErrors.soyad = "Soyad zorunludur";
    if (!formData.telefon) newErrors.telefon = "Telefon numarası zorunludur";
    if (!formData.rol) newErrors.rol = "Kullanıcı rolü zorunludur";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userData) return;
    
    setSubmitting(true);
    
    try {
      // Create user profile in kullanicilar table
      const { data, error } = await supabase
        .from("kullanicilar")
        .insert({
          auth_id: userData.id,
          ad: formData.ad,
          soyad: formData.soyad,
          telefon: formData.telefon,
          rol: formData.rol,
          profil_tamamlandi: true,
          eposta: userData.email,
          kimlik: userData.id, // Using auth ID as kimlik
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Profiliniz başarıyla oluşturuldu");
      
      // Redirect based on user role
      if (formData.rol === "isletme_sahibi") {
        navigate("/isletme/anasayfa", { replace: true });
      } else if (formData.rol === "personel") {
        navigate("/personel/anasayfa", { replace: true });
      } else {
        navigate("/musteri/anasayfa", { replace: true });
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      toast.error(`Profil kaydedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, rol: value as KullaniciRol }));
  };

  return {
    loading,
    submitting,
    formData,
    errors,
    handleSubmit,
    handleInputChange,
    handleSelectChange,
    navigate
  };
}
