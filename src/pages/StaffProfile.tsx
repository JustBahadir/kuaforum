
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      .upsert([dataToUpsert], { onConflict: ["personel_id"] });

    setLoading(false);
    if (error) {
      console.error("Eğitim bilgileri kaydedilirken hata:", error);
      toast.error("Eğitim bilgileri güncellenemedi.");
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
      .upsert([dataToUpsert], { onConflict: ["personel_id"] });

    setLoading(false);
    if (error) {
      console.error("Geçmiş bilgileri kaydedilirken hata:", error);
      toast.error("Geçmiş bilgileri güncellenemedi.");
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
      .upsert([dataToUpsert], { onConflict: ["personel_id"] });

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

                {/* Profile Tab */}
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

                {/* Education Tab */}
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

                    {showLisedurumu && (
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

                    {showLiseturu && (
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

                    {showMeslekibrans && (
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

                    {showUniversitedurumu && (
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

                    {showUniversitebolum && (
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

                {/* History Tab */}
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

                {/* Join Tab */}
                <TabsContent value="join">
                  <div>
                    <label className="block mb-2 font-semibold">İşletme Kodu</label>
                    <input
                      type="text"
                      value={shopCode}
                      onChange={(e) => setShopCode(e.target.value)}
                      disabled={validatingCode}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                      placeholder="Almış olduğunuz işletme kodunu giriniz"
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
  const [adding, setAdding] = useState(false);
  const [newIsyeri, setNewIsyeri] = useState("");
  const [newGorev, setNewGorev] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editIsyeri, setEditIsyeri] = useState("");
  const [editGorev, setEditGorev] = useState("");
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setAdding(true);
    setNewIsyeri("");
    setNewGorev("");
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewIsyeri("");
    setNewGorev("");
  };

  const saveAdd = async () => {
    if (!newIsyeri.trim() || !newGorev.trim()) {
      toast.error("İş yeri ve görev zorunludur.");
      return;
    }

    setSaving(true);
    const newIsyerleri = [...historyData.isyerleri, newIsyeri.trim()];
    const newGorevPozisyon = [...historyData.gorevpozisyon, newGorev.trim()];

    setHistoryData(prev => ({
      ...prev,
      isyerleri: newIsyerleri,
      gorevpozisyon: newGorevPozisyon,
      _newIsYeri: "",
      _newGorev: "",
    }));

    try {
      await saveHistoryDataWithParams(newIsyerleri, newGorevPozisyon, historyData.belgeler, historyData.yarismalar, historyData.cv);
      toast.success("İş yeri ve görev başarıyla eklendi.");
      setAdding(false);
    } catch (error) {
      toast.error("Ekleme işlemi sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditIsyeri(historyData.isyerleri[index]);
    setEditGorev(historyData.gorevpozisyon[index]);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditIsyeri("");
    setEditGorev("");
  };

  const saveEdit = async () => {
    if (editIndex === null) return;

    if (!editIsyeri.trim() || !editGorev.trim()) {
      toast.error("İş yeri ve görev zorunludur.");
      return;
    }

    setSaving(true);
    const newIsyerleri = [...historyData.isyerleri];
    const newGorevPozisyon = [...historyData.gorevpozisyon];
    newIsyerleri[editIndex] = editIsyeri.trim();
    newGorevPozisyon[editIndex] = editGorev.trim();

    setHistoryData(prev => ({
      ...prev,
      isyerleri: newIsyerleri,
      gorevpozisyon: newGorevPozisyon,
    }));

    try {
      await saveHistoryDataWithParams(newIsyerleri, newGorevPozisyon, historyData.belgeler, historyData.yarismalar, historyData.cv);
      toast.success("İş yeri ve görev başarıyla güncellendi.");
      setEditIndex(null);
      setEditIsyeri("");
      setEditGorev("");
    } catch (error) {
      toast.error("Güncelleme işlemi sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const removeAtIndex = async (index: number) => {
    setSaving(true);
    const newIsyerleri = [...historyData.isyerleri];
    const newGorevPozisyon = [...historyData.gorevpozisyon];
    newIsyerleri.splice(index, 1);
    newGorevPozisyon.splice(index, 1);
    setHistoryData(prev => ({
      ...prev,
      isyerleri: newIsyerleri,
      gorevpozisyon: newGorevPozisyon,
    }));

    try {
      await saveHistoryDataWithParams(newIsyerleri, newGorevPozisyon, historyData.belgeler, historyData.yarismalar, historyData.cv);
      toast.success("İş yeri ve görev başarıyla silindi.");
    } catch (error) {
      toast.error("Silme işlemi sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">İşyerleri ve Görevler</h3>
      {historyData.isyerleri.length === 0 && <p>Henüz işyeri ve görev bilgisi eklenmemiş.</p>}

      {historyData.isyerleri.map((isyeri, index) => (
        <div key={index} className="mb-2 flex items-center space-x-4">
          {editIndex === index ? (
            <>
              <input
                type="text"
                value={editIsyeri}
                onChange={(e) => setEditIsyeri(e.target.value)}
                className="border p-1 rounded"
                disabled={saving}
              />
              <input
                type="text"
                value={editGorev}
                onChange={(e) => setEditGorev(e.target.value)}
                className="border p-1 rounded"
                disabled={saving}
              />
              <Button disabled={saving} onClick={saveEdit}>Kaydet</Button>
              <Button variant="outline" disabled={saving} onClick={cancelEdit}>İptal</Button>
            </>
          ) : (
            <>
              <span>{isyeri}</span>
              <span>{historyData.gorevpozisyon[index]}</span>
              <Button variant="default" onClick={() => startEdit(index)}>Düzenle</Button>
              <Button variant="destructive" onClick={() => removeAtIndex(index)}>Sil</Button>
            </>
          )}
        </div>
      ))}

      {adding ? (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={newIsyeri}
            onChange={(e) => setNewIsyeri(e.target.value)}
            className="border p-1 rounded w-full"
            placeholder="Yeni işyeri"
            disabled={loading}
          />
          <input
            type="text"
            value={newGorev}
            onChange={(e) => setNewGorev(e.target.value)}
            className="border p-1 rounded w-full"
            placeholder="Yeni görev"
            disabled={loading}
          />
          <Button onClick={saveAdd} disabled={loading}>Ekle</Button>
          <Button variant="outline" onClick={cancelAdd} disabled={loading}>İptal</Button>
        </div>
      ) : (
        <Button className="mt-4" onClick={startAdd}>İş Yeri ve Görev Ekle</Button>
      )}
    </div>
  );
}

function DocumentsSection({
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
  const [adding, setAdding] = useState(false);
  const [newBelge, setNewBelge] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setAdding(true);
    setNewBelge("");
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewBelge("");
  };

  const saveAdd = async () => {
    if (!newBelge.trim()) {
      toast.error("Lütfen belge adı giriniz.");
      return;
    }
    setSaving(true);
    const newBelgeler = [...historyData.belgeler, newBelge.trim()];
    setHistoryData(prev => ({
      ...prev,
      belgeler: newBelgeler,
      _newBelge: "",
    }));

    try {
      await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, newBelgeler, historyData.yarismalar, historyData.cv);
      toast.success("Belge eklendi.");
      setAdding(false);
    } catch (error) {
      toast.error("Belge eklenirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(historyData.belgeler[index]);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (editIndex === null) return;
    if (!editValue.trim()) {
      toast.error("Belge adı boş olamaz.");
      return;
    }
    setSaving(true);
    const newBelgeler = [...historyData.belgeler];
    newBelgeler[editIndex] = editValue.trim();
    setHistoryData(prev => ({
      ...prev,
      belgeler: newBelgeler,
    }));

    try {
      await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, newBelgeler, historyData.yarismalar, historyData.cv);
      toast.success("Belge güncellendi.");
      setEditIndex(null);
      setEditValue("");
    } catch (error) {
      toast.error("Belge güncellenirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const removeAtIndex = async (index: number) => {
    setSaving(true);
    const newBelgeler = [...historyData.belgeler];
    newBelgeler.splice(index, 1);
    setHistoryData(prev => ({
      ...prev,
      belgeler: newBelgeler,
    }));

    try {
      await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, newBelgeler, historyData.yarismalar, historyData.cv);
      toast.success("Belge silindi.");
    } catch (error) {
      toast.error("Belge silinirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Belgeler</h3>
      {historyData.belgeler.length === 0 && <p>Henüz belge eklenmemiş.</p>}

      {historyData.belgeler.map((belge, index) => (
        <div key={index} className="mb-2 flex items-center space-x-4">
          {editIndex === index ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                disabled={saving}
                className="border p-1 rounded"
              />
              <Button disabled={saving} onClick={saveEdit}>Kaydet</Button>
              <Button variant="outline" disabled={saving} onClick={cancelEdit}>İptal</Button>
            </>
          ) : (
            <>
              <span>{belge}</span>
              <Button variant="default" onClick={() => startEdit(index)}>Düzenle</Button>
              <Button variant="destructive" onClick={() => removeAtIndex(index)}>Sil</Button>
            </>
          )}
        </div>
      ))}

      {adding ? (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={newBelge}
            onChange={(e) => setNewBelge(e.target.value)}
            disabled={loading}
            placeholder="Yeni belge adı"
            className="border p-1 rounded w-full"
          />
          <Button onClick={saveAdd} disabled={loading}>Ekle</Button>
          <Button variant="outline" onClick={cancelAdd} disabled={loading}>İptal</Button>
        </div>
      ) : (
        <Button className="mt-4" onClick={startAdd}>Belge Ekle</Button>
      )}
    </div>
  );
}

function CompetitionsSection({
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
  const [adding, setAdding] = useState(false);
  const [newYarisma, setNewYarisma] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setAdding(true);
    setNewYarisma("");
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewYarisma("");
  };

  const saveAdd = async () => {
    if (!newYarisma.trim()) {
      toast.error("Lütfen yarışma adı giriniz.");
      return;
    }
    setSaving(true);
    const newYarismalar = [...historyData.yarismalar, newYarisma.trim()];
    setHistoryData(prev => ({
      ...prev,
      yarismalar: newYarismalar,
      _newYarisma: "",
    }));

    try {
      await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozisyon, historyData.belgeler, newYarismalar, historyData.cv);
      toast.success("Yarışma eklendi.");
      setAdding(false);
    } catch (error) {
      toast.error("Yarışma eklenirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(historyData.yarismalar[index]);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (editIndex === null) return;
    if (!editValue.trim()) {
      toast.error("Yarışma adı boş olamaz.");
      return;
    }
    setSaving(true);
    const newYarismalar = [...historyData.yarismalar];
    newYarismalar[editIndex] = editValue.trim();
    setHistoryData(prev => ({
      ...prev,
      yarismalar: newYarismalar,
    }));

    try {
      await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozsyon, historyData.belgeler, newYarismalar, historyData.cv);
      toast.success("Yarışma güncellendi.");
      setEditIndex(null);
      setEditValue("");
    } catch (error) {
      toast.error("Yarışma güncellenirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const removeAtIndex = async (index: number) => {
    setSaving(true);
    const newYarismalar = [...historyData.yarismalar];
    newYarismalar.splice(index, 1);
    setHistoryData(prev => ({
      ...prev,
      yarismalar: newYarismalar,
    }));

    try {
      await saveHistoryDataWithParams(historyData.isyerleri, historyData.gorevpozsyon, historyData.belgeler, newYarismalar, historyData.cv);
      toast.success("Yarışma silindi.");
    } catch (error) {
      toast.error("Yarışma silinirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Yarışmalar</h3>
      {historyData.yarismalar.length === 0 && <p>Henüz yarışma eklenmemiş.</p>}

      {historyData.yarismalar.map((yarisma, index) => (
        <div key={index} className="mb-2 flex items-center space-x-4">
          {editIndex === index ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                disabled={saving}
                className="border p-1 rounded"
              />
              <Button disabled={saving} onClick={saveEdit}>Kaydet</Button>
              <Button variant="outline" disabled={saving} onClick={cancelEdit}>İptal</Button>
            </>
          ) : (
            <>
              <span>{yarisma}</span>
              <Button variant="default" onClick={() => startEdit(index)}>Düzenle</Button>
              <Button variant="destructive" onClick={() => removeAtIndex(index)}>Sil</Button>
            </>
          )}
        </div>
      ))}

      {adding ? (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={newYarisma}
            onChange={(e) => setNewYarisma(e.target.value)}
            disabled={loading}
            placeholder="Yeni yarışma adı"
            className="border p-1 rounded w-full"
          />
          <Button onClick={saveAdd} disabled={loading}>Ekle</Button>
          <Button variant="outline" onClick={cancelAdd} disabled={loading}>İptal</Button>
        </div>
      ) : (
        <Button className="mt-4" onClick={startAdd}>Yarışma Ekle</Button>
      )}
    </div>
  );
}

function CvSection({
  cv,
  setCv,
  user,
  saveHistoryDataWithParams,
  cvEditMode,
  setCvEditMode,
}: {
  cv: string;
  setCv: React.Dispatch<React.SetStateAction<string>>;
  user: any;
  saveHistoryDataWithParams: (
    isyerleri: string[],
    gorevpozisyon: string[],
    belgeler: string[],
    yarismalar: string[],
    cvExtra: string
  ) => Promise<void>;
  cvEditMode: boolean;
  setCvEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [saving, setSaving] = useState(false);

  const saveCv = async () => {
    setSaving(true);
    try {
      await saveHistoryDataWithParams([], [], [], [], cv);
      toast.success("CV kaydedildi.");
      setCvEditMode(false);
    } catch (error) {
      toast.error("CV kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">CV</h3>
      {cvEditMode ? (
        <>
          <textarea
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            rows={10}
            className="w-full border rounded p-2"
            disabled={saving}
          />
          <div className="mt-2 flex space-x-2">
            <Button disabled={saving} onClick={saveCv}>
              Kaydet
            </Button>
            <Button variant="outline" disabled={saving} onClick={() => setCvEditMode(false)}>
              İptal
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="whitespace-pre-wrap border rounded p-3 min-h-[200px]">{cv || "Henüz CV eklenmemiş."}</div>
          <Button className="mt-2" onClick={() => setCvEditMode(true)}>
            Düzenle
          </Button>
        </>
      )}
    </div>
  );
}
