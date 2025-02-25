
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isStaffSignup, setIsStaffSignup] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    // Telefon numarasını +90 formatına çevir
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('90')) {
      cleaned = cleaned.substring(2);
    }
    if (!cleaned.startsWith('5')) {
      return phone;
    }
    return `+90${cleaned}`;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: isStaffSignup ? 'staff' : 'customer',
          },
        },
      });
      if (error) throw error;
      setShowVerification(true);
      toast.success('Doğrulama kodu telefonunuza gönderildi.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formatPhoneNumber(phone),
        token: verificationCode,
        type: 'sms',
      });
      if (error) throw error;
      navigate('/dashboard');
      toast.success('Giriş başarılı!');
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
            {showVerification 
              ? 'Telefonunuza gönderilen kodu giriniz' 
              : 'Randevu almak için giriş yapın veya hesap oluşturun'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showVerification ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="5XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isStaff"
                  checked={isStaffSignup}
                  onChange={(e) => setIsStaffSignup(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isStaff">Personel olarak kayıt ol</Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'İşlem yapılıyor...' : 'Devam Et'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label htmlFor="code">Doğrulama Kodu</Label>
                <Input
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Doğrulama kodunu giriniz"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Doğrulanıyor...' : 'Doğrula ve Giriş Yap'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowVerification(false)}
              >
                Geri Dön
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-600">
          Kuaför randevu sistemi &copy; 2024
        </CardFooter>
      </Card>
    </div>
  );
}
