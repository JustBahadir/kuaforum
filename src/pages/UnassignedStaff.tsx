import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Mail, Phone, MapPin, User, School, History, Briefcase, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UnassignedStaff() {
  console.log("UnassignedStaff component rendered"); // Debug log
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
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
  
  const [error, setError] = useState<string | null>(null);

  // Çıkış yap fonksiyonu
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yaptınız.");
      navigate("/login");
    } catch (err) {
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  };

  // Bilgi Kaydet fonksiyonu (hem eğitim hem geçmiş için kullanılıyor)
  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Kullanıcı doğrulanamadı. Lütfen tekrar giriş yapın.");
        navigate("/login");
        return;
      }

      // Numeric personel id almalıyız, yoksa hata mesajı ve return
      const { data: personel, error: personelError } = await supabase
        .from("personel")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (!personel || personelError) {
        setError("Personel kaydı bulunamadı. Profilinizi tamamlayın veya destek ile iletişime geçin.");
        setLoading(false);
        return;
      }

      // upsert'ler için numeric id kullanalım
      await supabase.from("staff_education").upsert({
        personel_id: personel.id,
        ...educationData,
      }, { onConflict: ['personel_id'] });

      await supabase.from("staff_history").upsert({
        personel_id: personel.id,
        ...historyData,
      }, { onConflict: ['personel_id'] });

      toast.success("Bilgileriniz başarıyla kaydedildi.");
    } catch (err) {
      setError("Bilgiler kaydedilirken bir hata oluştu.");
      toast.error("Bilgiler kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
          navigate("/login");
          return;
        }
        const userRole = data.session.user.user_metadata?.role;
        if (userRole !== 'staff' && userRole !== 'admin') {
          setError("Yetkiniz yok veya profil tamamlanmamış. Lütfen giriş ekranına dönün.");
          navigate("/login");
          return;
        }
      } catch (error) {
        setError("Kullanıcı bilgisi doğrulanamadı. Lütfen tekrar giriş yapın.");
        navigate("/login");
      }
    };
    checkUserType();
    checkUserAndLoadData();
  }, [navigate]);

  const checkUserAndLoadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.");
        navigate("/login");
        return;
      }

      // Numeric personel id için burada çekiyoruz
      const { data: personel } = await supabase
        .from('personel')
        .select('id, dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (!personel) {
        setError("Personel kaydı bulunamadı. Lütfen profilinizi tamamlayın.");
        setLoading(false);
        return;
      }
      if (personel.dukkan_id) {
        navigate('/staff-profile');
        return;
      }

      // Profil bilgisi
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      }

      // Eğitim bilgisi
      const { data: educationDataLoaded } = await supabase
        .from('staff_education')
        .select('*')
        .eq('personel_id', personel.id)
        .maybeSingle();

      if (educationDataLoaded) setEducationData(educationDataLoaded);

      // Geçmiş bilgisi
      const { data: historyDataLoaded } = await supabase
        .from('staff_history')
        .select('*')
        .eq('personel_id', personel.id)
        .maybeSingle();

      if (historyDataLoaded) setHistoryData(historyDataLoaded);

      setLoading(false);
    } catch (error: any) {
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <h3 className="font-bold">Hata</h3>
          <p>{error}</p>
        </div>
        <Button variant="default" onClick={() => navigate("/login")}>
          Giriş Sayfasına Dön
        </Button>
      </div>
    );
  }

  const renderSideNavigation = () => (
    <div className="w-64 bg-white border-r h-screen fixed left-0 top-0 overflow-y-auto hidden md:block">
      <div className="flex flex-col items-center p-6 border-b">
        <Avatar className="w-24 h-24">
          {userProfile?.avatar_url ? (
            <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
          ) : (
            <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
              {userProfile?.first_name?.[0] || 'P'}
            </AvatarFallback>
          )}
        </Avatar>
        <h3 className="mt-4 font-semibold text-xl">{userProfile?.first_name} {userProfile?.last_name}</h3>
        <p className="text-sm text-gray-500">Personel</p>
      </div>
      
      <nav className="p-4 space-y-2">
        <button 
          onClick={() => setActiveTab("personal")}
          className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeTab === "personal" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <User size={18} className="mr-3" />
          Kişisel Bilgiler
        </button>
        
        <button 
          onClick={() => setActiveTab("education")}
          className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeTab === "education" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <School size={18} className="mr-3" />
          Eğitim Bilgileri
        </button>
        
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeTab === "history" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <History size={18} className="mr-3" />
          Geçmiş Bilgileri
        </button>
        
        <button 
          onClick={() => navigate("/staff-join-request")}
          className={`flex items-center w-full px-4 py-2 text-left rounded-md text-gray-600 hover:bg-gray-100`}
        >
          <Briefcase size={18} className="mr-3" />
          İşletmeye Katıl
        </button>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full flex items-center justify-center"
        >
          <LogOut size={18} className="mr-2" />
          Oturumu Kapat
        </Button>
      </div>
    </div>
  );

  const renderMobileNavigation = () => (
    <div className="md:hidden">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {userProfile?.first_name?.[0] || 'P'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{userProfile?.first_name} {userProfile?.last_name}</h3>
            <p className="text-xs text-gray-500">Personel</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center">
            <User size={16} className="mr-2" /> Kişisel
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center">
            <School size={16} className="mr-2" /> Eğitim
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History size={16} className="mr-2" /> Geçmiş
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  const renderPersonalInfo = () => (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24">
              {userProfile?.avatar_url ? (
                <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
              ) : (
                <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                  {userProfile?.first_name?.[0] || 'P'}
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-sm text-gray-500 mt-2">Profil fotoğrafı</p>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">Kişisel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Ad Soyad</span>
                <span className="font-medium">{userProfile?.first_name} {userProfile?.last_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">E-posta</span>
                <span className="font-medium">{userProfile?.email || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Telefon</span>
                <span className="font-medium">{userProfile?.phone || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Adres</span>
                <span className="font-medium">{userProfile?.address || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  console.log("Rendering UnassignedStaff with activeTab:", activeTab);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {renderMobileNavigation()}
      <div className="flex">
        {renderSideNavigation()}
        
        <div className="md:ml-64 w-full p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <TabsContent value="personal" className="mt-0">
              {renderPersonalInfo()}
            </TabsContent>
            
            <TabsContent value="education" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Eğitim Bilgileri</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="ortaokuldurumu" className="block text-sm font-medium text-gray-700 mb-1">
                        Ortaokul Durumu
                      </label>
                      <input
                        id="ortaokuldurumu"
                        className="w-full p-2 border rounded-md"
                        value={educationData.ortaokuldurumu}
                        onChange={(e) => setEducationData({...educationData, ortaokuldurumu: e.target.value})}
                        placeholder="Ör: Mezun, Devam Ediyor..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lisedurumu" className="block text-sm font-medium text-gray-700 mb-1">
                        Lise Durumu
                      </label>
                      <input
                        id="lisedurumu"
                        className="w-full p-2 border rounded-md"
                        value={educationData.lisedurumu}
                        onChange={(e) => setEducationData({...educationData, lisedurumu: e.target.value})}
                        placeholder="Ör: Mezun, Devam Ediyor..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="liseturu" className="block text-sm font-medium text-gray-700 mb-1">
                        Lise Türü
                      </label>
                      <input
                        id="liseturu"
                        className="w-full p-2 border rounded-md"
                        value={educationData.liseturu}
                        onChange={(e) => setEducationData({...educationData, liseturu: e.target.value})}
                        placeholder="Ör: Anadolu, Meslek Lisesi..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="meslekibrans" className="block text-sm font-medium text-gray-700 mb-1">
                        Mesleki Branş
                      </label>
                      <input
                        id="meslekibrans"
                        className="w-full p-2 border rounded-md"
                        value={educationData.meslekibrans}
                        onChange={(e) => setEducationData({...educationData, meslekibrans: e.target.value})}
                        placeholder="Ör: Kuaförlük, Estetik..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="universitedurumu" className="block text-sm font-medium text-gray-700 mb-1">
                        Üniversite Durumu
                      </label>
                      <input
                        id="universitedurumu"
                        className="w-full p-2 border rounded-md"
                        value={educationData.universitedurumu}
                        onChange={(e) => setEducationData({...educationData, universitedurumu: e.target.value})}
                        placeholder="Ör: Mezun, Devam Ediyor..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="universitebolum" className="block text-sm font-medium text-gray-700 mb-1">
                        Üniversite Bölüm
                      </label>
                      <input
                        id="universitebolum"
                        className="w-full p-2 border rounded-md"
                        value={educationData.universitebolum}
                        onChange={(e) => setEducationData({...educationData, universitebolum: e.target.value})}
                        placeholder="Ör: İşletme, Güzellik Uzmanlığı..."
                      />
                    </div>
                    
                    <Button
                      onClick={handleSave}
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      disabled={loading}
                    >
                      {loading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Geçmiş Bilgileri</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="isyerleri" className="block text-sm font-medium text-gray-700 mb-1">
                        İşyerleri
                      </label>
                      <textarea
                        id="isyerleri"
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        value={historyData.isyerleri}
                        onChange={(e) => setHistoryData({...historyData, isyerleri: e.target.value})}
                        placeholder="Çalıştığınız işyerleri..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="gorevpozisyon" className="block text-sm font-medium text-gray-700 mb-1">
                        Görev Pozisyon
                      </label>
                      <textarea
                        id="gorevpozisyon"
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        value={historyData.gorevpozisyon}
                        onChange={(e) => setHistoryData({...historyData, gorevpozisyon: e.target.value})}
                        placeholder="Üstlendiğiniz görevler..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="belgeler" className="block text-sm font-medium text-gray-700 mb-1">
                        Belgeler
                      </label>
                      <textarea
                        id="belgeler"
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        value={historyData.belgeler}
                        onChange={(e) => setHistoryData({...historyData, belgeler: e.target.value})}
                        placeholder="Sahip olduğunuz belgeler..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="yarismalar" className="block text-sm font-medium text-gray-700 mb-1">
                        Yarışmalar
                      </label>
                      <textarea
                        id="yarismalar"
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        value={historyData.yarismalar}
                        onChange={(e) => setHistoryData({...historyData, yarismalar: e.target.value})}
                        placeholder="Katıldığınız yarışmalar..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">
                        CV
                      </label>
                      <textarea
                        id="cv"
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        value={historyData.cv}
                        onChange={(e) => setHistoryData({...historyData, cv: e.target.value})}
                        placeholder="Özgeçmişiniz..."
                      />
                    </div>
                    
                    <Button
                      onClick={handleSave}
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      disabled={loading}
                    >
                      {loading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="md:hidden p-4">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => navigate("/staff-join-request")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Briefcase size={18} className="mr-2" />
                  İşletmeye Katıl
                </Button>
                
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut size={18} className="mr-2" />
                  Oturumu Kapat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
