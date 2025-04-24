
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

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.error("Auth error or no session:", error);
          navigate("/login");
          return;
        }
        
        const userRole = data.session.user.user_metadata?.role;
        if (userRole !== 'staff' && userRole !== 'admin') {
          console.error("Wrong user role:", userRole);
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      }
    };
    
    checkUserType();
    checkUserAndLoadData();
  }, [navigate]);

  const checkUserAndLoadData = async () => {
    try {
      console.log("UnassignedStaff: Checking user and loading data");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Auth error:", userError);
        navigate("/login");
        return;
      }

      console.log("UnassignedStaff: User found:", user.id);

      // Check if user is already connected to a shop
      const { data: staffData, error: staffError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
        
      if (staffError) {
        console.error("Staff data fetch error:", staffError);
      }
      
      // If staff is assigned to a shop, redirect to staff profile
      if (staffData && staffData.dukkan_id) {
        console.log("UnassignedStaff: User is connected to a shop, redirecting to staff profile");
        navigate('/staff-profile');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        // Don't return early if profile fetch fails, try to continue
      }

      if (profileData) {
        console.log("UnassignedStaff: Profile data loaded:", profileData);
        setUserProfile(profileData);
      }

      // Load existing education data if any
      const { data: educationData, error: eduError } = await supabase
        .from('staff_education')
        .select('*')
        .eq('personel_id', user.id)
        .maybeSingle();

      if (eduError) {
        console.error("Education data error:", eduError);
      }

      if (educationData) {
        console.log("UnassignedStaff: Education data loaded");
        setEducationData(educationData);
      }

      // Load existing history data if any
      const { data: historyData, error: histError } = await supabase
        .from('staff_history')
        .select('*')
        .eq('personel_id', user.id)
        .maybeSingle();

      if (histError) {
        console.error("History data error:", histError);
      }

      if (historyData) {
        console.log("UnassignedStaff: History data loaded");
        setHistoryData(historyData);
      }

      setLoading(false);
    } catch (error) {
      console.error("UnassignedStaff: Error loading user data:", error);
      toast.error("Kullanıcı bilgileri yüklenirken bir hata oluştu");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast.error("Çıkış yapılırken bir hata oluştu");
      } else {
        toast.success("Başarıyla çıkış yapıldı");
        navigate("/login");
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast.error("Çıkış yapılırken beklenmeyen bir hata oluştu");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        console.error("User not found:", userError);
        throw new Error("Kullanıcı bulunamadı");
      }

      console.log("Saving data for user:", user.id);

      // Save education data
      const { error: eduError } = await supabase
        .from('staff_education')
        .upsert({
          personel_id: user.id,
          ...educationData,
          updated_at: new Date().toISOString()
        });

      if (eduError) {
        console.error("Education save error:", eduError);
        throw new Error("Eğitim bilgileri kaydedilemedi");
      }

      // Save history data
      const { error: histError } = await supabase
        .from('staff_history')
        .upsert({
          personel_id: user.id,
          ...historyData,
          updated_at: new Date().toISOString()
        });

      if (histError) {
        console.error("History save error:", histError);
        throw new Error("Geçmiş bilgileri kaydedilemedi");
      }

      toast.success("Bilgiler başarıyla kaydedildi");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Bilgiler kaydedilirken bir hata oluştu");
    } finally {
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
