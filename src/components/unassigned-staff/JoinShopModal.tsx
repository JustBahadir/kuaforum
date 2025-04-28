
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Store, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JoinShopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personelId: number | null;
}

export function JoinShopModal({ open, onOpenChange, personelId }: JoinShopModalProps) {
  const [shopCode, setShopCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinResult, setJoinResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const resetState = () => {
    setJoinResult(null);
    setShopCode("");
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleJoinShop = async () => {
    if (!shopCode) {
      toast.error("Lütfen işletme kodunu giriniz");
      return;
    }

    if (!personelId) {
      toast.error("Personel bilgileriniz bulunamadı. Lütfen tekrar giriş yapınız.");
      return;
    }

    setIsJoining(true);
    setJoinResult(null);
    
    try {
      // First, check if the shop code exists
      const { data: shopData, error: shopError } = await supabase
        .from("dukkanlar")
        .select("id, ad")
        .eq("kod", shopCode)
        .single();

      if (shopError) {
        console.error("Error fetching shop:", shopError);
        setJoinResult({
          success: false,
          message: "Bu koda sahip bir işletme bulunamadı."
        });
        return;
      }

      if (!shopData) {
        setJoinResult({
          success: false,
          message: "Bu koda sahip bir işletme bulunamadı."
        });
        return;
      }

      // Check if there is an existing request
      const { data: existingRequest, error: checkError } = await supabase
        .from("staff_join_requests")
        .select("id, durum")
        .eq("personel_id", personelId)
        .eq("dukkan_id", shopData.id)
        .maybeSingle();
        
      if (existingRequest) {
        if (existingRequest.durum === "pending") {
          setJoinResult({
            success: false,
            message: `Bu işletmeye zaten katılım talebiniz var. İşletme sahibinin onayını bekleyin.`
          });
          return;
        } else if (existingRequest.durum === "rejected") {
          setJoinResult({
            success: false,
            message: `Bu işletme daha önce talebinizi reddetmiş.`
          });
          return;
        }
      }

      // Create a join request
      const { error: requestError } = await supabase
        .from("staff_join_requests")
        .insert({
          personel_id: personelId,
          dukkan_id: shopData.id,
          durum: "pending"
        });

      if (requestError) {
        console.error("Error creating join request:", requestError);
        
        // Generic error message
        setJoinResult({
          success: false,
          message: "İşletmeye katılım isteği gönderilirken bir hata oluştu."
        });
        return;
      }

      // Send notification to shop owner
      try {
        const { data: shopOwnerData } = await supabase
          .from("dukkanlar")
          .select("sahibi_id")
          .eq("id", shopData.id)
          .single();
          
        if (shopOwnerData?.sahibi_id) {
          // Get staff info
          const { data: staffData } = await supabase
            .from("personel")
            .select("ad_soyad")
            .eq("id", personelId)
            .single();
            
          const staffName = staffData?.ad_soyad || "Bir personel";
          
          // Create notification
          await supabase
            .from("notifications")
            .insert({
              user_id: shopOwnerData.sahibi_id,
              title: "Yeni Personel Talebi",
              message: `${staffName} işletmenize katılmak istiyor.`,
              type: "staff_join_request"
            });
        }
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // We still consider the request successful even if notification fails
      }

      setJoinResult({
        success: true,
        message: `"${shopData.ad}" işletmesine katılım talebiniz başarıyla gönderildi. Yönetici onayı bekleniyor.`
      });
      
    } catch (error) {
      console.error("Error joining shop:", error);
      setJoinResult({
        success: false,
        message: "İşletmeye katılırken bir hata oluştu."
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            İşletmeye Katıl
          </DialogTitle>
          <DialogDescription>
            İşletme yöneticisinden aldığınız kodu girerek bir işletmeye personel olarak katılın.
          </DialogDescription>
        </DialogHeader>

        {joinResult ? (
          <>
            <Alert variant={joinResult.success ? "default" : "destructive"} className="my-4">
              {joinResult.success ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{joinResult.message}</AlertDescription>
            </Alert>
            
            <DialogFooter>
              {joinResult.success ? (
                <Button onClick={handleClose}>
                  Tamam
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={resetState}>
                    Tekrar Dene
                  </Button>
                  <Button variant="default" onClick={handleClose}>
                    Kapat
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="shopCode" className="text-sm font-medium">
                  İşletme Kodu
                </label>
                <Input
                  id="shopCode"
                  value={shopCode}
                  onChange={(e) => setShopCode(e.target.value.trim())}
                  placeholder="Örn: crazy-kuafor-533"
                  className="col-span-3"
                />
                <p className="text-xs text-muted-foreground">
                  İşletme yöneticisinden aldığınız kodu giriniz.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Vazgeç
              </Button>
              <LoadingButton
                onClick={handleJoinShop}
                loading={isJoining}
                disabled={!shopCode || isJoining}
              >
                Katılım Talebi Gönder
              </LoadingButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
