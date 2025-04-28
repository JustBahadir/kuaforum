
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface JoinShopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personelId: number | null;
}

export function JoinShopModal({ open, onOpenChange, personelId }: JoinShopModalProps) {
  const [shopCode, setShopCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

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
    try {
      // First, check if the shop code exists
      const { data: shopData, error: shopError } = await supabase
        .from("dukkanlar")
        .select("id")
        .eq("kod", shopCode)
        .single();

      if (shopError) {
        console.error("Error fetching shop:", shopError);
        toast.error("Girilen işletme kodu bulunamadı. Lütfen doğru kodu kullandığınızdan emin olun.");
        return;
      }

      if (!shopData) {
        toast.error("Girilen işletme kodu bulunamadı. Lütfen doğru kodu kullandığınızdan emin olun.");
        return;
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
        
        // Check if it's a duplicate request
        if (requestError.code === "23505") {
          toast.error("Bu işletmeye zaten katılım isteği gönderdiniz.");
        } else {
          toast.error("İşletmeye katılım isteği gönderilirken bir hata oluştu.");
        }
        return;
      }

      toast.success("İşletmeye katılım talebiniz başarıyla gönderildi. Yönetici onayı bekleniyor.");
      onOpenChange(false);
      setShopCode("");
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
            <Input
              id="shopCode"
              value={shopCode}
              onChange={(e) => setShopCode(e.target.value)}
              placeholder="Örn: ABCDE123"
              className="col-span-3"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <LoadingButton
            onClick={handleJoinShop}
            loading={isJoining}
            disabled={!shopCode || isJoining}
          >
            Katılım Talebi Gönder
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
