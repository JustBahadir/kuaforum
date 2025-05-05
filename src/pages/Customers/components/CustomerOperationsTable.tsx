import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/currencyFormatter";
import { format } from "date-fns";
import { useCustomerOperations } from "@/hooks/useCustomerOperations";

interface CustomerOperationsTableProps {
  customerId: string | number;
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const { operations, isLoading, error, refetch } = useCustomerOperations(customerId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p>İşlem geçmişi yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    );
  }
  
  if (!operations || operations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Bu müşterinin henüz bir işlem geçmişi bulunmamaktadır.</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>İşlem</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead className="text-center">Detay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((operation: CustomerOperation) => (
            <TableRow key={operation.id}>
              <TableCell className="font-medium">
                {new Date(operation.created_at).toLocaleDateString('tr-TR')}
              </TableCell>
              <TableCell>{operation.description || 'Bilinmiyor'}</TableCell>
              <TableCell>{operation.staff_name || 'Bilinmiyor'}</TableCell>
              <TableCell className="text-right">{formatCurrency(operation.amount || 0)}</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="sm">
                  Görüntüle
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CustomerOperationsTable;
