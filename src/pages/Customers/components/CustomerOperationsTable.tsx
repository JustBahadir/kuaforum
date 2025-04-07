
import { useState } from "react";
import { useCustomerOperations } from "@/hooks/useCustomerOperations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker-adapter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, RefreshCw } from "lucide-react";

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

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: tr });
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-500">İşlem geçmişi yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">İşlem Geçmişi</h3>
          <p className="text-sm text-gray-500">Müşterinin daha önce yaptırdığı işlemler</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <DatePickerWithRange 
            date={dateRange} 
            setDate={setDateRange} 
          />
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
        </div>
      </div>

      {operations && operations.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-purple-50 text-center">
              <p className="text-sm text-gray-600">Toplam İşlem Tutarı</p>
              <p className="text-2xl font-bold text-purple-700">
                {totals?.totalAmount ? totals.totalAmount.toFixed(2) : "0.00"} ₺
              </p>
            </Card>
            <Card className="p-4 bg-blue-50 text-center">
              <p className="text-sm text-gray-600">Toplam Puan</p>
              <p className="text-2xl font-bold text-blue-700">
                {totals?.totalPoints || "0"} Puan
              </p>
            </Card>
            <Card className="p-4 bg-green-50 text-center">
              <p className="text-sm text-gray-600">İşlem Sayısı</p>
              <p className="text-2xl font-bold text-green-700">
                {operations.length} İşlem
              </p>
            </Card>
          </div>
          
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Tarih</th>
                  <th className="py-2 px-4 text-left">İşlem</th>
                  <th className="py-2 px-4 text-left">Personel</th>
                  <th className="py-2 px-4 text-right">Tutar</th>
                  <th className="py-2 px-4 text-right">Puan</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      {op.date ? formatDate(op.date) : "Belirtilmemiş"}
                    </td>
                    <td className="py-2 px-4">{op.service_name || op.aciklama || "Belirtilmemiş"}</td>
                    <td className="py-2 px-4">{op.personnel_name || "Belirtilmemiş"}</td>
                    <td className="py-2 px-4 text-right">{op.amount ? `${op.amount.toFixed(2)} ₺` : "-"}</td>
                    <td className="py-2 px-4 text-right">{op.points || "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <h4 className="text-lg font-medium mb-1">İşlem Geçmişi Bulunamadı</h4>
          <p className="text-gray-500 mb-4">Bu müşteri için kayıtlı işlem bulunamadı.</p>
          <Button onClick={handleRecovery} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                İşlemler Yenileniyor
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                İşlem Geçmişini Yenile
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
