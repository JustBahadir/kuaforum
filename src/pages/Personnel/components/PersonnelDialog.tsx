
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useShopData } from "@/hooks/useShopData";
import { toast } from "sonner";
import { isletmeServisi } from "@/lib/supabase";

interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonnelDialog({ open, onOpenChange }: PersonnelDialogProps) {
  const { userRole } = useCustomerAuth();
  const { isletmeData } = useShopData(null);
  const [businessCode, setBusinessCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (open && isletmeData?.id) {
      fetchBusinessCode();
    }
  }, [open, isletmeData?.id]);
  
  const fetchBusinessCode = async () => {
    if (!isletmeData?.id) return;
    
    try {
      const dukkanData = await isletmeServisi.getir(isletmeData.id);
      if (dukkanData?.kod) {
        setBusinessCode(dukkanData.kod);
      }
    } catch (error) {
      console.error("İşletme kodu alınırken hata:", error);
    }
  };
  
  const copyToClipboard = () => {
    if (!businessCode) return;
    
    try {
      navigator.clipboard.writeText(businessCode);
      setCopied(true);
      toast.success("İşletme kodu panoya kopyalandı");
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error("Kopyalama hatası:", error);
      toast.error("Kopyalama işlemi başarısız oldu");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Personel Sistemi</DialogTitle>
        </DialogHeader>
        
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Personel eklemek için, personellerinizin dükkan kodunuzu kullanarak üye olmalarını sağlayın. 
            Aşağıda görünen kodu personelleriniz ile paylaşın.
          </AlertDescription>
        </Alert>
        
        {userRole === 'admin' ? (
          <div className="space-y-4">
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">İşletme Kodu</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 border rounded-md p-2 bg-muted">
                  <code className="text-sm">{businessCode || "Kod yüklenemedi"}</code>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  disabled={!businessCode}
                  className={copied ? "text-green-500" : ""}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bu kodu personellerinize vererek sisteme kayıt olmalarını sağlayabilirsiniz.
              </p>
            </div>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Yalnızca İşletme Sahipleri personel ekleyebilir.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
