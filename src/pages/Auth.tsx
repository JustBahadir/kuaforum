
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Home } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Check if user is already logged in - with a short timeout
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          // Redirect to dashboard if already logged in
          const metadata = data.session.user?.user_metadata;
          const userRole = metadata?.role || 'customer';
          
          if (userRole === 'customer') {
            navigate('/customer-dashboard');
          } else if (userRole === 'admin' || userRole === 'staff') {
            navigate('/admin/dashboard');
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simple signup flow
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'customer'
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simple direct login with minimal error handling
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      
      // Check if user is a customer
      const metadata = data.user?.user_metadata;
      if (metadata && metadata.role !== 'customer') {
        // Sign out if not a customer
        await supabase.auth.signOut();
        toast.error('Bu giriş sayfası sadece müşteriler içindir.');
        setLoading(false);
        return;
      }
      
      toast.success('Giriş başarılı!');
      navigate('/customer-dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Kuaför Randevu Sistemi</CardTitle>
          <CardDescription>
            Randevu almak için giriş yapın veya hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Giriş</TabsTrigger>
              <TabsTrigger value="register">Kayıt</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="loginEmail">E-posta</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
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
              <Link to="/admin">
                Personel olarak giriş yapmak için tıklayın
              </Link>
            </Button>
            <Button variant="secondary" asChild className="w-full">
              <Link to="/" className="flex items-center justify-center gap-2">
                <Home size={16} />
                <span>Ana Sayfaya Dön</span>
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-600">
          Kuaför randevu sistemi &copy; 2024
        </CardFooter>
      </Card>
    </div>
  );
}
