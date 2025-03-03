
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Phone, User, Store } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
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
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [shopName, setShopName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const validateForm = () => {
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
    
    try {
      console.log("Registering with:", email, "as", role);
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            phone,
            role: role
          }
        }
      });
      
      if (error) throw error;

      if (data.user) {
        // Update profile table with staff/admin role
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            phone,
            role: role
          });

        if (profileError) {
          console.error("Error updating profile:", profileError);
          throw new Error("Profil oluşturulurken bir hata oluştu");
        }

        // If admin role, create shop first
        let shopId = null;
        if (role === "admin") {
          const { data: shopData, error: shopError } = await supabase
            .from('dukkanlar')
            .insert({
              ad: shopName,
              sahibi_id: data.user.id
            })
            .select()
            .single();

          if (shopError) {
            console.error("Error creating shop:", shopError);
            throw new Error("Dükkan oluşturulurken bir hata oluştu");
          }
          
          shopId = shopData.id;
        }

        // Create personel record
        const { error: personelError } = await supabase
          .from('personel')
          .insert({
            auth_id: data.user.id,
            ad_soyad: `${firstName} ${lastName}`,
            telefon: phone,
            eposta: email,
            adres: '',
            personel_no: role === "admin" ? `A${Math.floor(Math.random() * 9000) + 1000}` : `S${Math.floor(Math.random() * 9000) + 1000}`,
            maas: 0,
            calisma_sistemi: 'aylik',
            prim_yuzdesi: 0,
            dukkan_id: shopId
          });

        if (personelError) {
          console.error("Error creating personnel record:", personelError);
          // Continue anyway since user and profile were created
        }
      }
      
      setRegisteredEmail(email);
      setShowSuccessDialog(true);
      
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      
      if (error.message.includes("already registered")) {
        toast.error("Bu e-posta adresi zaten kayıtlı.");
      } else {
        toast.error("Kayıt yapılamadı: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    onSuccess();
  };

  return (
    <>
      <form onSubmit={handleRegister} className="space-y-4">
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
            onValueChange={(value: "staff" | "admin") => setRole(value)}
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

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kayıt Başarılı</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                {registeredEmail} e-posta adresi ile {role === "admin" ? "Dükkan Sahibi" : "Personel"} kaydı başarıyla tamamlandı. 
                Şimdi giriş yapabilirsiniz.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessDialogClose}>
              Giriş Yap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

