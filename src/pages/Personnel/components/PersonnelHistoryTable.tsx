
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
    refetchOnWindowFocus: true,
    staleTime: 10000, // Reduced to 10 seconds for more frequent refresh
    refetchInterval: 30000 // Set a refresh interval of 30 seconds
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Toplam {islemGecmisi.length} işlem bulundu
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
              <TableHead>Personel</TableHead>
              <TableHead>İşlem</TableHead>
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
                <TableCell>
                  {personeller?.find(p => p.id === islem.personel_id)?.ad_soyad || islem.personel?.ad_soyad}
                </TableCell>
                <TableCell>{islem.aciklama}</TableCell>
                <TableCell>{formatCurrency(islem.tutar || 0)}</TableCell>
                <TableCell>%{islem.prim_yuzdesi}</TableCell>
                <TableCell>{formatCurrency(islem.odenen || 0)}</TableCell>
                <TableCell>{islem.puan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
