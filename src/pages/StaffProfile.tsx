import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function StaffProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "education" | "history" | "join">("profile");
  const [shopCode, setShopCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [educationData, setEducationData] = useState({
    ortaokulDurumu: "",
    liseDurumu: "",
    liseTuru: "",
    meslekiBrans: ""
  });
  const [historyData, setHistoryData] = useState({
    isYerleri: "",
    gorevPozisyon: "",
    belgeler: "",
    yarismalar: "",
    cv: ""
  });

  const [userRole, setUserRole] = useState("");

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

        // Get user role
        const role = data.session.user.user_metadata?.role;
        setUserRole(role);

        // If user is admin, redirect to admin profile
        if (role === "admin") {
          navigate("/shop-home");
          return;
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        setProfile(profileData || {});

        // Get education and history data from separate tables or profile extensions
        // For demonstration, assuming education and history fields are in "staff_extended" table or similar.

        // Example simple fetch logic:
        const { data: educationRes } = await supabase
          .from("staff_education")
          .select("*")
          .eq("personel_id", data.session.user.id)
          .maybeSingle();

        setEducationData(educationRes || {
          ortaokulDurumu: "",
          liseDurumu: "",
          liseTuru: "",
          meslekiBrans: ""
        });

        const { data: historyRes } = await supabase
          .from("staff_history")
          .select("*")
          .eq("personel_id", data.session.user.id)
          .maybeSingle();

        setHistoryData(historyRes || {
          isYerleri: "",
          gorevPozisyon: "",
          belgeler: "",
          yarismalar: "",
          cv: ""
        });

        // Check if user is a staff and attached to any shop
        if (role === "staff") {
          const { data: personelData } = await supabase
            .from("personel")
            .select("dukkan_id, id")
            .eq("auth_id", data.session.user.id)
            .maybeSingle();

          if (personelData?.dukkan_id) {
            // If staff is assigned to a shop, redirect to shop home
            navigate("/shop-home");
            return;
          }
        } else {
          // If not staff or admin, redirect to appropriate dashboard
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  };

  const handleJoinShop = async () => {
    if (!shopCode) {
      toast.error("Lütfen işletme kodunu girin");
      return;
    }

    setValidatingCode(true);

    try {
      // Validate shop code
      const { data: shopData, error: shopError } = await supabase
        .from("dukkanlar")
        .select("id, ad")
        .eq("kod", shopCode.trim())
        .single();

      if (shopError || !shopData) {
        toast.error("Geçersiz işletme kodu. Lütfen doğru kodu girdiğinizden emin olun.");
        return;
      }

      // Create personel record
      const { error: personelError } = await supabase.from("personel").insert({
        auth_id: user.id,
        ad_soyad: `${profile.first_name} ${profile.last_name}`,
        telefon: profile.phone || "",
        eposta: user.email,
        adres: profile.address || "",
        personel_no: `P${Math.floor(Math.random() * 10000)}`,
        dukkan_id: shopData.id,
        maas: 0,
        prim_yuzdesi: 0,
        calisma_sistemi: "aylik_maas",
      });

      if (personelError) {
        throw personelError;
      }

      toast.success(`"${shopData.ad}" işletmesine başarıyla katıldınız!`);
      navigate("/shop-home");
    } catch (error) {
      console.error("İşletmeye katılırken hata:", error);
      toast.error("İşletmeye katılırken bir hata oluştu.");
    } finally {
      setValidatingCode(false);
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEducationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHistoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHistoryData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfileEdits = async () => {
    try {
      setLoading(true);

      // Update profile table (Özlük Bilgileri tablosu gibi)
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          gender: profile.gender,
          // Add other profile fields as needed
        })
        .eq("id", user.id);

      if (profileUpdateError) {
        toast.error("Profil bilgileri güncellenirken hata oluştu.");
        return;
      }

      // Save education info into staff_education table
      const dataToUpsert = [{
        personel_id: user.id,
        ortaokulDurumu: educationData.ortaokulDurumu,
        liseDurumu: educationData.liseDurumu,
        liseTuru: educationData.liseTuru,
        meslekiBrans: educationData.meslekiBrans,
      }];

      const { error: educationError } = await supabase
        .from("staff_education")
        .upsert(dataToUpsert, { onConflict: ["personel_id"] });

      if (educationError) {
        toast.error("Eğitim bilgileri kaydedilemedi.");
        return;
      }

      // Save history info into staff_history table
      const historyToUpsert = [{
        personel_id: user.id,
        isYerleri: historyData.isYerleri,
        gorevPozisyon: historyData.gorevPozisyon,
        belgeler: historyData.belgeler,
        yarismalar: historyData.yarismalar,
        cv: historyData.cv,
      }];

      const { error: historyError } = await supabase
        .from("staff_history")
        .upsert(historyToUpsert, { onConflict: ["personel_id"] });

      if (historyError) {
        toast.error("Geçmiş bilgileri kaydedilemedi.");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-2 text-sm text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  const initials = `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
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

          {/* Main Content */}
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
                        <Button onClick={handleEditToggle}>Bilgileri Düzenle</Button>
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
                        <Button type="submit">Kaydet</Button>
                        <Button type="button" variant="outline" onClick={handleEditToggle}>İptal</Button>
                      </form>
                    )}
                  </>
                )}

                {activeTab === "education" && (
                  <>
                    {!editMode ? (
                      <div className="space-y-4">
                        <p><strong>Ortaokul Durumu:</strong> {educationData.ortaokulDurumu || "Bilgi yok"}</p>
                        <p><strong>Lise Durumu:</strong> {educationData.liseDurumu || "Bilgi yok"}</p>
                        <p><strong>Lise Türü:</strong> {educationData.liseTuru || "Bilgi yok"}</p>
                        <p><strong>Mesleki Branş:</strong> {educationData.meslekiBrans || "Bilgi yok"}</p>
                        <Button onClick={handleEditToggle}>Eğitim Bilgilerini Düzenle</Button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveProfileEdits();
                        }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="ortaokulDurumu" className="block text-sm font-medium">Ortaokul Durumu</label>
                            <select
                              id="ortaokulDurumu"
                              name="ortaokulDurumu"
                              value={educationData.ortaokulDurumu}
                              onChange={handleEducationChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                            >
                              <option value="">Seçiniz</option>
                              <option value="bitirdi">Bitirdi</option>
                              <option value="okuyor">Okuyor</option>
                              <option value="bitirmedi">Bitirmedi</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="liseDurumu" className="block text-sm font-medium">Lise Durumu</label>
                            <select
                              id="liseDurumu"
                              name="liseDurumu"
                              value={educationData.liseDurumu}
                              onChange={handleEducationChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                            >
                              <option value="">Seçiniz</option>
                              <option value="bitirdi">Bitirdi</option>
                              <option value="okuyor">Okuyor</option>
                              <option value="bitirmedi">Bitirmedi</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="liseTuru" className="block text-sm font-medium">Lise Türü</label>
                            <select
                              id="liseTuru"
                              name="liseTuru"
                              value={educationData.liseTuru}
                              onChange={handleEducationChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                            >
                              <option value="">Seçiniz</option>
                              <option value="meslek">Meslek Lisesi</option>
                              <option value="genel">Genel Lise</option>
                              <option value="anatomi">Anadolu Lisesi</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="meslekiBrans" className="block text-sm font-medium">Mesleki Branş</label>
                            <input
                              type="text"
                              id="meslekiBrans"
                              name="meslekiBrans"
                              value={educationData.meslekiBrans}
                              onChange={handleEducationChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                              placeholder="Örn: Kuaförlük, Güzellik Uzmanlığı"
                            />
                          </div>
                        </div>
                        <Button type="submit">Kaydet</Button>
                        <Button type="button" variant="outline" onClick={handleEditToggle}>
                          İptal
                        </Button>
                      </form>
                    )}
                  </>
                )}

                {activeTab === "history" && (
                  <>
                    {!editMode ? (
                      <div className="space-y-4">
                        <p><strong>İş Yerleri:</strong> {historyData.isYerleri || "Bilgi yok"}</p>
                        <p><strong>Görev / Pozisyon:</strong> {historyData.gorevPozisyon || "Bilgi yok"}</p>
                        <p><strong>Belgeler:</strong> {historyData.belgeler || "Bilgi yok"}</p>
                        <p><strong>Yarışmalar:</strong> {historyData.yarismalar || "Bilgi yok"}</p>
                        <p><strong>CV:</strong> {historyData.cv || "Bilgi yok"}</p>
                        <Button onClick={handleEditToggle}>Geçmiş Bilgileri Düzenle</Button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveProfileEdits();
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="isYerleri" className="block text-sm font-medium">İş Yerleri</label>
                            <input
                              type="text"
                              id="isYerleri"
                              name="isYerleri"
                              value={historyData.isYerleri}
                              onChange={handleHistoryChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                              placeholder="Nerelerde çalıştı"
                            />
                          </div>
                          <div>
                            <label htmlFor="gorevPozisyon" className="block text-sm font-medium">Görev / Pozisyon</label>
                            <input
                              type="text"
                              id="gorevPozisyon"
                              name="gorevPozisyon"
                              value={historyData.gorevPozisyon}
                              onChange={handleHistoryChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                              placeholder="Hangi pozisyonda çalıştı"
                            />
                          </div>
                          <div>
                            <label htmlFor="belgeler" className="block text-sm font-medium">Belgeler</label>
                            <input
                              type="text"
                              id="belgeler"
                              name="belgeler"
                              value={historyData.belgeler}
                              onChange={handleHistoryChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                              placeholder="Sahip olduğu belgeler"
                            />
                          </div>
                          <div>
                            <label htmlFor="yarismalar" className="block text-sm font-medium">Yarışmalar</label>
                            <input
                              type="text"
                              id="yarismalar"
                              name="yarismalar"
                              value={historyData.yarismalar}
                              onChange={handleHistoryChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                              placeholder="Katıldığı yarışmalar"
                            />
                          </div>
                          <div>
                            <label htmlFor="cv" className="block text-sm font-medium">CV</label>
                            <textarea
                              id="cv"
                              name="cv"
                              value={historyData.cv}
                              onChange={handleHistoryChange}
                              className="w-full rounded border border-gray-300 px-3 py-2"
                              placeholder="Serbest metin"
                              rows={4}
                            />
                          </div>
                        </div>
                        <Button type="submit">Kaydet</Button>
                        <Button type="button" variant="outline" onClick={handleEditToggle}>
                          İptal
                        </Button>
                      </form>
                    )}
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
