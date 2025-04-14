
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface CustomerLoyaltyCardProps {
  customerId: number;
  expanded?: boolean;
}

export function CustomerLoyaltyCard({ customerId, expanded = false }: CustomerLoyaltyCardProps) {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      // Get all operations and filter by customer ID
      const allOperations = await personelIslemleriServisi.hepsiniGetir();
      return allOperations.filter(op => op.musteri_id === customerId);
    },
    enabled: !!customerId
  });

  // Calculate loyalty metrics
  const totalSpent = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalPoints = operations.reduce((sum, op) => sum + (op.puan || 0), 0);
  const averageRating = operations.length ? totalPoints / operations.length : 0;
  const operationCount = operations.length;
  
  // For loyalty tier calculation (example logic)
  let tier = "Bronze";
  let nextTier = "Silver";
  let progress = 0;
  
  if (totalSpent >= 5000) {
    tier = "Platinum";
    nextTier = "Max";
    progress = 100;
  } else if (totalSpent >= 2000) {
    tier = "Gold";
    nextTier = "Platinum";
    progress = ((totalSpent - 2000) / 3000) * 100; // Progress towards Platinum
  } else if (totalSpent >= 500) {
    tier = "Silver";
    nextTier = "Gold";
    progress = ((totalSpent - 500) / 1500) * 100; // Progress towards Gold
  } else {
    progress = (totalSpent / 500) * 100; // Progress towards Silver
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Sadakat Seviyesi</h3>
          <p className="text-2xl font-bold">{tier}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
          {tier.charAt(0)}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Bir sonraki seviye: {nextTier}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="pt-2 border-t space-y-2">
        <div className="flex justify-between text-sm">
          <span>Toplam Harcama</span>
          <span className="font-semibold">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>İşlem Sayısı</span>
          <span className="font-semibold">{operationCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Ortalama Puan</span>
          <span className="font-semibold">{averageRating.toFixed(1)}/5</span>
        </div>
      </div>
      
      {expanded && (
        <div className="pt-4 space-y-4">
          <h4 className="font-medium">Sadakat Programı Avantajları</h4>
          <div className="space-y-2">
            <div className="p-3 border rounded-md bg-gray-50">
              <div className="font-medium">Bronze</div>
              <p className="text-sm text-gray-600">Temel indirimler ve kampanyalara erişim</p>
            </div>
            <div className="p-3 border rounded-md bg-gray-50">
              <div className="font-medium">Silver</div>
              <p className="text-sm text-gray-600">%5 indirim ve özel kampanyalara erken erişim</p>
            </div>
            <div className="p-3 border rounded-md bg-gray-50">
              <div className="font-medium">Gold</div>
              <p className="text-sm text-gray-600">%10 indirim ve ücretsiz ek hizmetler</p>
            </div>
            <div className="p-3 border rounded-md bg-gray-50">
              <div className="font-medium">Platinum</div>
              <p className="text-sm text-gray-600">%15 indirim, öncelikli randevu ve VIP hizmetler</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
