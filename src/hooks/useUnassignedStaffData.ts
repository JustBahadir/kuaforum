
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
  const isUserSaving = useRef(false);

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

      // Set user profile data with all available data sources
      setUserProfile({
        firstName: profileData?.first_name || user.user_metadata?.first_name || '',
        lastName: profileData?.last_name || user.user_metadata?.last_name || '',
        email: user.email || '',
        phone: profileData?.phone || user.user_metadata?.phone || '',
        gender: profileData?.gender || user.user_metadata?.gender || null,
        address: profileData?.address || user.user_metadata?.address || '',
        avatarUrl: profileData?.avatar_url || user.user_metadata?.avatar_url || ''
      });

      let staffId = null;
      const { data: personel, error: perErr } = await supabase
        .from('personel')
        .select('id, dukkan_id, ad_soyad, telefon, eposta, adres, avatar_url')
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
              prim_yuzdesi: 0,
              avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || ''
            }])
            .select('id');

          if (createError) {
            console.error("Personel record creation error:", createError);
          } else if (newPersonel && newPersonel.length > 0) {
            staffId = newPersonel[0].id;
            setPersonelId(newPersonel[0].id);
            console.log("Created personel record with id:", newPersonel[0].id);
            
            // After creating a new personel record, create empty education and history records
            const { error: eduInitError } = await supabase
              .from('staff_education')
              .insert({
                personel_id: staffId,
                ortaokuldurumu: '',
                lisedurumu: '',
                liseturu: '',
                meslekibrans: '',
                universitedurumu: '',
                universitebolum: ''
              });
            
            if (eduInitError) {
              console.error("Error creating initial education record:", eduInitError);
            }
            
            const { error: histInitError } = await supabase
              .from('staff_history')
              .insert({
                personel_id: staffId,
                isyerleri: '',
                gorevpozisyon: '',
                belgeler: '',
                yarismalar: '',
                cv: ''
              });
              
            if (histInitError) {
              console.error("Error creating initial history record:", histInitError);
            }
          }
        } catch (err) {
          console.error("Unexpected error creating personel:", err);
        }
      } else {
        console.log("Personel record found:", personel);
        staffId = personel.id;
        setPersonelId(personel.id);

        // Update userProfile with additional personel data if available
        if (personel.ad_soyad || personel.telefon || personel.adres || personel.avatar_url) {
          const currentProfile = { ...userProfile };
          if (!currentProfile.firstName && personel.ad_soyad) {
            const nameParts = personel.ad_soyad.split(' ');
            currentProfile.firstName = nameParts[0];
            currentProfile.lastName = nameParts.slice(1).join(' ');
          }
          if (!currentProfile.phone && personel.telefon && personel.telefon !== '-') {
            currentProfile.phone = personel.telefon;
          }
          if (!currentProfile.address && personel.adres && personel.adres !== '-') {
            currentProfile.address = personel.adres;
          }
          if (!currentProfile.avatarUrl && personel.avatar_url) {
            currentProfile.avatarUrl = personel.avatar_url;
          }
          setUserProfile(currentProfile);
        }
        
        if (personel.dukkan_id) {
          console.log("Staff is assigned to a dukkan, redirecting");
          navigate("/staff-profile", { replace: true });
          return;
        }
      }
      
      // If we have a personel ID, load education and history data
      if (staffId) {
        // Load education data
        const { data: educationDataLoaded, error: eduError } = await supabase
          .from('staff_education')
          .select('*')
          .eq('personel_id', staffId)
          .maybeSingle();
        
        if (eduError) {
          console.error("Error loading education data:", eduError);
          
          // If there was an error loading education data, try to create it
          if (eduError.code === 'PGRST116') {
            const { error: createEduError } = await supabase
              .from('staff_education')
              .insert({
                personel_id: staffId,
                ortaokuldurumu: '',
                lisedurumu: '',
                liseturu: '',
                meslekibrans: '',
                universitedurumu: '',
                universitebolum: ''
              });
            
            if (createEduError) {
              console.error("Error creating education data:", createEduError);
            }
          }
        } else if (educationDataLoaded) {
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

        // Load history data
        const { data: historyDataLoaded, error: histError } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', staffId)
          .maybeSingle();
        
        if (histError) {
          console.error("Error loading history data:", histError);
          
          // If there was an error loading history data, try to create it
          if (histError.code === 'PGRST116') {
            const { error: createHistError } = await supabase
              .from('staff_history')
              .insert({
                personel_id: staffId,
                isyerleri: '',
                gorevpozisyon: '',
                belgeler: '',
                yarismalar: '',
                cv: ''
              });
            
            if (createHistError) {
              console.error("Error creating history data:", createHistError);
            }
          }
        } else if (historyDataLoaded) {
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

      isDataLoaded.current = true;

    } catch (error: any) {
      console.error("Unexpected error in loadUserAndStaffData:", error);
      setError("Veri yüklenirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      isDataLoaded.current = false;
    } finally {
      console.log("Data loading complete");
      setLoading(false);
    }
  }, [navigate, userProfile]);

  const handleSave = useCallback(async (updatedData: any) => {
    // Prevent multiple simultaneous save operations
    if (isUserSaving.current) {
      return;
    }
    
    isUserSaving.current = true;
    setLoading(true);
    
    try {
      console.log("Saving data:", updatedData);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Update user metadata
      const userUpdateData: any = {};
      if ('firstName' in updatedData) userUpdateData.first_name = updatedData.firstName;
      if ('lastName' in updatedData) userUpdateData.last_name = updatedData.lastName;
      if ('phone' in updatedData) userUpdateData.phone = updatedData.phone;
      if ('gender' in updatedData) userUpdateData.gender = updatedData.gender;
      if ('address' in updatedData) userUpdateData.address = updatedData.address;
      if ('avatarUrl' in updatedData) userUpdateData.avatar_url = updatedData.avatarUrl;

      // Update auth user if we have metadata changes
      if (Object.keys(userUpdateData).length > 0) {
        const { error: updateUserError } = await supabase.auth.updateUser({
          data: userUpdateData
        });
        
        if (updateUserError) {
          console.error("Error updating user metadata:", updateUserError);
          throw updateUserError;
        }
      }

      let currentPersonelId = personelId;
      
      // If we don't have a personel ID, create a new personel record
      if (!currentPersonelId) {
        console.log("No personel ID found, creating personel record");
        
        const { data: newPersonel, error: createError } = await supabase
          .from('personel')
          .insert([{
            auth_id: user.id,
            ad_soyad: `${updatedData.firstName || ''} ${updatedData.lastName || ''}`.trim() || 'Personel',
            telefon: updatedData.phone || '-',
            eposta: user.email || '-',
            adres: updatedData.address || '-',
            personel_no: `P${Date.now().toString().substring(8)}`,
            calisma_sistemi: 'Tam Zamanlı',
            maas: 0,
            prim_yuzdesi: 0,
            avatar_url: updatedData.avatarUrl
          }])
          .select('id')
          .single();

        if (createError) {
          console.error("Error creating personel:", createError);
          throw createError;
        }

        if (newPersonel) {
          currentPersonelId = newPersonel.id;
          setPersonelId(newPersonel.id);
          console.log("Created new personel record with ID:", newPersonel.id);
          
          // Create initial empty records for education and history
          await supabase
            .from('staff_education')
            .insert({
              personel_id: currentPersonelId,
              ortaokuldurumu: '',
              lisedurumu: '',
              liseturu: '',
              meslekibrans: '',
              universitedurumu: '',
              universitebolum: ''
            });
          
          await supabase
            .from('staff_history')
            .insert({
              personel_id: currentPersonelId,
              isyerleri: '',
              gorevpozisyon: '',
              belgeler: '',
              yarismalar: '',
              cv: ''
            });
        } else {
          throw new Error("Failed to create personel record");
        }
      } else if ('firstName' in updatedData || 'lastName' in updatedData || 'phone' in updatedData || 'address' in updatedData || 'avatarUrl' in updatedData) {
        // Update the personel record if it exists and we have personal info updates
        const { error: updatePersonelError } = await supabase
          .from('personel')
          .update({
            ad_soyad: `${updatedData.firstName || ''} ${updatedData.lastName || ''}`.trim() || 'Personel',
            telefon: updatedData.phone || '-',
            adres: updatedData.address || '-',
            avatar_url: updatedData.avatarUrl || null
          })
          .eq('id', currentPersonelId);
        
        if (updatePersonelError) {
          console.error("Error updating personel:", updatePersonelError);
          throw updatePersonelError;
        }
      }

      // Check what type of data we're saving and update the appropriate table
      if ('ortaokuldurumu' in updatedData) {
        console.log("Saving education data for personel ID:", currentPersonelId);
        
        // Check if education record exists
        const { data: existingEdu, error: checkEduError } = await supabase
          .from('staff_education')
          .select('*')
          .eq('personel_id', currentPersonelId)
          .maybeSingle();
        
        if (checkEduError && checkEduError.code !== 'PGRST116') {
          console.error("Error checking education record:", checkEduError);
          throw checkEduError;
        }
        
        if (existingEdu) {
          // Update existing record
          const { error: eduError } = await supabase
            .from('staff_education')
            .update({
              ortaokuldurumu: updatedData.ortaokuldurumu || '',
              lisedurumu: updatedData.lisedurumu || '',
              liseturu: updatedData.liseturu || '',
              meslekibrans: updatedData.meslekibrans || '',
              universitedurumu: updatedData.universitedurumu || '',
              universitebolum: updatedData.universitebolum || '',
              updated_at: new Date().toISOString()
            })
            .eq('personel_id', currentPersonelId);

          if (eduError) {
            console.error("Education update error:", eduError);
            throw eduError;
          }
        } else {
          // Insert new record
          const { error: eduError } = await supabase
            .from('staff_education')
            .insert({
              personel_id: currentPersonelId,
              ortaokuldurumu: updatedData.ortaokuldurumu || '',
              lisedurumu: updatedData.lisedurumu || '',
              liseturu: updatedData.liseturu || '',
              meslekibrans: updatedData.meslekibrans || '',
              universitedurumu: updatedData.universitedurumu || '',
              universitebolum: updatedData.universitebolum || ''
            });

          if (eduError) {
            console.error("Education insert error:", eduError);
            throw eduError;
          }
        }
        
        // Update local state
        setEducationData({
          ortaokuldurumu: updatedData.ortaokuldurumu || '',
          lisedurumu: updatedData.lisedurumu || '',
          liseturu: updatedData.liseturu || '',
          meslekibrans: updatedData.meslekibrans || '',
          universitedurumu: updatedData.universitedurumu || '',
          universitebolum: updatedData.universitebolum || ''
        });
        toast.success("Eğitim bilgileriniz başarıyla güncellendi");
      } 
      else if ('isyerleri' in updatedData || 'belgeler' in updatedData || 'yarismalar' in updatedData || 'cv' in updatedData) {
        console.log("Saving history data for personel ID:", currentPersonelId);
        
        // Check if history record exists
        const { data: existingHist, error: checkHistError } = await supabase
          .from('staff_history')
          .select('*')
          .eq('personel_id', currentPersonelId)
          .maybeSingle();
        
        if (checkHistError && checkHistError.code !== 'PGRST116') {
          console.error("Error checking history record:", checkHistError);
          throw checkHistError;
        }
        
        // Build the update/insert object - combine existing data with updates
        const historyUpdateData = { ...historyData };
        if ('isyerleri' in updatedData) historyUpdateData.isyerleri = updatedData.isyerleri;
        if ('gorevpozisyon' in updatedData) historyUpdateData.gorevpozisyon = updatedData.gorevpozisyon;
        if ('belgeler' in updatedData) historyUpdateData.belgeler = updatedData.belgeler;
        if ('yarismalar' in updatedData) historyUpdateData.yarismalar = updatedData.yarismalar;
        if ('cv' in updatedData) historyUpdateData.cv = updatedData.cv;
        
        if (existingHist) {
          // Update existing record
          const { error: histError } = await supabase
            .from('staff_history')
            .update({
              ...historyUpdateData,
              updated_at: new Date().toISOString()
            })
            .eq('personel_id', currentPersonelId);

          if (histError) {
            console.error("History update error:", histError);
            throw histError;
          }
        } else {
          // Insert new record
          const { error: histError } = await supabase
            .from('staff_history')
            .insert({
              personel_id: currentPersonelId,
              ...historyUpdateData
            });

          if (histError) {
            console.error("History insert error:", histError);
            throw histError;
          }
        }
        
        // Update local state
        setHistoryData(historyUpdateData);
        toast.success("Geçmiş bilgileriniz başarıyla güncellendi");
      }
      else {
        // Just personal info updates, already handled above
        setUserProfile({
          ...userProfile,
          ...updatedData
        });
        toast.success("Kişisel bilgileriniz başarıyla güncellendi");
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("Bilgileriniz kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
      throw error;
    } finally {
      isUserSaving.current = false;
      setLoading(false);
    }
  }, [historyData, personelId, userProfile]);

  return {
    loading,
    error,
    userProfile,
    educationData,
    setEducationData,
    historyData,
    setHistoryData,
    personelId,
    handleLogout,
    handleSave,
    loadUserAndStaffData
  };
}
