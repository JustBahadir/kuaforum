
import { useState } from "react";
import { useCustomerOperations } from "@/hooks/useCustomerOperations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker-adapter";
import { format } from "date-fns";
import { CalendarIcon, RefreshCw, FileDown } from "lucide-react";

interface CustomerOperationsTableProps {
  customerId: number;
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    operations,
    isLoading,
    dateRange,
    setDateRange,
    handleForceRecover,
    totals
  } = useCustomerOperations(customerId);

  const handleRecovery = async () => {
    setIsRefreshing(true);
    try {
      await handleForceRecover();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReportDownload = () => {
    // Placeholder for PDF download functionality
    console.log("Downloading report for operations:", operations);
    // Implementation for PDF download would go here
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd.MM.yyyy");
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 text-center">
        <div className="w-8 h-8 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">İşlem geçmişi yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-base md:text-lg font-medium">İşlem Geçmişi</h3>
          <p className="text-xs md:text-sm text-gray-500">Müşterinin daha önce yaptırdığı işlemler</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
          <div className="w-full md:w-auto">
            <DatePickerWithRange 
              date={dateRange} 
              setDate={setDateRange} 
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="icon"
              onClick={handleRecovery}
              disabled={isRefreshing}
              className="h-10 w-10"
              title="İşlem geçmişini yenile"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            {operations && operations.length > 0 && (
              <Button 
                variant="outline"
                size="icon"
                onClick={handleReportDownload}
                className="h-10 w-10"
                title="Rapor İndir"
              >
                <FileDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {operations && operations.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="p-3 md:p-4 bg-purple-50 text-center">
              <p className="text-xs md:text-sm text-gray-600">Toplam İşlem Tutarı</p>
              <p className="text-lg md:text-2xl font-bold text-purple-700">
                {totals?.totalAmount ? totals.totalAmount.toFixed(2) : "0.00"} ₺
              </p>
            </Card>
            <Card className="p-3 md:p-4 bg-blue-50 text-center">
              <p className="text-xs md:text-sm text-gray-600">Toplam Puan</p>
              <p className="text-lg md:text-2xl font-bold text-blue-700">
                {totals?.totalPoints || "0"} Puan
              </p>
            </Card>
            <Card className="p-3 md:p-4 bg-green-50 text-center">
              <p className="text-xs md:text-sm text-gray-600">İşlem Sayısı</p>
              <p className="text-lg md:text-2xl font-bold text-green-700">
                {operations.length} İşlem
              </p>
            </Card>
          </div>
          
          <div className="overflow-auto -mx-4 px-4">
            <table className="w-full border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">Tarih</th>
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">İşlem</th>
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">Personel</th>
                  <th className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">Tutar</th>
                  {totals?.showPoints && (
                    <th className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">Puan</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm whitespace-nowrap">
                      {op.date ? formatDate(op.date) : "Belirtilmemiş"}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm">
                      {op.service_name || op.aciklama || "Belirtilmemiş"}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm">
                      {op.personnel_name || "Belirtilmemiş"}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-right text-xs md:text-sm whitespace-nowrap">
                      {op.amount ? `${op.amount.toFixed(2)} ₺` : "-"}
                    </td>
                    {totals?.showPoints && (
                      <td className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">
                        {op.points || "0"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center p-4 md:p-8 bg-gray-50 rounded-md">
          <CalendarIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-2" />
          <h4 className="text-base md:text-lg font-medium mb-1">İşlem Geçmişi Bulunamadı</h4>
          <p className="text-xs md:text-sm text-gray-500 mb-4">Bu müşteri için kayıtlı işlem bulunamadı.</p>
          <Button onClick={handleRecovery} disabled={isRefreshing} className="text-xs md:text-sm">
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                İşlemler Yenileniyor
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                İşlem Geçmişini Yenile
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
