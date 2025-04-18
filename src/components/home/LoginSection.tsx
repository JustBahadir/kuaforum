
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, User, Users, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export const LoginSection = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 shadow-lg border-2">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-semibold text-center text-purple-800">
          Salon Yönetim Sistemine Hoşgeldiniz
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    className="flex-1 h-12 bg-purple-600 hover:bg-purple-700" 
                    onClick={() => navigate("/register")}
                  >
                    <User className="mr-2" />
                    Müşteri Kaydı
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Müşteri girişi yakında aktif olacaktır.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              onClick={() => navigate("/staff-login")}
            >
              <Users className="mr-2" />
              Kuaför Girişi
            </Button>
          </div>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">Hizmet Ara</h3>
            <div className="space-y-4">
              <div className="flex gap-2 flex-col sm:flex-row">
                <Input placeholder="Hizmet veya salon adı" className="border-purple-200" />
                <Input placeholder="Şehir seçin" className="border-purple-200" />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Search className="mr-2" />
                Ara
              </Button>
            </div>
          </Card>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Kuaför girişi için
            </h3>
            <p className="text-xs text-blue-700 mt-1">
              Şu an için sadece Google ile giriş desteklenmektedir. Kuaför girişi butonuna tıklayarak giriş sayfasına ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
