
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // This page is just a placeholder for now
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="text-white hover:text-white/80 hover:bg-white/10 absolute top-2 left-2 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-center text-2xl">Kuaför Girişi</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Bu sayfa şu anda yapım aşamasındadır. Ana sayfaya dönmek için sol üstteki geri butonunu kullanabilirsiniz.
            </p>
          </div>
          
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-email">E-posta</Label>
              <Input 
                id="staff-email" 
                type="email" 
                placeholder="personel@salonyonetim.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">Şifre</Label>
              <Input 
                id="staff-password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled
              />
            </div>
            
            <Button 
              type="button" 
              className="w-full bg-gray-400 cursor-not-allowed"
              disabled
            >
              Yakında Aktif Olacak
            </Button>
            
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={() => navigate("/")}
                className="text-purple-600 hover:text-purple-800"
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
