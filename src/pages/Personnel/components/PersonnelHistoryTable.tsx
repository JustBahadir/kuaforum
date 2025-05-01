import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Button } from "@/components/ui/button";

interface PersonnelHistoryTableProps {
  personnelId: number;
}

export function PersonnelHistoryTable({ personnelId }: PersonnelHistoryTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    data: allOperations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["personnelOperations", personnelId],
    queryFn: async () => {
      return await islemServisi.personelIslemleriniGetir(personnelId);
    },
    enabled: !!personnelId,
  });

  // Reset page when personnelId changes
  useEffect(() => {
    setPage(1);
  }, [personnelId]);

  // Calculate pagination
  const totalPages = Math.ceil(allOperations.length / pageSize);
  const paginatedOperations = allOperations.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (isError) {
    return <div>Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</div>;
  }

  if (allOperations.length === 0) {
    return <div>İşlem geçmişi bulunamadı.</div>;
  }

  return (
    <div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOperations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>
                  {format(new Date(operation.created_at), "d MMMM yyyy", {
                    locale: tr,
                  })}
                </TableCell>
                <TableCell>
                  {operation.musteri
                    ? `${operation.musteri.first_name} ${operation.musteri.last_name || ""}`
                    : "Bilinmiyor"}
                </TableCell>
                <TableCell>{operation.aciklama}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(operation.tutar || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Önceki
          </Button>
          <div className="text-sm">
            Sayfa {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
