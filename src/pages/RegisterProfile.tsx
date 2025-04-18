
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const profileSchema = z.object({
  firstName: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır" }),
  lastName: z.string().min(2, { message: "Soyad en az 2 karakter olmalıdır" }),
  phone: z.string().min(10, { message: "Geçerli bir telefon numarası girin" }),
  gender: z.enum(["male", "female"]).optional(),
  role: z.enum(["staff", "business_owner"], { 
    required_error: "Kayıt türü seçimi zorunludur" 
  }),
  businessName: z.string().optional(),
  businessCode: z.string().optional(),
});

export default function RegisterProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      gender: undefined,
      role: undefined,
      businessName: "",
      businessCode: "",
    }
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 11);
    form.setValue('phone', formatPhoneNumber(value));
  };

  const selectedRole = form.watch("role");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error fetching user:", error);
        toast.error("Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        navigate("/staff-login");
        return;
      }
      
      if (!user) {
        toast.error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        navigate("/staff-login");
        return;
      }
      
      setUser(user);
      
      if (user.user_metadata) {
        form.setValue("firstName", user.user_metadata.first_name || "");
        form.setValue("lastName", user.user_metadata.last_name || "");
      }
    };
    
    getUser();
  }, [navigate, form]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (values.role === "business_owner" && !values.businessName) {
      toast.error("İşletme sahibi iseniz işletme adı girmelisiniz");
      return;
    }
    
    setLoading(true);
    try {
      // Önce kullanıcı metadata bilgisini güncelle (daha güvenli ve recursive error'a daha az eğilimli)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          role: values.role,
          phone: values.phone.replace(/\D/g, ''),
          gender: values.gender
        }
      });
      
      if (updateError) {
        console.error("Auth update error:", updateError);
        toast.error("Kullanıcı bilgileri güncellenirken hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      
      const cleanPhone = values.phone.replace(/\D/g, '');
      
      try {
        // Edge function ile profil güncelleme işlemi yap
        // Bu yaklaşım, infinity recursion hatasını önler
        const { data, error: edgeFnError } = await supabase.functions.invoke('get_current_user_role');
        
        if (edgeFnError) {
          console.error("Edge function error:", edgeFnError);
          // Edge function başarısız olsa bile auth metadata zaten güncellenmiş olduğu için devam et
        }
      } catch (edgeError) {
        console.error("Edge function call failed:", edgeError);
        // Hata olsa bile devam et, auth tarafı güncellenmiştir
      }
      
      // İşletme sahibi iş akışı
      if (values.role === "business_owner" && values.businessName) {
        const shopCode = generateShopCode(values.businessName);
        
        const { data: shopData, error: shopError } = await supabase
          .from('dukkanlar')
          .insert([{
            ad: values.businessName,
            adres: '',
            telefon: cleanPhone,
            sahibi_id: user.id,
            kod: shopCode,
            active: true
          }])
          .select();
        
        if (shopError) {
          console.error("Shop creation error:", shopError);
          toast.error("İşletme oluşturulurken hata oluştu. Lütfen tekrar deneyin.");
          setLoading(false);
          return;
        }
        
        if (shopData && shopData[0]) {
          // Personel kaydını oluştur
          const { error: personelError } = await supabase
            .from('personel')
            .insert([{
              ad_soyad: `${values.firstName} ${values.lastName}`,
              telefon: cleanPhone,
              personel_no: generatePersonnelCode(`${values.firstName}${values.lastName}`),
              eposta: user.email,
              adres: '',
              maas: 0,
              prim_yuzdesi: 100,
              calisma_sistemi: 'sahip',
              auth_id: user.id,
              dukkan_id: shopData[0].id
            }]);
          
          if (personelError) {
            console.error("Personnel creation error:", personelError);
            toast.warning("İşletme oluşturuldu ancak personel kaydınız yapılamadı. Bu işlemi daha sonra yapabilirsiniz.");
          }
        }
        
        toast.success("Profil bilgileriniz ve işletmeniz başarıyla kaydedildi");
        navigate("/shop-home");
        return;
      }
      
      // Personel iş akışı  
      if (values.role === "staff") {
        if (values.businessCode) {
          const { data: shopData, error: shopError } = await supabase
            .from('dukkanlar')
            .select('id, ad')
            .eq('kod', values.businessCode)
            .single();
          
          if (shopError) {
            console.error("Shop lookup error:", shopError);
            if (shopError.code === 'PGRST116') {
              toast.error("Girdiğiniz işletme kodu geçerli değil. Lütfen işletme sahibinden doğru kodu alınız.");
            } else {
              toast.error("İşletme bilgileri alınırken hata oluştu. Lütfen tekrar deneyin.");
            }
            
            // Kodda sorun olsa bile temel profil bilgilerini kaydet ve staff profil sayfasına yönlendir
            toast.success("Temel profil bilgileriniz kaydedildi, daha sonra işletmeye kaydolabilirsiniz.");
            navigate("/staff-profile");
            return;
          }
          
          // Personel kaydını oluştur
          const { error: personelError } = await supabase
            .from('personel')
            .insert([{
              ad_soyad: `${values.firstName} ${values.lastName}`,
              telefon: cleanPhone,
              personel_no: generatePersonnelCode(`${values.firstName}${values.lastName}`),
              eposta: user.email,
              adres: '',
              maas: 0,
              prim_yuzdesi: 50,
              calisma_sistemi: 'haftalik',
              auth_id: user.id,
              dukkan_id: shopData.id
            }]);
            
          if (personelError) {
            console.error("Personnel creation error:", personelError);
            toast.error("Personel kaydı oluşturulurken hata oluştu. Lütfen tekrar deneyin.");
            setLoading(false);
            return;
          }
          
          toast.success(`'${shopData.ad}' işletmesine personel olarak başarıyla kaydoldunuz.`);
        } else {
          toast.info("Herhangi bir işletmeye kaydolmadınız. İstediğiniz zaman Profil sayfasından işletmeye kaydolabilirsiniz.");
        }
        
        navigate("/staff-profile");
        return;
      }
      
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast.error("Profil bilgileriniz kaydedilirken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateShopCode = (businessName: string): string => {
    const prefix = businessName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase();
    
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    
    return `${prefix}${randomDigits}`;
  };

  const generatePersonnelCode = (nameSurname: string): string => {
    const prefix = nameSurname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
    
    const randomDigits = Math.floor(100 + Math.random() * 900).toString();
    
    return `P${prefix}${randomDigits}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-semibold text-center">Profil Bilgilerinizi Tamamlayın</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad*</FormLabel>
                      <FormControl>
                        <Input placeholder="Adınız" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad*</FormLabel>
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="05XX XXX XX XX"
                        value={field.value}
                        onChange={handlePhoneChange}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormDescription>
                      Size ulaşabileceğimiz geçerli bir telefon numarası girin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cinsiyet</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        value={field.value || ""}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="cursor-pointer">Kadın</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="cursor-pointer">Erkek</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kayıt Türü*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kayıt türünüzü seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="business_owner">İşletme Sahibi</SelectItem>
                        <SelectItem value="staff">Personel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedRole === "business_owner" && (
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İşletme Adı*</FormLabel>
                      <FormControl>
                        <Input placeholder="İşletmenizin adını girin" {...field} />
                      </FormControl>
                      <FormDescription>
                        Salonunuzun/işletmenizin ismini girin
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {selectedRole === "staff" && (
                <FormField
                  control={form.control}
                  name="businessCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İşletme Kodu (Opsiyonel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Varsa işletme kodunu girin" {...field} />
                      </FormControl>
                      <FormDescription>
                        Bağlı olduğunuz işletmenin size verdiği kodu girebilirsiniz
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" 
                  disabled={loading}
                >
                  {loading ? "Kaydediliyor..." : "Profili Tamamla"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
