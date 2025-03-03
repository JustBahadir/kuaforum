
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Loader2, User } from "lucide-react";

const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "Ad en az 2 karakter olmalıdır.",
  }),
  last_name: z.string().min(2, {
    message: "Soyad en az 2 karakter olmalıdır.",
  }),
  phone: z.string().min(10, {
    message: "Geçerli bir telefon numarası giriniz.",
  }),
  gender: z.string().optional(),
  birthdate: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function StaffProfile() {
  const { user, userName, refreshProfile } = useCustomerAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      gender: "",
      birthdate: "",
      address: "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        throw error;
      }

      form.reset({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        gender: data.gender || "",
        birthdate: data.birthdate || "",
        address: "", // address field is not in profiles table
      });
    } catch (error) {
      console.error("Profil yüklenirken hata:", error);
      toast.error("Profil bilgileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          gender: data.gender,
          birthdate: data.birthdate,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      toast.success("Profil bilgileriniz güncellendi");
    } catch (error) {
      console.error("Profil güncellenirken hata:", error);
      toast.error("Profil bilgileriniz güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const getGenderBasedGreeting = () => {
    const gender = form.watch("gender");
    const firstName = form.watch("first_name");
    
    if (gender === "erkek") {
      return `${firstName} Bey`;
    } else if (gender === "kadın") {
      return `${firstName} Hanım`;
    } else {
      return firstName;
    }
  };

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Profil Bilgilerim</h1>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Profil bilgileriniz yükleniyor...</span>
          </div>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Merhaba, {getGenderBasedGreeting()}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adınız</FormLabel>
                            <FormControl>
                              <Input placeholder="Adınız" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyadınız</FormLabel>
                            <FormControl>
                              <Input placeholder="Soyadınız" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefon</FormLabel>
                            <FormControl>
                              <Input placeholder="Telefon numaranız" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="birthdate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doğum Tarihi</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cinsiyet</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Cinsiyet seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="erkek">Erkek</SelectItem>
                              <SelectItem value="kadın">Kadın</SelectItem>
                              <SelectItem value="belirtmek-istemiyorum">Belirtmek İstemiyorum</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adres</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Adresinizi giriniz"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kaydediliyor
                        </>
                      ) : (
                        "Bilgilerimi Güncelle"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
