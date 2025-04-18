
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

// Profile form validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır" }),
  lastName: z.string().min(2, { message: "Soyad en az 2 karakter olmalıdır" }),
  phone: z.string().min(10, { message: "Geçerli bir telefon numarası girin" }),
  gender: z.enum(["male", "female"], { 
    required_error: "Cinsiyet seçimi zorunludur" 
  }),
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
  
  // Initialize form with default values
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
  
  // Watch the role field to conditionally show businessName or businessCode
  const selectedRole = form.watch("role");
  
  // Get current user and prefill form if possible
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
      
      // Pre-fill form with user data if available
      if (user.user_metadata) {
        form.setValue("firstName", user.user_metadata.first_name || "");
        form.setValue("lastName", user.user_metadata.last_name || "");
      }
    };
    
    getUser();
  }, [navigate, form]);
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (values.role === "business_owner" && !values.businessName) {
      toast.error("İşletme sahibi iseniz işletme adı girmelisiniz");
      return;
    }
    
    setLoading(true);
    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          role: values.role
        }
      });
      
      if (updateError) throw updateError;
      
      // Update or create profile record
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone,
        gender: values.gender,
        role: values.role,
        business_name: values.role === "business_owner" ? values.businessName : null,
        business_code: values.role === "staff" ? values.businessCode : null,
        updated_at: new Date().toISOString()
      });
      
      if (profileError) throw profileError;
      
      toast.success("Profil bilgileriniz başarıyla kaydedildi");
      
      // Redirect based on role
      if (values.role === "business_owner") {
        navigate("/shop-home");
      } else if (values.role === "staff") {
        // If staff has business code, verify it (This would be expanded in a real implementation)
        // For now, just redirect to staff page
        navigate("/shop-home");
      } else {
        navigate("/");
      }
      
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast.error("Profil bilgileriniz kaydedilirken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
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
                      <Input placeholder="05XX XXX XX XX" {...field} />
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
                    <FormLabel>Cinsiyet*</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        value={field.value} 
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
