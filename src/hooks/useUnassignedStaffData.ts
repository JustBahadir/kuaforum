
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface EducationData {
  ortaokuldurumu: string;
  lisedurumu: string;
  liseturu: string;
  meslekibrans: string;
  universitedurumu: string;
  universitebolum: string;
}

interface HistoryData {
  isyerleri: string;
  gorevpozisyon: string;
  belgeler: string;
  yarismalar: string;
  cv: string;
}

export function useUnassignedStaffData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [educationData, setEducationData] = useState<EducationData>({
    ortaokuldurumu: "",
    lisedurumu: "",
    liseturu: "",
    meslekibrans: "",
    universitedurumu: "",
    universitebolum: ""
  });
  const [historyData, setHistoryData] = useState<HistoryData>({
    isyerleri: "",
    gorevpozisyon: "",
    belgeler: "",
    yarismalar: "",
    cv: ""
  });

  // Numeric personel id state
  const [personelId, setPersonelId] = useState<number | null>(null);

  // Çıkış yapma fonksiyonu
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yaptınız.");
      navigate("/login");
    } catch (err) {
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  }, [navigate]);

  // Bilgileri kaydetme fonksiyonu
  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      // numeric id lazım
      if (!personelId) {
        toast.error("Personel kaydı bulunamadı.");
        setLoading(false);
        return;
      }
      // education
      await supabase.from("staff_education").upsert([
        {
          personel_id: personelId,
          ...educationData,
        }
      ], { onConflict: 'personel_id' });

      // history
      await supabase.from("staff_history").upsert([
        {
          personel_id: personelId,
          ...historyData,
        }
      ], { onConflict: 'personel_id' });

      toast.success("Bilgileriniz başarıyla kaydedildi.");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Bilgiler kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [personelId, educationData, historyData]);

  // Kullanıcı, personel ve diğer dataları yükle
  const loadUserAndStaffData = useCallback(async () => {
    console.log("Loading user and staff data...");
    setLoading(true);
    setError(null);
    
    try {
      // KULLANICI AUTH
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("User data error:", userError);
        setError("Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        navigate("/login");
        return;
      }
      
      if (!user) {
        console.error("No user found in session");
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        navigate("/login");
        return;
      }

      console.log("User found:", user.id);

      // PROFİL BİLGİSİ - Önce profil bilgilerini alalım
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Profile error, bu sayfanın çalışmasını engellemeyecek
      }
      
      if (profileData) {
        console.log("Profile data loaded:", profileData);
        setUserProfile(profileData);
      } else {
        // Profil yoksa user metadata kullan
        console.log("Using user metadata as profile fallback");
        setUserProfile({
          id: user.id,
          first_name: user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || '',
          last_name: user.user_metadata?.last_name || 
            (user.user_metadata?.name?.split(' ').length > 1 ? 
              user.user_metadata?.name?.split(' ').slice(1).join(' ') : 
              ''),
          email: user.email,
          role: user.user_metadata?.role || 'staff'
        });
      }

      // PERSONEL KAYDI KONTROL ET
      const { data: personel, error: perErr } = await supabase
        .from('personel')
        .select('id, dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (perErr) {
        console.error("Error fetching personel:", perErr);
      }

      // Personel kaydı yoksa oluştur
      if (!personel) {
        console.log("No personel record found, creating one");
        
        try {
          // Create basic personel record using profile data or user metadata
          const name = profileData ? 
            `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 
            user.user_metadata?.name || user.email?.split('@')[0] || 'Personel';
          
          const { data: newPersonel, error: createError } = await supabase
            .from('personel')
            .insert([{
              auth_id: user.id,
              ad_soyad: name,
              telefon: profileData?.phone || user.user_metadata?.phone || '-',
              eposta: user.email || '-',
              adres: profileData?.address || user.user_metadata?.address || '-',
              personel_no: `P${Date.now().toString().substring(8)}`,
              calisma_sistemi: 'Tam Zamanlı',
              maas: 0,
              prim_yuzdesi: 0
            }])
            .select('id');

          if (createError) {
            console.error("Personel record creation error:", createError);
            // Personel kaydı hatası olsa bile devam et
          } else if (newPersonel && newPersonel.length > 0) {
            setPersonelId(newPersonel[0].id);
            console.log("Created personel record with id:", newPersonel[0].id);
          }
        } catch (err) {
          console.error("Unexpected error creating personel:", err);
          // Hata olsa bile devam et, sayfanın çalışmasını engelleme
        }
      } else {
        console.log("Personel record found:", personel);
        // Personel kaydı varsa ID'yi kullan
        setPersonelId(personel.id);
        
        // ÇIKIŞ: DUKKAN ATAMASI VARSA HEMEN PROFİLE
        if (personel.dukkan_id) {
          console.log("Staff is assigned to a dukkan, redirecting");
          navigate("/staff-profile", { replace: true });
          return;
        }
      }

      // EĞİTİM BİLGİSİ - personel ID ile alınmalı
      if (personel?.id || personelId) {
        const id = personel?.id || personelId;
        console.log("Loading education data for personel:", id);
        
        const { data: educationDataLoaded } = await supabase
          .from('staff_education')
          .select('*')
          .eq('personel_id', id)
          .maybeSingle();
          
        if (educationDataLoaded) {
          console.log("Education data loaded");
          setEducationData(educationDataLoaded);
        }

        // GEÇMİŞ
        const { data: historyDataLoaded } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', id)
          .maybeSingle();
          
        if (historyDataLoaded) {
          console.log("History data loaded");
          setHistoryData(historyDataLoaded);
        }
      }

    } catch (error: any) {
      console.error("Unexpected error in loadUserAndStaffData:", error);
      // Bu hata mesajını göster ama yine de sayfanın çalışmasını engelleme
    } finally {
      console.log("Data loading complete");
      setLoading(false);
    }
  }, [navigate, personelId]);

  return {
    loading,
    error,
    userProfile,
    educationData,
    setEducationData,
    historyData,
    setHistoryData,
    handleLogout,
    handleSave,
    loadUserAndStaffData
  };
}
