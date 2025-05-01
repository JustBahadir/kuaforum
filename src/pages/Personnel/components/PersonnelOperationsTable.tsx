
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { islemServisi } from '@/lib/supabase/services/islemServisi';
import { formatCurrency } from '@/utils/currencyFormatter';

interface PersonnelOperationsTableProps {
  personnelId: number;
  period?: 'today' | 'this-week' | 'this-month' | 'all';
}

export function PersonnelOperationsTable({ 
  personnelId, 
  period = 'all'
}: PersonnelOperationsTableProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(period);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Reset to page 1 when personnelId changes
  useEffect(() => {
    setCurrentPage(1);
  }, [personnelId]);

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnelOperations', personnelId],
    queryFn: async () => {
      if (!personnelId) return [];
      return await islemServisi.personelIslemleriniGetir(personnelId);
    },
    enabled: !!personnelId
  });

  // Filter operations based on selected period
  const filteredOperations = operations.filter(op => {
    if (selectedPeriod === 'all') return true;
    
    const opDate = new Date(op.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const opDay = opDate.getDay();
    const opWeek = Math.floor(opDate.getDate() / 7);
    const opMonth = opDate.getMonth();
    const opYear = opDate.getFullYear();
    
    const todayDay = today.getDay();
    const todayWeek = Math.floor(today.getDate() / 7);
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    switch(selectedPeriod) {
      case 'today':
        return opDate >= today;
      case 'this-week':
        // Get the first day of the week (Monday)
        const firstDay = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        firstDay.setDate(diff);
        firstDay.setHours(0, 0, 0, 0);
        return opDate >= firstDay;
      case 'this-month':
        // Get first day of the current month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return opDate >= firstDayOfMonth;
      default:
        return true;
    }
  });

  // Calculate pagination
  const totalFilteredItems = filteredOperations.length;
  const totalPages = Math.ceil(totalFilteredItems / pageSize);
  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Calculate stats
  const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 gap-4">
        <div>
          <h3 className="font-medium">
            İşlem Listesi 
            <span className="ml-2 text-sm text-muted-foreground">
              (Toplam: {filteredOperations.length} işlem, {formatCurrency(totalRevenue)} ciro)
            </span>
          </h3>
        </div>
        <div className="w-full sm:w-48">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Dönem seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="this-week">Bu Hafta</SelectItem>
              <SelectItem value="this-month">Bu Ay</SelectItem>
              <SelectItem value="all">Tüm Zamanlar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">İşlemler yükleniyor...</p>
        </div>
      ) : filteredOperations.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">Bu dönem için işlem bulunamadı.</p>
        </div>
      ) : (
        <>
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
                {paginatedOperations.map(operation => (
                  <TableRow key={operation.id}>
                    <TableCell>
                      {format(new Date(operation.created_at), "d MMMM yyyy", { locale: tr })}
                    </TableCell>
                    <TableCell>
                      {operation.musteri 
                        ? `${operation.musteri.first_name} ${operation.musteri.last_name || ''}`
                        : 'Bilinmiyor'
                      }
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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <div className="text-sm">
                Sayfa {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
