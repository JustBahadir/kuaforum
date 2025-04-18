
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Home, Info, ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Register() {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg p-6">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackClick}
                className="text-white hover:text-white/80 hover:bg-white/10 absolute top-0 left-0 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold text-center mb-1">Kayıt Ol</h1>
              <p className="text-sm text-center text-white/80">Yeni bir hesap oluşturun</p>
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
                        className="absolute right-0 top-0 z-10"
                      >
                        <Info className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Yeni kayıtlar yalnızca Google hesabıyla yapılabilir.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <p className="text-sm text-gray-600 mb-3">
                  Google hesabınızla kayıt olduktan sonra, profilinizi tamamlayarak hesabınızı oluşturabilirsiniz.
                </p>
                
                <GoogleAuthButton mode="signup" className="mt-2" />
              </div>
            </div>

            <div className="flex flex-col items-center mt-4 space-y-3">
              <Button 
                variant="outline"
                onClick={() => navigate("/staff-login")}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>Zaten hesabınız var mı? Giriş Yap</span>
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
