
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    rol: "isletme_sahibi" as "isletme_sahibi" | "personel",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      rol: e.target.value as "isletme_sahibi" | "personel",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("kullanicilar")
        .update({
          ad: formData.ad,
          soyad: formData.soyad,
          telefon: formData.telefon,
          rol: formData.rol,
          profil_tamamlandi: true,
        })
        .eq("kimlik", user.id);

      if (error) {
        throw error;
      }

      toast.success("Profil başarıyla oluşturuldu");

      // Rolüne göre yönlendir
      if (formData.rol === "isletme_sahibi") {
        navigate("/isletme/anasayfa");
      } else if (formData.rol === "personel") {
        navigate("/personel/anasayfa");
      }
    } catch (error: any) {
      console.error("Profil oluşturma hatası:", error);
      toast.error(`Hata: ${error.message || "Profil oluşturulamadı"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Erişim Reddedildi</h2>
          <p className="text-muted-foreground">
            Bu sayfaya erişmek için giriş yapmalısınız.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Profilinizi Oluşturun
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="ad" className="text-sm font-medium">
              Adınız
            </label>
            <Input
              id="ad"
              name="ad"
              value={formData.ad}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="soyad" className="text-sm font-medium">
              Soyadınız
            </label>
            <Input
              id="soyad"
              name="soyad"
              value={formData.soyad}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="telefon" className="text-sm font-medium">
              Telefon Numaranız
            </label>
            <Input
              id="telefon"
              name="telefon"
              type="tel"
              value={formData.telefon}
              onChange={handleInputChange}
              required
              placeholder="05XX XXX XX XX"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium block">
              Sistemi nasıl kullanacaksınız?
            </label>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="isletme_sahibi"
                name="rol"
                value="isletme_sahibi"
                checked={formData.rol === "isletme_sahibi"}
                onChange={handleRolChange}
                className="h-4 w-4"
              />
              <label htmlFor="isletme_sahibi">
                İşletme Sahibi olarak (Kendi işletmemi yöneteceğim)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="personel"
                name="rol"
                value="personel"
                checked={formData.rol === "personel"}
                onChange={handleRolChange}
                className="h-4 w-4"
              />
              <label htmlFor="personel">
                Personel olarak (Bir işletmeye bağlı çalışacağım)
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Profili Oluştur"}
          </Button>
        </form>
      </div>
    </div>
  );
}
