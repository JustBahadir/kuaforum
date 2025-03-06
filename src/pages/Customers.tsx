
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { CustomerList } from "./Customers/components/CustomerList";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NewCustomerForm } from "./Customers/components/NewCustomerForm";
import { Toaster } from "sonner";
import { useShopData } from "@/hooks/useShopData";

export default function Customers() {
  const [searchText, setSearchText] = useState("");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const { dukkanData } = useShopData(null);
  
  // Query with shop context
  const { 
    data: customers = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['musteriler', dukkanData?.id],
    queryFn: async () => {
      try {
        return await musteriServisi.hepsiniGetir(dukkanData?.id);
      } catch (err) {
        console.error("Müşteri verisi yüklenirken hata:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    retry: 1,
    enabled: !!dukkanData?.id // Only run query when shop data is available
  });

  // Filter customers based on search text
  const filteredCustomers = searchText
    ? customers.filter(customer => 
        `${customer.first_name} ${customer.last_name || ''}`.toLowerCase().includes(searchText.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchText))
      )
    : customers;

  const handleOpenNewCustomerModal = () => {
    setIsNewCustomerModalOpen(true);
  };

  const handleCloseNewCustomerModal = () => {
    setIsNewCustomerModalOpen(false);
  };

  const handleCustomerAdded = async () => {
    await refetch();
    handleCloseNewCustomerModal();
  };

  return (
    <StaffLayout>
      {/* Only use Sonner Toaster for notifications */}
      <Toaster position="bottom-right" richColors />
      
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
                  placeholder="İsim veya telefon ile ara..." 
                  className="pl-8"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="gap-1"
                onClick={handleOpenNewCustomerModal}
                disabled={!dukkanData?.id}
              >
                <UserPlus className="h-4 w-4" />
                <span>Yeni Müşteri</span>
              </Button>
            </div>
            {!dukkanData?.id && (
              <p className="text-sm text-red-500 mt-2">
                Müşteri eklemek için dükkan yöneticisi olmanız gerekmektedir.
              </p>
            )}
          </CardContent>
        </Card>
        
        <CustomerList 
          customers={filteredCustomers} 
          isLoading={isLoading || isRefetching} 
        />

        <Dialog open={isNewCustomerModalOpen} onOpenChange={setIsNewCustomerModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              <DialogDescription>
                Müşteri bilgilerini girerek yeni bir müşteri kaydı oluşturun.
              </DialogDescription>
            </DialogHeader>
            <NewCustomerForm 
              onSuccess={handleCustomerAdded} 
              onCancel={handleCloseNewCustomerModal} 
              dukkanId={dukkanData?.id}
            />
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
}
