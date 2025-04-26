
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function AccountNotFound() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/login?tab=register");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Hesap Durumu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-red-500">
            Bu Gmail'e kayıtlı bir hesap bulunmamaktadır.
          </p>
          <Button 
            onClick={handleRegister}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Kayıt olmak için tıklayın
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
            <Home size={16} />
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
