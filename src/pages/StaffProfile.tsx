
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PhoneInput } from "@/components/ui/phone-input";

export default function StaffProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [shopCode, setShopCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);

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
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        setProfile(profileData || {});
        
        // Check if user is a staff and attached to any shop
        const { data: personelData } = await supabase
          .from('personel')
          .select('dukkan_id, id')
          .eq('auth_id', data.session.user.id)
          .maybeSingle();
          
        if (personelData?.dukkan_id) {
          // If staff is assigned to a shop, redirect to shop home
          navigate('/shop-home');
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
      navigate('/login');
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
        .from('dukkanlar')
        .select('id, ad')
        .eq('kod', shopCode.trim())
        .single();
        
      if (shopError || !shopData) {
        toast.error("Geçersiz işletme kodu. Lütfen doğru kodu girdiğinizden emin olun.");
        return;
      }
      
      // Create personel record
      const { error: personelError } = await supabase
        .from('personel')
        .insert({
          auth_id: user.id,
          ad_soyad: `${profile.first_name} ${profile.last_name}`,
          telefon: profile.phone || '',
          eposta: user.email,
          adres: profile.address || '',
          personel_no: `P${Math.floor(Math.random() * 10000)}`,
          dukkan_id: shopData.id,
          maas: 0,
          prim_yuzdesi: 0,
          calisma_sistemi: 'aylik_maas'
        });
        
      if (personelError) {
        throw personelError;
      }
      
      toast.success(`"${shopData.ad}" işletmesine başarıyla katıldınız!`);
      navigate('/shop-home');
      
    } catch (error) {
      console.error("İşletmeye katılırken hata:", error);
      toast.error("İşletmeye katılırken bir hata oluştu.");
    } finally {
      setValidatingCode(false);
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
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{profile?.first_name} {profile?.last_name}</h2>
                <p className="text-muted-foreground text-sm">Personel</p>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setActiveTab('profile')}
              >
                Özlük Bilgileri
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setActiveTab('education')}
              >
                Eğitim Bilgileri
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setActiveTab('history')}
              >
                Geçmiş Bilgiler
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setActiveTab('join')}
              >
                İşletmeye Katıl
              </Button>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogout}
              >
                Oturumu Kapat
              </Button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'profile' && 'Özlük Bilgileri'}
                  {activeTab === 'education' && 'Eğitim Bilgileri'}
                  {activeTab === 'history' && 'Geçmiş Bilgiler'}
                  {activeTab === 'join' && 'İşletmeye Katıl'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Ad Soyad</label>
                        <p>{profile?.first_name} {profile?.last_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">E-posta</label>
                        <p>{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Telefon</label>
                        <p>{profile?.phone || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Adres</label>
                        <p>{profile?.address || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'education' && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Henüz eğitim bilgisi eklenmemiş</p>
                  </div>
                )}
                
                {activeTab === 'history' && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Henüz geçmiş bilgisi bulunmuyor</p>
                  </div>
                )}
                
                {activeTab === 'join' && (
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
