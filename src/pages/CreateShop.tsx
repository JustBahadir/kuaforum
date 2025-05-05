
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { defaultCalismaSaatleriOlustur } from "@/components/operations/utils/workingHoursUtils";
import { calismaSaatleriServisi } from "@/lib/supabase";

export default function CreateShop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    isletme_adi: "",
    telefon: "",
    adres: "",
    aciklama: "",
    iletisim_telefon: "",
    net_gelir: "0",
    toplam_prim: "0",
    toplam_gider: "0",
    toplam_islem: "0",
    toplam_randevu: "0",
    toplam_musteri: "0",
    toplam_personel: "0"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Kullanıcı oturumunuz bulunamadı. Lütfen tekrar giriş yapın.");
        navigate("/auth");
        return;
      }

      // Check if user already has a shop
      const { data: existingShop } = await supabase
        .from('isletmeler')
        .select('*')
        .eq('sahip_kimlik', user.id)
        .maybeSingle();

      if (existingShop) {
        toast.error("Zaten bir işletmeniz bulunuyor.");
        navigate("/isletme/anasayfa");
        return;
      }

      // Generate shop code
      const shopCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Insert new shop
      const { data: newShop, error: shopError } = await supabase
        .from('isletmeler')
        .insert({
          isletme_adi: formData.isletme_adi,
          telefon: formData.telefon || null,
          adres: formData.adres || null,
          aciklama: formData.aciklama || null,
          sahip_kimlik: user.id,
          isletme_kodu: shopCode,
          // Convert numeric fields from string to number
          net_gelir: parseFloat(formData.net_gelir) || 0,
          toplam_prim: parseFloat(formData.toplam_prim) || 0,
          toplam_gider: parseFloat(formData.toplam_gider) || 0,
          toplam_islem: parseInt(formData.toplam_islem) || 0,
          toplam_randevu: parseInt(formData.toplam_randevu) || 0,
          toplam_musteri: parseInt(formData.toplam_musteri) || 0,
          toplam_personel: parseInt(formData.toplam_personel) || 0
        })
        .select()
        .single();

      if (shopError) {
        throw shopError;
      }

      // Create default working hours
      if (newShop) {
        // Create default working hours
        const defaultSaatler = defaultCalismaSaatleriOlustur(newShop.kimlik);
        await calismaSaatleriServisi.topluGuncelle(defaultSaatler);
      }

      toast.success("İşletme başarıyla oluşturuldu!");
      navigate("/isletme/anasayfa");
    } catch (error: any) {
      console.error("İşletme oluşturma hatası:", error);
      toast.error(`Hata: ${error.message || "İşletme oluşturulurken bir sorun oluştu"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>İşletme Oluştur</CardTitle>
          <CardDescription>
            İşletme bilgilerinizi girerek işletmenizi oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="telefon">İşletme Telefonu</Label>
              <Input
                id="telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleInputChange}
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adres">İşletme Adresi</Label>
              <Textarea
                id="adres"
                name="adres"
                value={formData.adres}
                onChange={handleInputChange}
                placeholder="İşletmenizin açık adresi"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aciklama">İşletme Açıklaması</Label>
              <Textarea
                id="aciklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleInputChange}
                placeholder="İşletmeniz hakkında kısa bir açıklama"
                rows={3}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "İşletme Oluşturuluyor..." : "İşletme Oluştur"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
