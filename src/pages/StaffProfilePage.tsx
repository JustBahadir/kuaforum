
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfo } from "@/components/staff/profile/PersonalInfo";
import { EducationInfo } from "@/components/staff/profile/EducationInfo";
import { PastOperations } from "@/components/staff/profile/PastOperations";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function StaffProfilePage() {
  const navigate = useNavigate();
  const { userRole, handleLogout } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      setIsLoading(true);
      
      try {
        // Get user role from edge function
        const { data, error } = await supabase.functions.invoke('get_current_user_role');
        
        if (error) {
          console.error("Error checking user role:", error);
          toast.error("Kullanıcı rolü kontrol edilirken bir hata oluştu");
          return;
        }
        
        const role = data?.role;
        
        if (role && role !== 'staff') {
          toast.error("Bu sayfaya erişim yetkiniz yok");
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserRole();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Profil Bilgilerim</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="personal">Özlük Bilgileri</TabsTrigger>
              <TabsTrigger value="education">Eğitim Bilgileri</TabsTrigger>
              <TabsTrigger value="history">Geçmiş İşlemler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <PersonalInfo />
            </TabsContent>
            
            <TabsContent value="education">
              <EducationInfo />
            </TabsContent>
            
            <TabsContent value="history">
              <PastOperations />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button 
              variant="outline"
              onClick={() => navigate("/register-profile")}
            >
              İşletmeye Kaydol
            </Button>
            <Button 
              variant="destructive"
              onClick={handleLogout}
            >
              Çıkış Yap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
