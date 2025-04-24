
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { LoginTabs } from "@/components/staff/LoginTabs";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Home } from "lucide-react";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Clear any existing session when the login page is loaded
    const clearSession = async () => {
      try {
        await supabase.auth.signOut();
        console.log("Session cleared for fresh login");
      } catch (err) {
        console.error("Error clearing session:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    clearSession();
  }, []);
  
  const handleLoginSuccess = () => {
    console.log("Login success detected");
    
    // Let the AuthGoogleCallback or other login handlers perform the redirection 
    // based on user role and shop assignment status
  };

  const handleBackClick = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <StaffCardHeader onBack={handleBackClick} />
        <CardContent className="p-6">
          <LoginTabs onSuccess={handleLoginSuccess} />
          <div className="flex flex-col items-center mt-4 space-y-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Müşteri Girişi</span>
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleBackClick}
              className="w-full flex items-center justify-center gap-2"
            >
              <Home size={16} />
              <span>Ana Sayfaya Dön</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
