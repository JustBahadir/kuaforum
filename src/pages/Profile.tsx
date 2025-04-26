
import React, { useState, useEffect } from "react";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { StaffLayout } from "@/components/ui/staff-layout";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import ProfileTabs from "@/pages/ProfileTabs";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: null as ("erkek" | "kadın" | null),
    birthdate: "",
    avatarUrl: "",
    address: "",
    iban: "",
    role: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [educationData, setEducationData] = useState({
    ortaokuldurumu: "",
    lisedurumu: "",
    liseturu: "",
    meslekibrans: "",
    universitedurumu: "",
    universitebolum: ""
  });
  const [historyData, setHistoryData] = useState({
    isyerleri: "",
    gorevpozisyon: "",
    belgeler: "",
    yarismalar: "",
    cv: ""
  });
  const [loadingEduHist, setLoadingEduHist] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("Kullanıcı bilgisi alınamadı");
        return;
      }

      setProfile(prev => ({
        ...prev,
        email: user.email || "",
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        phone: user.user_metadata?.phone ? formatPhoneNumber(user.user_metadata.phone) : "",
        gender: user.user_metadata?.gender || null,
        birthdate: user.user_metadata?.birthdate || "",
        avatarUrl: user.user_metadata?.avatar_url || "",
        address: user.user_metadata?.address || "",
        iban: user.user_metadata?.iban || "",
        role: user.user_metadata?.role || ""
      }));

      try {
        const profileData = await profilServisi.getir();

        if (profileData) {
          setProfile(prev => ({
            ...prev,
            firstName: profileData.first_name || prev.firstName,
            lastName: profileData.last_name || prev.lastName,
            phone: profileData.phone ? formatPhoneNumber(profileData.phone) : prev.phone,
            gender: profileData.gender as "erkek" | "kadın" | null || prev.gender,
            birthdate: profileData.birthdate || prev.birthdate,
            avatarUrl: profileData.avatar_url || prev.avatarUrl,
            address: profileData.address || prev.address,
            iban: profileData.iban || prev.iban
          }));
        }
      } catch (error) {
        console.error("Profile data fetch error:", error);
        // Handle error silently
      }

      setLoadingEduHist(true);
      try {
        if (!user.id) {
          setLoadingEduHist(false);
          return;
        }

        const { data: personelData, error: personelError } = await supabase
          .from("personel")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle();

        let personelId = personelData?.id;
        if (!personelId) {
          const { data: newPersonel, error: createError } = await supabase
            .from("personel")
            .insert([{
              auth_id: user.id,
              ad_soyad: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Personel',
              telefon: profile.phone?.replace(/\s/g, "") || '-',
              eposta: user.email || '-',
              adres: profile.address || '-',
              personel_no: `P${Date.now().toString().substring(8)}`,
              calisma_sistemi: 'Tam Zamanlı',
              maas: 0,
              prim_yuzdesi: 0
            }])
            .select("id");

          if (createError) {
            console.error("Error creating personel record:", createError);
            toast.error("Personel kaydı oluşturulamadı");
          } else if (newPersonel && newPersonel.length > 0) {
            personelId = newPersonel[0].id;
            console.log("Created new personel record with ID:", personelId);
          }
        }

        if (personelId) {
          const { data: eduData, error: eduError } = await supabase
            .from("staff_education")
            .select("*")
            .eq("personel_id", personelId)
            .maybeSingle();

          if (!eduError && eduData) {
            setEducationData({
              ortaokuldurumu: eduData.ortaokuldurumu || "",
              lisedurumu: eduData.lisedurumu || "",
              liseturu: eduData.liseturu || "",
              meslekibrans: eduData.meslekibrans || "",
              universitedurumu: eduData.universitedurumu || "",
              universitebolum: eduData.universitebolum || ""
            });
          } else {
            const { error: createEduError } = await supabase
              .from("staff_education")
              .insert({
                personel_id: personelId,
                ortaokuldurumu: "",
                lisedurumu: "",
                liseturu: "",
                meslekibrans: "",
                universitedurumu: "",
                universitebolum: ""
              });
            
            if (createEduError && createEduError.code !== '23505') {
              console.error("Error creating initial education record:", createEduError);
            }
          }

          const { data: histData, error: histError } = await supabase
            .from("staff_history")
            .select("*")
            .eq("personel_id", personelId)
            .maybeSingle();

          if (!histError && histData) {
            setHistoryData({
              isyerleri: histData.isyerleri || "",
              gorevpozisyon: histData.gorevpozisyon || "",
              belgeler: histData.belgeler || "",
              yarismalar: histData.yarismalar || "",
              cv: histData.cv || ""
            });
          } else {
            const { error: createHistError } = await supabase
              .from("staff_history")
              .insert({
                personel_id: personelId,
                isyerleri: "",
                gorevpozisyon: "",
                belgeler: "",
                yarismalar: "",
                cv: ""
              });
            
            if (createHistError && createHistError.code !== '23505') {
              console.error("Error creating initial history record:", createHistError);
            }
          }
        }
      } catch (error) {
        console.error("Staff education/history fetch error:", error);
      } finally {
        setLoadingEduHist(false);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Profil bilgileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      setIsUploading(true);
      setProfile(prev => ({ ...prev, avatarUrl: url }));

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: url }
      });

      if (authError) {
        throw authError;
      }

      // Fix here: profilServisi.guncelle() now returns a boolean or object, not an object with error property
      const result = await profilServisi.guncelle({
        avatar_url: url
      });

      if (result === false) {
        throw new Error("Profil güncellenemedi");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: personelData } = await supabase
          .from("personel")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (personelData?.id) {
          const { error: personelUpdateError } = await supabase
            .from("personel")
            .update({ avatar_url: url })
            .eq("id", personelData.id);

          if (personelUpdateError) {
            console.error("Error updating personel avatar:", personelUpdateError);
          }
        }
      }

      toast.success("Profil fotoğrafı başarıyla güncellendi");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Profil fotoğrafı yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setProfile(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "gender") {
      setProfile(prev => ({
        ...prev,
        [name]: value ? (value as "erkek" | "kadın") : null
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const phoneForSaving = profile.phone.replace(/\s/g, "");

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: phoneForSaving,
          gender: profile.gender,
          birthdate: profile.birthdate,
          avatar_url: profile.avatarUrl,
          address: profile.address,
          iban: profile.iban
        }
      });

      if (authError) {
        throw authError;
      }

      // Fix here: profilServisi.guncelle() now returns a boolean or object, not an object with error property
      const result = await profilServisi.guncelle({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: phoneForSaving,
        gender: profile.gender,
        birthdate: profile.birthdate,
        avatar_url: profile.avatarUrl,
        address: profile.address,
        iban: profile.iban
      });

      if (result === false) {
        throw new Error("Profil güncellenemedi");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: personelData } = await supabase
          .from("personel")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (personelData?.id) {
          const { error: personelUpdateError } = await supabase
            .from("personel")
            .update({
              ad_soyad: `${profile.firstName} ${profile.lastName}`.trim(),
              telefon: phoneForSaving,
              adres: profile.address || '-',
              avatar_url: profile.avatarUrl
            })
            .eq("id", personelData.id);

          if (personelUpdateError) {
            console.error("Error updating personel record:", personelUpdateError);
          }
        }
      }

      toast.success("Profil bilgileriniz başarıyla güncellendi");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEducationChange = (newData: typeof educationData) => {
    setEducationData(newData);
  };
  
  const handleHistoryChange = (newData: typeof historyData) => {
    setHistoryData(newData);
  };

  const handleSaveEducationHistory = async () => {
    setLoadingEduHist(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        toast.error("Kullanıcı bilgisi alınamadı");
        return;
      }

      let personelId;
      const { data: personelData, error: personelError } = await supabase
        .from('personel')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (personelError) {
        console.error("Error fetching personel:", personelError);
        toast.error("Personel bilgisi alınamadı");
        return;
      }

      if (!personelData) {
        const { data: newPersonel, error: createError } = await supabase
          .from('personel')
          .insert([{
            auth_id: user.id,
            ad_soyad: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Personel',
            telefon: profile.phone?.replace(/\s/g, "") || '-',
            eposta: user.email || '-',
            adres: profile.address || '-',
            personel_no: `P${Date.now().toString().substring(8)}`,
            calisma_sistemi: 'Tam Zamanlı',
            maas: 0,
            prim_yuzdesi: 0,
            avatar_url: profile.avatarUrl || ''
          }])
          .select('id');

        if (createError) {
          console.error("Personel record creation error:", createError);
          toast.error("Personel kaydı oluşturulamadı");
          return;
        } 
        
        if (!newPersonel || newPersonel.length === 0) {
          toast.error("Personel kaydı oluşturulamadı");
          return;
        }
        
        personelId = newPersonel[0].id;
      } else {
        personelId = personelData.id;
      }

      const { data: existingEdu, error: checkEduError } = await supabase
        .from("staff_education")
        .select("personel_id")
        .eq("personel_id", personelId)
        .maybeSingle();
      
      let eduUpsertResult;
      if (!existingEdu) {
        eduUpsertResult = await supabase
          .from("staff_education")
          .insert({
            personel_id: personelId,
            ...educationData,
            updated_at: new Date().toISOString(),
          });
      } else {
        eduUpsertResult = await supabase
          .from("staff_education")
          .update({
            ...educationData,
            updated_at: new Date().toISOString(),
          })
          .eq("personel_id", personelId);
      }

      const { data: existingHist, error: checkHistError } = await supabase
        .from("staff_history")
        .select("personel_id")
        .eq("personel_id", personelId)
        .maybeSingle();
      
      let histUpsertResult;
      if (!existingHist) {
        histUpsertResult = await supabase
          .from("staff_history")
          .insert({
            personel_id: personelId,
            ...historyData,
            updated_at: new Date().toISOString(),
          });
      } else {
        histUpsertResult = await supabase
          .from("staff_history")
          .update({
            ...historyData,
            updated_at: new Date().toISOString(),
          })
          .eq("personel_id", personelId);
      }

      if (eduUpsertResult.error || histUpsertResult.error) {
        console.error("Error saving education/history:", eduUpsertResult.error || histUpsertResult.error);
        toast.error("Bilgiler kaydedilirken bir hata oluştu");
      } else {
        toast.success("Bilgiler başarıyla kaydedildi");
      }
    } catch (error) {
      console.error("Error saving education/history:", error);
      toast.error("Bilgiler kaydedilirken bir hata oluştu");
    } finally {
      setLoadingEduHist(false);
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-64 w-full">
          <p>Profil bilgileri yükleniyor...</p>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <ProfileTabs
        profile={profile}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleAvatarUpload={handleAvatarUpload}
        handleSave={handleSave}
        isSaving={isSaving}
        isUploading={isUploading}
        educationData={educationData}
        historyData={historyData}
        onEducationChange={handleEducationChange}
        onHistoryChange={handleHistoryChange}
        onSaveEducationHistory={handleSaveEducationHistory}
        isLoadingEducationHistory={loadingEduHist}
      />
    </StaffLayout>
  );
};

export default Profile;
