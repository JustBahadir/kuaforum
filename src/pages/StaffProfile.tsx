
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Import Label to fix "Cannot find name 'Label'"

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
  // Fix type of activeTab state setter to match Tabs onValueChange argument type (string)
  // Use union for activeTab variable to enforce allowed values
  const [activeTab, setActiveTab] = useState<"profile" | "education" | "history" | "join">(
    "profile"
  );
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
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        navigate("/login");
        return;
      }

      const currentUser = session.session.user;
      setUser(currentUser);

      // Fetch profile from "profiles" table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);
      setUserRole(profileData?.role || "");

      // Fetch education data from "staff_education"
      const { data: education, error: educationError } = await supabase
        .from("staff_education")
        .select("*")
        .eq("personel_id", Number(profileData.id))  // Convert id to number if needed
        .single();

      if (educationError && educationError.code !== "PGRST116") {
        throw educationError;
      }

      if (education) {
        setEducationData({
          ortaokuldurumu: education.ortaokuldurumu || "",
          lisedurumu: education.lisedurumu || "",
          liseturu: education.liseturu || "",
          meslekibrans: education.meslekibrans || "",
          universitedurumu: education.universitedurumu || "",
          universitebolum: education.universitebolum || "",
        });
      } else {
        setEducationData({
          ortaokuldurumu: "",
          lisedurumu: "",
          liseturu: "",
          meslekibrans: "",
          universitedurumu: "",
          universitebolum: "",
        });
      }

      // Fetch history data from "staff_history"
      const { data: history, error: historyError } = await supabase
        .from("staff_history")
        .select("*")
        .eq("personel_id", Number(profileData.id))  // Convert id to number if needed
        .single();

      if (historyError && historyError.code !== "PGRST116") {
        throw historyError;
      }

      if (history) {
        setHistoryData({
          isyerleri: stringToArray(history.isyerleri),
          gorevpozisyon: stringToArray(history.gorevpozisyon),
          belgeler: stringToArray(history.belgeler),
          yarismalar: stringToArray(history.yarismalar),
          cv: history.cv || "",
          _newIsYeri: "",
          _newGorev: "",
          _newBelge: "",
          _newYarisma: "",
        });
      } else {
        setHistoryData({
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
      }
    } catch (error: any) {
      console.error("Profil bilgileri alınırken hata:", error);
      toast.error("Profil bilgileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfileData = async () => {
    setSaving(true);
    try {
      if (!user) {
        throw new Error("Kullanıcı bilgileri alınamadı.");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          gender: profile.gender,
          address: profile.address,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast.success("Profil bilgileriniz başarıyla güncellendi!");
      setEditMode(false);
      fetchProfile();
    } catch (error: any) {
      console.error("Profil güncelleme hatası:", error);
      toast.error("Profil bilgileri güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleEducationInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEducationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveEducationData = async () => {
    setSaving(true);
    try {
      if (!user) {
        throw new Error("Kullanıcı bilgileri alınamadı.");
      }

      const { error } = await supabase
        .from("staff_education")
        .upsert(
          [
            {
              personel_id: profile.id,
              ortaokuldurumu: educationData.ortaokuldurumu,
              lisedurumu: educationData.lisedurumu,
              liseturu: educationData.liseturu,
              meslekibrans: educationData.meslekibrans,
              universitedurumu: educationData.universitedurumu,
              universitebolum: educationData.universitebolum,
            },
          ],
          { onConflict: "personel_id" }
        );

      if (error) {
        throw error;
      }

      toast.success("Eğitim bilgileriniz başarıyla kaydedildi!");
    } catch (error: any) {
      console.error("Eğitim bilgileri kaydetme hatası:", error);
      toast.error("Eğitim bilgileri kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleHistoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHistoryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fix handleAddToArray and handleRemoveFromArray keys to lowercase for keys of historyData
  const handleAddToArray = (arrayName: string) => {
    setHistoryData((prev) => {
      const newValue = prev[`_new${arrayName}` as keyof HistoryData] as string;
      if (!newValue) return prev;

      return {
        ...prev,
        [arrayName.toLowerCase()]: [...(prev[arrayName.toLowerCase() as keyof HistoryData] as string[]), newValue],
        [`_new${arrayName}` as keyof HistoryData]: "",
      };
    });
  };

  const handleRemoveFromArray = (arrayName: string, index: number) => {
    setHistoryData((prev) => {
      const newArray = [...(prev[arrayName.toLowerCase() as keyof HistoryData] as string[])];
      newArray.splice(index, 1);
      return {
        ...prev,
        [arrayName.toLowerCase()]: newArray,
      };
    });
  };

  const saveHistoryData = async () => {
    setSaving(true);
    try {
      if (!user) {
        throw new Error("Kullanıcı bilgileri alınamadı.");
      }

      const { error } = await supabase
        .from("staff_history")
        .upsert(
          [
            {
              personel_id: profile.id,
              isyerleri: historyData.isyerleri.join(", "),
              gorevpozisyon: historyData.gorevpozisyon.join(", "),
              belgeler: historyData.belgeler.join(", "),
              yarismalar: historyData.yarismalar.join(", "),
              cv: historyData.cv,
            },
          ],
          { onConflict: "personel_id" }
        );

      if (error) {
        throw error;
      }

      toast.success("İş geçmişi bilgileriniz başarıyla kaydedildi!");
    } catch (error: any) {
      console.error("İş geçmişi kaydetme hatası:", error);
      toast.error("İş geçmişi bilgileri kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleShopCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShopCode(e.target.value);
  };

  const validateShopCode = async () => {
    setValidatingCode(true);
    try {
      const { data, error } = await supabase
        .from("dukkanlar")
        .select("id")
        .eq("kod", shopCode)
        .single();

      if (error || !data) {
        throw new Error("Geçersiz dükkan kodu.");
      }

      // Update the user's profile with the shop ID
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ dukkan_id: data.id })
        .eq("id", user.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      toast.success("Dükkan kodu doğrulandı ve profilinize eklendi!");
      fetchProfile(); // Refresh profile data
    } catch (err: any) {
      toast.error(err.message || "Dükkan kodu doğrulanamadı.");
    } finally {
      setValidatingCode(false);
    }
  };

  const handleCvInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvEditMode(true);
    setSaving(true);

    try {
      const filePath = `cv/${user.id}/${file.name}`;
      const { data, error } = await supabase.storage
        .from("public")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const publicURL = supabase.storage.from("public").getPublicUrl(filePath);

      setHistoryData((prev) => ({
        ...prev,
        cv: publicURL.data.publicUrl,
      }));

      toast.success("CV başarıyla yüklendi!");
    } catch (error: any) {
      console.error("CV yükleme hatası:", error);
      toast.error("CV yüklenirken bir hata oluştu.");
    } finally {
      setSaving(false);
      setCvEditMode(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p>Profil bilgileri yükleniyor...</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-semibold">
                Personel Profil Sayfası
              </CardTitle>
              <Button onClick={() => navigate("/")} variant="outline">
                Çıkış Yap
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.first_name?.[0]}
                    {profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs 
            defaultValue="profile" 
            className="mt-4" 
            onValueChange={(value) => {
              // Ensure value is one of allowed tab types
              if (
                value === "profile" || 
                value === "education" || 
                value === "history" || 
                value === "join"
              ) {
                setActiveTab(value);
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="education">Eğitim</TabsTrigger>
              <TabsTrigger value="history">İş Geçmişi</TabsTrigger>
              {userRole !== "admin" && (
                <TabsTrigger value="join">Dükkana Katıl</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profil Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Ad</Label>
                      <Input
                        type="text"
                        id="firstName"
                        name="first_name"
                        value={profile?.first_name || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Soyad</Label>
                      <Input
                        type="text"
                        id="lastName"
                        name="last_name"
                        value={profile?.last_name || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profile?.phone || ""}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Cinsiyet</Label>
                    <Input
                      type="text"
                      id="gender"
                      name="gender"
                      value={profile?.gender || ""}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      value={profile?.address || ""}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <Button
                    onClick={editMode ? saveProfileData : () => setEditMode(true)}
                    disabled={saving}
                  >
                    {editMode
                      ? saving
                        ? "Kaydediliyor..."
                        : "Kaydet"
                      : "Profili Düzenle"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card>
                <CardHeader>
                  <CardTitle>Eğitim Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <Label htmlFor="ortaokuldurumu">Ortaokul Durumu</Label>
                    <Input
                      type="text"
                      id="ortaokuldurumu"
                      name="ortaokuldurumu"
                      value={educationData.ortaokuldurumu}
                      onChange={handleEducationInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lisedurumu">Lise Durumu</Label>
                    <Input
                      type="text"
                      id="lisedurumu"
                      name="lisedurumu"
                      value={educationData.lisedurumu}
                      onChange={handleEducationInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="liseturu">Lise Türü</Label>
                    <Input
                      type="text"
                      id="liseturu"
                      name="liseturu"
                      value={educationData.liseturu}
                      onChange={handleEducationInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meslekibrans">Meslek / Branş</Label>
                    <Input
                      type="text"
                      id="meslekibrans"
                      name="meslekibrans"
                      value={educationData.meslekibrans}
                      onChange={handleEducationInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="universitedurumu">Üniversite Durumu</Label>
                    <Input
                      type="text"
                      id="universitedurumu"
                      name="universitedurumu"
                      value={educationData.universitedurumu}
                      onChange={handleEducationInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="universitebolum">Üniversite Bölümü</Label>
                    <Input
                      type="text"
                      id="universitebolum"
                      name="universitebolum"
                      value={educationData.universitebolum}
                      onChange={handleEducationInputChange}
                    />
                  </div>
                  <Button onClick={saveEducationData} disabled={saving}>
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>İş Geçmişi</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <WorkplacesPositionsSection
                    historyData={historyData}
                    handleHistoryInputChange={handleHistoryInputChange}
                    handleAddToArray={handleAddToArray}
                    handleRemoveFromArray={handleRemoveFromArray}
                  />
                  <DocumentsSection
                    historyData={historyData}
                    handleHistoryInputChange={handleHistoryInputChange}
                    handleAddToArray={handleAddToArray}
                    handleRemoveFromArray={handleRemoveFromArray}
                  />
                  <CompetitionsSection
                    historyData={historyData}
                    handleHistoryInputChange={handleHistoryInputChange}
                    handleAddToArray={handleAddToArray}
                    handleRemoveFromArray={handleRemoveFromArray}
                  />
                  <CvSection
                    historyData={historyData}
                    handleHistoryInputChange={handleHistoryInputChange}
                    handleCvInputChange={handleCvInputChange}
                    cvEditMode={cvEditMode}
                  />
                  <Button onClick={saveHistoryData} disabled={saving}>
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="join">
              <Card>
                <CardHeader>
                  <CardTitle>Dükkana Katıl</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <Label htmlFor="shopCode">Dükkan Kodu</Label>
                    <Input
                      type="text"
                      id="shopCode"
                      value={shopCode}
                      onChange={handleShopCodeChange}
                    />
                  </div>
                  <Button onClick={validateShopCode} disabled={validatingCode}>
                    {validatingCode ? "Doğrulanıyor..." : "Dükkan Kodunu Doğrula"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

interface SectionProps {
  historyData: HistoryData;
  handleHistoryInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleAddToArray: (arrayName: string) => void;
  handleRemoveFromArray: (arrayName: string, index: number) => void;
}

const WorkplacesPositionsSection: React.FC<SectionProps> = ({
  historyData,
  handleHistoryInputChange,
  handleAddToArray,
  handleRemoveFromArray,
}) => (
  <>
    <div>
      <Label>İş Yerleri</Label>
      {historyData.isyerleri.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 mb-1">
          <Input type="text" value={item} readOnly />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleRemoveFromArray("IsYeri", index)}
          >
            Sil
          </Button>
        </div>
      ))}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Yeni iş yeri ekle"
          value={historyData._newIsYeri || ""}
          name="_newIsYeri"
          onChange={handleHistoryInputChange}
        />
        <Button type="button" onClick={() => handleAddToArray("IsYeri")}>
          Ekle
        </Button>
      </div>
    </div>

    <div>
      <Label>Görev Pozisyonları</Label>
      {historyData.gorevpozisyon.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 mb-1">
          <Input type="text" value={item} readOnly />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleRemoveFromArray("Gorev", index)}
          >
            Sil
          </Button>
        </div>
      ))}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Yeni görev pozisyonu ekle"
          value={historyData._newGorev || ""}
          name="_newGorev"
          onChange={handleHistoryInputChange}
        />
        <Button type="button" onClick={() => handleAddToArray("Gorev")}>
          Ekle
        </Button>
      </div>
    </div>
  </>
);

const DocumentsSection: React.FC<SectionProps> = ({
  historyData,
  handleHistoryInputChange,
  handleAddToArray,
  handleRemoveFromArray,
}) => (
  <>
    <div>
      <Label>Belgeler</Label>
      {historyData.belgeler.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 mb-1">
          <Input type="text" value={item} readOnly />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleRemoveFromArray("Belge", index)}
          >
            Sil
          </Button>
        </div>
      ))}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Yeni belge ekle"
          value={historyData._newBelge || ""}
          name="_newBelge"
          onChange={handleHistoryInputChange}
        />
        <Button type="button" onClick={() => handleAddToArray("Belge")}>
          Ekle
        </Button>
      </div>
    </div>
  </>
);

const CompetitionsSection: React.FC<SectionProps> = ({
  historyData,
  handleHistoryInputChange,
  handleAddToArray,
  handleRemoveFromArray,
}) => (
  <>
    <div>
      <Label>Yarışmalar</Label>
      {historyData.yarismalar.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 mb-1">
          <Input type="text" value={item} readOnly />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleRemoveFromArray("Yarisma", index)}
          >
            Sil
          </Button>
        </div>
      ))}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Yeni yarışma ekle"
          value={historyData._newYarisma || ""}
          name="_newYarisma"
          onChange={handleHistoryInputChange}
        />
        <Button type="button" onClick={() => handleAddToArray("Yarisma")}>
          Ekle
        </Button>
      </div>
    </div>
  </>
);

interface CvSectionProps {
  historyData: HistoryData;
  handleHistoryInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleCvInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cvEditMode: boolean;
}

const CvSection: React.FC<CvSectionProps> = ({
  historyData,
  handleHistoryInputChange,
  handleCvInputChange,
  cvEditMode,
}) => (
  <div>
    <Label>CV</Label>
    {historyData.cv ? (
      <a
        href={historyData.cv}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        Mevcut CV'yi Görüntüle
      </a>
    ) : (
      <p>CV Yok</p>
    )}
    <Input
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={handleCvInputChange}
      disabled={cvEditMode}
    />
  </div>
);

