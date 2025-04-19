
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
      toast.error("Geçmiş bilgileri güncellendi.");
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
          _newYarisma: "",
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

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Personel Profil</CardTitle>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleLogout}>
              Çıkış Yap
            </Button>
            {/* Düzenleme modunu aç/kapa butonu */}
            <Button
              variant="default"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "İptal" : "Düzenle"}
            </Button>
            {editMode && (
              <Button
                variant="default"
                onClick={saveProfileEdits}
              >
                Kaydet
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-start space-x-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url} alt="Profile Picture" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div>
              <h3 className="text-xl font-semibold">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-gray-500">
                {user?.email} | {userRole}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "profile" | "education" | "history" | "join")} className="w-full">
              <TabsList className="w-full flex space-x-4">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="education">Eğitim</TabsTrigger>
                <TabsTrigger value="history">Geçmiş</TabsTrigger>
                {/* Çocuklar sekmesini kaldırdık */}
                {userRole === "staff" && (
                  <TabsTrigger value="join">İşletmeye Katıl</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ad</label>
                    <input
                      type="text"
                      value={profile?.first_name || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, first_name: e.target.value })
                      }
                      disabled={!editMode}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Soyad</label>
                    <input
                      type="text"
                      value={profile?.last_name || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, last_name: e.target.value })
                      }
                      disabled={!editMode}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                    <input
                      type="text"
                      value={profile?.phone || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      disabled={!editMode}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adres</label>
                    <input
                      type="text"
                      value={profile?.address || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      disabled={!editMode}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cinsiyet</label>
                    <select
                      value={profile?.gender || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, gender: e.target.value })
                      }
                      disabled={!editMode}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <option value="">Seçiniz</option>
                      <option value="erkek">Erkek</option>
                      <option value="kadın">Kadın</option>
                    </select>
                  </div>
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
                      disabled={!editMode}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <option value="">Seçiniz</option>
                      <option value="okuyor">Okuyor</option>
                      <option value="bitirdi">Bitirdi</option>
                      <option value="ayrildi">Ayrıldı</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lise Durumu
                    </label>
                    <select
                      name="lisedurumu"
                      value={educationData.lisedurumu}
                      onChange={handleEducationChange}
                      disabled={!editMode || educationData.ortaokuldurumu !== "bitirdi"}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <option value="">Seçiniz</option>
                      <option value="okuyor">Okuyor</option>
                      <option value="bitirdi">Bitirdi</option>
                      <option value="ayrildi">Ayrıldı</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lise Türü
                    </label>
                    <select
                      name="liseturu"
                      value={educationData.liseturu}
                      onChange={handleEducationChange}
                      disabled={
                        !editMode ||
                        (educationData.lisedurumu !== "okuyor" &&
                          educationData.lisedurumu !== "bitirdi")
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <option value="">Seçiniz</option>
                      <option value="fen">Fen Lisesi</option>
                      <option value="sosyal_bilimler">Sosyal Bilimler Lisesi</option>
                      <option value="anatoli">Anadolu Lisesi</option>
                      <option value="guzel_sanatlar">Güzel Sanatlar Lisesi</option>
                      <option value="spor">Spor Lisesi</option>
                      <option value="imam_hatip">Anadolu İmam Hatip Lisesi</option>
                      <option value="cok_programli_anadolu">Çok Programlı Anadolu Lisesi</option>
                      <option value="meslek_ve_teknik_anadolu">Mesleki ve Teknik Anadolu Lisesi</option>
                      <option value="aksam">Akşam Lisesi</option>
                      <option value="acik_ogretim">Açık Öğretim Lisesi</option>
                    </select>
                  </div>
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
                      disabled={
                        !editMode ||
                        (educationData.lisedurumu !== "okuyor" &&
                          educationData.lisedurumu !== "bitirdi" &&
                          educationData.liseturu !== "cok_programli_anadolu" &&
                          educationData.liseturu !== "meslek_ve_teknik_anadolu")
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Üniversite Durumu
                    </label>
                    <select
                      name="universitedurumu"
                      value={educationData.universitedurumu}
                      onChange={handleEducationChange}
                      disabled={!editMode}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <option value="">Seçiniz</option>
                      <option value="okuyor">Okuyor</option>
                      <option value="bitirdi">Bitirdi</option>
                      <option value="ayrildi">Ayrıldı</option>
                    </select>
                  </div>
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
                      disabled={!editMode}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      İş Yerleri
                    </label>
                    <textarea
                      value={historyData.isyerleri.join(", ")}
                      disabled={!editMode}
                      onChange={(e) =>
                        setHistoryData((prev) => ({
                          ...prev,
                          isyerleri: e.target.value.split(",").map((s) => s.trim()),
                        }))
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Görev / Pozisyon
                    </label>
                    <textarea
                      value={historyData.gorevpozisyon.join(", ")}
                      disabled={!editMode}
                      onChange={(e) =>
                        setHistoryData((prev) => ({
                          ...prev,
                          gorevpozisyon: e.target.value.split(",").map((s) => s.trim()),
                        }))
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Belgeler</label>
                    <textarea
                      value={historyData.belgeler.join(", ")}
                      disabled={!editMode}
                      onChange={(e) =>
                        setHistoryData((prev) => ({
                          ...prev,
                          belgeler: e.target.value.split(",").map((s) => s.trim()),
                        }))
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Yarışmalar</label>
                    <textarea
                      value={historyData.yarismalar.join(", ")}
                      disabled={!editMode}
                      onChange={(e) =>
                        setHistoryData((prev) => ({
                          ...prev,
                          yarismalar: e.target.value.split(",").map((s) => s.trim()),
                        }))
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CV</label>
                    <textarea
                      value={historyData.cv}
                      disabled={!editMode}
                      onChange={(e) => setHistoryData((prev) => ({ ...prev, cv: e.target.value }))}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-2 focus:ring-indigo-500 ${
                        editMode
                          ? "focus:border-indigo-500"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
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
        </CardContent>
      </Card>
    </div>
  );
}

