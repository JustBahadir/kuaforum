
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
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { customerOperationsService } from "@/lib/supabase/services/customerOperationsService";
import { formatCurrency } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

  const { data: operations = [], isLoading, refetch } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      try {
        console.log(`Fetching operations for customer ID: ${customerId}`);
        const result = await customerOperationsService.getCustomerOperations(customerId);
        console.log("Retrieved customer operations:", result);
        return result;
      } catch (error) {
        console.error('Error fetching customer operations:', error);
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

  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  if (operations.length === 0) {
    return <div className="text-center py-4">Bu müşteriye ait işlem bulunamadı.</div>;
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
        </div>
      </div>
      
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
                {format(new Date(operation.date), 'dd.MM.yyyy')}
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
    </div>
  );
}
