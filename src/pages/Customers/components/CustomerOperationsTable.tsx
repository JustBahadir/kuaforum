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
import { OperationPhotoUpload } from "@/components/operations/OperationPhotoUpload";

interface CustomerOperationsTableProps {
  customerId: number;
}

interface Operation {
  id: number;
  created_at: string;
  operation_name: string;
  personnel_name: string;
  amount: number;
  notes: string;
  points: number;
  photos: string[];
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      const mockOperations: Operation[] = [];
      
      for (let i = 0; i < 5; i++) {
        mockOperations.push({
          id: i,
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
          operation_name: [`Saç Kesimi`, `Sakal Traşı`, `Ense Traşı`, `Saç Boyama`, `Manikür`][i % 5],
          personnel_name: [`Ahmet`, `Mehmet`, `Ayşe`, `Fatma`, `Ali`][i % 5],
          amount: Math.floor(Math.random() * 200) + 50,
          notes: `İşlem notu ${i + 1}`,
          points: Math.floor(Math.random() * 10) + 1,
          photos: []
        });
      }
      
      return mockOperations;
    },
    enabled: !!customerId
  });

  useEffect(() => {
    if (operations.length) {
      const points = operations.reduce((sum, op) => sum + op.points, 0);
      const amount = operations.reduce((sum, op) => sum + op.amount, 0);
      setTotalPoints(points);
      setTotalAmount(amount);
    }
  }, [operations]);

  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  if (operations.length === 0) {
    return <div className="text-center py-4">Bu müşteriye ait işlem bulunamadı.</div>;
  }

  const handlePhotoUpdate = async (operationId: number, photos: string[]) => {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .update({ photos })
        .eq('id', operationId);

      if (error) throw error;
      toast.success("Fotoğraflar güncellendi");
    } catch (error: any) {
      toast.error(`Fotoğraflar güncellenirken hata oluştu: ${error.message}`);
    }
  };

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
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
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
          {operations.map((operation) => (
            <TableRow key={operation.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                {format(new Date(operation.created_at), 'dd.MM.yyyy')}
              </TableCell>
              <TableCell>{operation.operation_name}</TableCell>
              <TableCell>{operation.personnel_name}</TableCell>
              <TableCell className="text-purple-600 font-semibold">{operation.points}</TableCell>
              <TableCell>{operation.amount.toFixed(2)} TL</TableCell>
              <TableCell className="max-w-xs truncate">{operation.notes}</TableCell>
              <td className="p-4">
                <OperationPhotoUpload
                  existingPhotos={operation.photos || []}
                  onPhotosUpdated={(photos) => handlePhotoUpdate(operation.id, photos)}
                />
              </td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
