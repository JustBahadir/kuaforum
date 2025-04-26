
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
      <Card className="w-full max-w-md shadow-lg border border-red-100">
        <CardHeader className="text-center">
          <CardTitle className="text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-t-lg">
            Hesap Durumu
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
          <Button 
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-12 text-lg"
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
