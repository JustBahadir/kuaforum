
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const profilSchema = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  soyad: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  telefon: z.string().min(10, "Telefon numarası geçerli değil"),
  cinsiyet: z.enum(["erkek", "kadın", "belirtmek_istemiyorum"]),
  rol: z.enum(["musteri", "personel", "isletme_sahibi"]),
  isletme_kodu: z.string().optional(),
});

type ProfilFormValues = z.infer<typeof profilSchema>;

export default function ProfilKurulum() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<ProfilFormValues>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      telefon: "",
      cinsiyet: "belirtmek_istemiyorum",
      rol: "musteri",
      isletme_kodu: "",
    },
  });

  const roleValue = form.watch("rol");

  // Check if user is already logged in and profile is completed
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("Oturum açmanız gerekiyor");
          navigate("/login");
          return;
        }
        
        setUserEmail(user.email || "");
        
        // Check if user already has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        // If profile exists and is completed, redirect to appropriate dashboard
        if (profile && profile.profil_tamamlandi) {
          const role = profile.role || "customer";
          if (role === "isletme_sahibi" || role === "admin") {
            navigate("/isletme/anasayfa");
          } else if (role === "personel" || role === "staff") {
            navigate("/personel/anasayfa");
          } else {
            navigate("/musteri/anasayfa");
          }
          return;
        }
      } catch (error) {
        console.error("Profil kurulum hatası:", error);
      } finally {
        setInitialCheckDone(true);
      }
    };
    
    checkUser();
  }, [navigate]);

  const onSubmit = async (data: ProfilFormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Kullanıcı bilgileri alınamadı");
        navigate("/login");
        return;
      }
      
      // Prepare role mapping (English to Turkish)
      let role = "customer";
      if (data.rol === "isletme_sahibi") role = "admin";
      if (data.rol === "personel") role = "staff";
      
      // Check if personnel's shop code exists when role is personnel
      if (data.rol === "personel" && data.isletme_kodu) {
        const { data: shop, error: shopError } = await supabase
          .from("isletmeler")
          .select("id")
          .eq("kod", data.isletme_kodu)
          .maybeSingle();
          
        if (shopError || !shop) {
          toast.error("Girilen işletme kodu geçerli değil");
          setLoading(false);
          return;
        }
      }
      
      // Update profile in both tables for compatibility
      // 1. Update profiles table (older structure)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: data.ad,
          last_name: data.soyad,
          phone: data.telefon,
          gender: data.cinsiyet,
          role: role,
          profil_tamamlandi: true,
        });
        
      if (profileError) {
        console.error("Profil güncelleme hatası:", profileError);
        toast.error("Profil kaydedilemedi");
        setLoading(false);
        return;
      }
      
      // 2. Update kullanicilar table (newer structure)
      const { error: userError } = await supabase
        .from("kullanicilar")
        .upsert({
          kimlik: user.id,
          ad: data.ad,
          soyad: data.soyad,
          telefon: data.telefon,
          cinsiyet: data.cinsiyet,
          rol: data.rol,
          profil_tamamlandi: true,
          eposta: user.email,
        });
        
      if (userError) {
        console.error("Kullanıcı güncelleme hatası:", userError);
        // Continue anyway since we updated the profiles table
      }
      
      // If personnel role, create join request
      if (data.rol === "personel" && data.isletme_kodu) {
        const { data: shop } = await supabase
          .from("isletmeler")
          .select("id")
          .eq("kod", data.isletme_kodu)
          .single();
          
        if (shop) {
          const { error: joinRequestError } = await supabase
            .from("personel_basvurular")
            .insert({
              kullanici_kimlik: user.id,
              isletme_id: shop.id,
              isletme_kodu: data.isletme_kodu,
              durum: "beklemede",
              tarih: new Date().toISOString(),
            });
            
          if (joinRequestError) {
            console.error("Personel başvurusu hatası:", joinRequestError);
            toast.error("Personel başvurusu oluşturulamadı");
          }
        }
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          first_name: data.ad,
          last_name: data.soyad,
          role: role
        }
      });
      
      toast.success("Profiliniz başarıyla oluşturuldu");
      
      // Redirect based on role
      if (data.rol === "isletme_sahibi") {
        navigate("/isletme/anasayfa");
      } else if (data.rol === "personel") {
        navigate("/personel/atanmamis");
      } else {
        navigate("/musteri/anasayfa");
      }
      
    } catch (error) {
      console.error("Form gönderme hatası:", error);
      toast.error("İşlem sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (!initialCheckDone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Profil Kurulumu</CardTitle>
          {userEmail && (
            <p className="text-center text-sm text-gray-500">{userEmail}</p>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Adınız" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="soyad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Soyadınız" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="telefon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="05XX XXX XX XX" 
                        {...field} 
                        onChange={(e) => {
                          // Simple phone formatter
                          const value = e.target.value.replace(/\D/g, '');
                          let formatted = '';
                          
                          if (value.length <= 4) {
                            formatted = value;
                          } else if (value.length <= 7) {
                            formatted = `${value.slice(0, 4)} ${value.slice(4)}`;
                          } else if (value.length <= 9) {
                            formatted = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`;
                          } else {
                            formatted = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7, 9)} ${value.slice(9, 11)}`;
                          }
                          
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cinsiyet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cinsiyet <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cinsiyet seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="erkek">Erkek</SelectItem>
                        <SelectItem value="kadın">Kadın</SelectItem>
                        <SelectItem value="belirtmek_istemiyorum">Belirtmek İstemiyorum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kayıt Türü <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kayıt türü seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="isletme_sahibi">İşletme Sahibi</SelectItem>
                        <SelectItem value="personel">Personel</SelectItem>
                        <SelectItem value="musteri">Müşteri</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {roleValue === "personel" && (
                <FormField
                  control={form.control}
                  name="isletme_kodu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İşletme Kodu</FormLabel>
                      <FormControl>
                        <Input placeholder="İşletme kodunu girin" {...field} />
                      </FormControl>
                      <FormDescription>
                        İşletme sahibinden alacağınız kod
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <CardFooter className="flex justify-end p-0">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Profili Tamamla
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
