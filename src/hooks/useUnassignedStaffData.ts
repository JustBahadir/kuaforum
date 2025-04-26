import { useState, useCallback, useEffect, useRef } from "react";
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
  
  // Veri yüklendi mi kontrolü için bir ref
  const isDataLoaded = useRef(false);

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
  const handleSave = useCallback(async (updatedData: any) => {
    setLoading(true);
    try {
      // Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          first_name: updatedData.firstName,
          last_name: updatedData.lastName,
          gender: updatedData.gender,
          phone: updatedData.phone,
          address: updatedData.address
        }
      });

      // Update profiles table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            first_name: updatedData.firstName,
            last_name: updatedData.lastName,
            gender: updatedData.gender,
            phone: updatedData.phone,
            address: updatedData.address,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      // Reload user data
      await loadUserAndStaffData();
      
      toast.success("Bilgileriniz başarıyla güncellendi");
    } catch (err) {
      console.error("Kayıt hatası:", err);
      toast.error("Bilgiler kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [loadUserAndStaffData]);

  // Kullanıcı ve personel verilerini yükle
  const loadUserAndStaffData = useCallback(async () => {
    if (isDataLoaded.current && userProfile) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError("Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        navigate("/login");
        return;
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile fetch error:", profileError);
      }

      // Set user profile combining auth and profile data
      setUserProfile({
        firstName: profileData?.first_name || user.user_metadata?.first_name || '',
        lastName: profileData?.last_name || user.user_metadata?.last_name || '',
        email: user.email || '',
        phone: profileData?.phone || user.user_metadata?.phone || '',
        gender: profileData?.gender || user.user_metadata?.gender || null,
        address: profileData?.address || user.user_metadata?.address || '',
        avatarUrl: profileData?.avatar_url || user.user_metadata?.avatar_url || ''
      });

      // PERSONEL KAYDI KONTROL ET
      const { data: personel, error: perErr } = await supabase
        .from('personel')
        .select('id, dukkan_id, ad_soyad, telefon, eposta, adres')
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

        // Update user profile with personel data if missing
        if (personel.ad_soyad || personel.telefon || personel.adres) {
          const currentProfile = { ...userProfile };
          if (!currentProfile.firstName && personel.ad_soyad) {
            const nameParts = personel.ad_soyad.split(' ');
            currentProfile.firstName = nameParts[0];
            currentProfile.lastName = nameParts.slice(1).join(' ');
          }
          if (!currentProfile.phone && personel.telefon) {
            currentProfile.phone = personel.telefon;
          }
          if (!currentProfile.address && personel.adres) {
            currentProfile.address = personel.adres;
          }
          setUserProfile(currentProfile);
        }
        
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
          console.log("Education data loaded", educationDataLoaded);
          setEducationData({
            ortaokuldurumu: educationDataLoaded.ortaokuldurumu || '',
            lisedurumu: educationDataLoaded.lisedurumu || '',
            liseturu: educationDataLoaded.liseturu || '',
            meslekibrans: educationDataLoaded.meslekibrans || '',
            universitedurumu: educationDataLoaded.universitedurumu || '',
            universitebolum: educationDataLoaded.universitebolum || ''
          });
        }

        // GEÇMİŞ
        const { data: historyDataLoaded } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', id)
          .maybeSingle();
          
        if (historyDataLoaded) {
          console.log("History data loaded", historyDataLoaded);
          setHistoryData({
            isyerleri: historyDataLoaded.isyerleri || '',
            gorevpozisyon: historyDataLoaded.gorevpozisyon || '',
            belgeler: historyDataLoaded.belgeler || '',
            yarismalar: historyDataLoaded.yarismalar || '',
            cv: historyDataLoaded.cv || ''
          });
        }
      }

      // Veriler yüklendi olarak işaretle
      isDataLoaded.current = true;

    } catch (error: any) {
      console.error("Unexpected error in loadUserAndStaffData:", error);
      setError("Veri yüklenirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      isDataLoaded.current = false;
    } finally {
      console.log("Data loading complete");
      setLoading(false);
    }
  }, [navigate, personelId, userProfile]);

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
