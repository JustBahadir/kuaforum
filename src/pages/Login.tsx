
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginTabs } from "@/components/staff/LoginTabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-blue-50 p-4">
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Ana Sayfa
        </Button>
      </div>
      
      <Card className="w-full max-w-md border border-purple-100 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Kuaför Paneli</CardTitle>
          <CardDescription className="text-purple-100">
            Giriş yapın veya hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <LoginTabs />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Kuaför yönetim sistemine erişim için giriş yapın</p>
            <p className="mt-2">
              Daha fazla bilgi için{" "}
              <a 
                href="mailto:info@kuaforum.com" 
                className="text-purple-600 hover:underline"
              >
                iletişime geçin
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
