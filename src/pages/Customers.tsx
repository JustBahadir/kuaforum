
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, AlertCircle } from "lucide-react";
import { CustomerList } from "./Customers/components/CustomerList";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NewCustomerForm } from "./Customers/components/NewCustomerForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { refreshSupabaseSession } from "@/lib/supabase/client";

export default function Customers() {
  const [searchText, setSearchText] = useState("");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sayfa yüklendiğinde oturumu yenile - daha az sıklıkla ve daha hızlı
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Sessiz modda oturumu yenile (toast göstermeden)
        const result = await refreshSupabaseSession();
        console.log("Sayfa yüklenirken oturum durumu:", result.success ? "Başarılı" : "Başarısız");
      } catch (err) {
        console.error("Oturum başlatma hatası:", err);
      }
    };
    
    initializeSession();
  }, []);
  
  // Daha düşük staleTime ile hızlandırılmış sorgu ve azaltılmış deneme hakkı
  const { 
    data: customers = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['musteriler'],
    queryFn: async () => {
      try {
        console.log("Müşteriler yükleniyor...");
        const result = await musteriServisi.hepsiniGetir();
        return result || [];
      } catch (err) {
        console.error("Müşteri veri yükleme hatası:", err);
        throw err;
      }
    },
    retry: 1, // Sadece bir kez dene
    retryDelay: 500, // Daha hızlı bir şekilde yeniden dene
    refetchOnWindowFocus: false,
    staleTime: 10000, // 10 saniye boyunca veriyi taze kabul et
  });

  const filteredCustomers = searchText
    ? customers.filter(customer => 
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchText))
      )
    : customers;

  const handleOpenNewCustomerModal = () => {
    setIsNewCustomerModalOpen(true);
  };

  const handleCloseNewCustomerModal = () => {
    setIsNewCustomerModalOpen(false);
  };

  const handleCustomerAdded = () => {
    refetch();
    handleCloseNewCustomerModal();
  };

  const handleRetryConnection = async () => {
    setIsRefreshing(true);
    toast.loading("Bağlantı yenileniyor...", { id: "refresh-connection" });
    
    try {
      // Oturumu yenile
      const result = await refreshSupabaseSession();
      
      if (result.success) {
        toast.success("Bağlantı yenilendi, veriler yükleniyor", { id: "refresh-connection" });
        // Sorguyu yenile
        await refetch();
      } else {
        toast.error("Oturum yenilenemedi. Lütfen sayfayı yenileyin.", { id: "refresh-connection" });
      }
    } catch (err) {
      console.error("Bağlantı yenileme hatası:", err);
      toast.error("Bağlantı yenilenemedi. Lütfen sayfayı yenileyin.", { id: "refresh-connection" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getErrorMessage = (error: any) => {
    if (!error) return "Bilinmeyen bir hata oluştu.";
    
    if (error.message && error.message.includes("Invalid API key")) {
      return "Bağlantı anahtarında sorun oluştu. Lütfen 'Bağlantıyı Yenile' butonuna tıklayın.";
    }
    
    return error.message || "Bilinmeyen bir hata oluştu.";
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Müşteriler</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Müşteri Ara</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search" 
                  placeholder="İsim, telefon veya e-posta ile ara..." 
                  className="pl-8"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="gap-1"
                onClick={handleOpenNewCustomerModal}
              >
                <UserPlus className="h-4 w-4" />
                <span>Yeni Müşteri</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>{getErrorMessage(error)}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryConnection}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Yenileniyor..." : "Bağlantıyı Yenile"}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <CustomerList 
          customers={filteredCustomers} 
          isLoading={isLoading} 
          error={error as Error}
        />

        <Dialog open={isNewCustomerModalOpen} onOpenChange={setIsNewCustomerModalOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              <DialogDescription>
                Müşteri bilgilerini girerek yeni bir müşteri kaydı oluşturun.
              </DialogDescription>
            </DialogHeader>
            <NewCustomerForm onSuccess={handleCustomerAdded} onCancel={handleCloseNewCustomerModal} />
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
}
