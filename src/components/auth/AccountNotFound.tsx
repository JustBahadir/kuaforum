
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, UserPlus } from "lucide-react";

export default function AccountNotFound() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/login?tab=register");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-t-lg">
            Hesap Durumu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-center text-red-500 font-medium text-lg">
            Bu Gmail'e kayıtlı bir hesap bulunmamaktadır.
          </p>
          <Button 
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <UserPlus className="mr-2 h-5 w-5" />
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
