
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
      ], { onConflict: 'personel_id' }); // onConflict should be string, not string[]

      // history
      await supabase.from("staff_history").upsert([
        {
          personel_id: personelId,
          ...historyData,
        }
      ], { onConflict: 'personel_id' }); // onConflict should be string, not string[]

      toast.success("Bilgileriniz başarıyla kaydedildi.");
    } catch (err) {
      setError("Bilgiler kaydedilirken bir hata oluştu.");
      toast.error("Bilgiler kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [personelId, educationData, historyData]);

  // Kullanıcı, personel ve diğer dataları yükle
  const loadUserAndStaffData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // KULLANICI AUTH
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Kullanıcı bilgisi alınamadı.");
        navigate("/login");
        setLoading(false);
        return;
      }

      // PERSONEL KAYDI KONTROL ET
      const { data: personel, error: perErr } = await supabase
        .from('personel')
        .select('id, dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();

      // Personel kaydı yoksa oluştur - FIX: Eğer personel yoksa otomatik oluştur
      if (!personel) {
        console.log("Creating personel record for staff user", user.id);
        // Create basic personel record
        const { data: newPersonel, error: createError } = await supabase
          .from('personel')
          .insert([{
            auth_id: user.id,
            ad_soyad: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Personel',
            telefon: user.user_metadata?.phone || '-',
            eposta: user.email || '-',
            adres: user.user_metadata?.address || '-',
            personel_no: `P${Date.now().toString().substring(8)}`,
            calisma_sistemi: 'Tam Zamanlı',
            maas: 0,
            prim_yuzdesi: 0
          }])
          .select('id')
          .single();

        if (createError) {
          console.error("Personel kaydı oluşturulamadı:", createError);
          setError("Personel kaydı oluşturulamadı. Lütfen sistem yöneticisine başvurun.");
          setLoading(false);
          return;
        }

        setPersonelId(newPersonel.id);
        console.log("Created personel record with id:", newPersonel.id);
      } else {
        // Personel kaydı varsa ID'yi kullan
        setPersonelId(personel.id);
        
        // ÇIKIŞ: DUKKAN ATAMASI VARSA HEMEN PROFİLE
        if (personel.dukkan_id) {
          navigate("/staff-profile", { replace: true });
          return;
        }
      }

      // PROFİL BİLGİSİ
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setUserProfile(profileData);

      // EĞİTİM BİLGİSİ - personel ID ile alınmalı
      if (personel || personelId) {
        const personelIdValue = personel?.id || personelId;
        
        const { data: educationDataLoaded } = await supabase
          .from('staff_education')
          .select('*')
          .eq('personel_id', personelIdValue)
          .maybeSingle();
        if (educationDataLoaded) setEducationData(educationDataLoaded);

        // GEÇMİŞ
        const { data: historyDataLoaded } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', personelIdValue)
          .maybeSingle();
        if (historyDataLoaded) setHistoryData(historyDataLoaded);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setError("Beklenmeyen bir hata oluştu.");
      setLoading(false);
    }
  }, [navigate]);

  // Initial load
  useEffect(() => {
    loadUserAndStaffData();
  }, [loadUserAndStaffData]);

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
