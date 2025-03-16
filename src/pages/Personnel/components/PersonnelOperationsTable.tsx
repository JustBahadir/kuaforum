
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { format } from "date-fns";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PersonnelOperationsTableProps {
  personnelId: number;
}

export function PersonnelOperationsTable({ personnelId }: PersonnelOperationsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get operations for this specific personnel
  const { data: operations = [], isLoading, refetch } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: async () => {
      try {
        console.log(`Fetching operations for personnel ID: ${personnelId}`);
        const result = await personelIslemleriServisi.personelIslemleriGetir(personnelId);
        console.log("Retrieved personnel operations:", result);
        return result;
      } catch (error) {
        console.error('Error fetching personnel operations:', error);
        return [];
      }
    },
    enabled: !!personnelId,
  });

  // Calculate totals
  const totalPoints = operations.reduce((sum, op) => sum + (op.puan || 0), 0);
  const totalAmount = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalPaid = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);

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

  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
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
        
        {totalPages > 1 && (
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
        )}
      </div>
      
      {operations.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          Bu personele ait işlem bulunamadı.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>İşlem</TableHead>
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
                  {operation.created_at ? format(new Date(operation.created_at), 'dd.MM.yyyy') : '-'}
                </TableCell>
                <TableCell>{operation.aciklama}</TableCell>
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
