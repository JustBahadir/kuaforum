
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
import { cn } from "@/lib/utils";

interface JoinShopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personelId: number | null;
}

export function JoinShopModal({ open, onOpenChange, personelId }: JoinShopModalProps) {
  const [shopCode, setShopCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [shopInfo, setShopInfo] = useState<{ id: number; ad: string } | null>(null);

  // Helper function to format the shop code input according to the pattern
  const formatShopCode = (input: string) => {
    input = input.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Maximum length check
    if (input.length > 19) {
      input = input.substring(0, 19);
    }
    
    // Format with hyphens to match XXXXX-XXXXX-XXX-XXX pattern
    let formatted = input;
    
    // Add hyphens if they don't exist at specific positions
    if (input.length > 5 && input.charAt(5) !== '-') {
      formatted = input.substring(0, 5) + '-' + input.substring(5);
    }
    
    if (formatted.length > 11 && formatted.charAt(11) !== '-') {
      formatted = formatted.substring(0, 11) + '-' + formatted.substring(11);
    }
    
    if (formatted.length > 15 && formatted.charAt(15) !== '-') {
      formatted = formatted.substring(0, 15) + '-' + formatted.substring(15);
    }
    
    return formatted;
  };

  const validateShopCode = async (code: string) => {
    // Minimum length check
    if (code.length < 15) {
      return false;
    }
    
    // Pattern check (XXXXX-XXXXX-XXX-XXX)
    const pattern = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{3}-[A-Z0-9]{3}$/;
    if (!pattern.test(code)) {
      return false;
    }
    
    try {
      setValidationStatus("validating");
      
      // Check if the shop code exists in the database
      const { data: shopData, error: shopError } = await supabase
        .from("dukkanlar")
        .select("id, ad")
        .eq("kod", code)
        .single();
      
      if (shopError || !shopData) {
        setValidationStatus("invalid");
        setShopInfo(null);
        return false;
      }
      
      setShopInfo(shopData);
      setValidationStatus("valid");
      return true;
    } catch (error) {
      console.error("Error validating shop code:", error);
      setValidationStatus("invalid");
      setShopInfo(null);
      return false;
    }
  };

  const handleShopCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCode = formatShopCode(e.target.value);
    setShopCode(formattedCode);
    
    // Reset validation status when input changes
    if (validationStatus !== "idle") {
      setValidationStatus("idle");
      setShopInfo(null);
    }
  };

  const handleValidateShopCode = async () => {
    if (!shopCode) {
      toast.error("Lütfen işletme kodunu giriniz");
      return;
    }
    
    const isValid = await validateShopCode(shopCode);
    
    if (!isValid) {
      toast.error("Bu koda sahip bir işletme bulunamadı.");
    }
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

    // Validate the shop code first (if not already validated)
    if (validationStatus !== "valid") {
      const isValid = await validateShopCode(shopCode);
      if (!isValid) {
        toast.error("Bu koda sahip bir işletme bulunamadı.");
        return;
      }
    }

    setIsJoining(true);
    try {
      // Check if there's already a pending request
      const { data: existingRequests, error: checkError } = await supabase
        .from("staff_join_requests")
        .select("id, durum")
        .eq("personel_id", personelId)
        .eq("dukkan_id", shopInfo!.id);

      if (checkError) {
        throw checkError;
      }

      if (existingRequests && existingRequests.length > 0) {
        const pendingRequest = existingRequests.find(req => req.durum === "pending");
        if (pendingRequest) {
          toast.error("Bu işletmeye zaten katılım isteği gönderdiniz.");
          return;
        }
      }

      // Create a join request
      const { error: requestError } = await supabase
        .from("staff_join_requests")
        .insert({
          personel_id: personelId,
          dukkan_id: shopInfo!.id,
          durum: "pending"
        });

      if (requestError) {
        throw requestError;
      }

      // Create notification for the shop owner
      try {
        // First, get the shop owner's user ID
        const { data: shopData, error: shopError } = await supabase
          .from("dukkanlar")
          .select("sahibi_id")
          .eq("id", shopInfo!.id)
          .single();
        
        if (!shopError && shopData?.sahibi_id) {
          // Then create a notification
          await supabase
            .from("notifications")
            .insert({
              user_id: shopData.sahibi_id,
              title: "Yeni Personel Başvurusu",
              message: `${personelId} ID'li personelden yeni bir katılım talebi alındı.`,
              type: "staff_request",
              related_staff_id: personelId
            });
        }
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Don't throw here, we still want to show success for the request
      }

      toast.success("İş başvurunuz başarıyla gönderildi.");
      setShopCode("");
      setValidationStatus("idle");
      setShopInfo(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error joining shop:", error);
      toast.error("İşletmeye katılırken bir hata oluştu.");
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

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="shopCode" className="text-sm font-medium">
              İşletme Kodu
            </label>
            <div className="relative">
              <Input
                id="shopCode"
                value={shopCode}
                onChange={handleShopCodeChange}
                placeholder="XXXXX-XXXXX-XXX-XXX"
                className={cn(
                  "pr-10",
                  validationStatus === "valid" && "border-green-500 focus-visible:ring-green-500",
                  validationStatus === "invalid" && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {validationStatus === "validating" && (
                <div className="absolute right-3 top-2.5">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                </div>
              )}
              {validationStatus === "valid" && (
                <div className="absolute right-3 top-2.5 text-green-500">
                  <Check className="h-5 w-5" />
                </div>
              )}
              {validationStatus === "invalid" && (
                <div className="absolute right-3 top-2.5 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Örnek format: CRAZY-TRIZM-001-A8K
            </p>
          </div>

          {validationStatus === "valid" && shopInfo && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <span className="font-medium">{shopInfo.ad}</span> işletmesi bulundu. Katılım talebi göndermek için aşağıdaki butona tıklayın.
              </AlertDescription>
            </Alert>
          )}

          {validationStatus === "invalid" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bu koda sahip bir işletme bulunamadı. Lütfen kodu kontrol ediniz.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          {validationStatus !== "valid" ? (
            <LoadingButton
              onClick={handleValidateShopCode}
              loading={validationStatus === "validating"}
              disabled={!shopCode || shopCode.length < 15}
            >
              Kodu Doğrula
            </LoadingButton>
          ) : (
            <LoadingButton
              onClick={handleJoinShop}
              loading={isJoining}
              disabled={validationStatus !== "valid" || !shopInfo}
            >
              Katılım Talebi Gönder
            </LoadingButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
