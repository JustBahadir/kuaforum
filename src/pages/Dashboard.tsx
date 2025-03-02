
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { Toaster } from "@/components/ui/toaster";

// New icons imports
import { ChevronRight, CheckCircle, Scissors, Calendar, Users, CreditCard, PieChart, Bell } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // User is already logged in, fetch profile to determine redirect path
        const profile = await profilServisi.getir();
        if (profile?.role === 'staff') {
          navigate('/personnel');
        } else {
          navigate('/appointments');
        }
      }
    };
    
    checkSession();
  }, [navigate]);
  
  // Customer auth state
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Customer login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Clear error when form changes
  const clearError = () => {
    if (loginError) setLoginError("");
  };

  // Handle customer login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    
    try {
      console.log("Attempting login with:", email);
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        console.error("Login error:", error);
        setLoginError("E-posta veya şifre hatalı.");
        setLoading(false);
        return;
      }
      
      if (!data.user) {
        setLoginError("Giriş yapılırken beklenmeyen bir hata oluştu.");
        setLoading(false);
        return;
      }
      
      // Fetch profile
      try {
        const profile = await profilServisi.getir();
        
        toast({
          title: "Başarılı",
          description: "Giriş başarılı! Randevularınıza yönlendiriliyorsunuz."
        });
        
        // Save auth in browser if remember me is checked
        if (rememberMe) {
          localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        }
        
        // Navigate to appropriate page based on role
        if (profile?.role === 'staff') {
          setTimeout(() => navigate("/personnel"), 500);
        } else {
          setTimeout(() => navigate("/appointments"), 500);
        }
      } catch (profileError: any) {
        console.error("Profile fetch error:", profileError);
        setLoginError("Profil bilgileri alınamadı. Lütfen tekrar deneyin.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Giriş yapılırken bir hata oluştu");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle customer registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    
    try {
      // Validate form
      if (!email || !password || !firstName || !lastName || !phone) {
        setLoginError("Lütfen tüm zorunlu alanları doldurunuz");
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setLoginError("Şifreler eşleşmiyor");
        setLoading(false);
        return;
      }
      
      // Create new user with email/password
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            age: age,
            role: "customer"
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes("already registered")) {
          setLoginError("Bu e-posta adresi ile kayıtlı bir hesap bulunmaktadır. Lütfen giriş yapınız.");
        } else {
          setLoginError(error.message);
        }
        
        setLoading(false);
        return;
      }
      
      if (!data.user) {
        throw new Error("Kullanıcı oluşturulamadı");
      }
      
      // Create or update profile with customer role
      try {
        await profilServisi.createOrUpdateProfile(data.user.id, {
          first_name: firstName,
          last_name: lastName,
          role: "customer",
          phone: phone
        });
        
        toast({
          title: "Başarılı", 
          description: "Kayıt başarılı! Randevularınıza yönlendiriliyorsunuz."
        });
        
        // Navigate to appointments page
        setTimeout(() => {
          navigate("/appointments");
        }, 500);
      } catch (profileError: any) {
        console.error("Profile creation error:", profileError);
        toast({
          title: "Uyarı",
          description: "Profil oluşturulurken bir hata oluştu, ancak hesabınız kaydedildi.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          navigate("/customer-profile");
        }, 500);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setLoginError(error.message || "Kayıt yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Staff login handler - redirects to empty page for now
  const handleStaffLogin = () => {
    navigate("/staff-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Scissors className="h-8 w-8 text-pink-500 mr-2" />
              <span className="font-bold text-2xl text-gray-800">SalonYönetim</span>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setIsLogin(true)}
                variant="outline" 
                className="bg-white hover:bg-gray-50"
              >
                Müşteri Girişi
              </Button>
              <Button 
                onClick={handleStaffLogin}
                variant="outline" 
                className="bg-white hover:bg-gray-50 border-purple-200 text-purple-700 hover:text-purple-800 hover:border-purple-300"
              >
                Kuaför Girişi
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Kuaför Salonları İçin<br />
                <span className="text-pink-600">A'dan Z'ye Yönetim Programı</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Modern ve kullanıcı dostu salon yönetim sistemi ile hizmetlerinizi ve müşterilerinizi kolayca yönetin.
              </p>
              <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg rounded-lg">
                7 Gün Ücretsiz Deneyin <ChevronRight className="ml-2" />
              </Button>
            </div>
            <div className="md:w-1/2">
              {/* Login/Registration Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="text-center text-2xl">
                    {isLogin ? "Müşteri Girişi" : "Yeni Hesap Oluştur"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLogin ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta veya Telefon</Label>
                        <Input 
                          id="email" 
                          type="text" 
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
                        <Label htmlFor="password">Şifre</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError();
                          }}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember-me" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label
                          htmlFor="remember-me"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Beni hatırla
                        </label>
                      </div>
                      
                      {loginError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{loginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white" 
                        disabled={loading}
                      >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                      </Button>
                      
                      <p className="text-center text-sm text-gray-600 mt-4">
                        Hesabınız yok mu?{" "}
                        <button
                          type="button"
                          className="text-pink-600 hover:text-pink-700 font-medium"
                          onClick={() => {
                            setIsLogin(false);
                            clearError();
                          }}
                        >
                          Kayıt olmak için tıklayınız
                        </button>
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Adınız <span className="text-red-500">*</span></Label>
                          <Input 
                            id="firstName" 
                            type="text" 
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              clearError();
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Soyadınız <span className="text-red-500">*</span></Label>
                          <Input 
                            id="lastName" 
                            type="text" 
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              clearError();
                            }}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-register">E-posta <span className="text-red-500">*</span></Label>
                          <Input 
                            id="email-register" 
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
                          <Label htmlFor="phone">Telefon <span className="text-red-500">*</span></Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="05XXXXXXXXX" 
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              clearError();
                            }}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="age">Yaşınız</Label>
                        <Input 
                          id="age" 
                          type="number" 
                          min="18"
                          max="100"
                          placeholder="30" 
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password-register">Şifre <span className="text-red-500">*</span></Label>
                        <Input 
                          id="password-register" 
                          type="password" 
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError();
                          }}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          En az 6 karakter uzunluğunda olmalıdır.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Şifreyi Doğrulayın <span className="text-red-500">*</span></Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearError();
                          }}
                          required
                        />
                      </div>
                      
                      {loginError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm">{loginError}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white" 
                        disabled={loading}
                      >
                        {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                      </Button>
                      
                      <p className="text-center text-sm text-gray-600 mt-4">
                        Zaten hesabınız var mı?{" "}
                        <button
                          type="button"
                          className="text-pink-600 hover:text-pink-700 font-medium"
                          onClick={() => {
                            setIsLogin(true);
                            clearError();
                          }}
                        >
                          Giriş yapmak için tıklayınız
                        </button>
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Türkiye'de <span className="text-pink-600">Gururla</span> Geliştirildi,
          </h2>
          <h3 className="text-2xl font-bold text-gray-700 mb-16">
            60 Ülkede <span className="text-pink-600">Aşkla</span> Kullanılıyor!
          </h3>
          
          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-pink-100 p-3 rounded-full inline-block mb-4">
                <Calendar className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Randevu Takvimi</h3>
              <p className="text-gray-600">
                Tüm randevularınız tek bir sayfada toplayarak çakışmaları önleyin ve randevularınız kolayca takip edin.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full inline-block mb-4">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Paket Hizmet Satışı</h3>
              <p className="text-gray-600">
                Müşterilerinize özel seanslı ön ödemeli hizmet paketleri oluşturarak sadık müşterilerinizi ödüllendirin.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-pink-100 p-3 rounded-full inline-block mb-4">
                <PieChart className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Kasa ve Cari Takibi</h3>
              <p className="text-gray-600">
                Yapılan satışları ve tanımlanan cari ve masraflar sistemde sürekli takip ederek finansal kontrolünüz elinizde olsun.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full inline-block mb-4">
                <Scissors className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ürün ve Hizmet Yönetimi</h3>
              <p className="text-gray-600">
                Salonunuzda sunduğunuz tüm hizmetleri kolayca yönetin, fiyatlandırın ve ürün stoklarınızı takip edin.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-50 rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-pink-100 p-3 rounded-full inline-block mb-4">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Müşteri Takibi</h3>
              <p className="text-gray-600">
                Müşterilerinizin tüm geçmiş işlemlerini ve tercihleri kayıt altında tutun, özel kampanyalar hazırlayın.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-gray-50 rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full inline-block mb-4">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Otomatik SMS Bildirimleri</h3>
              <p className="text-gray-600">
                Randevu hatırlatmaları ve kampanya duyuruları için otomatik SMS bildirimleri gönderin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call To Action Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Salon Yönetiminizi Dijitalleştirmeye Başlayın</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Hemen ücretsiz deneme sürenizi başlatın ve salonunuzu modern bir şekilde yönetmenin avantajlarını keşfedin.
          </p>
          <Button className="bg-white text-purple-700 hover:bg-gray-100 text-lg px-8 py-6 rounded-lg">
            Şimdi Başlayın <ChevronRight className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">Müşterilerimiz Ne Diyor?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow text-left relative">
              <div className="absolute -top-4 left-6 bg-pink-100 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-pink-600" />
              </div>
              <p className="text-gray-600 italic mb-4">
                "Salon yönetim sistemini kullanmaya başladıktan sonra randevu çakışmaları tamamen ortadan kalktı ve müşteri memnuniyetimiz arttı."
              </p>
              <p className="font-semibold text-gray-800">Ayşe Yılmaz</p>
              <p className="text-sm text-gray-500">Kuaför Salonu Sahibi, İstanbul</p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow text-left relative">
              <div className="absolute -top-4 left-6 bg-purple-100 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-gray-600 italic mb-4">
                "Artık tüm finansal takibimi sistem üzerinden yapıyorum. Personel performanslarını ölçebilmek işimi çok kolaylaştırdı."
              </p>
              <p className="font-semibold text-gray-800">Mehmet Kaya</p>
              <p className="text-sm text-gray-500">Güzellik Merkezi Sahibi, Ankara</p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow text-left relative">
              <div className="absolute -top-4 left-6 bg-pink-100 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-pink-600" />
              </div>
              <p className="text-gray-600 italic mb-4">
                "SMS hatırlatma özelliği sayesinde unutulan randevular minimuma indi. Müşterilerimiz de sistemden çok memnun."
              </p>
              <p className="font-semibold text-gray-800">Zeynep Demir</p>
              <p className="text-sm text-gray-500">Saç Stilisti, İzmir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Hakkımızda</h3>
              <p className="text-gray-400">
                Salonunuzu dijitalleştiren modern ve kullanıcı dostu yönetim sistemi.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hizmetlerimiz</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Randevu Yönetimi</li>
                <li>Müşteri Takibi</li>
                <li>Kasa Yönetimi</li>
                <li>Personel Yönetimi</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2 text-gray-400">
                <li>info@salonyonetim.com</li>
                <li>+90 850 123 45 67</li>
                <li>İstanbul, Türkiye</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Bizi Takip Edin</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2023 Salon Yönetim Sistemi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
