
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDate, formatDateShort } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";

interface OperationsHistoryTabProps {
  personnel: any;
  isLoading?: boolean;
}

export function OperationsHistoryTab({ personnel, isLoading = false }: OperationsHistoryTabProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  // Fetch personnel operations
  const {
    data: operations = [],
    isLoading: operationsLoading
  } = useQuery({
    queryKey: ["personnelOperations", personnel?.id],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personnel.id),
    enabled: !!personnel?.id,
  });

  const filteredOperations = operations.filter((op: any) => {
    if (!search) return true;
    
    const lowerCaseSearch = search.toLowerCase();
    return (
      op.islem?.islem_adi?.toLowerCase().includes(lowerCaseSearch) ||
      op.aciklama?.toLowerCase().includes(lowerCaseSearch)
    );
  });

  const paginatedOperations = filteredOperations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>İşlem Geçmişi</CardTitle>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="İşlem ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || operationsLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : paginatedOperations.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOperations.map((op: any) => (
                    <TableRow key={op.id}>
                      <TableCell className="font-medium">
                        {formatDateShort(op.created_at)}
                      </TableCell>
                      <TableCell>{op.islem?.islem_adi || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {op.aciklama || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        ₺{op.tutar?.toFixed(2) || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Önceki sayfa</span>
                </Button>
                <div className="text-sm text-muted-foreground">
                  Sayfa {page} / {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Sonraki sayfa</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "Aramanıza uygun işlem bulunamadı." : "Bu personel için henüz işlem kaydı bulunmamaktadır."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
