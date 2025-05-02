
import { useEffect, useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function StaffJoinRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  
  const { 
    userProfile, 
    loadUserAndStaffData,
    personelId = null
  } = useUnassignedStaffData();

  useEffect(() => {
    loadUserAndStaffData();
  }, [loadUserAndStaffData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      toast.error("Lütfen katılım kodu girin");
      return;
    }

    try {
      setLoading(true);
      
      // Fetch shop by code
      const { data: dukkan, error: dukkanError } = await supabase
        .from('dukkanlar')
        .select('id, ad')
        .eq('kod', joinCode)
        .single();
      
      if (dukkanError || !dukkan) {
        toast.error("Geçersiz katılım kodu. Lütfen tekrar kontrol edin.");
        return;
      }

      // Insert join request
      if (!personelId) {
        toast.error("Personel bilgileriniz bulunamadı");
        return;
      }

      const { error: requestError } = await supabase
        .from('staff_join_requests')
        .insert({
          personel_id: personelId,
          dukkan_id: dukkan.id,
          durum: 'pending'
        });
      
      if (requestError) {
        console.error("Join request error:", requestError);
        toast.error("Katılım isteği gönderilirken bir hata oluştu");
        return;
      }

      toast.success(`"${dukkan.ad}" işletmesine katılım isteğiniz gönderildi`);
      
      // Redirect to waiting page or profile
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
      
    } catch (error) {
      console.error("Error sending join request:", error);
      toast.error("İşlem sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaffLayout>
      <div className="container mx-auto py-8 max-w-md">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center">İşletmeye Katıl</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                İşletme sahibinden aldığınız katılım kodunu girerek mevcut bir işletmeye personel olarak katılabilirsiniz.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="joinCode" className="text-sm font-medium">
                  Katılım Kodu
                </label>
                <input
                  id="joinCode"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="ABC123"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "İstek Gönderiliyor..." : "Katılım İsteği Gönder"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate("/profile")} 
                className="text-sm"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
