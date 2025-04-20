import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsSection from "./components/DocumentsSection";
import CompetitionsSection from "./components/CompetitionsSection";
import CvSection from "./components/CvSection";

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
    "profile" | "education" | "history" | "join"
  >("profile");
  const [shopCode, setShopCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [cvEditMode, setCvEditMode] = useState(false);

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
    _newIsYeri: "",
    _newGorev: "",
    _newBelge: "",
    _newYarisma: "",
  });

  const [userRole, setUserRole] = useState("");

  const saveEducationData = useCallback(async () => {
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
      toast.error("Geçmiş bilgileri güncellenemedi.");
    } else {
      toast.success("Geçmiş bilgileri güncellendi.");
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
      gorevpozisyon: newGorevPozisyon,
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

  const handleJoinShop = async () => {
    if (!shopCode.trim()) {
      toast.error("Lütfen bir işletme kodu girin.");
      return;
    }

    const cleanedCode = shopCode.toLowerCase().replace(/[^a-z0-9]/g, '');

    const formattedCode = cleanedCode.replace(/^(.{5})(.{4})(.{3})$/, '$1-$2-$3');

    if (formattedCode !== shopCode) {
      setShopCode(formattedCode);
      toast("İşletme kodu otomatik düzenlendi. Lütfen tekrar klikleyin.");
      return;
    }

    setValidatingCode(true);
    try {
      const { data: shopData, error: shopError } = await supabase
        .from("dukkanlar")
        .select("id, ad, sahibi_id")
        .eq("kod", shopCode)
        .maybeSingle();

      if (shopError) throw shopError;

      if (!shopData) {
        toast.error("Geçersiz işletme kodu.");
        return;
      }

      console.log(`Join request sent to shop owner (${shopData.sahibi_id}) from person ${profile?.first_name} ${profile?.last_name} (${user.email})`);

      toast.success(`${shopData.ad} işletmesine katılma talebiniz gönderildi.`);

      setShopCode("");
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

      await saveEducationData();

      await saveHistoryData();

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

        const role = data.session.user.user_metadata?.role ?? "customer";
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

        setProfile({
          first_name: profileData?.first_name || "",
          last_name: profileData?.last_name || "",
          phone: profileData?.phone || "",
          address: profileData?.address || "",
          gender: profileData?.gender || "",
          avatar_url: profileData?.avatar_url || null
        });

        const { data: educationRes } = await supabase
          .from("staff_education")
          .select("*")
          .eq("personel_id", Number(data.session.user.id))
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
          .eq("personel_id", Number(data.session.user.id))
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

  const initials = `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`;

  const showLisedurumu = educationData.ortaokuldurumu.toLowerCase() === "bitirdi";
  const showLiseturu =
    showLisedurumu &&
    (educationData.lisedurumu.toLowerCase() === "bitirdi" ||
      educationData.lisedurumu.toLowerCase() === "okuyor");
  const showMeslekibrans =
    showLiseturu &&
    ["cok_programli_anadolu", "meslek_ve_teknik_anadolu"].includes(
      educationData.liseturu
    );
  const showUniversitedurumu = educationData.lisedurumu.toLowerCase() === "bitirdi";
  const showUniversitebolum =
    showUniversitedurumu &&
    (educationData.universitedurumu.toLowerCase() === "bitirdi" ||
      educationData.universitedurumu.toLowerCase() === "okuyor");

  const handleTabChange = (value: string) => {
    setActiveTab(value as "profile" | "education" | "history" | "join");
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Personel Profil</CardTitle>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-start space-x-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url} alt="Profile Picture" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-grow">
              <p className="text-gray-500 mb-3">
                {user?.email} | {userRole}
              </p>
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="w-full flex space-x-4">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="education">Eğitim</TabsTrigger>
                  <TabsTrigger value="history">Geçmiş</TabsTrigger>
                  {userRole === "staff" && (
                    <TabsTrigger value="join">İşletmeye Katıl</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="profile">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ad
                      </label>
                      <input
                        type="text"
                        value={profile?.first_name || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, first_name: e.target.value })
                        }
                        disabled={false}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Soyad
                      </label>
                      <input
                        type="text"
                        value={profile?.last_name || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, last_name: e.target.value })
                        }
                        disabled={false}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Telefon
                      </label>
                      <input
                        type="text"
                        value={profile?.phone || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        disabled={false}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Adres
                      </label>
                      <input
                        type="text"
                        value={profile?.address || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, address: e.target.value })
                        }
                        disabled={false}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cinsiyet
                      </label>
                      <select
                        value={profile?.gender || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, gender: e.target.value })
                        }
                        disabled={false}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      >
                        <option value="">Seçiniz</option>
                        <option value="erkek">Erkek</option>
                        <option value="kadın">Kadın</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="default" onClick={saveProfileEdits} disabled={loading}>
                      Kaydet
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="education">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ortaokul Durumu
                      </label>
                      <select
                        name="ortaokuldurumu"
                        value={educationData.ortaokuldurumu}
                        onChange={handleEducationChange}
                        disabled={loading || editMode}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500`}
                      >
                        <option value="">Seçiniz</option>
                        <option value="okuyor">Okuyor</option>
                        <option value="bitirdi">Bitirdi</option>
                        <option value="ayrildi">Ayrıldı</option>
                      </select>
                    </div>

                    {educationData.ortaokuldurumu.toLowerCase() === "bitirdi" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Lise Durumu
                        </label>
                        <select
                          name="lisedurumu"
                          value={educationData.lisedurumu}
                          onChange={handleEducationChange}
                          disabled={loading || editMode}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500`}
                        >
                          <option value="">Seçiniz</option>
                          <option value="okuyor">Okuyor</option>
                          <option value="bitirdi">Bitirdi</option>
                          <option value="ayrildi">Ayrıldı</option>
                        </select>
                      </div>
                    )}

                    {(educationData.lisedurumu.toLowerCase() === "bitirdi" ||
                      educationData.lisedurumu.toLowerCase() === "okuyor") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Lise Türü
                        </label>
                        <select
                          name="liseturu"
                          value={educationData.liseturu}
                          onChange={handleEducationChange}
                          disabled={loading || editMode}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500`}
                        >
                          <option value="">Seçiniz</option>
                          <option value="fen">Fen Lisesi</option>
                          <option value="sosyal_bilimler">Sosyal Bilimler Lisesi</option>
                          <option value="anatoli">Anadolu Lisesi</option>
                          <option value="guzel_sanatlar">Güzel Sanatlar Lisesi</option>
                          <option value="spor">Spor Lisesi</option>
                          <option value="imam_hatip">Anadolu İmam Hatip Lisesi</option>
                          <option value="cok_programli_anadolu">
                            Çok Programlı Anadolu Lisesi
                          </option>
                          <option value="meslek_ve_teknik_anadolu">
                            Mesleki ve Teknik Anadolu Lisesi
                          </option>
                          <option value="aksam">Akşam Lisesi</option>
                          <option value="acik_ogretim">Açık Öğretim Lisesi</option>
                        </select>
                      </div>
                    )}

                    {["cok_programli_anadolu", "meslek_ve_teknik_anadolu"].includes(
                      educationData.liseturu
                    ) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Meslek / Branş
                        </label>
                        <input
                          type="text"
                          name="meslekibrans"
                          value={educationData.meslekibrans}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            setEducationData((prev) => ({ ...prev, [name]: value }));
                          }}
                          disabled={loading || editMode}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    {educationData.lisedurumu.toLowerCase() === "bitirdi" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Üniversite Durumu
                        </label>
                        <select
                          name="universitedurumu"
                          value={educationData.universitedurumu}
                          onChange={handleEducationChange}
                          disabled={loading || editMode}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Seçiniz</option>
                          <option value="okuyor">Okuyor</option>
                          <option value="bitirdi">Bitirdi</option>
                          <option value="ayrildi">Ayrıldı</option>
                        </select>
                      </div>
                    )}

                    {(educationData.universitedurumu.toLowerCase() === "bitirdi" ||
                      educationData.universitedurumu.toLowerCase() === "okuyor") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Üniversite Bölümü
                        </label>
                        <input
                          type="text"
                          name="universitebolum"
                          value={educationData.universitebolum}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            setEducationData((prev) => ({ ...prev, [name]: value }));
                          }}
                          disabled={loading || editMode}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="space-y-6">
                    <WorkplacesPositionsSection
                      historyData={historyData}
                      setHistoryData={setHistoryData}
                      user={user}
                      saveHistoryDataWithParams={saveHistoryDataWithParams}
                    />
                    <DocumentsSection
                      historyData={historyData}
                      setHistoryData={setHistoryData}
                      user={user}
                      saveHistoryDataWithParams={saveHistoryDataWithParams}
                    />
                    <CompetitionsSection
                      historyData={historyData}
                      setHistoryData={setHistoryData}
                      user={user}
                      saveHistoryDataWithParams={saveHistoryDataWithParams}
                    />
                    <CvSection
                      cv={historyData.cv}
                      setCv={(cvValue) =>
                        setHistoryData((prev) => ({ ...prev, cv: cvValue }))
                      }
                      user={user}
                      saveHistoryDataWithParams={saveHistoryDataWithParams}
                      cvEditMode={cvEditMode}
                      setCvEditMode={setCvEditMode}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="join">
                  <div>
                    <label className="block mb-2 font-semibold">İşletme Kodu</label>
                    <input
                      type="text"
                      value={shopCode}
                      onChange={(e) => setShopCode(e.target.value)}
                      disabled={validatingCode}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                      placeholder="crazy-kuafr-533"
                    />
                    <Button
                      disabled={validatingCode}
                      onClick={handleJoinShop}
                      className="mt-2"
                      variant="default"
                    >
                      Katıl
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkplacesPositionsSection({
  historyData,
  setHistoryData,
  user,
  saveHistoryDataWithParams,
}: {
  historyData: HistoryData;
  setHistoryData: React.Dispatch<React.SetStateAction<HistoryData>>;
  user: any;
  saveHistoryDataWithParams: (
    isyerleri: string[],
    gorevpozisyon: string[],
    belgeler: string[],
    yarismalar: string[],
    cv: string
  ) => Promise<void>;
}) {
  const [adding, setAdding] = React.useState(false);
  const [newIsyeri, setNewIsyeri] = React.useState("");
