
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Home, User, UserPlus, LogIn } from 'lucide-react';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration specific
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Active tab: login or register
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          return;
        }
        if (data.session) {
          const metadata = data.session.user?.user_metadata;
          const userRole = metadata?.role || 'customer';

          if (userRole === 'customer') {
            navigate('/customer-dashboard');
          } else if (userRole === 'admin' || userRole === 'staff') {
            navigate('/admin/dashboard');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    checkSession();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Lütfen e-posta adresinizi girin');
      return;
    }
    if (!password) {
      toast.error('Lütfen şifrenizi girin');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          error.message.includes('User not found') ||
          error.message.includes('Invalid login credentials')
        ) {
          toast.error("Böyle bir kullanıcı bulunamadı. Kayıt olmak için 'Kayıt Ol' bölümüne geçin.");
          setActiveTab('register');
          setLoading(false);
          return;
        }
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const metadata = data.user?.user_metadata;
      if (metadata && metadata.role !== 'customer') {
        await supabase.auth.signOut();
        toast.error('Bu giriş sayfası sadece müşteriler içindir.');
        setLoading(false);
        return;
      }

      toast.success('Giriş başarılı!');
      navigate('/customer-dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Lütfen e-posta adresinizi girin');
      return;
    }
    if (!password) {
      toast.error('Lütfen şifrenizi girin');
      return;
    }
    if (!firstName.trim()) {
      toast.error('Lütfen adınızı girin');
      return;
    }
    if (!lastName.trim()) {
      toast.error('Lütfen soyadınızı girin');
      return;
    }

    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'customer',
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.error('Bu e-posta ile zaten bir hesap var. Lütfen giriş yapın.');
          setActiveTab('login');
          setLoading(false);
          return;
        }
        throw signUpError;
      }

      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      setActiveTab('login');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Kuaför Randevu Sistemi</CardTitle>
          <CardDescription>Randevu almak için giriş yapın veya hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center justify-center gap-1">
                <LogIn size={14} /> Giriş Yap
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center justify-center gap-1">
                <UserPlus size={14} /> Kayıt Ol
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="text-center mb-3 font-semibold text-gray-700">
                GOOGLE İLE GİRİŞ YAP
              </div>
              <GoogleAuthButton
                text="Google ile Giriş Yap"
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
              />
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase text-muted-foreground bg-gray-50">
                  veya
                </div>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="loginEmail">E-posta</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="loginPassword">Şifre</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <div className="text-center mb-3 font-semibold text-gray-700">
                GOOGLE İLE KAYDOL
              </div>
              <GoogleAuthButton
                text="Google ile Kayıt Ol"
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
              />
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase text-muted-foreground bg-gray-50">
                  veya
                </div>
              </div>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="registerEmail">E-posta</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registerPassword">Şifre</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registerFirstName">Ad</Label>
                  <Input
                    id="registerFirstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registerLastName">Soyad</Label>
                  <Input
                    id="registerLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center space-y-3">
            <Button variant="link" asChild>
              <Link to="/admin">Personel olarak giriş yapmak için tıklayın</Link>
            </Button>
            <div className="space-y-2">
              <Button variant="secondary" asChild className="w-full">
                <Link to="/" className="flex items-center justify-center gap-2">
                  <Home size={16} />
                  <span>Ana Sayfaya Dön</span>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-600">
          Kuaför randevu sistemi &copy; 2024
        </CardFooter>
      </Card>
    </div>
  );
}

