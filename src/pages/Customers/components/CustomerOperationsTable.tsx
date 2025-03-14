
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { customerOperationsService } from "@/lib/supabase/services/customerOperationsService";

interface CustomerOperationsTableProps {
  customerId: string;
}

interface Operation {
  id: number;
  date: string;
  service_name: string;
  personnel_name: string;
  amount: number;
  notes?: string;
  points: number;
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      try {
        // Fetch operations from the personel_islemleri table for this specific customer
        const { data, error } = await supabase
          .from('personel_islemleri')
          .select(`
            id,
            created_at,
            aciklama,
            tutar,
            puan,
            notlar,
            personel:personel(ad_soyad),
            islem:islemler(islem_adi)
          `)
          .eq('musteri_id', customerId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (!data || data.length === 0) return [];
        
        // Transform the data with proper type casting
        return data.map(item => ({
          id: item.id,
          date: item.created_at,
          service_name: item.islem ? (item.islem as { islem_adi: string }).islem_adi : item.aciklama.split(' hizmeti verildi')[0],
          personnel_name: item.personel ? (item.personel as { ad_soyad: string }).ad_soyad : 'Belirtilmemiş',
          amount: item.tutar,
          notes: item.notlar || '',
          points: item.puan
        }));
      } catch (error) {
        console.error('Error fetching customer operations:', error);
        return [];
      }
    },
    enabled: !!customerId
  });

  // Calculate totals and pagination
  useEffect(() => {
    if (operations.length) {
      const points = operations.reduce((sum, op) => sum + op.points, 0);
      const amount = operations.reduce((sum, op) => sum + op.amount, 0);
      setTotalPoints(points);
      setTotalAmount(amount);
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
            <div className="text-xl font-bold">{totalAmount.toFixed(2)} TL</div>
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
            <TableHead>Puan</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Açıklama</TableHead>
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
              <TableCell className="text-purple-600 font-semibold">{operation.points}</TableCell>
              <TableCell>{operation.amount.toFixed(2)} TL</TableCell>
              <TableCell className="max-w-xs truncate">{operation.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
