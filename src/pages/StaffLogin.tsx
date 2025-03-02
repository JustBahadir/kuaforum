
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Check if the user has the staff role
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user) {
        const { data: staffData } = await supabase
          .from('personel')
          .select('*')
          .eq('email', userData.user.email)
          .single();
          
        if (staffData) {
          toast.success("Kuaför girişi başarılı!");
          navigate("/dashboard");
        } else {
          // If not staff, sign out and show error
          await supabase.auth.signOut();
          toast.error("Bu hesap bir kuaför hesabı değil.");
        }
      }
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      toast.error("Giriş yapılamadı: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First register the user in auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'staff'
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Then add to personel table
        const { data: personelData, error: personelError } = await supabase
          .from('personel')
          .insert([
            {
              email: email,
              ad_soyad: `${firstName} ${lastName}`,
              telefon: phone,
              durum: 'aktif'
            }
          ]);
          
        if (personelError) throw personelError;
        
        toast.success("Kuaför kaydı başarılı! Giriş yapabilirsiniz.");
        // Switch to login tab
      } else {
        toast.warning("Kaydınız oluşturuldu. E-posta onayı gerekebilir.");
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      toast.error("Kayıt yapılamadı: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="text-white hover:text-white/80 hover:bg-white/10 absolute top-2 left-2 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-center text-2xl">Kuaför Girişi</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">E-posta</Label>
                  <Input 
                    id="staff-email" 
                    type="email" 
                    placeholder="personel@salonyonetim.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">Şifre</Label>
                  <Input 
                    id="staff-password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
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
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-posta</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="personel@salonyonetim.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Şifre</Label>
                  <Input 
                    id="register-password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-firstName">Ad</Label>
                  <Input 
                    id="register-firstName" 
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastName">Soyad</Label>
                  <Input 
                    id="register-lastName" 
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Telefon</Label>
                  <Input 
                    id="register-phone" 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-4">
            <Button 
              variant="link" 
              onClick={() => navigate("/")}
              className="text-purple-600 hover:text-purple-800"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
