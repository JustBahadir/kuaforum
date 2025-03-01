
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { LogIn, UserPlus, Mail, Lock, User, UserRound } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Separate state for customer login
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerLoginError, setCustomerLoginError] = useState("");
  
  // Separate state for staff login
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffFirstName, setStaffFirstName] = useState("");
  const [staffLastName, setStaffLastName] = useState("");
  const [staffLoginError, setStaffLoginError] = useState("");
  
  // Clear error when tab changes or input changes for customer
  const clearCustomerError = () => {
    if (customerLoginError) setCustomerLoginError("");
  };

  // Clear error when tab changes or input changes for staff
  const clearStaffError = () => {
    if (staffLoginError) setStaffLoginError("");
  };

  // Customer login handler
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerLoading(true);
    setCustomerLoginError("");
    
    try {
      console.log("Attempting customer login with:", customerEmail);
      
      // First sign out if already signed in - this prevents the second login issue
      await supabase.auth.signOut();
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: customerEmail,
        password: customerPassword,
      });
      
      if (error) {
        console.error("Login error:", error);
        setCustomerLoginError(error.message);
        setCustomerLoading(false);
        return;
      }
      
      // Process login success
      try {
        // Check if user is a customer
        const profile = await profilServisi.getir();
        console.log("Retrieved user profile:", profile);
        
        if (!profile) {
          toast.error("Kullanıcı profili bulunamadı.");
          setCustomerLoginError("Kullanıcı profili bulunamadı.");
          setCustomerLoading(false);
          return;
        }
        
        const role = profile.role;
        console.log("User role:", role);
        
        if (role !== 'customer' && role !== null) {
          toast.error("Bu hesap müşteri girişi için yetkili değil.");
          
          // Sign out the user
          await supabase.auth.signOut();
          setCustomerLoginError("Bu hesap müşteri girişi için yetkili değil.");
          setCustomerLoading(false);
          return;
        }
        
        toast.success("Giriş başarılı! Müşteri paneline yönlendiriliyorsunuz.");
        
        // Check if profile is complete
        if (profile && profile.first_name && profile.last_name && profile.phone) {
          // Profile is complete, navigate to appointments
          navigate("/appointments");
        } else {
          // Profile is incomplete, navigate to profile completion page
          navigate("/customer-profile");
        }
      } catch (error: any) {
        console.error("Role check error:", error);
        setCustomerLoginError("Rol kontrolü sırasında bir hata oluştu");
        setCustomerLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setCustomerLoginError(error.message || "Giriş yapılırken bir hata oluştu");
      setCustomerLoading(false);
    }
  };

  // Customer registration handler
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerLoading(true);
    setCustomerLoginError("");
    
    try {
      if (!customerEmail || !customerPassword || !customerFirstName || !customerLastName) {
        setCustomerLoginError("Lütfen tüm alanları doldurunuz");
        setCustomerLoading(false);
        return;
      }
      
      // First sign out if already signed in
      await supabase.auth.signOut();
      
      // Create new user with email/password
      const { data, error } = await supabase.auth.signUp({
        email: customerEmail,
        password: customerPassword,
        options: {
          data: {
            first_name: customerFirstName,
            last_name: customerLastName,
            role: "customer"
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        setCustomerLoginError(error.message);
        setCustomerLoading(false);
        return;
      }
      
      // Create or update profile with customer role
      await profilServisi.createOrUpdateProfile(data.user?.id || "", {
        first_name: customerFirstName,
        last_name: customerLastName,
        role: "customer"
      });
      
      toast.success("Kayıt başarılı! Müşteri bilgi formunu doldurmanız gerekmektedir.");
      
      // Redirect to customer profile form
      navigate("/customer-profile");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      setCustomerLoginError(error.message || "Kayıt yapılırken bir hata oluştu");
      setCustomerLoading(false);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Staff login handler
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffLoginError("");
    
    try {
      console.log("Attempting staff login with:", staffEmail);
      
      // First sign out if already signed in - this prevents the second login issue
      await supabase.auth.signOut();
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: staffEmail,
        password: staffPassword,
      });
      
      if (error) {
        console.error("Staff login error:", error);
        setStaffLoginError("Personel girişi başarısız: " + error.message);
        setStaffLoading(false);
        return;
      }
      
      console.log("Login successful, user:", data.user);
      
      try {
        // Check if user has staff role in profiles table
        const profile = await profilServisi.getir();
        if (!profile) {
          toast.error("Kullanıcı profili bulunamadı.");
          setStaffLoginError("Kullanıcı profili bulunamadı.");
          
          // Sign out the user
          await supabase.auth.signOut();
          setStaffLoading(false);
          return;
        }
        
        const role = profile.role;
        console.log("Retrieved staff role:", role);
        
        if (role !== 'staff') {
          toast.error("Bu hesabın personel girişi için yetkisi yok.");
          
          // Sign out the user
          await supabase.auth.signOut();
          setStaffLoginError("Bu hesap personel girişi için yetkili değil.");
          setStaffLoading(false);
          return;
        }
        
        // Check if this user is linked to a personel record
        const { data: personelData, error: personelError } = await supabase
          .from('personel')
          .select('*')
          .eq('auth_id', data.user?.id)
          .maybeSingle();
          
        console.log("Personnel record:", personelData);
        
        if (!personelData && data.user) {
          console.log("Personnel record not found, creating one...");
          // Create a personel record if one doesn't exist
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          
          const { error: createError } = await supabase
            .from('personel')
            .insert({
              auth_id: data.user.id,
              ad_soyad: fullName || 'Anonim Personel',
              telefon: profile.phone || '',
              eposta: data.user.email || '',
              adres: '',
              personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`, // Generate a random staff number
              maas: 0,
              calisma_sistemi: 'aylik',
              prim_yuzdesi: 0
            });
            
          if (createError) {
            console.error("Error creating personnel record:", createError);
            toast.error("Personel kaydı oluşturulamadı: " + createError.message);
          } else {
            toast.success("Personel kaydınız oluşturuldu.");
          }
        } else if (personelError) {
          console.error("Personnel record error:", personelError);
          toast.error("Personel kaydınız kontrol edilirken bir hata oluştu.");
        }
        
        toast.success("Giriş başarılı! Personel paneline yönlendiriliyorsunuz.");
        navigate("/personnel");
      } catch (error: any) {
        console.error("Role check error:", error);
        setStaffLoginError("Rol kontrolü sırasında bir hata oluştu");
        setStaffLoading(false);
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      setStaffLoginError(error.message || "Giriş yapılırken bir hata oluştu");
      setStaffLoading(false);
    }
  };

  // Staff registration handler
  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffLoginError("");
    
    try {
      if (!staffEmail || !staffPassword || !staffFirstName || !staffLastName) {
        setStaffLoginError("Lütfen tüm alanları doldurunuz");
        setStaffLoading(false);
        return;
      }
      
      // First sign out if already signed in
      await supabase.auth.signOut();
      
      // Create new user with email/password and staff role
      const { data, error } = await supabase.auth.signUp({
        email: staffEmail,
        password: staffPassword,
        options: {
          data: {
            first_name: staffFirstName,
            last_name: staffLastName,
            role: "staff"
          }
        }
      });
      
      if (error) {
        console.error("Staff signup error:", error);
        setStaffLoginError(error.message);
        setStaffLoading(false);
        return;
      }
      
      if (!data.user) {
        throw new Error("Kullanıcı oluşturulamadı");
      }
      
      // Create or update profile with staff role
      await profilServisi.createOrUpdateProfile(data.user.id, {
        first_name: staffFirstName,
        last_name: staffLastName,
        role: "staff"
      });
      
      // Create personel record
      const { error: personelError } = await supabase
        .from('personel')
        .insert([{
          ad_soyad: `${staffFirstName} ${staffLastName}`,
          telefon: "",
          eposta: staffEmail,
          adres: "",
          personel_no: `P${Math.floor(Math.random() * 10000)}`,
          maas: 0,
          calisma_sistemi: "aylik",
          prim_yuzdesi: 0,
          auth_id: data.user.id
        }]);
        
      if (personelError) {
        console.error("Personnel creation error:", personelError);
        setStaffLoginError("Personel kaydı oluşturulurken bir hata oluştu: " + personelError.message);
        setStaffLoading(false);
        return;
      }
      
      toast.success("Personel kaydı başarılı! Giriş yapabilirsiniz.");
      
      // Clear registration fields and switch to login tab
      setStaffEmail("");
      setStaffPassword("");
      setStaffFirstName("");
      setStaffLastName("");
      
      // Correctly set tab to login using HTMLElement type casting
      const loginTab = document.querySelector('[data-state="inactive"][value="login"]');
      if (loginTab) {
        (loginTab as HTMLElement).click();
      }
      
    } catch (error: any) {
      console.error("Staff signup error:", error);
      setStaffLoginError(error.message || "Personel kaydı yapılırken bir hata oluştu");
    } finally {
      setStaffLoading(false);
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

        {/* Features and Login Section - Clear separation with borders */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Customer Side */}
          <div className="border-r-0 md:border-r border-indigo-200 pr-0 md:pr-4">
            <Card className="h-full">
              <CardHeader className="bg-indigo-50 rounded-t-lg">
                <CardTitle className="text-2xl text-indigo-800">Müşteri Özellikleri</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
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
                  <p className="text-sm text-center text-gray-600 mb-4">
                    İlk kez giriş yapacaksanız "Kayıt Ol" bölümünü, hesabınız var ise "Giriş Yap" bölümünü kullanınız.
                  </p>
                </div>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login" onClick={clearCustomerError}>Giriş Yap</TabsTrigger>
                    <TabsTrigger value="register" onClick={clearCustomerError}>Kayıt Ol</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleCustomerLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-email">E-posta</Label>
                        <Input 
                          id="customer-email" 
                          type="email" 
                          placeholder="ornek@mail.com" 
                          value={customerEmail}
                          onChange={(e) => {
                            setCustomerEmail(e.target.value);
                            clearCustomerError();
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-password">Şifre</Label>
                        <Input 
                          id="customer-password" 
                          type="password" 
                          value={customerPassword}
                          onChange={(e) => {
                            setCustomerPassword(e.target.value);
                            clearCustomerError();
                          }}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Varsayılan şifre "password123". En az 6 karakter olmalıdır.
                        </p>
                      </div>
                      
                      {customerLoginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{customerLoginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={customerLoading}
                      >
                        {customerLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
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
                          value={customerEmail}
                          onChange={(e) => {
                            setCustomerEmail(e.target.value);
                            clearCustomerError();
                          }}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer-first-name">Adınız</Label>
                          <Input 
                            id="customer-first-name" 
                            type="text" 
                            value={customerFirstName}
                            onChange={(e) => setCustomerFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer-last-name">Soyadınız</Label>
                          <Input 
                            id="customer-last-name" 
                            type="text" 
                            value={customerLastName}
                            onChange={(e) => setCustomerLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-password-register">Şifre</Label>
                        <Input 
                          id="customer-password-register" 
                          type="password" 
                          value={customerPassword}
                          onChange={(e) => {
                            setCustomerPassword(e.target.value);
                            clearCustomerError();
                          }}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Varsayılan şifre "password123". En az 6 karakter olmalıdır.
                        </p>
                      </div>
                      
                      {customerLoginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{customerLoginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={customerLoading}
                      >
                        {customerLoading ? "Kaydediliyor..." : "Kayıt Ol"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardFooter>
            </Card>
          </div>
          
          {/* Staff Side */}
          <div className="pl-0 md:pl-4">
            <Card className="h-full">
              <CardHeader className="bg-purple-50 rounded-t-lg">
                <CardTitle className="text-2xl text-purple-800">Personel Özellikleri</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
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
                  <p className="text-sm text-center text-gray-600 mb-4">
                    İlk kez giriş yapacaksanız "Kayıt Ol" bölümünü, hesabınız var ise "Giriş Yap" bölümünü kullanınız.
                  </p>
                </div>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login" onClick={clearStaffError}>Giriş Yap</TabsTrigger>
                    <TabsTrigger value="register" onClick={clearStaffError}>Kayıt Ol</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleStaffLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="staff-email">E-posta</Label>
                        <Input 
                          id="staff-email" 
                          type="email" 
                          placeholder="personel@salonadi.com" 
                          value={staffEmail}
                          onChange={(e) => {
                            setStaffEmail(e.target.value);
                            clearStaffError();
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staff-password">Şifre</Label>
                        <Input 
                          id="staff-password" 
                          type="password" 
                          value={staffPassword}
                          onChange={(e) => {
                            setStaffPassword(e.target.value);
                            clearStaffError();
                          }}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Varsayılan şifre "password123". En az 6 karakter olmalıdır.
                        </p>
                      </div>
                      
                      {staffLoginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{staffLoginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-700" 
                        disabled={staffLoading}
                      >
                        {staffLoading ? "Giriş yapılıyor..." : "Personel Girişi"}
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
                          value={staffEmail}
                          onChange={(e) => {
                            setStaffEmail(e.target.value);
                            clearStaffError();
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
                            value={staffFirstName}
                            onChange={(e) => setStaffFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="staff-last-name">Soyadınız</Label>
                          <Input 
                            id="staff-last-name" 
                            type="text" 
                            value={staffLastName}
                            onChange={(e) => setStaffLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staff-password-register">Şifre</Label>
                        <Input 
                          id="staff-password-register" 
                          type="password" 
                          value={staffPassword}
                          onChange={(e) => {
                            setStaffPassword(e.target.value);
                            clearStaffError();
                          }}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Varsayılan şifre "password123". En az 6 karakter olmalıdır.
                        </p>
                      </div>
                      
                      {staffLoginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{staffLoginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-700" 
                        disabled={staffLoading}
                      >
                        {staffLoading ? "Kaydediliyor..." : "Personel Kaydı Oluştur"}
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
