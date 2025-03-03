
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { toast } from "sonner";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { shopService } from "@/lib/auth/services/shopService";
import { authService } from "@/lib/auth/authService";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Şehir ve ilçeler için tip tanımlamaları
interface City {
  name: string;
  value: string;
  districts: District[];
}

interface District {
  name: string;
  value: string;
}

// Form şeması
const shopSchema = z.object({
  shopName: z.string().min(3, { message: "Dükkan adı en az 3 karakter olmalıdır" }),
  city: z.string().min(1, { message: "Lütfen bir il seçin" }),
  district: z.string().min(1, { message: "Lütfen bir ilçe seçin" }),
});

export default function CreateShop() {
  const navigate = useNavigate();
  const { refreshProfile } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Türkiye'nin başlıca şehirleri ve ilçeleri (basitleştirilmiş)
  const cities: City[] = [
    {
      name: "İstanbul",
      value: "istanbul",
      districts: [
        { name: "Kadıköy", value: "kadikoy" },
        { name: "Beşiktaş", value: "besiktas" },
        { name: "Şişli", value: "sisli" },
        { name: "Üsküdar", value: "uskudar" },
        { name: "Beyoğlu", value: "beyoglu" }
      ]
    },
    {
      name: "Ankara",
      value: "ankara",
      districts: [
        { name: "Çankaya", value: "cankaya" },
        { name: "Keçiören", value: "kecioren" },
        { name: "Mamak", value: "mamak" },
        { name: "Yenimahalle", value: "yenimahalle" }
      ]
    },
    {
      name: "İzmir",
      value: "izmir",
      districts: [
        { name: "Konak", value: "konak" },
        { name: "Karşıyaka", value: "karsiyaka" },
        { name: "Bornova", value: "bornova" },
        { name: "Çeşme", value: "cesme" }
      ]
    },
    {
      name: "Antalya",
      value: "antalya",
      districts: [
        { name: "Muratpaşa", value: "muratpasa" },
        { name: "Konyaaltı", value: "konyaalti" },
        { name: "Lara", value: "lara" }
      ]
    }
  ];

  const form = useForm<z.infer<typeof shopSchema>>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      shopName: "",
      city: "",
      district: "",
    },
  });

  const selectedCity = form.watch("city");
  const selectedDistricts = cities.find(city => city.value === selectedCity)?.districts || [];

  // Dükkan oluşturma fonksiyonu
  const onSubmit = async (values: z.infer<typeof shopSchema>) => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Kullanıcı kimliğini al
      const user = await authService.getCurrentUser();
      
      if (!user) {
        setErrorMessage("Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }
      
      // Dükkan kodu oluştur
      const shopCode = shopService.generateShopCode(values.shopName);
      
      // Dükkan adresi oluştur
      const cityInfo = cities.find(c => c.value === values.city);
      const districtInfo = selectedDistricts.find(d => d.value === values.district);
      
      const address = `${districtInfo?.name || values.district}, ${cityInfo?.name || values.city}`;
      
      // Dükkanı oluştur
      const newShop = await dukkanServisi.ekle({
        ad: values.shopName,
        adres: address,
        sahibi_id: user.id,
        kod: shopCode,
        active: true
      });
      
      toast.success("Dükkan başarıyla oluşturuldu!");
      
      // Profil bilgilerini yenile (dükkan bilgilerini güncellemek için)
      await refreshProfile();
      
      // Personel sayfasına yönlendir
      navigate("/personnel");
      
    } catch (error: any) {
      console.error("Dükkan oluşturma hatası:", error);
      setErrorMessage(`Dükkan oluşturulurken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      toast.error("Dükkan oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <StaffCardHeader onBack={() => navigate(-1)} />
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Dükkan Oluştur</h2>
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dükkan Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Ahmet Kuaför Salonu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İl</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="İl seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İlçe</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedCity}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedCity ? "İlçe seçin" : "Önce il seçin"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedDistricts.map((district) => (
                          <SelectItem key={district.value} value={district.value}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Dükkan Oluşturuluyor..." : "Dükkan Oluştur"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
