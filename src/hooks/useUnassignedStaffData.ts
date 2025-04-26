import { useState, useCallback, useRef } from "react";
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
  
  const [personelId, setPersonelId] = useState<number | null>(null);
  const isDataLoaded = useRef(false);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yaptınız.");
      navigate("/login");
    } catch (err) {
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  }, [navigate]);

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

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile fetch error:", profileError);
      }

      setUserProfile({
        firstName: profileData?.first_name || user.user_metadata?.first_name || '',
        lastName: profileData?.last_name || user.user_metadata?.last_name || '',
        email: user.email || '',
        phone: profileData?.phone || user.user_metadata?.phone || '',
        gender: profileData?.gender || user.user_metadata?.gender || null,
        address: profileData?.address || user.user_metadata?.address || '',
        avatarUrl: profileData?.avatar_url || user.user_metadata?.avatar_url || ''
      });

      const { data: personel, error: perErr } = await supabase
        .from('personel')
        .select('id, dukkan_id, ad_soyad, telefon, eposta, adres')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (perErr) {
        console.error("Error fetching personel:", perErr);
      }

      if (!personel) {
        console.log("No personel record found, creating one");
        
        try {
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
          } else if (newPersonel && newPersonel.length > 0) {
            setPersonelId(newPersonel[0].id);
            console.log("Created personel record with id:", newPersonel[0].id);
          }
        } catch (err) {
          console.error("Unexpected error creating personel:", err);
        }
      } else {
        console.log("Personel record found:", personel);
        setPersonelId(personel.id);

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
        
        if (personel.dukkan_id) {
          console.log("Staff is assigned to a dukkan, redirecting");
          navigate("/staff-profile", { replace: true });
          return;
        }
      }

      const { data: educationDataLoaded } = await supabase
        .from('staff_education')
        .select('*')
        .eq('personel_id', personel?.id || personelId)
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

      const { data: historyDataLoaded } = await supabase
        .from('staff_history')
        .select('*')
        .eq('personel_id', personel?.id || personelId)
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

  const handleSave = useCallback(async (updatedData: any) => {
    setLoading(true);
    try {
      console.log("Saving data:", updatedData);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (!personelId) {
        const { data: newPersonel, error: createError } = await supabase
          .from('personel')
          .insert([{
            auth_id: user.id,
            ad_soyad: `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Personel',
            telefon: userProfile?.phone || '-',
            eposta: user.email || '-',
            adres: userProfile?.address || '-',
            personel_no: `P${Date.now().toString().substring(8)}`,
            calisma_sistemi: 'Tam Zamanlı',
            maas: 0,
            prim_yuzdesi: 0,
            avatar_url: userProfile?.avatarUrl
          }])
          .select('id')
          .single();

        if (createError) {
          console.error("Error creating personel:", createError);
          throw createError;
        }

        if (newPersonel) {
          setPersonelId(newPersonel.id);
        }
      }

      if ('ortaokuldurumu' in updatedData) {
        const { error: eduError } = await supabase
          .from('staff_education')
          .upsert({
            personel_id: personelId,
            ...updatedData,
            updated_at: new Date().toISOString()
          }, { onConflict: 'personel_id' });

        if (eduError) throw eduError;
        
        setEducationData(updatedData);
        toast.success("Eğitim bilgileriniz başarıyla güncellendi");
      } 
      else if ('isyerleri' in updatedData) {
        const { data: existingHistory } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', personelId)
          .maybeSingle();

        if (existingHistory) {
          const { error: updateError } = await supabase
            .from('staff_history')
            .update({
              isyerleri: updatedData.isyerleri || '',
              gorevpozisyon: updatedData.gorevpozisyon || '',
              belgeler: updatedData.belgeler || '',
              yarismalar: updatedData.yarismalar || '',
              cv: updatedData.cv || '',
              updated_at: new Date().toISOString()
            })
            .eq('personel_id', personelId);

          if (updateError) {
            console.error("History update error:", updateError);
            throw updateError;
          }
        } else {
          const { error: insertError } = await supabase
            .from('staff_history')
            .insert([{
              personel_id: personelId,
              isyerleri: updatedData.isyerleri || '',
              gorevpozisyon: updatedData.gorevpozisyon || '',
              belgeler: updatedData.belgeler || '',
              yarismalar: updatedData.yarismalar || '',
              cv: updatedData.cv || ''
            }]);

          if (insertError) {
            console.error("History insert error:", insertError);
            throw insertError;
          }
        }

        setHistoryData(updatedData);
        toast.success("Geçmiş bilgileriniz başarıyla güncellendi");
      }
      else {
        await supabase.auth.updateUser({
          data: {
            first_name: updatedData.firstName,
            last_name: updatedData.lastName,
            gender: updatedData.gender,
            phone: updatedData.phone,
            address: updatedData.address
          }
        });

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

        if (personelId) {
          await supabase
            .from('personel')
            .update({
              ad_soyad: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
              telefon: updatedData.phone || '-',
              adres: updatedData.address || '-'
            })
            .eq('id', personelId);
        }

        setUserProfile({
          ...userProfile,
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          gender: updatedData.gender,
          phone: updatedData.phone,
          address: updatedData.address
        });
        
        toast.success("Bilgileriniz başarıyla güncellendi");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }, [personelId, userProfile]);

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
