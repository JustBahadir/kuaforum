
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { shopService } from "@/lib/auth/services/shopService";
import { LoadingButton } from "@/components/ui/loading-button";

interface JoinShopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personelId: number | null;
}

export function JoinShopModal({ open, onOpenChange, personelId }: JoinShopModalProps) {
  const [shopCode, setShopCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleJoinShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopCode.trim()) {
      toast.error("İşletme kodu giriniz");
      return;
    }

    if (!personelId) {
      toast.error("Personel bilgileriniz bulunamadı. Lütfen tekrar giriş yapınız.");
      onOpenChange(false);
      return;
    }

    try {
      setIsLoading(true);
      const shop = await shopService.verifyShopCode(shopCode.trim());
      
      if (!shop) {
        toast.error("Geçersiz işletme kodu. Lütfen kontrol ediniz.");
        setIsLoading(false);
        return;
      }

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
        return;
      }

      if (existingRequests && existingRequests.length > 0) {
        toast.warning("Zaten bekleyen bir katılım talebiniz bulunuyor. İşletme yöneticisinin onayını bekleyiniz.");
        onOpenChange(false);
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
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying shop code:", error);
      toast.error("İşletme kodu doğrulanırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>İşletmeye Katıl</DialogTitle>
          <DialogDescription>
            Bağlanmak istediğiniz işletmenin yöneticisinden aldığınız kodu giriniz. 
            Kodun doğruluğunu kontrol ediniz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleJoinShop}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shopCode" className="text-right col-span-1">
                İşletme Kodu
              </Label>
              <Input
                id="shopCode"
                placeholder="İşletme kodunu buraya giriniz..."
                value={shopCode}
                onChange={(e) => {
                  // Only allow alphanumeric characters
                  const alphanumericValue = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                  setShopCode(alphanumericValue);
                }}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              İptal
            </Button>
            <LoadingButton 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              loading={isLoading}
            >
              İşletmeye Katıl
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
