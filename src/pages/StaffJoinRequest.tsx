
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { shopService } from "@/lib/auth/services/shopService";
import { LoadingButton } from "@/components/ui/loading-button";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";

export default function StaffJoinRequest() {
  const [shopCode, setShopCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { personelId, loadUserAndStaffData } = useUnassignedStaffData();
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadUserAndStaffData();
  }, [loadUserAndStaffData]);

  const handleJoinShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopCode.trim()) {
      toast.error("İşletme kodu giriniz");
      return;
    }

    try {
      setValidating(true);
      const shop = await shopService.verifyShopCode(shopCode.trim());
      
      if (!shop) {
        toast.error("Geçersiz işletme kodu. Lütfen kontrol ediniz.");
        setValidating(false);
        return;
      }

      if (!personelId) {
        toast.error("Personel bilgileriniz bulunamadı. Lütfen tekrar giriş yapınız.");
        setValidating(false);
        return;
      }

      setIsLoading(true);
      
      // Check if there is already a pending request
      const { data: existingRequests, error: checkError } = await supabase
        .from('staff_join_requests')
        .select('*')
        .eq('personel_id', personelId)
        .eq('durum', 'pending');

      if (checkError) {
        console.error("Error checking existing requests:", checkError);
        toast.error("İşlem sırasında bir hata oluştu");
        setIsLoading(false);
        setValidating(false);
        return;
      }

      if (existingRequests && existingRequests.length > 0) {
        toast.warning("Zaten bekleyen bir katılım talebiniz bulunuyor. İşletme yöneticisinin onayını bekleyiniz.");
        setIsLoading(false);
        setValidating(false);
        return;
      }

      // Create join request
      const { error: joinError } = await supabase
        .from('staff_join_requests')
        .insert([{
          personel_id: personelId,
          dukkan_id: shop.id,
          durum: 'pending'
        }]);

      if (joinError) {
        console.error("Error creating join request:", joinError);
        toast.error("İşletmeye katılım talebi oluşturulurken bir hata oluştu");
      } else {
        toast.success(`"${shop.ad}" işletmesine katılım talebiniz oluşturuldu. Yönetici onayı bekleniyor.`);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying shop code:", error);
      toast.error("İşletme kodu doğrulanırken bir hata oluştu");
    } finally {
      setIsLoading(false);
      setValidating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">İşletmeye Katıl</h1>
            <p className="text-gray-600 mt-2">
              Bağlanmak istediğiniz işletmenin yöneticisinden aldığınız kodu giriniz. 
              Kodun doğruluğunu kontrol ediniz.
            </p>
          </div>

          <form onSubmit={handleJoinShop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopCode">İşletme Kodu</Label>
              <Input
                id="shopCode"
                placeholder="İşletme kodunu buraya giriniz..."
                value={shopCode}
                onChange={(e) => {
                  // Only allow alphanumeric characters
                  const alphanumericValue = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                  setShopCode(alphanumericValue);
                }}
                className="text-base"
                disabled={validating || isLoading}
              />
            </div>

            <div className="pt-2">
              <LoadingButton 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                loading={validating || isLoading}
              >
                İşletmeye Katıl
              </LoadingButton>
            </div>

            <div className="text-center mt-4">
              <Button
                variant="link"
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-gray-700"
                disabled={validating || isLoading}
              >
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
