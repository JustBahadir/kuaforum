
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Home, Info } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <StaffCardHeader onBack={handleBackClick} />
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2 relative">
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
              
              <GoogleAuthButton mode="signup" className="mt-2" />
            </div>
          </div>

          <div className="flex flex-col items-center mt-4 space-y-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/login")}
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
        </CardContent>
      </Card>
    </div>
  );
}
