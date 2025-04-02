
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Upload, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface PersonnelHistoryTableProps {
  personnelId?: number;
}

export function PersonnelHistoryTable({ personnelId }: PersonnelHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isRecovering, setIsRecovering] = useState(false);
  const itemsPerPage = 10;

  const { data: islemGecmisi = [], isLoading, refetch } = useQuery({
    queryKey: ['personelIslemleri', personnelId],
    queryFn: async () => {
      console.log("Fetching personnel operations for ID:", personnelId);
      try {
        const result = personnelId 
          ? await personelIslemleriServisi.personelIslemleriGetir(personnelId)
          : await personelIslemleriServisi.hepsiniGetir();
        console.log("Retrieved operations:", result);
        return result;
      } catch (error) {
        console.error("Error fetching personnel operations:", error);
        toast.error("İşlem geçmişi yüklenirken bir hata oluştu");
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 0 // Don't cache this data
  });

  const { data: personeller = [] } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  // Pagination
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

  const handleRefresh = async () => {
    toast.info("İşlem geçmişi yenileniyor...");
    await refetch();
    toast.success("İşlem geçmişi yenilendi");
  };

  const handleRecoverOperations = async () => {
    if (!personnelId) return;
    
    try {
      setIsRecovering(true);
      toast.info("Tamamlanan randevular işleniyor...");
      
      // Force recovery from appointments
      await personelIslemleriServisi.recoverOperationsFromAppointments(personnelId);
      
      // Refetch data
      await refetch();
      
      toast.success("İşlem geçmişi yenilendi");
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlem geçmişi yenilenirken bir hata oluştu");
    } finally {
      setIsRecovering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (islemGecmisi.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        {personnelId ? "Bu personele ait işlem bulunamadı." : "Henüz işlem kaydı bulunmamaktadır."}
        {personnelId && (
          <div className="mt-4 flex justify-center gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Yenile
            </Button>
            
            <Button size="sm" variant="default" onClick={handleRecoverOperations} disabled={isRecovering}>
              {isRecovering ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-purple-600 border-purple-200 rounded-full animate-spin mr-2"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Randevulardan Oluştur
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Toplam {islemGecmisi.length} işlem bulundu
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Yenile
          </Button>
          
          {personnelId && (
            <Button size="sm" variant="default" onClick={handleRecoverOperations} disabled={isRecovering}>
              {isRecovering ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-purple-600 border-purple-200 rounded-full animate-spin mr-2"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Randevulardan Güncelle
                </>
              )}
            </Button>
          )}
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
              <TableHead>Saat</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Prim %</TableHead>
              <TableHead>Ödenen</TableHead>
              <TableHead>Puan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOperations.map((islem) => {
              const createdAt = new Date(islem.created_at!);
              const dateFormatted = format(createdAt, 'dd MMMM yyyy', { locale: tr });
              const timeFormatted = format(createdAt, 'HH:mm', { locale: tr });
              
              return (
                <TableRow key={islem.id}>
                  <TableCell>{dateFormatted}</TableCell>
                  <TableCell>{timeFormatted}</TableCell>
                  <TableCell>
                    {islem.musteri?.first_name 
                      ? `${islem.musteri.first_name} ${islem.musteri.last_name || ''}`
                      : 'Belirtilmemiş'}
                  </TableCell>
                  <TableCell>{islem.islem?.islem_adi || islem.aciklama}</TableCell>
                  <TableCell>{formatCurrency(islem.tutar || 0)}</TableCell>
                  <TableCell>%{islem.prim_yuzdesi}</TableCell>
                  <TableCell>{formatCurrency(islem.odenen || 0)}</TableCell>
                  <TableCell>{islem.puan}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
