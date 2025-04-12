
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, Briefcase, UserCircle, AlertCircle, UserCog } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { formatCurrency } from "@/lib/utils";

export default function StaffProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [personnelData, setPersonnelData] = useState<any>(null);
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    skills: ""
  });

  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    setLoading(true);
    try {
      // Get current user data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/staff-login");
        return;
      }
      
      setUser(user);
      
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (!profileError && profileData) {
        setProfile(profileData);
        
        // Set form data
        setFormData({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          email: user.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          bio: profileData.bio || "",
          skills: profileData.skills || ""
        });
      }
      
      // Get personnel data
      const { data: personnelData, error: personnelError } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', user.id)
        .single();
        
      if (!personnelError && personnelData) {
        setPersonnelData(personnelData);
        
        // Get shop data if dukkan_id exists
        if (personnelData.dukkan_id) {
          const { data: shopData, error: shopError } = await supabase
            .from('dukkanlar')
            .select('*')
            .eq('id', personnelData.dukkan_id)
            .single();
            
          if (!shopError && shopData) {
            setShopData(shopData);
          }
        } else {
          // Check for pending shop join requests
          const { data: pendingRequests, error: requestsError } = await supabase
            .from('personel_shop_requests')
            .select('*, dukkanlar:dukkan_id(*)')
            .eq('personel_id', personnelData.id)
            .eq('status', 'pending');
            
          if (!requestsError && pendingRequests?.length > 0) {
            // Set shop status as pending
            setShopData({
              ad: pendingRequests[0].dukkanlar.ad,
              status: 'pending'
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Profil bilgileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          skills: formData.skills
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Update personnel record if exists
      if (personnelData) {
        const { error: personnelError } = await supabase
          .from('personel')
          .update({
            ad_soyad: `${formData.firstName} ${formData.lastName}`,
            telefon: formData.phone,
            adres: formData.address
          })
          .eq('id', personnelData.id);
          
        if (personnelError) throw personnelError;
      }
      
      toast.success("Profil bilgileriniz güncellendi");
      loadUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setUpdating(false);
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };
  
  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>Kişisel bilgilerinizi görüntüleyin ve güncelleyin</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-3 pt-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {getInitials(profile?.first_name || '', profile?.last_name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-medium text-lg">
                      {profile?.first_name} {profile?.last_name}
                    </h3>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                  </div>
                </div>
                
                <div className="pt-4 space-y-3">
                  {personnelData?.dukkan_id && shopData ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{shopData.ad}</span>
                    </div>
                  ) : shopData?.status === 'pending' ? (
                    <Alert variant="warning">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {shopData.ad} dükkanına katılım isteğiniz onay bekliyor.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Henüz bir dükkana bağlı değilsiniz.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {personnelData && (
                    <>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{personnelData.calisma_sistemi === 'prim_komisyon' ? 
                          `Prim/Komisyon (${personnelData.prim_yuzdesi}%)` : 
                          personnelData.calisma_sistemi === 'aylik_maas' ? 'Aylık Maaş' : 
                          personnelData.calisma_sistemi === 'haftalik_maas' ? 'Haftalık Maaş' : 
                          'Günlük Maaş'
                        }</span>
                      </div>
                      
                      {personnelData.maas > 0 && personnelData.calisma_sistemi !== 'prim_komisyon' && (
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                          <span>Maaş: {formatCurrency(personnelData.maas)}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.phone || '--'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{profile?.address || '--'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-2/3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Profil Yönetimi</CardTitle>
                <CardDescription>Profilinizi güncelleyin ve düzenleyin</CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                <Tabs 
                  defaultValue={activeTab} 
                  value={activeTab} 
                  onValueChange={setActiveTab} 
                  className="space-y-6"
                >
                  <TabsList>
                    <TabsTrigger value="profile">Kişisel Bilgiler</TabsTrigger>
                    <TabsTrigger value="professional">Mesleki Bilgiler</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Ad</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Soyad</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Adres</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="professional" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Hakkımda</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Kendiniz hakkında kısa bir bilgi..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="skills">Uzmanlık Alanları</Label>
                      <Textarea
                        id="skills"
                        value={formData.skills}
                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                        placeholder="Saç kesimi, ombre, perma, vb..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="mt-2">
                      <Alert>
                        <UserCircle className="h-4 w-4" />
                        <AlertDescription>
                          Doldurduğunuz mesleki bilgiler ileride iş başvurularında kullanılacaktır.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleUpdateProfile} disabled={updating}>
                    {updating ? "Güncelleniyor..." : "Profili Güncelle"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
