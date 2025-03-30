
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
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface PersonnelOperationsTableProps {
  personnelId: number | string;
}

export function PersonnelOperationsTable({ personnelId }: PersonnelOperationsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const itemsPerPage = 5;

  // Get operations for this specific personnel
  const { data: operations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: async () => {
      try {
        console.log(`Fetching operations for personnel ID: ${personnelId}`);
        const result = await personelIslemleriServisi.personelIslemleriGetir(Number(personnelId));
        console.log("Retrieved personnel operations:", result);
        return result;
      } catch (error) {
        console.error('Error fetching personnel operations:', error);
        toast.error("Personel işlemleri yüklenirken bir hata oluştu");
        return [];
      }
    },
    enabled: !!personnelId,
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

  const handleRefresh = () => {
    refetch();
    toast.info("İşlem geçmişi yenileniyor...");
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
      toast.info("Tamamlanan randevular işleniyor...");
      
      // Force recovery from appointments
      await personelIslemleriServisi.recoverOperationsFromAppointments(Number(personnelId));
      
      // Refetch data
      refetch();
      
      toast.success("İşlem geçmişi yenilendi");
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlem geçmişi yenilenirken bir hata oluştu");
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
      <div className="flex justify-between">
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
        
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleForceRecover}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            Veriyi Yenile
          </Button>
          
          {totalPages > 1 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">{currentPage} / {totalPages || 1}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {operations.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="mb-2">Bu personele ait işlem bulunamadı.</p>
          <Button 
            variant="outline" 
            onClick={handleForceRecover}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Tamamlanan Randevulardan İşlemleri Oluştur
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Prim %</TableHead>
              <TableHead>Ödenen</TableHead>
              <TableHead>Puan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOperations.map((operation) => (
              <TableRow key={operation.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {operation.created_at ? formatDate(operation.created_at) : '-'}
                </TableCell>
                <TableCell>{operation.aciklama || (operation.islem?.islem_adi) || '-'}</TableCell>
                <TableCell>
                  {operation.musteri ? 
                    `${operation.musteri.first_name || ''} ${operation.musteri.last_name || ''}`.trim() : 
                    (operation.aciklama ? operation.aciklama.split(' - ')[1]?.replace(/\(Randevu #\d+\)/, '').trim() : '-')}
                </TableCell>
                <TableCell>{formatCurrency(operation.tutar || 0)}</TableCell>
                <TableCell>%{operation.prim_yuzdesi}</TableCell>
                <TableCell>{formatCurrency(operation.odenen || 0)}</TableCell>
                <TableCell className="text-purple-600 font-semibold">{operation.puan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
