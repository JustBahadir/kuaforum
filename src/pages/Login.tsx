
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

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Define login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg p-6">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackClick}
                className="text-white hover:text-white/80 hover:bg-white/10 absolute top-0 left-0 p-2"
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold text-center mb-1">Müşteri Girişi</h1>
              <p className="text-sm text-center text-white/80">Hesabınıza giriş yapın</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
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
                      <p>Sadece Google ile yeni kullanıcı alımı yapılmaktadır. Mail ile giriş sadece geliştirici hesapları için geçerlidir.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <GoogleAuthButton mode="signin" className="mt-2" />
                
                <div className="relative flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <div className="px-3 text-sm text-gray-500">veya</div>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>
              
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

            <div className="flex flex-col items-center mt-4 space-y-3">
              <Button 
                variant="outline"
                onClick={() => navigate("/register")}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>Yeni Hesap Oluştur</span>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
