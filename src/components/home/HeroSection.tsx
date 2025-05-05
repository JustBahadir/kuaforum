
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-purple-700 to-blue-600 text-white py-16 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Kuaför Randevu Sistemi</h1>
        <p className="text-xl md:text-2xl mb-8">İster müşteri ister salon sahibi olun, size özel çözümlerimiz var</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <GoogleAuthButton 
            text="Google ile Giriş Yap" 
            className="bg-white text-gray-800 hover:bg-gray-100"
          />
          <Button onClick={() => navigate("/login")} className="w-full sm:w-auto">
            Kuaför Girişi
          </Button>
        </div>
      </div>
    </header>
  );
}
