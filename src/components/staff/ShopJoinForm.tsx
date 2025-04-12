
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { authService } from "@/lib/auth/services/authService";

interface ShopJoinFormProps {
  personnelId: number;
  onSuccess?: () => void;
}

export function ShopJoinForm({ personnelId, onSuccess }: ShopJoinFormProps) {
  const [loading, setLoading] = useState(false);
  const [shopCode, setShopCode] = useState("");
  const [shop, setShop] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerifyCode = async () => {
    if (!shopCode.trim()) {
      setError("Dükkan kodu boş olamaz");
      return;
    }
    
    setVerifying(true);
    setError(null);
    
    try {
      const shop = await authService.verifyShopCode(shopCode);
      
      if (!shop) {
        setError("Geçersiz dükkan kodu. Lütfen kod bilgisini kontrol ediniz.");
        return;
      }
      
      // Check if already requested to join this shop
      const { data: existingRequest, error: requestCheckError } = await supabase
        .from('personel_shop_requests')
        .select('status')
        .eq('personel_id', personnelId)
        .eq('dukkan_id', shop.id)
        .maybeSingle();
        
      if (!requestCheckError && existingRequest) {
        if (existingRequest.status === 'pending') {
          setError(`Bu dükkana zaten katılım isteği gönderilmiş ve onay bekliyor.`);
          return;
        } else if (existingRequest.status === 'rejected') {
          setError(`Bu dükkana daha önce gönderdiğiniz istek reddedildi.`);
          return;
        }
      }
      
      // Check if already member of this shop
      const { data: personnelData, error: personnelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', personnelId)
        .single();
        
      if (!personnelError && personnelData?.dukkan_id === shop.id) {
        setError("Zaten bu dükkana bağlısınız.");
        return;
      }
      
      setShop(shop);
      setVerified(true);
    } catch (error) {
      console.error("Error verifying shop code:", error);
      setError("Dükkan kodu doğrulanırken bir hata oluştu");
    } finally {
      setVerifying(false);
    }
  };

  const handleSendRequest = async () => {
    if (!shop) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('personel_shop_requests')
        .insert([{
          personel_id: personnelId,
          dukkan_id: shop.id,
          status: 'pending'
        }]);
        
      if (error) throw error;
      
      toast.success(`"${shop.ad}" dükkanına katılım isteği gönderildi.`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error sending shop join request:", error);
      toast.error("İstek gönderilirken bir hata oluştu");
      setError("Katılım isteği gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dükkana Katıl</CardTitle>
        <CardDescription>
          Çalışmak istediğiniz dükkanın kodunu girerek katılım isteği gönderin
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopCode">Dükkan Kodu</Label>
            <div className="flex space-x-2">
              <Input
                id="shopCode"
                value={shopCode}
                onChange={(e) => setShopCode(e.target.value)}
                disabled={verified}
                placeholder="Dükkan yöneticisinden alınan kod"
              />
              <Button 
                variant="outline" 
                disabled={verifying || verified || !shopCode.trim()}
                onClick={handleVerifyCode}
              >
                {verifying ? "..." : "Doğrula"}
              </Button>
            </div>
          </div>
          
          {shop && verified && (
            <>
              <Alert>
                <AlertDescription>
                  <strong>{shop.ad}</strong> dükkanına katılım isteği gönderilecek.
                  İstek dükkan yöneticisi tarafından onaylandıktan sonra dükkana bağlanacaksınız.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button onClick={handleSendRequest} disabled={loading}>
                  {loading ? "Gönderiliyor..." : "Katılım İsteği Gönder"}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
