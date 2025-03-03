
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Phone, User, Store } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { authService } from "@/lib/auth/authService";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const staffSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  role: z.enum(["staff", "admin"]),
  shopName: z.string().optional(),
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (role === "admin" && !shopName) {
      setErrors({ shopName: "Dükkan adı gereklidir" });
      return;
    }
    
    setLoading(true);
    setGlobalError(null);
    
    try {
      console.log("Kayıt yapılıyor:", email, "olarak", role);
      
      // Generate shop code for admin
      let shopCode: string | null = null;
      
      if (role === "admin") {
        shopCode = authService.generateShopCode(shopName);
      }
      
      // Register user with Supabase Auth
      await authService.signUp(
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
      
      toast.success("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      onSuccess();
      
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      
      if (error.message?.includes("already registered")) {
        setGlobalError("Bu e-posta adresi zaten kayıtlı.");
        toast.error("Bu e-posta adresi zaten kayıtlı.");
      } else {
        setGlobalError(error.message || "Kayıt işlemi sırasında bir hata oluştu");
        toast.error("Kayıt yapılamadı: " + error.message);
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
