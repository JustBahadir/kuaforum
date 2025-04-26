
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
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();
  
  const handleJoinShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopCode.trim()) {
      toast.error("İşletme kodu giriniz");
      return;
    }

    try {
      // First validate the shop code
      setIsValidating(true);
      const shop = await shopService.verifyShopCode(shopCode.trim());
      setIsValidating(false);
      
      if (!shop) {
        toast.error("Girilen işletme kodu bulunamadı. Lütfen doğru kodu kullandığınızdan emin olun.");
        return;
      }
      
      // If we don't have personelId yet, let's try to get it first
      let currentPersonelId = personelId;
      if (!currentPersonelId) {
        setIsLoading(true);
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error("Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapınız.");
          setIsLoading(false);
          return;
        }
        
        // Try to find personel record
        const { data: personelData, error: personelError } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();
        
        // If no personel record, create one
        if (!personelData && !personelError) {
          const name = user.user_metadata?.first_name ? 
            `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : 
            user.email?.split('@')[0] || 'Personel';
          
          const { data: newPersonel, error: createError } = await supabase
            .from('personel')
            .insert([{
              auth_id: user.id,
              ad_soyad: name,
              telefon: user.user_metadata?.phone || '-',
              eposta: user.email || '-',
              adres: user.user_metadata?.address || '-',
              personel_no: `P${Date.now().toString().substring(8)}`,
              calisma_sistemi: 'Tam Zamanlı',
              maas: 0,
              prim_yuzdesi: 0,
              avatar_url: user.user_metadata?.avatar_url || ''
            }])
            .select('id')
            .single();

          if (createError) {
            console.error("Error creating personel record:", createError);
            toast.error("Profil bilginiz oluşturulamadı. Lütfen tekrar deneyiniz.");
            setIsLoading(false);
            return;
          }
          
          currentPersonelId = newPersonel.id;
        } else if (personelData) {
          currentPersonelId = personelData.id;
        } else if (personelError) {
          console.error("Error fetching personel:", personelError);
          toast.error("Profil bilginiz alınamadı. Lütfen tekrar deneyiniz.");
          setIsLoading(false);
          return;
        }
      }
      
      if (!currentPersonelId) {
        toast.error("Profil bilginiz bulunamadı. Lütfen tekrar deneyiniz.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Check if there is already a pending request
      const { data: existingRequests, error: checkError } = await supabase
        .from('staff_join_requests')
        .select('*')
        .eq('personel_id', currentPersonelId)
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
        setIsLoading(false);
        return;
      }

      // Create join request
      const { error: joinError } = await supabase
        .from('staff_join_requests')
        .insert([{
          personel_id: currentPersonelId,
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
    } catch (error: any) {
      console.error("Error joining shop:", error);
      toast.error(error.message || "İşletmeye katılım sırasında bir hata oluştu");
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
                disabled={isValidating || isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isValidating || isLoading}>
              İptal
            </Button>
            <LoadingButton 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              loading={isValidating || isLoading}
            >
              İşletmeye Katıl
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
