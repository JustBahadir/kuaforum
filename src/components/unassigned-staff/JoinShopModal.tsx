
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export interface JoinShopModalProps {
  personelId?: number;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function JoinShopModal({ personelId, onOpenChange, open }: JoinShopModalProps) {
  const [shopCode, setShopCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopCode.trim()) {
      toast.error("İşletme kodu gerekli");
      return;
    }
    
    try {
      setLoading(true);
      
      // İlk olarak işletme kodunun geçerli olup olmadığını kontrol et
      const { data: shopData, error: shopError } = await supabase
        .from('isletmeler')
        .select('kimlik, isletme_adi')
        .eq('isletme_kodu', shopCode)
        .single();
      
      if (shopError || !shopData) {
        toast.error("Geçersiz işletme kodu");
        return;
      }
      
      // Başvuru oluştur
      const { error: applicationError } = await supabase
        .from('personel_basvurulari')
        .insert({
          kullanici_kimlik: (await supabase.auth.getUser()).data.user?.id,
          isletme_kodu: shopCode,
          durum: 'beklemede',
          tarih: new Date().toISOString().split('T')[0]
        });
      
      if (applicationError) {
        toast.error("Başvuru gönderilirken bir hata oluştu");
        return;
      }
      
      toast.success(`"${shopData.isletme_adi}" işletmesine başvuru gönderildi`);
      onOpenChange(false);
      
      // Sayfayı yönlendirme (opsiyonel)
      setTimeout(() => {
        window.location.href = "/personel/beklemede";
      }, 2000);
      
    } catch (error: any) {
      console.error("Join shop error:", error);
      toast.error("Bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>İşletmeye Katıl</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopCode">İşletme Kodu</Label>
            <Input
              id="shopCode"
              value={shopCode}
              onChange={(e) => setShopCode(e.target.value)}
              placeholder="İşletme kodunu giriniz"
              required
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Başvur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default JoinShopModal;
