
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Profil } from "@/lib/supabase/types";

export default function CustomerProfile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profil | null>(null);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    adres: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Kullanıcı bilgileri alınamadı");
        return;
      }

      const { data, error } = await supabase
        .from("kullanicilar")
        .select("*")
        .eq("kimlik", user.id)
        .single();

      if (error) throw error;

      setProfile(data as Profil);
      setFormData({
        ad: data.ad || "",
        soyad: data.soyad || "",
        telefon: data.telefon || "",
        adres: data.adres || ""
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error("Profil bilgileri alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Kullanıcı bilgileri alınamadı");
        return;
      }

      const { error } = await supabase
        .from("kullanicilar")
        .update({
          ad: formData.ad,
          soyad: formData.soyad,
          telefon: formData.telefon,
          adres: formData.adres
        })
        .eq("kimlik", user.id);

      if (error) throw error;

      toast.success("Profil bilgileri güncellendi");
      fetchProfile();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Profil güncellenemedi");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-4">
              <p>Profil bilgileri yükleniyor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgilerim</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad">Ad</Label>
                <Input
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  placeholder="Adınız"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soyad">Soyad</Label>
                <Input
                  id="soyad"
                  value={formData.soyad}
                  onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                  placeholder="Soyadınız"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  placeholder="Telefon numaranız"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Hesap Türü</Label>
                <Input
                  id="rol"
                  value={profile.rol === 'musteri' ? 'Müşteri' : 'Diğer'}
                  disabled
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adres">Adres</Label>
              <Input
                id="adres"
                value={formData.adres}
                onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                placeholder="Adresiniz"
                className="h-24"
              />
            </div>
            
            <Button type="submit" disabled={loading} className="mt-4 w-full">
              {loading ? "Kaydediliyor..." : "Bilgilerimi Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
