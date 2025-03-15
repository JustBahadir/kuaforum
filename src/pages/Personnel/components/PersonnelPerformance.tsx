
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PersonnelPerformanceProps {
  personnelId: number;
}

export function PersonnelPerformance({ personnelId }: PersonnelPerformanceProps) {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: async () => {
      console.log("Personnel operations for ID:", personnelId);
      const operations = await personelIslemleriServisi.personelIslemleriGetir(personnelId);
      console.log("Personnel operations:", operations);
      return operations;
    },
    enabled: !!personnelId,
  });

  if (isLoading) {
    return <div className="text-center py-6">Yükleniyor...</div>;
  }

  if (operations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Bu personele ait performans verisi bulunamadı.
      </div>
    );
  }

  // Calculate performance metrics
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCommission = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const totalPoints = operations.reduce((sum, op) => sum + (op.puan || 0), 0);
  const operationCount = operations.length;
  const averageRevenuePerOperation = operationCount > 0 ? totalRevenue / operationCount : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              İşlem Sayısı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Ciro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Prim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalCommission)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Puan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ortalama İşlem Tutarı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageRevenuePerOperation)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>İşlem Performansı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                  Performans
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-purple-600">
                  {totalPoints} Puan
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
              <div
                style={{ width: `${Math.min(totalPoints / 10, 100)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
