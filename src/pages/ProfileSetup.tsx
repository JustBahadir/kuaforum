
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const handleRedirectToLogin = () => {
    // Navigate to login page with register tab selected
    navigate("/login?tab=register");
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Hesap Durumu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-lg text-red-600 font-medium">
            Bu Gmail'e kayıtlı bir hesap bulunmamaktadır.
          </div>
          
          <div className="grid gap-4">
            <Button 
              onClick={handleRedirectToLogin}
              className="w-full"
            >
              Kayıt olmak için tıklayın
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleNavigateHome}
              className="w-full flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
