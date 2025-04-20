import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';

export default function CreateShop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    isletmeAdi: '',
    isletmeAdresi: '',
    isletmeAcikAdres: '',
    isletmeTelefon: '',
    isletmeKodu: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();

      if (authError) {
        throw authError;
      }

      if (!authData?.session?.user?.id) {
        throw new Error('Kullanıcı oturumu bulunamadı.');
      }

      const ownerId = authData.session.user.id;

      // Create isletme record
      const { data: shopData, error: shopError } = await supabase
        .from('dukkanlar')
        .insert([
          {
            ad: formData.isletmeAdi,
            adres: formData.isletmeAdresi,
            acik_adres: formData.isletmeAcikAdres,
            telefon: formData.isletmeTelefon,
            kod: formData.isletmeKodu,
            sahibi_id: ownerId,
            active: true
          }
        ])
        .select()

      if (shopError) {
        throw shopError;
      }

      const isletmeId = shopData?.[0]?.id;

      if (!isletmeId) {
        throw new Error('İşletme oluşturulamadı.');
      }

      // Create working hours with all required fields
      const workingHours: CalismaSaati[] = [
        { id: 1, gun: "pazartesi", gun_sira: 1, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: isletmeId },
        { id: 2, gun: "sali", gun_sira: 2, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: isletmeId },
        { id: 3, gun: "carsamba", gun_sira: 3, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: isletmeId },
        { id: 4, gun: "persembe", gun_sira: 4, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: isletmeId },
        { id: 5, gun: "cuma", gun_sira: 5, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: isletmeId },
        { id: 6, gun: "cumartesi", gun_sira: 6, acilis: "09:00", kapanis: "18:00", kapali: false, dukkan_id: isletmeId },
        { id: 7, gun: "pazar", gun_sira: 7, acilis: "09:00", kapanis: "18:00", kapali: true, dukkan_id: isletmeId }
      ];

      const { error: workingHoursError } = await supabase
        .from('calisma_saatleri')
        .insert(workingHours);

      if (workingHoursError) {
        throw workingHoursError;
      }

      toast.success('İşletmeniz başarıyla oluşturuldu!');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'İşletme oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dükkan Oluştur</CardTitle>
          <CardDescription>Yeni bir dükkan oluşturmak için bilgilerinizi giriniz.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Hata!</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="isletmeAdi">İşletme Adı</Label>
              <Input
                id="isletmeAdi"
                value={formData.isletmeAdi}
                onChange={(e) => setFormData({ ...formData, isletmeAdi: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isletmeAdresi">İşletme Adresi</Label>
              <Input
                id="isletmeAdresi"
                value={formData.isletmeAdresi}
                onChange={(e) => setFormData({ ...formData, isletmeAdresi: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isletmeAcikAdres">Açık Adres</Label>
              <Input
                id="isletmeAcikAdres"
                value={formData.isletmeAcikAdres}
                onChange={(e) => setFormData({ ...formData, isletmeAcikAdres: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isletmeTelefon">İşletme Telefonu</Label>
              <Input
                id="isletmeTelefon"
                value={formData.isletmeTelefon}
                onChange={(e) => setFormData({ ...formData, isletmeTelefon: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isletmeKodu">İşletme Kodu</Label>
              <Input
                id="isletmeKodu"
                value={formData.isletmeKodu}
                onChange={(e) => setFormData({ ...formData, isletmeKodu: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'İşletmeyi Oluştur'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate('/admin')}>
            Admin sayfasına dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
