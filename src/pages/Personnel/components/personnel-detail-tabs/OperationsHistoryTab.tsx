
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface OperationsHistoryTabProps {
  personnel: any;
  operations?: any[];
  isLoading?: boolean;
}

export function OperationsHistoryTab({ 
  personnel, 
  operations = [],
  isLoading = false
}: OperationsHistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOperations, setFilteredOperations] = useState<any[]>([]);
  const [singleDate, setSingleDate] = useState(false);
  
  // Date range state
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    from: subMonths(today, 1),
    to: today
  });
  
  // Custom month cycle
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [cycleActive, setCycleActive] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalOperations: 0,
    totalRevenue: 0,
    totalPoints: 0
  });
  
  // Calculate stats from filtered operations
  const calculateStats = (ops: any[]) => {
    const newStats = {
      totalOperations: ops.length,
      totalRevenue: ops.reduce((sum, op) => sum + (op.tutar || 0), 0),
      totalPoints: ops.reduce((sum, op) => sum + (op.puan || 0), 0)
    };
    setStats(newStats);
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setSingleDate(range.from.toDateString() === range.to.toDateString());
    setCycleActive(false);
    setSelectedDay(null);
  };
  
  // Handle custom month cycle selection
  const handleCycleDaySelect = (day: number, date: Date) => {
    setSelectedDay(day);
    setCycleActive(true);
    
    // Calculate date range based on selected day
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    
    let from: Date, to: Date;
    
    if (currentDay >= day) {
      // If today is after or on the cycle day, cycle is current month to next month
      from = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      to = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day - 1);
    } else {
      // If today is before the cycle day, cycle is previous month to this month
      from = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      to = new Date(currentDate.getFullYear(), currentDate.getMonth(), day - 1);
    }
    
    setDateRange({ from, to });
    setSingleDate(false);
  };
  
  // Clear cycle selection
  const handleClearCycle = () => {
    setCycleActive(false);
    setSelectedDay(null);
    setDateRange({
      from: subMonths(today, 1),
      to: today
    });
    setSingleDate(false);
  };
  
  // Filter operations by search term and date range
  useEffect(() => {
    if (!operations) return;
    
    const term = searchTerm.toLowerCase();
    
    const filtered = operations.filter(op => {
      // Filter by search term
      const matchesSearch = !term || 
        (op.aciklama && op.aciklama.toLowerCase().includes(term)) ||
        (op.notlar && op.notlar.toLowerCase().includes(term));
      
      // Filter by date range if date exists
      let matchesDate = true;
      if (op.created_at) {
        const opDate = new Date(op.created_at);
        matchesDate = opDate >= dateRange.from && opDate <= dateRange.to;
      }
      
      return matchesSearch && matchesDate;
    });
    
    setFilteredOperations(filtered);
    calculateStats(filtered);
  }, [operations, searchTerm, dateRange]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="İşlemlerde ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {/* Date Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={handleDateRangeChange}
          singleDate={singleDate}
          className="flex-grow"
        />
        <CustomMonthCycleSelector
          selectedDay={selectedDay || 1}
          onChange={handleCycleDaySelect}
          active={cycleActive}
          onClear={handleClearCycle}
        />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">İşlem Sayısı</div>
            <div className="text-2xl font-bold mt-2">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalOperations}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Toplam Ciro</div>
            <div className="text-2xl font-bold mt-2">
              {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Toplam Puan</div>
            <div className="text-2xl font-bold mt-2">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalPoints}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations Table */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">İşlem Geçmişi</h3>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
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
                  {filteredOperations.length > 0 ? (
                    filteredOperations.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell>
                          {operation.created_at ? 
                            format(new Date(operation.created_at), 'dd.MM.yyyy') : 
                            'Belirtilmemiş'}
                        </TableCell>
                        <TableCell>{operation.aciklama || 'Belirtilmemiş'}</TableCell>
                        <TableCell>
                          {operation.musteri_adi || 'Müşteri Yok'}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(operation.tutar || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {operation.puan || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        {searchTerm 
                          ? "Arama kriterlerine uygun işlem bulunamadı." 
                          : "Bu tarih aralığında işlem bulunmamaktadır."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
