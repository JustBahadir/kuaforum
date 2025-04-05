
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface PersonnelHistoryTableProps {
  personnelId?: number;
}

export function PersonnelHistoryTable({ personnelId }: PersonnelHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: islemGecmisi = [], isLoading, refetch } = useQuery({
    queryKey: ['personelIslemleri', personnelId],
    queryFn: async () => {
      console.log("Fetching personnel operations for ID:", personnelId);
      try {
        // First try to get the personnel operations
        const result = personnelId 
          ? await personelIslemleriServisi.personelIslemleriGetirById(personnelId)
          : await personelIslemleriServisi.hepsiniGetir();
          
        console.log("Retrieved operations:", result);
        
        // If no operations, automatically try to recover from appointments
        if (result.length === 0 && personnelId) {
          console.log("No operations found, attempting to recover from appointments");
          await personelIslemleriServisi.recoverOperationsFromAppointments(personnelId);
          
          // Fetch again after recovery attempt
          const recoveredResult = await personelIslemleriServisi.personelIslemleriGetirById(personnelId);
          console.log("Operations after recovery:", recoveredResult);
          return recoveredResult;
        }
        
        return result;
      } catch (error) {
        console.error("Error fetching personnel operations:", error);
        toast.error("İşlem geçmişi yüklenirken bir hata oluştu");
        return [];
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 10000, // Reduced to 10 seconds for more frequent refresh
    refetchInterval: 30000 // Set a refresh interval of 30 seconds
  });

  useEffect(() => {
    if (personnelId) {
      refetch();
    }
  }, [personnelId, refetch]);

  const totalPages = Math.ceil(islemGecmisi.length / itemsPerPage);
  const paginatedOperations = islemGecmisi.slice(
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
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleRecoverOperations = async () => {
    if (!personnelId) return;
    
    try {
      toast.info("Tamamlanan randevulardan işlemler oluşturuluyor...");
      await personelIslemleriServisi.recoverOperationsFromAppointments(personnelId);
      await refetch();
      toast.success("İşlem geçmişi güncellendi");
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlem geçmişi güncellenirken bir hata oluştu");
    }
  };

  const renderEmptyState = () => {
    if (!personnelId) {
      return "Personel seçilmedi.";
    }
    
    return (
      <div className="text-center space-y-4">
        <p>Bu personele ait işlem bulunamadı.</p>
        <Button onClick={handleRecoverOperations}>
          Tamamlanmış Randevulardan İşlemleri Oluştur
        </Button>
      </div>
    );
  };

  if (islemGecmisi.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        {renderEmptyState()}
      </div>
    );
  }

  // Calculate totals
  const totalAmount = islemGecmisi.reduce((sum, item) => sum + (item.tutar || 0), 0);
  const totalPaid = islemGecmisi.reduce((sum, item) => sum + (item.odenen || 0), 0);
  const totalPoints = islemGecmisi.reduce((sum, item) => sum + (item.puan || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">TOPLAM PUAN</div>
          <div className="text-2xl font-bold text-purple-700">{totalPoints}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">TOPLAM TUTAR</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">TOPLAM ÖDENEN</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</div>
        </div>
      </div>
      
      {islemGecmisi.length > itemsPerPage && (
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
              <TableHead>Müşteri</TableHead>
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
                <TableCell>{islem.islem?.islem_adi || islem.aciklama}</TableCell>
                <TableCell>
                  {islem.musteri 
                    ? `${islem.musteri.first_name} ${islem.musteri.last_name || ''}` 
                    : ''}
                </TableCell>
                <TableCell>{formatCurrency(islem.tutar || 0)}</TableCell>
                <TableCell>%{islem.prim_yuzdesi}</TableCell>
                <TableCell>{formatCurrency(islem.odenen || 0)}</TableCell>
                <TableCell>{islem.puan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleRecoverOperations}>
          Tamamlanmış Randevulardan İşlemleri Oluştur
        </Button>
      </div>
    </div>
  );
}
