
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { authService } from "@/lib/auth/services/authService";

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
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
      const shop = await authService.verifyShopCode(formData.shopCode);
      
      if (!shop) {
        setError("Geçersiz dükkan kodu. Lütfen kod bilgisini kontrol ediniz.");
        setLoading(false);
        return;
      }
      
      setShopId(shop.id);
      setShopName(shop.ad);
      setShopValidated(true);
      toast.success(`"${shop.ad}" dükkanı doğrulandı`);
    } catch (err: any) {
      setError(err.message || "Dükkan kodu doğrulanırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone) {
      setError("Lütfen tüm zorunlu alanları doldurun");
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

      if (authError) throw authError;

      if (authData.user) {
        // Create personnel record with initial shop connection if provided
        const personnelData: any = {
          auth_id: authData.user.id,
          ad_soyad: `${formData.firstName} ${formData.lastName}`,
          telefon: formData.phone,
          eposta: formData.email,
          adres: formData.address,
          personel_no: `P${Math.floor(Math.random() * 10000)}`,
          maas: 0,
          prim_yuzdesi: 0,
          calisma_sistemi: 'aylik_maas',
          baslama_tarihi: new Date().toISOString().split('T')[0],
        };

        // If shop code was validated, add shop connection or request
        if (shopValidated && shopId) {
          // Create shop join request
          const { error: requestError } = await supabase
            .from('personel_shop_requests')
            .insert([{
              personel_id: null, // Will be updated after personnel record is created
              dukkan_id: shopId,
              status: 'pending',
              auth_id: authData.user.id
            }]);

          if (requestError) throw requestError;
        }

        // Create personnel record
        const { data: personnelRecord, error: personnelError } = await supabase
          .from('personel')
          .insert([personnelData])
          .select()
          .single();

        if (personnelError) throw personnelError;
          
        // Update shop join request with personnel id if it was created
        if (shopValidated && shopId && personnelRecord) {
          await supabase
            .from('personel_shop_requests')
            .update({ personel_id: personnelRecord.id })
            .eq('auth_id', authData.user.id)
            .eq('dukkan_id', shopId);
        }

        // Create profile record
        await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            role: 'staff'
          });

        toast.success('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu');
      setError(error.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="shopCode">Dükkan Kodu (İsteğe Bağlı)</Label>
        <div className="flex space-x-2">
          <Input
            id="shopCode"
            value={formData.shopCode}
            onChange={(e) => setFormData({ ...formData, shopCode: e.target.value })}
            disabled={shopValidated}
            placeholder="Dükkan kodu"
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
          <p className="text-sm text-green-600">"{shopName}" dükkanına katılım isteği gönderilecek.</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ad</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Soyad</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Adres</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
      </Button>
    </form>
  );
}
