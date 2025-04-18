
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { personelIslemleriServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, Clock } from "lucide-react";

interface OperationsHistoryTabProps {
  personnelId: number;
}

export function OperationsHistoryTab({ personnelId }: OperationsHistoryTabProps) {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personel-islemleri', personnelId],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personnelId),
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Limit to last 5 operations
  const recentOperations = [...operations].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Son 5 İşlem</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : recentOperations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Henüz işlem geçmişi bulunmuyor.
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Hizmet</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="text-right">Komisyon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOperations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <CalendarDays className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{formatDate(operation.created_at)}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatTime(operation.created_at)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {operation.musteri ? 
                          `${operation.musteri.first_name} ${operation.musteri.last_name || ''}` : 
                          'Belirtilmemiş'}
                      </TableCell>
                      <TableCell>
                        {operation.islem?.islem_adi || operation.aciklama || 'Belirtilmemiş'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(operation.tutar || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(operation.odenen || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
