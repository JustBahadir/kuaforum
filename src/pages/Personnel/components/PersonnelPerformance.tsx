
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { formatCurrency } from "@/lib/utils";

interface PersonnelPerformanceProps {
  personnelId: number;
}

export function PersonnelPerformance({ personnelId }: PersonnelPerformanceProps) {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personnelId),
    enabled: !!personnelId
  });

  // Calculate totals
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const operationCount = operations.length;
  const totalCommission = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const totalPoints = operations.reduce((sum, op) => sum + (op.puan || 0), 0);

  if (isLoading) {
    return <div className="p-4 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm text-gray-600">Toplam İşlem</h3>
          <p className="text-2xl font-bold">{operationCount}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-600">Toplam Ciro</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-600">Toplam Prim</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalCommission)}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-600">Toplam Puan</h3>
          <p className="text-2xl font-bold">{totalPoints}</p>
        </div>
      </div>
    </div>
  );
}
