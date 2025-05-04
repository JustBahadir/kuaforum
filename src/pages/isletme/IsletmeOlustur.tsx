
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IsletmeOlustur() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    isletme_adi: "",
    ulke_kodu: "TR",
    sehir_kodu: "IST",
    adres: "",
    telefon: "",
    aciklama: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Oturum açmanız gerekiyor");
      return;
    }

    try {
      setLoading(true);

      // Generate isletme_kodu
      const { data: kodeData, error: kodeError } = await supabase.rpc(
        'generate_isletme_kodu',
        { 
          isletme_adi: formData.isletme_adi,
          ulke_kodu: formData.ulke_kodu,
          sehir_kodu: formData.sehir_kodu,
          sube_no: 1
        }
      );

      if (kodeError) {
        throw kodeError;
      }

      if (!kodeData) {
        throw new Error("İşletme kodu oluşturulamadı");
      }

      const isletme_kodu = kodeData;

      // Insert new isletme
      const { data, error } = await supabase
        .from("isletmeler")
        .insert({
          isletme_adi: formData.isletme_adi,
          isletme_kodu,
          adres: formData.adres || null,
          telefon: formData.telefon || null,
          aciklama: formData.aciklama || null,
          sahip_kimlik: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("İşletme başarıyla oluşturuldu!");
      navigate("/isletme/anasayfa");
    } catch (error: any) {
      console.error("İşletme oluşturma hatası:", error);
      toast.error(`Hata: ${error.message || "İşletme oluşturulamadı"}`);
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
    <div className="container mx-auto py-8 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>İşletme Oluştur</CardTitle>
          <CardDescription>
            İşletmeniz için gerekli bilgileri girerek başlayın
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="isletme_adi">İşletme Adı</Label>
              <Input
                id="isletme_adi"
                name="isletme_adi"
                value={formData.isletme_adi}
                onChange={handleInputChange}
                placeholder="İşletmenizin adı"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ulke_kodu">Ülke Kodu</Label>
                <Input
                  id="ulke_kodu"
                  name="ulke_kodu"
                  value={formData.ulke_kodu}
                  onChange={handleInputChange}
                  placeholder="TR"
                  maxLength={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sehir_kodu">Şehir Kodu</Label>
                <Input
                  id="sehir_kodu"
                  name="sehir_kodu"
                  value={formData.sehir_kodu}
                  onChange={handleInputChange}
                  placeholder="IST"
                  maxLength={3}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                name="telefon"
                type="tel"
                value={formData.telefon}
                onChange={handleInputChange}
                placeholder="İşletme telefon numarası"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adres">Adres</Label>
              <Textarea
                id="adres"
                name="adres"
                value={formData.adres}
                onChange={handleInputChange}
                placeholder="İşletme adresi"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleInputChange}
                placeholder="İşletmeniz hakkında kısa bir açıklama"
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate("/isletme/anasayfa")}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Oluşturuluyor..." : "İşletmeyi Oluştur"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
