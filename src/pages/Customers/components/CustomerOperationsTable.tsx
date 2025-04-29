
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/lib/utils'; // Updated import source
import { CustomerOperation } from '@/lib/supabase/services/customerOperationsService';

interface CustomerOperationsTableProps {
  operations: CustomerOperation[];
  loading: boolean;
}

const CustomerOperationsTable: React.FC<CustomerOperationsTableProps> = ({
  operations,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!operations || operations.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Müşteriye ait işlem geçmişi bulunmamaktadır.
      </div>
    );
  }

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return "—";
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  const getPaymentStatusBadge = (status?: string) => {
    if (!status) return null;
    
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ödendi</Badge>;
    }
    else if (status === 'partial') {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Kısmi</Badge>;
    }
    else if (status === 'pending') {
      return <Badge variant="outline" className="border-red-500 text-red-500">Ödenmedi</Badge>;
    }
    
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>İşlem</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Ödeme</TableHead>
            <TableHead>Not</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((operation) => (
            <TableRow key={operation.id}>
              <TableCell className="font-medium">
                {formatDate(operation.operation_date)}
              </TableCell>
              <TableCell>
                {operation.operation_type || (operation.service_id ? (operation as any).service?.name : '—')}
              </TableCell>
              <TableCell>
                {(operation.staff_id ? (operation as any).staff?.name : '—')}
              </TableCell>
              <TableCell>
                {formatPrice(operation.price || (operation.service_id ? (operation as any).service?.price : undefined))}
              </TableCell>
              <TableCell>
                {getPaymentStatusBadge(operation.payment_status)}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {operation.notes || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerOperationsTable;
