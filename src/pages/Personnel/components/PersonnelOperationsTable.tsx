
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PersonnelOperationsTableProps {
  personnelId: number;
}

export function PersonnelOperationsTable({ personnelId }: PersonnelOperationsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personnelId),
    enabled: !!personnelId
  });

  // Calculate totals
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCommission = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const totalPoints = operations.reduce((sum, op) => sum + (op.puan || 0), 0);

  // Pagination
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
    return <div className="flex justify-center p-4">
      <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
    </div>;
  }

  if (operations.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">
      Bu personele ait işlem bulunamadı.
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Toplam Ciro</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Toplam Prim</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalCommission)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Toplam Puan</h3>
          <p className="text-2xl font-bold">{totalPoints}</p>
        </div>
      </div>
      
      {operations.length > itemsPerPage && (
        <div className="flex justify-end items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">{currentPage} / {totalPages}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="rounded-md border">
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
            {paginatedOperations.map((islem) => (
              <TableRow key={islem.id}>
                <TableCell>
                  {new Date(islem.created_at!).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>{islem.aciklama}</TableCell>
                <TableCell>{formatCurrency(islem.tutar)}</TableCell>
                <TableCell>%{islem.prim_yuzdesi}</TableCell>
                <TableCell>{formatCurrency(islem.odenen)}</TableCell>
                <TableCell>{islem.puan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
