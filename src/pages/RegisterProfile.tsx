
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema for profile registration
const profileSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  gender: z.enum(["female", "male"]),
  role: z.enum(["salon_owner", "staff"]),
  businessName: z.string().optional(),
  businessCode: z.string().optional(),
});

export default function RegisterProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      gender: "female",
      role: "salon_owner",
      businessName: "",
      businessCode: "",
    },
  });
  
  // Watch the role field to conditionally show fields
  const watchRole = form.watch("role");

  // Load user data from auth session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // No authenticated user, redirect to login
        toast.error("Lütfen önce giriş yapınız");
        navigate("/staff-login", { replace: true });
        return;
      }
      
      // Set email from authenticated user
      setUserEmail(user.email || "");
      
      // Pre-fill form with any existing metadata
      if (user.user_metadata) {
        form.setValue("firstName", user.user_metadata.first_name || "");
        form.setValue("lastName", user.user_metadata.last_name || "");
      }
    };
    
    getUser();
  }, [navigate, form]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Kullanıcı bilgisi bulunamadı");
      }
      
      // Map role values to the backend roles
      const backendRole = values.role === "salon_owner" ? "admin" : "staff";
      
      // Update user metadata first
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          gender: values.gender,
          role: backendRole,
          full_name: `${values.firstName} ${values.lastName}`,
        }
      });
      
      if (metadataError) {
        throw metadataError;
      }
      
      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          gender: values.gender,
          role: backendRole,
        });
        
      if (profileError) {
        throw profileError;
      }
      
      // Handle business owner and staff-specific actions
      if (values.role === "salon_owner" && values.businessName) {
        // Generate a business code for the salon
        const businessCode = generateBusinessCode(values.businessName);
        
        // Create a salon record
        const { data: shopData, error: shopError } = await supabase
          .from('dukkanlar')
          .insert({
            ad: values.businessName,
            sahibi_id: user.id,
            kod: businessCode,
            active: true
          })
          .select();
          
        if (shopError) {
          throw shopError;
        }
        
        // Create a staff record linking to the salon
        if (shopData && shopData[0]) {
          const { error: staffError } = await supabase
            .from('personel')
            .insert({
              auth_id: user.id,
              ad_soyad: `${values.firstName} ${values.lastName}`,
              telefon: values.phone,
              eposta: userEmail,
              dukkan_id: shopData[0].id,
              personel_no: generateStaffCode(`${values.firstName}${values.lastName}`),
              adres: "",
              maas: 0,
              prim_yuzdesi: 100,
              calisma_sistemi: "haftalik"
            });
            
          if (staffError) {
            throw staffError;
          }
        }
        
        toast.success("İşletme kaydınız oluşturuldu!");
        navigate("/shop-home", { replace: true });
      } 
      // Handle staff registration
      else if (values.role === "staff") {
        // If business code provided, attempt to join that business
        if (values.businessCode) {
          // Verify business code
          const { data: shopData, error: shopError } = await supabase
            .from('dukkanlar')
            .select('id, ad')
            .eq('kod', values.businessCode)
            .single();
            
          if (shopError) {
            throw new Error("Geçersiz işletme kodu: " + shopError.message);
          }
          
          // Create a staff record
          const { error: staffError } = await supabase
            .from('personel')
            .insert({
              auth_id: user.id,
              ad_soyad: `${values.firstName} ${values.lastName}`,
              telefon: values.phone,
              eposta: userEmail,
              dukkan_id: shopData.id,
              personel_no: generateStaffCode(`${values.firstName}${values.lastName}`),
              adres: "",
              maas: 0,
              prim_yuzdesi: 50,
              calisma_sistemi: "haftalik"
            });
            
          if (staffError) {
            throw staffError;
          }
          
          toast.success(`${shopData.ad} işletmesine başvurunuz alındı. İşletme yöneticisi onayından sonra giriş yapabileceksiniz.`);
        } else {
          // Staff without business code just completes their profile without linking to a business
          toast.success("Profiliniz oluşturuldu! Bir işletmeye katılmak için işletme kodunu kullanabilirsiniz.");
        }
        
        navigate("/shop-home", { replace: true });
      }
    } catch (error: any) {
      console.error("Profile registration error:", error);
      setError(error.message || "Profil oluşturulurken bir hata meydana geldi");
      toast.error("Kayıt sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  const generateBusinessCode = (name: string): string => {
    // Remove spaces, special chars, convert to uppercase
    const baseName = name.replace(/[^\w]/gi, '').toUpperCase().substring(0, 4);
    // Add random numbers
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${baseName}${randomNum}`;
  };
  
  const generateStaffCode = (name: string): string => {
    // Remove spaces, special chars, convert to uppercase
    const baseName = name.replace(/[^\w]/gi, '').toUpperCase().substring(0, 2);
    // Add random numbers
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${baseName}${randomNum}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profil Bilgilerinizi Tamamlayın</CardTitle>
          <CardDescription>
            Google hesabınızla giriş yaptınız. Sisteme kaydolmak için lütfen bilgilerinizi tamamlayın.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kayıt Türü</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kayıt türünüzü seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salon_owner">İşletme Sahibi</SelectItem>
                          <SelectItem value="staff">Personel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad</FormLabel>
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
                      <FormLabel>Soyad</FormLabel>
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
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="05XX XXX XX XX" type="tel" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cinsiyet seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="female">Kadın</SelectItem>
                        <SelectItem value="male">Erkek</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchRole === "salon_owner" && (
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İşletme Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="İşletmenizin adı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {watchRole === "staff" && (
                <FormField
                  control={form.control}
                  name="businessCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İşletme Kodu (İsteğe Bağlı)</FormLabel>
                      <FormControl>
                        <Input placeholder="İşletme kodu" {...field} />
                      </FormControl>
                      <FormDescription>
                        Eğer bir işletmede çalışıyorsanız, işletme kodunu girerek işletmeye başvuru yapabilirsiniz.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Profili Tamamla'}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>Salon Yönetim Sistemi &copy; 2024</p>
        </CardFooter>
      </Card>
    </div>
  );
}
