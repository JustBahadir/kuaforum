
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { CustomerList } from "./Customers/components/CustomerList";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NewCustomerForm } from "./Customers/components/NewCustomerForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { refreshSupabaseSession } from "@/lib/supabase/client";

export default function Customers() {
  const [searchText, setSearchText] = useState("");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Query with proper error handling and shorter stale time
  const { 
    data: customers = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['musteriler'],
    queryFn: async () => {
      try {
        return await musteriServisi.hepsiniGetir();
      } catch (err) {
        console.error("Customer data loading error:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    retry: 1,
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
    toast.loading("Bağlantı yenileniyor...");
    
    try {
      // First refresh the Supabase session
      await refreshSupabaseSession();
      
      // Then refetch the data
      await refetch();
      
      toast.dismiss();
      toast.success("Bağlantı başarıyla yenilendi");
    } catch (err) {
      console.error("Connection refresh error:", err);
      toast.dismiss();
      toast.error("Bağlantı yenilenirken hata oluştu. Lütfen sayfayı yenileyin.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <StaffLayout>
      <Toaster />
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
              <span>Bağlantı hatası. Lütfen tekrar deneyin.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryConnection}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Yenileniyor...
                  </>
                ) : 'Bağlantıyı Yenile'}
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
