
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123"); // Default longer password
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        setLoginError(error.message);
        return;
      }
      
      // Check if user is a customer
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .single();
      
      if (profileData?.role !== 'customer' && profileData?.role !== null) {
        toast.error("Bu hesap müşteri girişi için yetkili değil.");
        
        // Sign out the user
        await supabase.auth.signOut();
        setLoginError("Bu hesap müşteri girişi için yetkili değil.");
        setLoading(false);
        return;
      }
      
      toast.success("Giriş başarılı! Müşteri paneline yönlendiriliyorsunuz.");
      
      // Direct user to appointments page after successful login
      navigate("/appointments");
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Customer registration handler
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    
    try {
      // Create new user with email/password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: "customer"
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        setLoginError(error.message);
        return;
      }
      
      toast.success("Kayıt başarılı! Müşteri bilgi formunu doldurmanız gerekmektedir.");
      
      // Redirect to customer profile form
      navigate("/customer-profile");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      setLoginError(error.message || "Kayıt yapılırken bir hata oluştu");
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
        setLoginError("Personel girişi başarısız: " + error.message);
        return;
      }
      
      // Check if user has staff role in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .single();
      
      if (profileData?.role !== 'staff') {
        toast.error("Bu hesabın personel girişi için yetkisi yok.");
        
        // Sign out the user
        await supabase.auth.signOut();
        setLoginError("Bu hesap personel girişi için yetkili değil.");
        setLoading(false);
        return;
      }
      
      toast.success("Giriş başarılı! Personel paneline yönlendiriliyorsunuz.");
      navigate("/personnel");
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Staff registration handler
  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    
    try {
      // Create new user with email/password and staff role
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: "staff"
          }
        }
      });
      
      if (error) {
        console.error("Staff signup error:", error);
        setLoginError(error.message);
        return;
      }
      
      // Create profile with staff role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user?.id,
          first_name: firstName,
          last_name: lastName,
          phone: "",
          role: "staff"
        });
      
      if (profileError) {
        console.error("Profile creation error:", profileError);
        setLoginError(profileError.message);
        return;
      }
      
      toast.success("Personel kaydı başarılı! Yönetici onayı gerekebilir.");
      
      // Redirect to login page
      navigate("/");
      
    } catch (error: any) {
      console.error("Staff signup error:", error);
      setLoginError(error.message || "Personel kaydı yapılırken bir hata oluştu");
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

        {/* Features and Login Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
            <Card className="h-auto">
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
              
              {/* Customer Login Section */}
              <CardFooter className="flex-col">
                <div className="w-full mb-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-center mb-4">Müşteri Girişi</h3>
                </div>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                    <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleCustomerLogin} className="space-y-4">
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
                          Varsayılan şifre "password123". En az 6 karakter olmalıdır.
                        </p>
                      </div>
                      
                      {loginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{loginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleCustomerRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-email-register">E-posta</Label>
                        <Input 
                          id="customer-email-register" 
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">Adınız</Label>
                          <Input 
                            id="first-name" 
                            type="text" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Soyadınız</Label>
                          <Input 
                            id="last-name" 
                            type="text" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-password-register">Şifre</Label>
                        <Input 
                          id="customer-password-register" 
                          type="password" 
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError();
                          }}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Varsayılan şifre "password123". En az 6 karakter olmalıdır.
                        </p>
                      </div>
                      
                      {loginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{loginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="h-auto">
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
              
              {/* Staff Login Section */}
              <CardFooter className="flex-col">
                <div className="w-full mb-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-center mb-4">Personel Girişi</h3>
                </div>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                    <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleStaffLogin} className="space-y-4">
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
                          Varsayılan şifre "password123". En az 6 karakter olmalıdır.
                        </p>
                      </div>
                      
                      {loginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{loginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading ? "Giriş yapılıyor..." : "Personel Girişi"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleStaffRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="staff-email-register">E-posta</Label>
                        <Input 
                          id="staff-email-register" 
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="staff-first-name">Adınız</Label>
                          <Input 
                            id="staff-first-name" 
                            type="text" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="staff-last-name">Soyadınız</Label>
                          <Input 
                            id="staff-last-name" 
                            type="text" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staff-password-register">Şifre</Label>
                        <Input 
                          id="staff-password-register" 
                          type="password" 
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError();
                          }}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Varsayılan şifre "password123". En az 6 karakter olmalıdır.
                        </p>
                      </div>
                      
                      {loginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{loginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading ? "Kaydediliyor..." : "Personel Kaydı Oluştur"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
