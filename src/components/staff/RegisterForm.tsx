
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Phone, User, Store, MapPin } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { authService } from "@/lib/auth/authService";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegisterFormProps {
  onSuccess: () => void;
}

// Turkey cities and districts data
interface District {
  name: string;
  value: string;
}

interface City {
  name: string;
  value: string;
  districts: District[];
}

const staffSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  role: z.enum(["staff", "admin"]),
  shopName: z.string().optional(),
  shopAddress: z.string().optional(),
  shopPhone: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
});

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("password123"); // Default password
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Fetch Turkey cities and districts
  useEffect(() => {
    const fetchCitiesData = async () => {
      try {
        // This is a placeholder URL - you should replace with a real API
        const response = await fetch('https://raw.githubusercontent.com/volkansenturk/turkiye-iller-ilceler/master/data/il-ilce.json');
        if (!response.ok) {
          throw new Error('Failed to fetch cities data');
        }
        
        const data = await response.json();
        
        // Transform the data into the format we need
        const formattedCities = Object.keys(data).map(cityName => {
          return {
            name: cityName,
            value: cityName.toLowerCase(),
            districts: data[cityName].map((districtName: string) => ({
              name: districtName,
              value: districtName.toLowerCase()
            }))
          };
        });
        
        setCities(formattedCities);
      } catch (error) {
        console.error('Error fetching cities data:', error);
        // Fallback with some major cities
        setCities([
          {
            name: "İstanbul",
            value: "istanbul",
            districts: [
              { name: "Kadıköy", value: "kadikoy" },
              { name: "Beşiktaş", value: "besiktas" },
              { name: "Şişli", value: "sisli" },
              { name: "Üsküdar", value: "uskudar" },
              { name: "Maltepe", value: "maltepe" }
            ]
          },
          {
            name: "Ankara",
            value: "ankara",
            districts: [
              { name: "Çankaya", value: "cankaya" },
              { name: "Keçiören", value: "kecioren" },
              { name: "Yenimahalle", value: "yenimahalle" }
            ]
          },
          {
            name: "İzmir",
            value: "izmir",
            districts: [
              { name: "Konak", value: "konak" },
              { name: "Karşıyaka", value: "karsiyaka" },
              { name: "Bornova", value: "bornova" }
            ]
          }
        ]);
      }
    };

    fetchCitiesData();
  }, []);

  // Update districts when city is selected
  useEffect(() => {
    if (city) {
      const cityData = cities.find(c => c.value === city);
      if (cityData) {
        setDistricts(cityData.districts);
      } else {
        setDistricts([]);
      }
      // Reset selected district when city changes
      setDistrict("");
    } else {
      setDistricts([]);
    }
  }, [city, cities]);

  const validateForm = () => {
    setGlobalError(null);
    try {
      staffSchema.parse({
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
        shopName: role === "admin" ? shopName : undefined,
        shopAddress: role === "admin" ? shopAddress : undefined,
        shopPhone: role === "admin" ? shopPhone : undefined,
        city: role === "admin" ? city : undefined,
        district: role === "admin" ? district : undefined,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const clearForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("password123");
    setRole("staff");
    setShopName("");
    setShopAddress("");
    setShopPhone("");
    setCity("");
    setDistrict("");
    setErrors({});
    setGlobalError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (role === "admin") {
      if (!shopName) {
        setErrors({ shopName: "Dükkan adı gereklidir" });
        return;
      }
      
      if (!city) {
        setErrors({ city: "İl seçimi gereklidir" });
        return;
      }
    }
    
    setLoading(true);
    setGlobalError(null);
    
    try {
      console.log("Kayıt yapılıyor:", email, "olarak", role);
      
      // Generate shop code for admin
      let shopCode: string | null = null;
      let dukkanId: number | null = null;
      
      if (role === "admin") {
        shopCode = authService.generateShopCode(shopName);
      }
      
      // Register user with Supabase Auth
      const { user, error } = await authService.signUp(
        email,
        password,
        {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          phone,
          role: role,
          shop_name: shopName,
          shop_code: shopCode
        }
      );
      
      if (error) {
        if (error.message?.includes("already registered")) {
          setGlobalError("Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın veya farklı bir e-posta adresi kullanın.");
        } else {
          setGlobalError(error.message || "Kayıt işlemi sırasında bir hata oluştu");
        }
        return;
      }
      
      // Eğer admin ise ve dükkan adı belirtilmişse dükkan oluştur
      if (role === "admin" && shopName && user) {
        try {
          const shopAddress = district ? `${district}, ${city}` : city;
          
          const dukkan = await dukkanServisi.ekle({
            ad: shopName,
            adres: shopAddress || "",
            telefon: shopPhone || phone,
            sahibi_id: user.id,
            kod: shopCode || authService.generateShopCode(shopName),
            active: true
          } as any); // Using type assertion to bypass type checking for now
          
          dukkanId = dukkan.id;
          
          // Dükkan sahibini aynı zamanda personel olarak da ekleyelim
          await personelServisi.ekle({
            ad_soyad: `${firstName} ${lastName}`,
            personel_no: authService.generateShopCode(`${firstName}${lastName}`),
            telefon: phone,
            eposta: email,
            adres: shopAddress || "",
            maas: 0, // Dükkan sahibi için maaş 0 olarak ayarlanabilir
            calisma_sistemi: "haftalik",
            prim_yuzdesi: 100, // Dükkan sahibi kendi primini alır
            auth_id: user.id,
            dukkan_id: dukkanId
          });
          
          toast.success("Dükkanınız başarıyla oluşturuldu!");
        } catch (dukkanError: any) {
          console.error("Dükkan oluşturma hatası:", dukkanError);
          toast.error("Dükkan oluşturulurken bir hata oluştu: " + (dukkanError.message || "Bilinmeyen bir hata"));
        }
      }
      
      toast.success("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      clearForm();
      onSuccess();
      
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      
      if (error.message?.includes("already registered") || error.message?.includes("User already registered")) {
        setGlobalError("Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın veya farklı bir e-posta adresi kullanın.");
      } else {
        setGlobalError(error.message || "Kayıt işlemi sırasında bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {globalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ad</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Soyad</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-red-500">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Kayıt Türü</Label>
        <Select
          value={role}
          onValueChange={(value: "staff" | "admin") => {
            setRole(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kayıt türü seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Personel</SelectItem>
            <SelectItem value="admin">Dükkan Sahibi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {role === "admin" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="shopName">Dükkan Adı</Label>
            <div className="relative">
              <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="pl-10"
                placeholder="Dükkanınızın adını giriniz"
                required
              />
            </div>
            {errors.shopName && (
              <p className="text-xs text-red-500">{errors.shopName}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">İl</Label>
              <Select
                value={city}
                onValueChange={setCity}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="İl seçin" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((cityItem) => (
                    <SelectItem key={cityItem.value} value={cityItem.value}>
                      {cityItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="district">İlçe</Label>
              <Select
                value={district}
                onValueChange={setDistrict}
                disabled={!city}
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder={city ? "İlçe seçin" : "Önce il seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((districtItem) => (
                    <SelectItem key={districtItem.value} value={districtItem.value}>
                      {districtItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.district && (
                <p className="text-xs text-red-500">{errors.district}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shopPhone">Dükkan Telefonu</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="shopPhone"
                type="tel"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                className="pl-10"
                placeholder="Dükkanınızın telefon numarası (isteğe bağlı)"
              />
            </div>
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        <p className="text-xs text-gray-500">
          Varsayılan şifre: password123 (Sonradan değiştirebilirsiniz)
        </p>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
      </Button>
    </form>
  );
}
