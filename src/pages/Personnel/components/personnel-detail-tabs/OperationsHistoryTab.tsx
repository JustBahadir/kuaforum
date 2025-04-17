
import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { Input } from "@/components/ui/input";
import { Search, Calendar, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personelIslemleriServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface OperationsHistoryTabProps {
  personnel: any;
  operations: any[];
  isLoading: boolean;
}

export function OperationsHistoryTab({ 
  personnel, 
  operations, 
  isLoading 
}: OperationsHistoryTabProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);
  const [singleDateMode, setSingleDateMode] = useState(false);
  const queryClient = useQueryClient();
  
  const handleDateRangeChange = ({from, to}: {from: Date, to: Date}) => {
    setDateRange({from, to});
    setUseMonthCycle(false);
    setSingleDateMode(false);
  };

  const handleMonthCycleChange = (day: number, date: Date) => {
    setMonthCycleDay(day);
    setSingleDateMode(false);
    
    const currentDate = new Date();
    const selectedDay = day;
    
    let fromDate = new Date();
    
    // Set to previous month's cycle day
    fromDate.setDate(selectedDay);
    if (currentDate.getDate() < selectedDay) {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    
    // Create the end date (same day, current month)
    const toDate = new Date(fromDate);
    toDate.setMonth(toDate.getMonth() + 1);
    
    setDateRange({
      from: fromDate,
      to: toDate
    });
    
    setUseMonthCycle(true);
  };
  
  const handleSingleDateModeToggle = () => {
    const newSingleDateMode = !singleDateMode;
    setSingleDateMode(newSingleDateMode);
    
    if (newSingleDateMode) {
      // When enabling single date mode, set both from and to to the same day
      const today = new Date();
      setDateRange({
        from: today,
        to: today
      });
    } else {
      // When switching back to range mode, set the "to" date to today
      setDateRange(prev => ({
        from: prev.from,
        to: new Date()
      }));
    }
    
    setUseMonthCycle(false);
  };
  
  const handleSingleDateChange = (date: Date | undefined) => {
    if (!date) return;
    setDateRange({ from: date, to: date });
  };

  // Filter operations by date range and search term
  const filteredOperations = operations.filter(op => {
    if (!op.created_at) return false;
    const date = new Date(op.created_at);
    const isInDateRange = date >= dateRange.from && date <= dateRange.to;
    
    if (!isInDateRange) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = op.musteri ? 
        `${op.musteri.first_name || ''} ${op.musteri.last_name || ''}`.toLowerCase() : '';
      const serviceName = op.islem ? op.islem.islem_adi?.toLowerCase() : '';
      const description = op.aciklama?.toLowerCase() || '';
      
      return customerName.includes(searchLower) || 
             serviceName.includes(searchLower) || 
             description.includes(searchLower);
    }
    
    return true;
  });

  // Calculate totals
  const totalRevenue = filteredOperations.reduce((sum, op) => sum + (Number(op.tutar) || 0), 0);
  const totalCommission = filteredOperations.reduce((sum, op) => sum + (Number(op.odenen) || 0), 0);
  const totalOperations = filteredOperations.length;
  const totalPoints = filteredOperations.reduce((sum, op) => sum + (Number(op.puan) || 0), 0);

  // Determine if this is a commission-based worker
  const isCommissionBased = personnel.calisma_sistemi === "prim_komisyon";
  
  // Function to recover operations from appointments
  const handleRecoverOperations = async () => {
    if (!personnel || !personnel.id) return;
    
    try {
      toast.loading("İşlemler yükleniyor...");
      
      await personelIslemleriServisi.recoverOperationsFromAppointments(personnel.id);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({queryKey: ["personnel-operations"]});
      
      toast.success("İşlemler başarıyla güncellendi");
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlemler güncellenirken bir hata oluştu");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Date Filter - Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Müşteri veya işlem ara..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={singleDateMode ? "secondary" : "outline"}
            size="sm"
            className="h-9 gap-1 whitespace-nowrap flex-shrink-0"
            onClick={handleSingleDateModeToggle}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{singleDateMode ? "Tek Gün" : "Tarih Aralığı"}</span>
          </Button>

          {singleDateMode ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal flex-grow">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.from.toLocaleDateString()
                  ) : (
                    <span>Tarih seçin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateRange.from}
                  onSelect={handleSingleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : !useMonthCycle ? (
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              onSelect={handleDateRangeChange}
              className="flex-grow"
            />
          ) : (
            <div className="flex-grow" />
          )}

          <CustomMonthCycleSelector
            selectedDay={monthCycleDay}
            onChange={handleMonthCycleChange}
            active={useMonthCycle}
            onClear={() => setUseMonthCycle(false)}
          />
        </div>
      </div>
      
      {/* Summary Stats Cards - Flexbox for Responsive Layout */}
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="bg-muted p-2 px-3 rounded-md text-sm">
          <span className="text-muted-foreground mr-1">İşlem:</span> 
          <span className="font-medium">{totalOperations}</span>
        </div>
        <div className="bg-muted p-2 px-3 rounded-md text-sm">
          <span className="text-muted-foreground mr-1">Ciro:</span> 
          <span className="font-medium text-green-600">{formatCurrency(totalRevenue)}</span>
        </div>
        {isCommissionBased && (
          <div className="bg-muted p-2 px-3 rounded-md text-sm">
            <span className="text-muted-foreground mr-1">Prim:</span> 
            <span className="font-medium text-blue-600">{formatCurrency(totalCommission)}</span>
          </div>
        )}
        <div className="bg-muted p-2 px-3 rounded-md text-sm">
          <span className="text-muted-foreground mr-1">Puan:</span> 
          <span className="font-medium text-purple-600">{totalPoints}</span>
        </div>
        
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRecoverOperations}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">İşlemleri Yenile</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </div>
      ) : filteredOperations.length > 0 ? (
        <div className="overflow-x-auto border rounded-md mt-2">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">TARİH</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">MÜŞTERİ</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">İŞLEM</th>
                {isCommissionBased && (
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">PRİM %</th>
                )}
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">TUTAR</th>
                {isCommissionBased && (
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">ÖDENEN</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredOperations.map((op) => (
                <tr key={op.id} className="border-t hover:bg-muted/50">
                  <td className="p-2 text-sm">
                    {new Date(op.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-2 text-sm">
                    {op.musteri ? `${op.musteri.first_name} ${op.musteri.last_name || ''}` : '-'}
                  </td>
                  <td className="p-2 text-sm">
                    {op.islem?.islem_adi || op.aciklama || '-'}
                  </td>
                  {isCommissionBased && (
                    <td className="p-2 text-sm text-right">
                      %{op.prim_yuzdesi || 0}
                    </td>
                  )}
                  <td className="p-2 text-sm text-right">
                    {formatCurrency(op.tutar || 0)}
                  </td>
                  {isCommissionBased && (
                    <td className="p-2 text-sm text-right font-medium text-blue-600">
                      {formatCurrency(op.odenen || 0)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          {searchTerm ? "Arama kriterlerine uygun işlem bulunamadı." : "Seçilen tarih aralığında işlem bulunamadı."}
        </div>
      )}
    </div>
  );
}
