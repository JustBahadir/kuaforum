
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, RefreshCw } from "lucide-react";
import { customerOperationsService } from "@/lib/supabase/services/customerOperationsService";
import { formatCurrency } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerOperationsTableProps {
  customerId: string | number;
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editedNotes, setEditedNotes] = useState<Record<number, string>>({});
  const itemsPerPage = 5;
  const queryClient = useQueryClient();

  const { 
    data: operations = [], 
    isLoading, 
    isRefetching,
    refetch,
    error
  } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      try {
        console.log(`Fetching operations for customer ID: ${customerId}`);
        const result = await customerOperationsService.getCustomerOperations(customerId);
        console.log("Retrieved customer operations:", result);
        return result;
      } catch (error) {
        console.error('Error fetching customer operations:', error);
        toast.error("Müşteri işlemleri yüklenirken bir hata oluştu");
        return [];
      }
    },
    enabled: !!customerId
  });

  // Mutation for updating notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ operationId, notes }: { operationId: number, notes: string }) => {
      return await customerOperationsService.updateOperationNotes(operationId, notes);
    },
    onSuccess: () => {
      toast.success("Notlar başarıyla kaydedildi");
      queryClient.invalidateQueries({ queryKey: ['customerOperations', customerId] });
    },
    onError: (error) => {
      toast.error("Notlar kaydedilirken bir hata oluştu");
      console.error("Error updating notes:", error);
    }
  });

  // Calculate totals and pagination
  useEffect(() => {
    if (operations.length) {
      const points = operations.reduce((sum, op) => sum + op.points, 0);
      const amount = operations.reduce((sum, op) => sum + op.amount, 0);
      setTotalPoints(points);
      setTotalAmount(amount);

      // Initialize edited notes
      const notesMap: Record<number, string> = {};
      operations.forEach(op => {
        notesMap[op.id] = op.notes || '';
      });
      setEditedNotes(notesMap);
    } else {
      setTotalPoints(0);
      setTotalAmount(0);
      setEditedNotes({});
    }
  }, [operations]);

  // Calculate pagination
  const totalPages = Math.ceil(operations.length / itemsPerPage);
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

  const handleNotesChange = (operationId: number, value: string) => {
    setEditedNotes(prev => ({
      ...prev,
      [operationId]: value
    }));
  };

  const saveNotes = (operationId: number) => {
    const notes = editedNotes[operationId] || '';
    updateNotesMutation.mutate({ operationId, notes });
  };

  const handleRefresh = () => {
    refetch();
    toast.info("İşlem geçmişi yenileniyor...");
  };

  const handleForceRecover = async () => {
    try {
      toast.info("Tamamlanan randevular işleniyor...");
      
      // Force recovery from appointments
      await customerOperationsService.forceConvertAppointmentsToOperations(customerId);
      
      // Refetch data
      refetch();
      
      toast.success("İşlem geçmişi yenilendi");
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlem geçmişi yenilenirken bir hata oluştu");
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
      <div className="p-4 space-y-4">
        <div className="flex justify-between">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-500">TOPLAM PUAN</div>
            <div className="text-xl font-bold text-purple-600">{totalPoints}</div>
          </div>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-500">TOPLAM TUTAR</div>
            <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
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
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <div className="text-5xl mb-4 opacity-20">📋</div>
          <p className="text-lg text-gray-500">Henüz kayıtlı işlem bulunmuyor</p>
          <p className="text-sm text-gray-400 mt-2">Tamamlanan randevular burada görüntülenecektir</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleForceRecover}
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
              <TableHead>Personel</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Puan</TableHead>
              <TableHead>Notlar</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOperations.map((operation) => (
              <TableRow key={operation.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {formatDate(operation.date)}
                </TableCell>
                <TableCell>{operation.service_name}</TableCell>
                <TableCell>{operation.personnel_name}</TableCell>
                <TableCell>{formatCurrency(operation.amount)}</TableCell>
                <TableCell className="text-purple-600 font-semibold">{operation.points}</TableCell>
                <TableCell>
                  <Textarea 
                    className="w-full text-sm min-h-[60px]"
                    value={editedNotes[operation.id] || ''}
                    onChange={(e) => handleNotesChange(operation.id, e.target.value)}
                    rows={2}
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => saveNotes(operation.id)}
                    disabled={updateNotesMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
