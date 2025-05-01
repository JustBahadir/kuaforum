
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName || !email || !password) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName || "",
            role: "admin", // Default role for shop owners
          },
        },
      });

      if (signUpError) throw signUpError;

      if (user) {
        // Update profile
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            first_name: firstName,
            last_name: lastName || "",
            phone: phone || null,
            role: "admin",
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        toast.success("Kayıt işlemi başarılı! Giriş yapıyorsunuz...");
        navigate("/shop-home");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.message === "User already registered"
          ? "Bu e-posta adresi zaten kayıtlı"
          : error.message || "Kayıt işlemi sırasında bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">Ad *</Label>
            <Input
              id="first-name"
              placeholder="Adınız"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Soyad</Label>
            <Input
              id="last-name"
              placeholder="Soyadınız"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta *</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="05XX XXX XX XX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre *</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Şifreniz en az 6 karakter olmalıdır
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
        Kaydol
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabınız var mı?{" "}
        <a href="/login" className="text-primary hover:underline">
          Giriş Yap
        </a>
      </p>
    </form>
  );
}
