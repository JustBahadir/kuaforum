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

const arrayToString = (value: string[] | string): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "";
};

// New helper to convert comma separated string to array, removing empty entries
const stringToArray = (str: string | null | undefined): string[] => {
  if (!str) return [];
  return str.split(",").map(s => s.trim()).filter(s => s.length > 0);
};

export default function StaffProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "education" | "history" | "join">("profile");
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
    cv: ""
  });

  const [userRole, setUserRole] = useState("");

  // Helper function to save education data to Supabase
  const saveEducationData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Prepare single object (not array), with snake_case keys
    const dataToUpsert = {
      personel_id: user.id,
      ortaokuldurumu: educationData.ortaokuldurumu,
      lisedurumu: educationData.lisedurumu,
      liseturu: educationData.liseturu,
      meslekibrans: educationData.meslekibrans,
      universitedurumu: educationData.universitedurumu,
      universitebolum: educationData.universitebolum,
    };

    const { error } = await supabase
      .from("staff_education")
      .upsert(dataToUpsert, { onConflict: ["personel_id"] });

    setLoading(false);
    if (error) {
      toast.error("Eğitim bilgileri kaydedilemedi.");
    } else {
      toast.success("Eğitim bilgileri kaydedildi.");
    }
  }, [educationData, user]);

  // Helper function to save history data to Supabase
  const saveHistoryData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Prepare single object (not array), keys snake_case,
    // and convert arrays to comma separated strings
    const dataToUpsert = {
      personel_id: user.id,
      isyerleri: historyData.isyerleri.join(", "),
      gorevpozisyon: historyData.gorevpozisyon.join(", "),
      belgeler: historyData.belgeler.join(", "),
      yarismalar: historyData.yarismalar.join(", "),
      cv: historyData.cv || "",
    };

    const { error } = await supabase
      .from("staff_history")
      .upsert(dataToUpsert, { onConflict: ["personel_id"] });

    setLoading(false);
    if (error) {
      toast.error("Geçmiş bilgileri kaydedilemedi.");
    } else {
      toast.success("Geçmiş bilgileri kaydedildi.");
    }
  }, [historyData, user]);

  const addWorkplaceWithPosition = () => {
    if (!historyData._newIsYeri || !historyData._newGorev) {
      toast.error("İş yeri ve görev giriniz.");
      return;
    }
    setHistoryData(prev => {
      const newIsYerleri = [...prev.isyerleri, prev._newIsYeri || ""];
      const newGorevPozisyon = [...prev.gorevpozisyon, prev._newGorev || ""];
      return { ...prev, isyerleri: newIsYerleri, gorevpozisyon: newGorevPozisyon, _newIsYeri: "", _newGorev: "" };
    });
  };

  const removeWorkplaceAtIndex = (index: number) => {
    setHistoryData(prev => {
      const newIsYerleri = [...prev.isyerleri];
      const newGorevPozisyon = [...prev.gorevpozisyon];
      newIsYerleri.splice(index, 1);
      newGorevPozisyon.splice(index, 1);
      return { ...prev, isyerleri: newIsYerleri, gorevpozisyon: newGorevPozisyon };
    });
  };

  const addBelge = () => {
    if (!historyData._newBelge) {
      toast.error("Belge adı giriniz.");
      return;
    }
    setHistoryData(prev => ({
      ...prev,
      belgeler: [...prev.belgeler, prev._newBelge || ""],
      _newBelge: ""
    }));
  };

  const removeBelgeAtIndex = (index: number) => {
    setHistoryData(prev => {
      const newBelgeler = [...prev.belgeler];
      newBelgeler.splice(index, 1);
      return { ...prev, belgeler: newBelgeler };
    });
  };

  const addYarismalar = () => {
    if (!historyData._newYarisma) {
      toast.error("Yarışma adı giriniz.");
      return;
    }
    setHistoryData(prev => ({
      ...prev,
      yarismalar: [...prev.yarismalar, prev._newYarisma || ""],
      _newYarisma: ""
    }));
  };

  const removeYarismalarAtIndex = (index: number) => {
    setHistoryData(prev => {
      const newYarismalar = [...prev.yarismalar];
      newYarismalar.splice(index, 1);
      return { ...prev, yarismalar: newYarismalar };
    });
  };

  // Autosave history data on changes
  useEffect(() => {
    if (user) {
      const delayDebounceFn = setTimeout(() => {
        saveHistoryData();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [historyData.isyerleri, historyData.gorevpozisyon, historyData.belgeler, historyData.yarismalar, historyData.cv, saveHistoryData, user]);

  // Handle education input change with logic to show/hide fields progressively
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setEducationData(prev => {
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

  // Autosave education data on changes
  useEffect(() => {
    if (user) {
      const delayDebounce = setTimeout(() => {
        saveEducationData();
      }, 500);

      return () => clearTimeout(delayDebounce);
    }
  }, [educationData, saveEducationData, user]);

  const handleCvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setHistoryData(prev => ({ ...prev, cv: value }));
  };

  const handleJoinShop = async () => {
    toast.success("İşletmeye katılma işlevi henüz uygulanmadı.");
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

      // Upsert education uses snake_case keys and single object
      const dataToUpsert = {
        personel_id: user.id,
        ortaokuldurumu: educationData.ortaokuldurumu,
        lisedurumu: educationData.lisedurumu,
        liseturu: educationData.liseturu,
        meslekibrans: educationData.meslekibrans,
        universitedurumu: educationData.universitedurumu,
        universitebolum: educationData.universitebolum,
      };

      const { error: educationError } = await supabase
        .from("staff_education")
        .upsert(dataToUpsert, { onConflict: ["personel_id"] });

      if (educationError) {
        toast.error("Eğitim bilgileri kaydedilemedi.");
        setLoading(false);
        return;
      }

      // Upsert history uses snake_case keys and single object,
      // with arrays converted to strings
      const historyToUpsert = {
        personel_id: user.id,
        isyerleri: historyData.isyerleri.join(", "),
        gorevpozisyon: historyData.gorevpozisyon.join(", "),
        belgeler: historyData.belgeler.join(", "),
        yarismalar: historyData.yarismalar.join(", "),
        cv: historyData.cv || "",
      };

      const { error: historyError } = await supabase
        .from("staff_history")
        .upsert(historyToUpsert, { onConflict: ["personel_id"] });

      if (historyError) {
        toast.error("Geçmiş bilgileri kaydedilemedi.");
        setLoading(false);
        return;
      }

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
          ortaokuldurumu: typeof educationRes?.ortaokuldurumu === "string" ? educationRes.ortaokuldurumu : "",
          lisedurumu: typeof educationRes?.lisedurumu === "string" ? educationRes.lisedurumu : "",
          liseturu: typeof educationRes?.liseturu === "string" ? educationRes.liseturu : "",
          meslekibrans: typeof educationRes?.meslekibrans === "string" ? educationRes.meslekibrans : "",
          universitedurumu: typeof educationRes?.universitedurumu === "string" ? educationRes.universitedurumu : "",
          universitebolum: typeof educationRes?.universitebolum === "string" ? educationRes.universitebolum : "",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-2 text-sm text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  const initials = `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`;

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url} alt={`${profile?.first_name} ${profile?.last_name}`} />
                  <AvatarFallback className="text-lg bg-purple-100 text-purple-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{profile?.first_name} {profile?.last_name}</h2>
                <p className="text-muted-foreground text-sm">Personel</p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("profile");
                  setEditMode(false);
                }}
              >
                Özlük Bilgileri
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("education");
                  setEditMode(false);
                }}
              >
                Eğitim Bilgileri
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("history");
                  setEditMode(false);
                }}
              >
                Geçmiş Bilgiler
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab("join")}
              >
                İşletmeye Katıl
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                Oturumu Kapat
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "profile" && "Özlük Bilgileri"}
                  {activeTab === "education" && "Eğitim Bilgileri"}
                  {activeTab === "history" && "Geçmiş Bilgiler"}
                  {activeTab === "join" && "İşletmeye Katıl"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === "profile" && (
                  <>
                    {!editMode ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Ad Soyad</label>
                            <p>{profile?.first_name} {profile?.last_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">E-posta</label>
                            <p>{user?.email || "-"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Telefon</label>
                            <p>{profile?.phone || "-"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Adres</label>
                            <p>{profile?.address || "-"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Cinsiyet</label>
                            <p>{profile?.gender || "-"}</p>
                          </div>
                        </div>
                        <Button onClick={() => setEditMode(true)}>Bilgileri Düzenle</Button>
                      </div>
                    ) : (
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveProfileEdits();
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="first_name" className="block text-sm font-medium">Ad</label>
                            <input
                              type="text"
                              id="first_name"
                              value={profile?.first_name || ""}
                              onChange={(e) => setProfile((p: any) => ({ ...p, first_name: e.target.value }))}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="last_name" className="block text-sm font-medium">Soyad</label>
                            <input
                              type="text"
                              id="last_name"
                              value={profile?.last_name || ""}
                              onChange={(e) => setProfile((p: any) => ({ ...p, last_name: e.target.value }))}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium">Telefon</label>
                            <input
                              type="text"
                              id="phone"
                              value={profile?.phone || ""}
                              onChange={(e) => setProfile((p: any) => ({ ...p, phone: e.target.value }))}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                            />
                          </div>
                          <div>
                            <label htmlFor="address" className="block text-sm font-medium">Adres</label>
                            <input
                              type="text"
                              id="address"
                              value={profile?.address || ""}
                              onChange={(e) => setProfile((p: any) => ({ ...p, address: e.target.value }))}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                            />
                          </div>
                          <div>
                            <label htmlFor="gender" className="block text-sm font-medium">Cinsiyet</label>
                            <select
                              id="gender"
                              value={profile?.gender || ""}
                              onChange={(e) => setProfile((p: any) => ({ ...p, gender: e.target.value }))}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                            >
                              <option value="">Seçiniz</option>
                              <option value="erkek">Erkek</option>
                              <option value="kadın">Kadın</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button type="submit">Kaydet</Button>
                          <Button type="button" variant="outline" onClick={() => setEditMode(false)}>İptal</Button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {activeTab === "education" && (
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ortaokul Durumu */}
                      <div>
                        <label htmlFor="ortaokuldurumu" className="block text-sm font-medium">Ortaokul Durumu</label>
                        <select
                          id="ortaokuldurumu"
                          name="ortaokuldurumu"
                          value={educationData.ortaokuldurumu}
                          onChange={handleEducationChange}
                          className="w-full rounded border border-gray-300 px-3 py-2"
                        >
                          <option value="">Seçiniz</option>
                          <option value="bitirdi">Bitirdi</option>
                          <option value="okuyor">Okuyor</option>
                          <option value="bitirmedi">Bitirmedi</option>
                        </select>
                      </div>

                      {/* Lise Durumu */}
                      {educationData.ortaokuldurumu === "bitirdi" && (
                        <div>
                          <label htmlFor="lisedurumu" className="block text-sm font-medium">Lise Durumu</label>
                          <select
                            id="lisedurumu"
                            name="lisedurumu"
                            value={educationData.lisedurumu}
                            onChange={handleEducationChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                          >
                            <option value="">Seçiniz</option>
                            <option value="bitirdi">Bitirdi</option>
                            <option value="okuyor">Okuyor</option>
                            <option value="bitirmedi">Bitirmedi</option>
                          </select>
                        </div>
                      )}

                      {/* Lise Türü */}
                      {(educationData.lisedurumu === "bitirdi" || educationData.lisedurumu === "okuyor") && (
                        <div>
                          <label htmlFor="liseturu" className="block text-sm font-medium">Lise Türü</label>
                          <select
                            id="liseturu"
                            name="liseturu"
                            value={educationData.liseturu}
                            onChange={handleEducationChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                          >
                            <option value="">Seçiniz</option>
                            {liseTuruOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Mesleki Branş */}
                      {["cok_programli_anadolu", "meslek_ve_teknik_anadolu"].includes(educationData.liseturu) && (
                        <div>
                          <label htmlFor="meslekibrans" className="block text-sm font-medium">Mesleki Branş</label>
                          <input
                            type="text"
                            id="meslekibrans"
                            name="meslekibrans"
                            value={educationData.meslekibrans}
                            onChange={handleEducationChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            placeholder="Örn: Kuaförlük, Güzellik Uzmanlığı"
                          />
                        </div>
                      )}

                      {/* Üniversite Durumu */}
                      {educationData.lisedurumu === "bitirdi" && (
                        <div>
                          <label htmlFor="universitedurumu" className="block text-sm font-medium">Üniversite Durumu</label>
                          <select
                            id="universitedurumu"
                            name="universitedurumu"
                            value={educationData.universitedurumu}
                            onChange={handleEducationChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                          >
                            <option value="">Seçiniz</option>
                            <option value="okuyor">Okuyor</option>
                            <option value="bitirdi">Bitirdi</option>
                            <option value="bitirmedi">Bitirmedi</option>
                          </select>
                        </div>
                      )}

                      {/* Üniversite Bölüm */}
                      {(educationData.universitedurumu === "okuyor" || educationData.universitedurumu === "bitirdi") && (
                        <div>
                          <label htmlFor="universitebolum" className="block text-sm font-medium">Bölüm</label>
                          <select
                            id="universitebolum"
                            name="universitebolum"
                            value={educationData.universitebolum}
                            onChange={handleEducationChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                          >
                            <option value="">Seçiniz</option>
                            {universiteOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </form>
                )}

                {activeTab === "history" && (
                  <>
                    <div>
                      <strong>İş Yerleri ve Görevler</strong>
                      {historyData.isyerleri.length === 0 && <p>Bilgi yok</p>}
                      <ul className="list-disc pl-5 mb-3">
                        {historyData.isyerleri.map((yeri, i) => (
                          <li key={`workplace-${i}`} className="flex gap-2 items-center">
                            <span className="flex-1">{yeri}</span>
                            <span className="flex-1">{historyData.gorevpozisyon[i] || "-"}</span>
                            <button type="button" className="text-destructive" onClick={() => removeWorkplaceAtIndex(i)} aria-label="İş yeri sil">
                              Sil
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mb-4 flex gap-2">
                        <input
                          type="text"
                          placeholder="İş yeri"
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          value={historyData._newIsYeri || ""}
                          onChange={(e) => setHistoryData(prev => ({ ...prev, _newIsYeri: e.target.value }))}
                        />
                        <input
                          type="text"
                          placeholder="Görev / Pozisyon"
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          value={historyData._newGorev || ""}
                          onChange={(e) => setHistoryData(prev => ({ ...prev, _newGorev: e.target.value }))}
                        />
                        <Button
                          type="button"
                          onClick={addWorkplaceWithPosition}
                          size="sm"
                        >
                          İş Yeri Ekle
                        </Button>
                      </div>
                    </div>

                    <div>
                      <strong>Belgeler</strong>
                      {historyData.belgeler.length === 0 && <p>Bilgi yok</p>}
                      <ul className="list-disc pl-5 mb-3">
                        {historyData.belgeler.map((item, i) => (
                          <li key={`document-${i}`} className="flex items-center justify-between">
                            <span>{item}</span>
                            <button type="button" className="text-destructive" onClick={() => removeBelgeAtIndex(i)} aria-label="Belge sil">
                              Sil
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mb-4 flex gap-2">
                        <input
                          type="text"
                          placeholder="Belge adı"
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          value={historyData._newBelge || ""}
                          onChange={(e) => setHistoryData(prev => ({ ...prev, _newBelge: e.target.value }))}
                        />
                        <Button
                          type="button"
                          onClick={addBelge}
                          size="sm"
                        >
                          Belge Ekle
                        </Button>
                      </div>
                    </div>

                    <div>
                      <strong>Yarışmalar</strong>
                      {historyData.yarismalar.length === 0 && <p>Bilgi yok</p>}
                      <ul className="list-disc pl-5 mb-3">
                        {historyData.yarismalar.map((item, i) => (
                          <li key={`competition-${i}`} className="flex items-center justify-between">
                            <span>{item}</span>
                            <button type="button" className="text-destructive" onClick={() => removeYarismalarAtIndex(i)} aria-label="Yarışma sil">
                              Sil
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mb-4 flex gap-2">
                        <input
                          type="text"
                          placeholder="Yarışma adı"
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          value={historyData._newYarisma || ""}
                          onChange={(e) => setHistoryData(prev => ({ ...prev, _newYarisma: e.target.value }))}
                        />
                        <Button
                          type="button"
                          onClick={addYarismalar}
                          size="sm"
                        >
                          Yarışma Ekle
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cv" className="block font-medium mb-1">CV</label>
                      <textarea
                        id="cv"
                        value={historyData.cv}
                        onChange={handleCvChange}
                        className="w-full rounded border border-gray-300 px-3 py-2"
                        rows={5}
                        placeholder="Serbest metin"
                      />
                    </div>
                  </>
                )}

                {activeTab === "join" && (
                  <div className="space-y-4">
                    <p>İşletmeye katılmak için işletme sahibinin size verdiği kodu girin:</p>

                    <div className="flex gap-2">
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="İşletme kodu"
                        value={shopCode}
                        onChange={(e) => setShopCode(e.target.value)}
                      />
                      <Button onClick={handleJoinShop} disabled={validatingCode || !shopCode}>
                        {validatingCode ? "İşleniyor..." : "Katıl"}
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Bir işletmeye katıldığınızda, işletme sahibi size görev atayabilir ve randevularınızı yönetebilirsiniz.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
