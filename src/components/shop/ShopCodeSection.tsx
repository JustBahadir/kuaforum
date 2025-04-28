
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { shopService } from "@/lib/auth/services/shopService";
import { LoadingButton } from "@/components/ui/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShopCodeSectionProps {
  shopId: number;
  shopName: string;
}

export function ShopCodeSection({ shopId, shopName }: ShopCodeSectionProps) {
  const [shopCode, setShopCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchShopCode();
  }, [shopId]);

  const fetchShopCode = async () => {
    if (!shopId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dukkanlar")
        .select("kod")
        .eq("id", shopId)
        .single();

      if (error) throw error;
      
      if (data && data.kod) {
        setShopCode(data.kod);
      } else {
        // Generate a code if none exists
        await generateShopCode();
      }
    } catch (error) {
      console.error("Error fetching shop code:", error);
      toast.error("İşletme kodu alınırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const generateShopCode = async () => {
    try {
      setRegenerating(true);
      
      const newCode = shopService.generateShopCode(shopName);
      
      // Save the new code
      const { error } = await supabase
        .from("dukkanlar")
        .update({ kod: newCode })
        .eq("id", shopId);
        
      if (error) throw error;
      
      setShopCode(newCode);
      toast.success("İşletme kodu yenilendi");
    } catch (error) {
      console.error("Error generating shop code:", error);
      toast.error("İşletme kodu oluşturulurken bir hata oluştu");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shopCode);
    toast.success("İşletme kodu panoya kopyalandı");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşletme Kodu</CardTitle>
        <CardDescription>
          Bu kodu personelleriniz ile paylaşarak onların sisteme kaydolmalarını sağlayabilirsiniz
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Input
                value={shopCode}
                readOnly
                className="font-mono bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                title="Kopyala"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <Alert className="mb-4">
              <AlertDescription>
                Not: Bu kod işletmenize özeldir ve değiştirilemez. Personellerinizin sisteme kaydolabilmesi için bu kodu kullanmaları gerekir.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <LoadingButton
                variant="outline"
                onClick={generateShopCode}
                loading={regenerating}
                disabled={regenerating}
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Kodu Yenile
              </LoadingButton>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
