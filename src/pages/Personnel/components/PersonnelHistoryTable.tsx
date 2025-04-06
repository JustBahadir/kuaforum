
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface PersonnelHistoryTableProps {
  personnelId?: number;
}

// Supabase connection info
const SUPABASE_URL = "https://xkbjjcizncwkrouvoujw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw";

export function PersonnelHistoryTable({ personnelId }: PersonnelHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

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
          console.log("No operations found, attempting automatic recovery...");
          await handleRecoverOperations(); // Use the same function as the button click
          
          // Fetch again after recovery
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
    staleTime: 1000, // Reduced to 1 second for more frequent refresh
    refetchInterval: 10000, // Set a refresh interval of 10 seconds
    enabled: !!personnelId
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

  const handleRecoverOperations = async () => {
    if (!personnelId) return;
    
    try {
      toast.info("Tamamlanan randevulardan işlemler oluşturuluyor...");
      
      // Call the edge function directly with the URL constants
      const response = await fetch(`${SUPABASE_URL}/functions/v1/recover_customer_operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ personnel_id: personnelId })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error from edge function:", errorText);
        throw new Error("İşlem geçmişi yenilenirken bir hata oluştu");
      }
      
      const result = await response.json();
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['personelIslemleri'] });
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      
      // Refetch after invalidation
      await refetch();
      
      toast.success(`İşlem geçmişi güncellendi (${result.count || 0} işlem)`);
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlem geçmişi güncellenirken bir hata oluştu: " + 
        (error instanceof Error ? error.message : "Bilinmeyen hata"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4 items-center">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        <span className="ml-2">İşlem geçmişi yükleniyor...</span>
      </div>
    );
  }

  const renderEmptyState = () => {
    if (!personnelId) {
      return "Personel seçilmedi.";
    }
    
    return (
      <div className="text-center space-y-4">
        <p>Bu personele ait işlem bulunamadı.</p>
        <Button onClick={handleRecoverOperations} className="flex items-center gap-2">
          <RefreshCcw size={16} />
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
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">İşlem Geçmişi</h3>
        <Button 
          onClick={handleRecoverOperations}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <RefreshCcw size={14} />
          Yenile
        </Button>
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
    </div>
  );
}
