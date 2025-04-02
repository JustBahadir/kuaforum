
import { useState, useEffect, useCallback } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface PersonnelOperationsTableProps {
  personnelId: number | string;
}

export function PersonnelOperationsTable({ personnelId }: PersonnelOperationsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const itemsPerPage = 5;
  
  // Adjust date range to include more history
  const [dateRange, setDateRange] = useState({
    from: new Date(2023, 0, 1), // January 1, 2023
    to: new Date()
  });

  // Get operations for this specific personnel
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnelOperations', personnelId, dateRange.from, dateRange.to],
    queryFn: async () => {
      try {
        console.log(`Fetching operations for personnel ID: ${personnelId} from ${dateRange.from} to ${dateRange.to}`);
        
        // Initial attempt to get operations
        let result = await personelIslemleriServisi.personelIslemleriGetir(Number(personnelId));
        
        // If no operations found, try to recover them once
        if (!result || result.length === 0) {
          console.log("No operations found, attempting to recover from appointments...");
          await personelIslemleriServisi.recoverOperationsFromAppointments(Number(personnelId));
          result = await personelIslemleriServisi.personelIslemleriGetir(Number(personnelId));
        }
        
        console.log("Retrieved personnel operations:", result);
        
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
    refetchOnWindowFocus: false,
    staleTime: 1000, // Cache for 1 second to avoid immediate refetches
    refetchInterval: 10000 // Refetch every 10 seconds automatically for fresh data
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tarih aralığı:</span>
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              onSelect={({ from, to }) => {
                setDateRange({ from, to });
                setCurrentPage(1); // Reset page number
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-500">TOPLAM PUAN</div>
            <div className="text-xl font-bold text-purple-600">{totalPoints}</div>
          </div>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-500">TOPLAM TUTAR</div>
            <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
          </div>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-500">TOPLAM ÖDENEN</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </div>
        </div>
      </div>
      
      {operations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Seçilen tarih aralığında kayıtlı işlem bulunmamaktadır.
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
                  <TableHead className="text-right">Prim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOperations.map((operation) => (
                  <TableRow key={operation.id}>
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
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(operation.odenen || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
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
    </div>
  );
}
