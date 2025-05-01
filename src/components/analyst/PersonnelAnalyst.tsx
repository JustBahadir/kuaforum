
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useShopData } from "@/hooks/useShopData";
import { formatCurrency } from "@/utils/currencyFormatter";

export function PersonnelAnalyst() {
  const [isLoading, setIsLoading] = useState(true);
  const [performans, setPerformans] = useState<any[]>([]);
  const { isletmeData } = useShopData();

  // Get personnel islemler history
  const { data: islemler = [] } = useQuery({
    queryKey: ["personel_islemleri"],
    queryFn: async () => {
      try {
        // Use the correct method name - personelIslemleriniGetir instead of personelIslemleriGetir
        return await personelIslemleriServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching personnel operations:", error);
        return [];
      }
    },
  });

  // Compute total stats
  useEffect(() => {
    if (islemler.length > 0) {
      const calculatedPerformans = calculatePerformans(islemler);
      setPerformans(calculatedPerformans);
      setIsLoading(false);
    } else {
      // Handle the case when islemler is empty
      setIsLoading(false);
    }
  }, [islemler]);

  // Calculate personel performans
  const calculatePerformans = (islemlerData: any[]) => {
    // Group by personel_id
    const groupedByPersonel: Record<string, any[]> = {};
    
    islemlerData.forEach((islem) => {
      const personelId = islem.personel_id;
      if (!groupedByPersonel[personelId]) {
        groupedByPersonel[personelId] = [];
      }
      groupedByPersonel[personelId].push(islem);
    });
    
    // Calculate stats for each personel
    return Object.keys(groupedByPersonel).map((personelId) => {
      const personelIslemler = groupedByPersonel[personelId];
      const personelInfo = personelIslemler[0]?.personel || {};
      
      const islemSayisi = personelIslemler.length;
      const toplamCiro = personelIslemler.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
      const toplamPrim = personelIslemler.reduce((sum, islem) => {
        const primOrani = islem.prim_yuzdesi || 0;
        const tutar = islem.tutar || 0;
        return sum + (tutar * primOrani / 100);
      }, 0);
      
      return {
        id: personelId,
        ad_soyad: personelInfo.ad_soyad || "Bilinmeyen Personel",
        islem_sayisi: islemSayisi,
        toplam_ciro: toplamCiro,
        toplam_prim: toplamPrim,
        ciro_yuzdesi: 0, // Will be calculated after
      };
    });
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Personel Performansı</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : performans.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Personel performans verisi bulunmuyor.
          </div>
        ) : (
          <div className="space-y-6">
            {performans.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                    {item.ad_soyad?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="font-medium">{item.ad_soyad}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.islem_sayisi} işlem
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(item.toplam_ciro)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(item.toplam_prim)} prim
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
