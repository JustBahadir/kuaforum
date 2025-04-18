
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Home, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Form schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
});

// Form schema for registration
const registerSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
  firstName: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır" }),
  lastName: z.string().min(2, { message: "Soyad en az 2 karakter olmalıdır" }),
  phone: z.string().min(10, { message: "Geçerli bir telefon numarası giriniz" }),
});

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Define login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Define register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error("Giriş yapılamadı: " + error.message);
        return;
      }

      toast.success("Giriş başarılı!");
      navigate("/customer-dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Giriş sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Handle register submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            role: "customer",
          },
        },
      });

      if (error) {
        toast.error("Kayıt yapılamadı: " + error.message);
        return;
      }

      // Create profile in the profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              first_name: values.firstName,
              last_name: values.lastName,
              phone: values.phone,
              role: 'customer',
            },
          ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          toast.error("Profil oluşturulurken bir hata oluştu.");
          return;
        }
      }

      toast.success("Kayıt başarılı! E-posta adresinizi doğrulayın.");
      setActiveTab("login");
      registerForm.reset();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <StaffCardHeader onBack={handleBackClick} />
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Giriş</TabsTrigger>
              <TabsTrigger value="register">Kayıt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-6">
                <div className="space-y-2">
                  <GoogleAuthButton mode="signin" className="mt-2" />
                </div>
                
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <div className="px-3 text-sm text-gray-500">veya</div>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                <div className="relative">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0"
                        >
                          <Info className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Geliştirici hesabı için e-posta ile giriş aktif. Yeni kayıtlar yalnızca Google hesabıyla yapılabilir.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-posta</FormLabel>
                            <FormControl>
                              <Input placeholder="ornek@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şifre</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Giriş Yapılıyor..." : "E-posta ile Giriş Yap"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="space-y-6">
                <div className="space-y-2">
                  <GoogleAuthButton mode="signup" className="mt-2" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col items-center mt-4 space-y-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/staff-login")}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Personel Girişi</span>
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleBackClick}
              className="w-full flex items-center justify-center gap-2"
            >
              <Home size={16} />
              <span>Ana Sayfaya Dön</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
