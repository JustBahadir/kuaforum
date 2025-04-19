import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
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
  isyerleri: string[];
  gorevpozisyon: string[];
  belgeler: string[];
  yarismalar: string[];
  cv: string;
  _newIsYeri?: string;
  _newGorev?: string;
  _newBelge?: string;
  _newYarisma?: string;
}

interface ChildrenData {
  children_names: string[];
  _newChildName?: string;
}

// Yardımcı: dizileri virgülle ayrılmış stringe çevirme
const arrayToString = (value: string[] | string): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "";
};

const stringToArray = (str: string | null | undefined): string[] => {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export default function StaffProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "education" | "history" | "children" | "join"
  >("profile");
  const [shopCode, setShopCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [educationData, setEducationData] = useState<EducationData>({
    ortaokuldurumu: "",
    lisedurumu: "",
    liseturu: "",
    meslekibrans: "",
    universitedurumu: "",
    universitebolum: "",
  });

  const [historyData, setHistoryData] = useState<HistoryData>({
    isyerleri: [],
    gorevpozisyon: [],
    belgeler: [],
    yarismalar: [],
    cv: "",
  });

  const [childrenData, setChildrenData] = useState<ChildrenData>({
    children_names: [],
    _newChildName: "",
  });

  const [userRole, setUserRole] = useState("");

  // Yeni: Çocuk bilgilerini kaydetme fonksiyonu, Supabase'e doğru formatla çağıracak
  const saveChildrenDataWithParams = async (childrenNames: string[]) => {
    if (!user || !user.id) return;

    setLoading(true);

    // The field children_names is string[] in DB, but Supabase typings expect string, so convert to comma string or null
    const personalData = {
      customer_id: user.id,
      children_names: childrenNames.length > 0 ? childrenNames.join(", ") : null,
      updated_at: new Date().toISOString(),
    };

    // Pass as single object, not array
    const { error } = await supabase
      .from("customer_personal_data")
      .upsert(personalData, { onConflict: ["customer_id"] });

    setLoading(false);
    if (error) {
      console.error("Çocuk bilgileri kaydedilirken hata:", error);
      toast.error("Çocuk bilgileri kaydedilemedi.");
    } else {
      toast.success("Çocuk bilgileri güncellendi.");
    }
  };

  const saveEducationData = useCallback(async () => {
    if (!user || !user.id) return;
    setLoading(true);

    // The DB expects strings, so convert arrays (if any) to strings - currently all strings
    const dataToUpsert = {
      personel_id: Number(user.id),
      ortaokuldurumu: educationData.ortaokuldurumu,
      lisedurumu: educationData.lisedurumu,
      liseturu: educationData.liseturu,
      meslekibrans: educationData.meslekibrans,
      universitedurumu: educationData.universitedurumu,
      universitebolum: educationData.universitebolum,
      updated_at: new Date().toISOString(),
    };

    // Pass as single object
    const { error } = await supabase
      .from("staff_education")
      .upsert(dataToUpsert, { onConflict: ["personel_id"] });

    setLoading(false);
    if (error) {
      console.error("Eğitim bilgileri kaydedilirken hata:", error);
      toast.error("Eğitim bilgileri kaydedilemedi.");
    } else {
      toast.success("Eğitim bilgileri kaydedildi.");
    }
  }, [educationData, user]);

  const saveHistoryData = useCallback(async () => {
    if (!user || !user.id) return;
    setLoading(true);

    const dataToUpsert = {
      personel_id: Number(user.id),
      isyerleri: arrayToString(historyData.isyerleri),
      gorevpozisyon: arrayToString(historyData.gorevpozisyon),
      belgeler: arrayToString(historyData.belgeler),
      yarismalar: arrayToString(historyData.yarismalar),
      cv: historyData.cv || "",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("staff_history")
      .upsert(dataToUpsert, { onConflict: ["personel_id"] });

    setLoading(false);
    if (error) {
      console.error("Geçmiş bilgileri kaydedilirken hata:", error);
      toast.error("Geçmiş bilgileri kaydedilemedi.");
    } else {
      toast.success("Geçmiş bilgileri kaydedildi.");
    }
  }, [historyData, user]);

  const saveHistoryDataWithParams = async (
    isyerleri: string[],
    gorevpozisyon: string[],
    belgeler: string[],
    yarismalar: string[],
    cv: string
  ) => {
    if (!user || !user.id) return;

    setLoading(true);
    const dataToUpsert = {
      personel_id: Number(user.id),
      isyerleri: arrayToString(isyerleri),
      gorevpozisyon: arrayToString(gorevpozisyon),
      belgeler: arrayToString(belgeler),
      yarismalar: arrayToString(yarismalar),
      cv: cv || "",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("staff_history")
      .upsert(dataToUpsert, { onConflict: ["personel_id"] });

    setLoading(false);
    if (error) {
      console.error("Geçmiş bilgileri kaydedilirken hata:", error);
      toast.error("Geçmiş bilgileri güncellendi.");
    } else {
      toast.success("Geçmiş bilgileri güncellendi.");
    }
  };

  const saveEducationDataOnClick = async () => {
    if (!user || !user.id) return;
    setLoading(true);

    const dataToUpsert = {
      personel_id: Number(user.id),
      ortaokuldurumu: educationData.ortaokuldurumu,
      lisedurumu: educationData.lisedurumu,
      liseturu: educationData.liseturu,
      meslekibrans: educationData.meslekibrans,
      universitedurumu: educationData.universitedurumu,
      universitebolum: educationData.universitebolum,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("staff_education")
      .upsert(dataToUpsert, { onConflict: ["personel_id"] });

    setLoading(false);
    if (error) {
      console.error("Eğitim bilgileri kaydedilirken hata:", error);
      toast.error("Eğitim bilgileri kaydedilemedi.");
    } else {
      toast.success("Eğitim bilgileri kaydedildi.");
    }
  };

  const addWorkplaceWithPosition = async () => {
    if (!historyData._newIsYeri || !historyData._newGorev) {
      toast.error("İş yeri ve görev giriniz.");
      return;
    }
    const newIsyerleri = [...historyData.isyerleri, historyData._newIsYeri];
    const newGorevPozisyon = [...historyData.gorevpozisyon, historyData._newGorev];
    setHistoryData((prev) => ({
      ...prev,
      isyerleri: newIsyerleri,
      gorevpozisyon: newGorevPozisyon,
      _newIsYeri: "",
      _newGorev: "",
    }));

    await saveHistoryDataWithParams(
      newIsyerleri,
      newGorevPozisyon,
      historyData.belgeler,
      historyData.yarismalar,
      historyData.cv
    );
  };

  const removeWorkplaceAtIndex = async (index: number) => {
    const newIsyerleri = [...historyData.isyerleri];
    const newGorevPozisyon = [...historyData.gorevpozisyon];
    newIsyerleri.splice(index, 1);
    newGorevPozisyon.splice(index, 1);
    setHistoryData((prev) => ({
      ...prev,
      isyerleri: newIsyerleri,
      gorevpozisyon: newGorevPozisyon
    }));

    await saveHistoryDataWithParams(newIsyerleri, newGorevPozisyon, historyData.belgeler, historyData.yarismalar, historyData.cv);
  };

  const addBelge = async () => {
    if (!historyData._newBelge) {
      toast.error("Belge adı giriniz.");
      return;
    }
    const newBelgeler = [...historyData.belgeler, historyData._newBelge];
    setHistoryData((prev) => ({
      ...prev,
      belgeler: newBelgeler,
      _newBelge: ""
    }));

    await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, newBelgeler, historyData.yarismalar, historyData.cv);
  };

  const removeBelgeAtIndex = async (index: number) => {
    const newBelgeler = [...historyData.belgeler];
    newBelgeler.splice(index, 1);
    setHistoryData((prev) => ({ ...prev, belgeler: newBelgeler }));

    await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, newBelgeler, historyData.yarismalar, historyData.cv);
  };

  const addYarismalar = async () => {
    if (!historyData._newYarisma) {
      toast.error("Yarışma adı giriniz.");
      return;
    }
    const newYarismalar = [...historyData.yarismalar, historyData._newYarisma];
    setHistoryData((prev) => ({
      ...prev,
      yarismalar: newYarismalar,
      _newYarisma: ""
    }));

    await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, historyData.belgeler, newYarismalar, historyData.cv);
  };

  const removeYarismalarAtIndex = async (index: number) => {
    const newYarismalar = [...historyData.yarismalar];
    newYarismalar.splice(index, 1);
    setHistoryData((prev) => ({ ...prev, yarismalar: newYarismalar }));

    await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, historyData.belgeler, newYarismalar, historyData.cv);
  };

  const handleCvChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setHistoryData((prev) => ({ ...prev, cv: value }));
    await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, historyData.belgeler, historyData.yarismalar, value);
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setEducationData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "ortaokuldurumu" && value !== "bitirdi") {
        newData.lisedurumu = "";
        newData.liseturu = "";
        newData.meslekibrans = "";
        newData.universitedurumu = "";
        newData.universitebolum = "";
      } else if (name === "lisedurumu") {
        if (value !== "okuyor" && value !== "bitirdi") {
          newData.liseturu = "";
          newData.meslekibrans = "";
          newData.universitedurumu = "";
          newData.universitebolum = "";
        }
        if (value !== "bitirdi") {
          newData.universitedurumu = "";
          newData.universitebolum = "";
        }
      } else if (name === "liseturu") {
        if (!["cok_programli_anadolu", "meslek_ve_teknik_anadolu"].includes(value)) {
          newData.meslekibrans = "";
        }
      } else if (name === "universitedurumu") {
        if (value !== "okuyor" && value !== "bitirdi") {
          newData.universitebolum = "";
        }
      }

      return newData;
    });
  };

  const addChild = async () => {
    if (!childrenData._newChildName || childrenData._newChildName.trim() === "") {
      toast.error("Çocuk adı giriniz.");
      return;
    }

    const newChildren = [...childrenData.children_names, childrenData._newChildName.trim()];

    setChildrenData({
      children_names: newChildren,
      _newChildName: ""
    });

    await saveChildrenDataWithParams(newChildren);
  };

  const removeChildAtIndex = async (index: number) => {
    const newChildren = [...childrenData.children_names];
    newChildren.splice(index, 1);
    setChildrenData({ children_names: newChildren, _newChildName: "" });

    await saveChildrenDataWithParams(newChildren);
  };

  const saveChildrenData = async () => {
    if (!user || !user.id) return;
    await saveChildrenDataWithParams(childrenData.children_names);
  };

  const handleJoinShop = async () => {
    if (!shopCode.trim()) {
      toast.error("Lütfen bir işletme kodu girin.");
      return;
    }
    
    setValidatingCode(true);
    try {
      const { data: shopData, error: shopError } = await supabase
        .from("dukkanlar")
        .select("id, ad")
        .eq("kod", shopCode.trim())
        .maybeSingle();
      
      if (shopError) throw shopError;
      
      if (!shopData) {
        toast.error("Geçersiz işletme kodu.");
        return;
      }
      
      const { error: personelError } = await supabase
        .from("personel")
        .upsert({
          auth_id: user.id,
          dukkan_id: shopData.id,
          ad_soyad: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
          telefon: profile?.phone || '',
          eposta: user.email,
          adres: profile?.address || '',
          personel_no: `P${Date.now().toString().substring(7)}`,
          maas: 0,
          prim_yuzdesi: 0,
          calisma_sistemi: 'aylik',
          aktif: true,
          baslama_tarihi: new Date().toISOString().split('T')[0]
        });
      
      if (personelError) throw personelError;
      
      toast.success(`${shopData.ad} işletmesine başarıyla katıldınız.`);
      setTimeout(() => {
        navigate("/shop-home");
      }, 1500);
      
    } catch (error) {
      console.error("İşletmeye katılma hatası:", error);
      toast.error("İşletmeye katılırken bir hata oluştu.");
    } finally {
      setValidatingCode(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  };

  const saveProfileEdits = async () => {
    try {
      setLoading(true);

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          gender: profile.gender,
        })
        .eq("id", user.id);

      if (profileUpdateError) {
        toast.error("Profil bilgileri güncellenirken hata oluştu.");
        setLoading(false);
        return;
      }

      const dataToUpsert = {
        personel_id: Number(user.id),
        ortaokuldurumu: educationData.ortaokuldurumu,
        lisedurumu: educationData.lisedurumu,
        liseturu: educationData.liseturu,
        meslekibrans: educationData.meslekibrans,
        universitedurumu: educationData.universitedurumu,
        universitebolum: educationData.universitebolum,
        updated_at: new Date().toISOString(),
      };

      const { error: educationError } = await supabase
        .from("staff_education")
        .upsert(dataToUpsert, { onConflict: ["personel_id"] });

      if (educationError) {
        toast.error("Eğitim bilgileri kaydedilemedi.");
        setLoading(false);
        return;
      }

      const historyToUpsert = {
        personel_id: Number(user.id),
        isyerleri: arrayToString(historyData.isyerleri),
        gorevpozisyon: arrayToString(historyData.gorevpozisyon),
        belgeler: arrayToString(historyData.belgeler),
        yarismalar: arrayToString(historyData.yarismalar),
        cv: historyData.cv || "",
        updated_at: new Date().toISOString(),
      };

      const { error: historyError } = await supabase
        .from("staff_history")
        .upsert(historyToUpsert, { onConflict: ["personel_id"] });

      if (historyError) {
        toast.error("Geçmiş bilgileri kaydedilemedi.");
        setLoading(false);
        return;
      }

      await saveChildrenDataWithParams(childrenData.children_names);

      setEditMode(false);
      toast.success("Bilgiler güncellendi.");
    } catch (error) {
      console.error("Profil kaydetme hatası:", error);
      toast.error("Bilgiler kaydedilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!data.session) {
          navigate("/login");
          return;
        }

        setUser(data.session.user);

        const role = data.session.user.user_metadata?.role;
        setUserRole(role);

        if (role === "admin") {
          navigate("/shop-home");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        setProfile(profileData || {});

        const { data: educationRes } = await supabase
          .from("staff_education")
          .select("*")
          .eq("personel_id", data.session.user.id)
          .maybeSingle();

        setEducationData({
          ortaokuldurumu:
            typeof educationRes?.ortaokuldurumu === "string"
              ? educationRes.ortaokuldurumu
              : "",
          lisedurumu:
            typeof educationRes?.lisedurumu === "string"
              ? educationRes.lisedurumu
              : "",
          liseturu:
            typeof educationRes?.liseturu === "string" ? educationRes.liseturu : "",
          meslekibrans:
            typeof educationRes?.meslekibrans === "string"
              ? educationRes.meslekibrans
              : "",
          universitedurumu:
            typeof educationRes?.universitedurumu === "string"
              ? educationRes.universitedurumu
              : "",
          universitebolum:
            typeof educationRes?.universitebolum === "string"
              ? educationRes.universitebolum
              : "",
        });

        const { data: historyRes } = await supabase
          .from("staff_history")
          .select("*")
          .eq("personel_id", data.session.user.id)
          .maybeSingle();

        setHistoryData({
          isyerleri: stringToArray(historyRes?.isyerleri),
          gorevpozisyon: stringToArray(historyRes?.gorevpozisyon),
          belgeler: stringToArray(historyRes?.belgeler),
          yarismalar: stringToArray(historyRes?.yarismalar),
          cv: typeof historyRes?.cv === "string" ? historyRes.cv : "",
          _newIsYeri: "",
          _newGorev: "",
          _newBelge: "",
          _newYarisma: ""
        });

        if (role === "staff") {
          const { data: personelData } = await supabase
            .from("personel")
            .select("dukkan_id, id")
            .eq("auth_id", data.session.user.id)
            .maybeSingle();

          if (personelData?.dukkan_id) {
            navigate("/shop-home");
            return;
          }
        } else {
          navigate("/customer-dashboard");
          return;
        }
      } catch (error) {
        console.error("Profil bilgileri alınırken hata:", error);
        toast.error("Profil bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const liseTuruOptions = [
    { label: "Fen Lisesi", value: "fen" },
    { label: "Sosyal Bilimler Lisesi", value: "sosyal_bilimler" },
    { label: "Anadolu Lisesi", value: "anatoli" },
    { label: "Güzel Sanatlar Lisesi", value: "guzel_sanatlar" },
    { label: "Spor Lisesi", value: "spor" },
    { label: "Anadolu İmam Hatip Lisesi", value: "imam_hatip" },
    { label: "Çok Programlı Anadolu Lisesi", value: "cok_programli_anadolu" },
    { label: "Mesleki ve Teknik Anadolu Lisesi", value: "meslek_ve_teknik_anadolu" },
    { label: "Akşam Lisesi", value: "aksam" },
    { label: "Açık Öğretim Lisesi", value: "acik_ogretim" },
  ];

  const universiteOptions = [
    { label: "Saç Bakımı ve Güzellik Hizmetleri", value: "sac_bakim" },
    { label: "Diğer", value: "diger" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-2 text-sm text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  const initials = `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`;

  return <></>;
}
