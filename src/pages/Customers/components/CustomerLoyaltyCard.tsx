
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { personelIslemleriServisi } from "@/lib/supabase";
import { PersonelIslemi } from "@/lib/supabase/temporaryTypes";
import { Musteri } from "@/lib/supabase/types";
import { Coins, Star } from "lucide-react";

interface CustomerLoyaltyCardProps {
  customer: Musteri;
}

export function CustomerLoyaltyCard({ customer }: CustomerLoyaltyCardProps) {
  const [islemler, setIslemler] = useState<PersonelIslemi[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get customer operations
        const customerIslemler = await personelIslemleriServisi.musteriyeGoreGetir(customer.kimlik);
        setIslemler(customerIslemler);
        
        // Calculate points and total spent
        let points = 0;
        let spent = 0;
        
        customerIslemler.forEach((islem) => {
          points += islem.puan || 0;
          spent += islem.tutar || 0;
        });
        
        setLoyaltyPoints(points);
        setTotalSpent(spent);
      } catch (error) {
        console.error("Müşteri puanları yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [customer.kimlik]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Müşteri Sadakat Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-md">
              <Star className="h-8 w-8 text-amber-500 mb-2" />
              <div className="text-2xl font-bold">{loyaltyPoints}</div>
              <div className="text-xs text-muted-foreground">Toplam Puan</div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-md">
              <Coins className="h-8 w-8 text-emerald-500 mb-2" />
              <div className="text-2xl font-bold">{totalSpent.toFixed(2)} ₺</div>
              <div className="text-xs text-muted-foreground">Toplam Harcama</div>
            </div>
            
            <div className="col-span-2 text-center text-sm text-muted-foreground mt-2">
              {islemler.length === 0 ? (
                "Bu müşteriye ait işlem kaydı bulunamadı"
              ) : (
                <span>
                  Son {islemler.length} işlemde {loyaltyPoints} puan kazanıldı
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CustomerLoyaltyCard;
