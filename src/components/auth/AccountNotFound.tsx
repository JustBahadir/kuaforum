
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountNotFoundProps } from "@/types/personnel";

export default function AccountNotFound({ accountExists = false }: AccountNotFoundProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md border shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Hesap Bulunamadı</CardTitle>
          <CardDescription>
            Bu Gmail hesabıyla kayıtlı kullanıcı bulunamadı.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-500 text-sm">
          Giriş yapmaya çalıştığınız Google hesabı sistemimizde kayıtlı değildir. 
          Kayıt olmak istiyorsanız aşağıdaki butona tıklayabilir veya giriş sayfasına dönerek farklı bir hesapla giriş yapabilirsiniz.
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => navigate("/kayit-formu")}
          >
            Kayıt Olmak İçin Tıklayın
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/login")}
          >
            Giriş Sayfasına Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
