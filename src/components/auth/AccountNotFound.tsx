
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, UserPlus, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

interface AccountNotFoundProps {
  accountExists?: boolean;
}

export default function AccountNotFound({ accountExists = false }: AccountNotFoundProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isExistingAccount, setIsExistingAccount] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(2);
  
  useEffect(() => {
    const accountExistsParam = searchParams.get("accountExists") === "true" || accountExists;
    if (accountExistsParam) {
      setIsExistingAccount(true);
      setRedirecting(true);
      
      // Countdown timer
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login?error=account-exists");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [searchParams, navigate, accountExists]);

  const handleRegister = () => {
    // Redirect to login page with register tab active
    navigate("/login?tab=register");
  };

  const handleLogin = () => {
    // Redirect to login page
    navigate("/login");
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  if (isExistingAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border border-blue-100">
          <CardHeader className="text-center">
            <CardTitle className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg">
              Hesap Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-blue-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <p className="text-center text-blue-500 font-medium text-lg">
              Bu e-posta zaten sistemimizde kayıtlı. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
            <div className="text-center text-blue-400">
              <p>{countdown} saniye içinde yönlendirileceksiniz</p>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" onClick={handleReturnHome} className="flex items-center gap-2">
              <Home size={16} />
              Ana Sayfaya Dön
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border border-red-100">
        <CardHeader className="text-center">
          <CardTitle className="text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-t-lg">
            Hesap Bulunamadı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <p className="text-center text-red-500 font-medium text-lg">
            Bu Gmail'e kayıtlı bir hesap bulunmamaktadır.
          </p>
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleRegister}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-12 text-lg"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Kayıt olmak için tıklayın
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline"
              className="w-full h-12 text-lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Giriş yapmak için tıklayın
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={handleReturnHome} className="flex items-center gap-2">
            <Home size={16} />
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
