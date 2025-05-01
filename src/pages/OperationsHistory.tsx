
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Search, FileBarChart, RefreshCcw, Download, FileText } from "lucide-react";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { DateControlBar } from "@/components/ui/date-control-bar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createMonthCycleDateRange } from "@/utils/dateUtils";
import { startOfDay, endOfDay } from "date-fns";

export default function OperationsHistory() {
  // Define the cleanOperationName function early in the component
  const cleanOperationName = (operation: any) => {
    if (operation.islem?.islem_adi) return operation.islem.islem_adi;
    if (!operation.aciklama) return '';
    return operation.aciklama.split(' hizmeti verildi')[0];
  };
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showPuntos, setShowPuntos] = useState(true);
  const [isMonthCycleActive, setIsMonthCycleActive] = useState(false);
  
  const { data: operationsData = [], isLoading, refetch } = useQuery({
    queryKey: ['operationsHistory', dateRange.from, dateRange.to],
    queryFn: async () => {
      try {
        // Get current dukkan_id to ensure we only get operations for this business
        const currentDukkanId = await personelIslemleriServisi.getCurrentDukkanId();
        if (!currentDukkanId) {
          console.error("Dükkan ID bulunamadı");
          return [];
        }
        
        // Get operations filtered by current dukkan_id
        const data = await personelIslemleriServisi.hepsiniGetir(currentDukkanId);
        
        // Filter by date range
        return filterOperationsByDateRange(data);
      } catch (error) {
        console.error("Error fetching operations:", error);
        toast.error("İşlemler yüklenirken hata oluştu");
        return [];
      }
    }
  });

  // Check if any operation uses points
  useEffect(() => {
    if (operationsData && operationsData.length > 0) {
      const hasPoints = operationsData.some(op => op.puan && op.puan > 0);
      setShowPuntos(hasPoints);
    }
  }, [operationsData]);

  // Filter operations based on search and filter type
  const filteredOperations = operationsData.filter(operation => {
    // Apply date range filter
    const operationDate = new Date(operation.created_at || "");
    const isInDateRange = operationDate >= dateRange.from && operationDate <= dateRange.to;
    
    if (!isInDateRange) return false;
    
    // Apply search filter
    const searchLower = searchText.toLowerCase();
    const personelName = operation.personel?.ad_soyad || '';
    const islemAdi = cleanOperationName(operation);
    const musteriFullName = operation.musteri 
      ? `${operation.musteri.first_name || ''} ${operation.musteri.last_name || ''}`.trim()
      : '';
    
    const matchesSearch = 
      !searchText || 
      personelName.toLowerCase().includes(searchLower) ||
      islemAdi.toLowerCase().includes(searchLower) ||
      musteriFullName.toLowerCase().includes(searchLower);
    
    // Apply type filter
    if (filterType === "all") return matchesSearch;
    if (filterType === "tamamlanan") {
      // All operations in personel_islemleri are completed
      return matchesSearch;
    }
    
    return matchesSearch;
  });

  // Calculate totals from filtered operations
  const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCount = filteredOperations.length;

  // Function to filter operations by date range
  const filterOperationsByDateRange = (operations) => {
    return operations.filter(islem => {
      if (!islem.created_at) return true;
      const islemDate = new Date(islem.created_at);
      return islemDate >= startOfDay(dateRange.from) && islemDate <= endOfDay(dateRange.to);
    });
  };
  
  const handleDateRangeChange = (newRange: {from: Date, to: Date}) => {
    console.log("Date range changed:", newRange);
    setDateRange(newRange);
    setIsMonthCycleActive(false);
  };
  
  const handleSingleDateSelect = (date: Date) => {
    console.log("Single date selected:", date);
    // For single date, we set from to start of day and to to end of day
    setDateRange({
      from: startOfDay(date),
      to: endOfDay(date)
    });
    setIsMonthCycleActive(false);
  };
  
  const handleMonthCycleChange = (day: number, cycleDate: Date) => {
    console.log("Month cycle day selected:", day, cycleDate);
    setIsMonthCycleActive(true);
    const { from, to } = createMonthCycleDateRange(day);
    setDateRange({ from, to });
  };

  const downloadReport = () => {
    try {
      // Create a window object
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Lütfen popup engelleyicisini kapatın");
        return;
      }
      
      // Generate HTML table for the report
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>İşlem Raporu - ${format(dateRange.from, 'dd.MM.yyyy', { locale: tr })} - ${format(dateRange.to, 'dd.MM.yyyy', { locale: tr })}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { margin: 20px 0; }
            .summary { margin: 20px 0; display: flex; gap: 20px; }
            .summary-item { padding: 10px; background: #f2f2f2; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>İşlem Raporu</h2>
            <p>Tarih Aralığı: ${format(dateRange.from, 'dd.MM.yyyy', { locale: tr })} - ${format(dateRange.to, 'dd.MM.yyyy', { locale: tr })}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <strong>Toplam İşlem:</strong> ${totalCount}
            </div>
            <div class="summary-item">
              <strong>Toplam Ciro:</strong> ${formatCurrency(totalRevenue)}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Personel</th>
                <th>Müşteri</th>
                <th>İşlem</th>
                <th>Tutar</th>
                ${showPuntos ? '<th>Puan</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredOperations.map(operation => `
                <tr>
                  <td>${format(new Date(operation.created_at || ''), 'dd.MM.yyyy', { locale: tr })}</td>
                  <td>${operation.personel?.ad_soyad || 'Belirtilmemiş'}</td>
                  <td>${operation.musteri 
                    ? `${operation.musteri.first_name || ''} ${operation.musteri.last_name || ''}`.trim() || 'Belirtilmemiş'
                    : 'Belirtilmemiş'}</td>
                  <td>${cleanOperationName(operation)}</td>
                  <td>${formatCurrency(operation.tutar || 0)}</td>
                  ${showPuntos ? `<td>${operation.puan || 0}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      // Write to the window
      printWindow.document.write(reportHTML);
      
      // Close the document
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      toast.success("Rapor hazırlanıyor...");
    } catch (error) {
      console.error("Rapor oluşturulurken hata:", error);
      toast.error("Rapor indirilemedi");
    }
  };
  
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">İşlem Geçmişi</h1>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <DateControlBar 
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              onSingleDateChange={handleSingleDateSelect}
              onMonthCycleChange={handleMonthCycleChange}
              className="w-full"
            />
          </CardContent>
        </Card>

        <div className="flex justify-between mb-4">
          <div className="flex gap-4">
            <div className="bg-gray-100 p-2 rounded-md flex items-center gap-1">
              <FileBarChart className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Toplam İşlem:</span> 
              <span className="ml-1">{totalCount}</span>
            </div>
            <div className="bg-gray-100 p-2 rounded-md">
              <span className="font-medium">Toplam Ciro:</span> 
              <span className="ml-1 text-green-600">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={downloadReport}
            >
              <FileText size={16} />
              Rapor İndir
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
              </div>
            ) : filteredOperations.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                Bu tarih aralığında henüz bir işlem bulunmamaktadır.
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                      {showPuntos && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puan</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOperations.map((operation) => (
                      <tr key={operation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {format(new Date(operation.created_at || ''), 'dd.MM.yyyy', { locale: tr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {operation.personel?.ad_soyad || 'Belirtilmemiş'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {operation.musteri 
                            ? `${operation.musteri.first_name || ''} ${operation.musteri.last_name || ''}`.trim() || 'Belirtilmemiş'
                            : 'Belirtilmemiş'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {cleanOperationName(operation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(operation.tutar || 0)}
                        </td>
                        {showPuntos && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {operation.puan || 0}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
