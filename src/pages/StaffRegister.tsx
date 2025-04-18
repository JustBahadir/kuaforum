
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function StaffRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopValidated, setShopValidated] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopId, setShopId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    shopCode: '',
  });

  const validateShopCode = async () => {
    if (!formData.shopCode.trim()) {
      setError("Dükkan kodu boş olamaz");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if shop code exists
      const { data, error: shopError } = await supabase
        .from('dukkanlar')
        .select('id, ad')
        .eq('kod', formData.shopCode)
        .single();
      
      if (shopError || !data) {
        setError("Geçersiz dükkan kodu. Lütfen kod bilgisini kontrol ediniz.");
        setLoading(false);
        return;
      }
      
      setShopId(data.id);
      setShopName(data.ad);
      setShopValidated(true);
      toast.success(`"${data.ad}" dükkanı doğrulandı`);
    } catch (err: any) {
      setError(err.message || "Dükkan kodu doğrulanırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopValidated) {
      setError("Lütfen önce dükkan kodunu doğrulayın");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'staff',
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Bu e-posta adresi zaten kayıtlı');
        }
        throw authError;
      }

      if (authData.user) {
        // Create personnel record
        const { error: staffError } = await supabase
          .from('personel')
          .insert([
            {
              auth_id: authData.user.id,
              ad_soyad: `${formData.firstName} ${formData.lastName}`,
              telefon: formData.phone,
              eposta: formData.email,
              adres: formData.address,
              personel_no: `P${Math.floor(Math.random() * 10000)}`,
              dukkan_id: shopId,
              maas: 0,
              prim_yuzdesi: 0,
              calisma_sistemi: 'aylik_maas',
              aktif: true,
              baslama_tarihi: new Date().toISOString().split('T')[0],
            }
          ]);

        if (staffError) {
          throw new Error('Personel kaydı oluşturulurken bir hata oluştu');
        }
      }

      toast.success('Personel kaydınız başarıyla alındı. Yönetici onayı bekleniyor.');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt işlemi sırasında bir hata oluştu');
      setError(error.message || 'Kayıt işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Personel Kayıt Formu</CardTitle>
          <CardDescription>
            Personel olarak kayıt olmak için bilgilerinizi giriniz.
            Kaydınız yönetici onayından sonra aktif olacaktır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopCode">Dükkan Kodu</Label>
              <div className="flex space-x-2">
                <Input
                  id="shopCode"
                  value={formData.shopCode}
                  onChange={(e) => setFormData({ ...formData, shopCode: e.target.value })}
                  disabled={shopValidated}
                  required
                />
                <Button 
                  type="button" 
                  onClick={validateShopCode} 
                  disabled={loading || shopValidated || !formData.shopCode.trim()}
                  variant="outline"
                >
                  {loading ? "..." : shopValidated ? "Doğrulandı" : "Doğrula"}
                </Button>
              </div>
              {shopValidated && (
                <p className="text-sm text-green-600">"{shopName}" dükkanına bağlanacaksınız.</p>
              )}
            </div>
            
            {shopValidated && (
              <>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate('/auth')}>
            Giriş sayfasına dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
