
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PersonnelOperationsTableProps {
  personnelId: number | string;
}

export function PersonnelOperationsTable({ personnelId }: PersonnelOperationsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const itemsPerPage = 10;
  
  // Date range for filtering
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last 30 days
    to: new Date()
  });

  // Get operations for this specific personnel
  const { data: operations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['personnelOperations', personnelId, dateRange.from, dateRange.to],
    queryFn: async () => {
      try {
        console.log(`Fetching operations for personnel ID: ${personnelId}`);
        const result = await personelIslemleriServisi.personelIslemleriGetir(Number(personnelId));
        
        // Filter by date range
        return result.filter(op => {
          if (!op.created_at) return false;
          const opDate = new Date(op.created_at);
          return opDate >= dateRange.from && opDate <= dateRange.to;
        });
      } catch (error) {
        console.error('Error fetching personnel operations:', error);
        toast.error("Personel işlemleri yüklenirken bir hata oluştu");
        return [];
      }
    },
    enabled: !!personnelId,
    refetchOnWindowFocus: false
  });

  // Calculate totals
  useEffect(() => {
    if (operations?.length) {
      setTotalPoints(operations.reduce((sum, op) => sum + (op.puan || 0), 0));
      setTotalAmount(operations.reduce((sum, op) => sum + (op.tutar || 0), 0));
      setTotalPaid(operations.reduce((sum, op) => sum + (op.odenen || 0), 0));
    } else {
      setTotalPoints(0);
      setTotalAmount(0);
      setTotalPaid(0);
    }
  }, [operations]);

  // Calculate pagination
  const totalPages = Math.ceil((operations?.length || 0) / itemsPerPage);
  const paginatedOperations = operations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (e) {
      return dateString || '-';
    }
  };

  const handleForceRecover = async () => {
    try {
      setIsRecovering(true);
      toast.info("Tamamlanan randevular işleniyor...");
      
      // Force recovery from appointments
      await personelIslemleriServisi.recoverOperationsFromAppointments(Number(personnelId));
      
      // Refetch data
      await refetch();
      
      toast.success("İşlem geçmişi yenilendi");
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlem geçmişi yenilenirken bir hata oluştu");
    } finally {
      setIsRecovering(false);
    }
  };

  const handleRefresh = async () => {
    toast.info("İşlem geçmişi yenileniyor...");
    await refetch();
    toast.success("İşlem geçmişi yenilendi");
  };

  // Group operations by day/month/year for different views
  const groupOperationsByDate = (type: 'daily' | 'monthly' | 'yearly') => {
    const groupedData: { [key: string]: any[] } = {};
    
    operations.forEach(op => {
      if (!op.created_at) return;
      
      const date = new Date(op.created_at);
      let key: string;
      
      if (type === 'daily') {
        key = format(date, 'yyyy-MM-dd');
      } else if (type === 'monthly') {
        key = format(date, 'yyyy-MM');
      } else { // yearly
        key = format(date, 'yyyy');
      }
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      
      groupedData[key].push(op);
    });
    
    return groupedData;
  };
  
  // Summary data for each period
  const calculatePeriodSummaries = (groupedData: { [key: string]: any[] }) => {
    return Object.entries(groupedData).map(([period, ops]) => {
      const total = ops.reduce((sum, op) => sum + (op.tutar || 0), 0);
      const paid = ops.reduce((sum, op) => sum + (op.odenen || 0), 0);
      const points = ops.reduce((sum, op) => sum + (op.puan || 0), 0);
      const count = ops.length;
      
      return { 
        period, 
        total, 
        paid, 
        points, 
        count,
        operations: ops
      };
    }).sort((a, b) => b.period.localeCompare(a.period)); // Sort by most recent
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const dailyData = calculatePeriodSummaries(groupOperationsByDate('daily'));
  const monthlyData = calculatePeriodSummaries(groupOperationsByDate('monthly'));
  const yearlyData = calculatePeriodSummaries(groupOperationsByDate('yearly'));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Tarih aralığı:</span>
            <DateRangePicker 
              from={dateRange.from}
              to={dateRange.to}
              onSelect={({from, to}) => {
                setDateRange({from, to});
                setCurrentPage(1); // Reset page number
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleForceRecover}
              disabled={isRecovering || isRefetching}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRecovering ? 'animate-spin' : ''}`} />
              Randevulardan Güncelle
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-500">TOPLAM PUAN</div>
            <div className="text-xl font-bold text-purple-600">{totalPoints}</div>
          </div>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-500">TOPLAM CİRO</div>
            <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
          </div>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-500">TOPLAM KAZANÇ</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="daily">Günlük</TabsTrigger>
          <TabsTrigger value="monthly">Aylık</TabsTrigger>
          <TabsTrigger value="yearly">Yıllık</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="p-1">
          {operations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Seçilen tarih aralığında kayıtlı işlem bulunmamaktadır.
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={handleForceRecover} disabled={isRecovering}>
                  {isRecovering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-purple-600 border-purple-200 rounded-full animate-spin mr-2"></div>
                      İşleniyor...
                    </>
                  ) : (
                    "Tamamlanmış Randevulardan İşlemleri Oluştur"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlem</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-right">Puan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOperations.map((operation) => (
                      <TableRow key={operation.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {formatDate(operation.created_at)}
                        </TableCell>
                        <TableCell>
                          {operation.islem?.islem_adi || operation.aciklama || 'Bilinmeyen İşlem'}
                        </TableCell>
                        <TableCell>
                          {operation.aciklama && operation.aciklama.includes('-') 
                            ? operation.aciklama.split('-')[1]?.split('(')[0]?.trim() 
                            : 'Bilinmeyen Müşteri'}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(operation.tutar || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {operation.puan || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Sayfa {currentPage} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToPreviousPage}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToNextPage}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="monthly">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ay</TableHead>
                  <TableHead className="text-right">İşlem Sayısı</TableHead>
                  <TableHead className="text-right">Toplam Ciro</TableHead>
                  <TableHead className="text-right">Toplam Kazanç</TableHead>
                  <TableHead className="text-right">Toplam Puan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.length > 0 ? (
                  monthlyData.map((item) => (
                    <TableRow key={item.period} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {format(new Date(item.period + '-01'), 'MMMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.count}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(item.paid)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.points}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      Seçilen tarih aralığında kayıtlı veri bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="yearly">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Yıl</TableHead>
                  <TableHead className="text-right">İşlem Sayısı</TableHead>
                  <TableHead className="text-right">Toplam Ciro</TableHead>
                  <TableHead className="text-right">Toplam Kazanç</TableHead>
                  <TableHead className="text-right">Toplam Puan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyData.length > 0 ? (
                  yearlyData.map((item) => (
                    <TableRow key={item.period} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {item.period}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.count}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(item.paid)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.points}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      Seçilen tarih aralığında kayıtlı veri bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
