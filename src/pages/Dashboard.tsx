
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123"); // Default longer password
  const [loginError, setLoginError] = useState("");
  
  // Clear error when tab changes or input changes
  const clearError = () => {
    if (loginError) setLoginError("");
  };

  // Customer login handler
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    
    try {
      // First try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If login failed, try to sign them up
      if (error) {
        console.log("Login error, attempting signup:", error.message);
        
        // Check if it's a new user, then sign them up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "customer"
            }
          }
        });
        
        if (signUpError) {
          console.error("Signup error:", signUpError);
          setLoginError(signUpError.message);
          return;
        }
        
        toast({
          title: "Yeni hesap oluşturuldu!",
          description: "Başarıyla kaydoldunuz. Müşteri bilgi formunu doldurmanız gerekmektedir.",
        });
        
        // Redirect to customer profile form
        navigate("/customer-profile");
        return;
      }
      
      toast({
        title: "Giriş başarılı!",
        description: "Müşteri paneline yönlendiriliyorsunuz.",
      });
      
      // Check if profile is complete
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, age, occupation')
        .eq('id', data.user?.id)
        .single();
      
      if (!profileData?.first_name || !profileData?.phone) {
        navigate("/customer-profile");
      } else {
        navigate("/appointments");
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Staff login handler
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    
    try {
      // Sign in with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Staff login error:", error);
        setLoginError("Personel girişi için geçerli bir hesap gereklidir. Yöneticinize başvurun.");
        return;
      }
      
      // Check if user is staff
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .maybeSingle();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }
      
      if (profileData?.role !== 'staff') {
        toast({
          title: "Yetkisiz giriş!",
          description: "Bu hesabın personel girişi için yetkisi yok.",
          variant: "destructive",
        });
        
        // Sign out the user
        await supabase.auth.signOut();
        setLoginError("Bu hesap personel girişi için yetkili değil.");
        return;
      }
      
      toast({
        title: "Giriş başarılı!",
        description: "Personel paneline yönlendiriliyorsunuz.",
      });
      
      navigate("/personnel");
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Landing Info */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">Salon Yönetim Sistemi</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Modern ve kullanıcı dostu salon yönetim sistemi ile hizmetlerinizi ve müşterilerinizi kolayca yönetin.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-800">Müşteri Özellikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Online randevu alma ve yönetme</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Kişisel bakım hizmetlerine kolay erişim</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Geçmiş işlemlerinizi görüntüleme</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Özel indirim ve kampanyalardan haberdar olma</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-800">Personel Özellikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Tüm randevuları takvim üzerinde görüntüleme</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Müşteri bilgilerini ve işlem geçmişini takip etme</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Performans raporları ve işlem istatistikleri</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Hizmet ve fiyatlandırma yönetimi</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Login Tabs */}
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="customer" className="w-full" onValueChange={clearError}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Müşteri Girişi</TabsTrigger>
              <TabsTrigger value="staff">Personel Girişi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>Müşteri Girişi</CardTitle>
                  <CardDescription>
                    Hesabınız yoksa, otomatik olarak oluşturulacaktır.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleCustomerLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-email">E-posta</Label>
                      <Input 
                        id="customer-email" 
                        type="email" 
                        placeholder="ornek@mail.com" 
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError();
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-password">Şifre</Label>
                      <Input 
                        id="customer-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError();
                        }}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Varsayılan şifre "password123" olarak ayarlanmıştır. En az 6 karakter uzunluğunda olmalıdır.
                      </p>
                    </div>
                    
                    {loginError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p className="text-sm">{loginError}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Giriş yapılıyor..." : "Giriş Yap / Kayıt Ol"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <CardTitle>Personel Girişi</CardTitle>
                  <CardDescription>
                    Salon personeli için giriş. Yeni personel hesapları yönetici tarafından oluşturulur.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleStaffLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staff-email">E-posta</Label>
                      <Input 
                        id="staff-email" 
                        type="email" 
                        placeholder="personel@salonadi.com" 
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError();
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staff-password">Şifre</Label>
                      <Input 
                        id="staff-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError();
                        }}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Varsayılan şifre "password123" olarak ayarlanmıştır. En az 6 karakter uzunluğunda olmalıdır.
                      </p>
                    </div>
                    
                    {loginError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p className="text-sm">{loginError}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Giriş yapılıyor..." : "Personel Girişi"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
