
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, ArrowLeft } from "lucide-react";
import { CustomerList } from "./Customers/components/CustomerList";
import { CustomerDetails } from "./Customers/components/CustomerDetails";
import { musteriServisi } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NewCustomerForm } from "./Customers/components/NewCustomerForm";
import { Toaster } from "sonner";
import { useShopData } from "@/hooks/useShopData";
import { Musteri } from "@/lib/supabase/types";

export default function Customers() {
  const [searchText, setSearchText] = useState("");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Musteri | null>(null);
  const { isletmeData } = useShopData(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldOpenNewCustomer = searchParams.get('new') === 'true';
    
    if (shouldOpenNewCustomer) {
      setIsNewCustomerModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  
  const { 
    data: customers = [], 
    isLoading, 
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['musteriler', isletmeData?.id],
    queryFn: async () => {
      try {
        if (!isletmeData?.id) {
          throw new Error("Dükkan ID bulunamadı");
        }
        return await musteriServisi.hepsiniGetir(isletmeData?.id);
      } catch (err) {
        console.error("Müşteri verisi yüklenirken hata:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
    retry: 1,
    enabled: !!isletmeData?.id
  });

  const filteredCustomers = searchText
    ? customers.filter((customer: Musteri) => 
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

  const handleSelectCustomer = (customer: Musteri) => {
    setSelectedCustomer(customer);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
  };

  return (
    <StaffLayout>
      <Toaster position="bottom-right" richColors />
      
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Müşteriler</h1>
        
        {selectedCustomer ? (
          <>
            <Button 
              variant="outline" 
              onClick={handleBackToList} 
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Müşteri Listesine Dön
            </Button>
            <CustomerDetails 
              customerId={selectedCustomer.id} 
            />
          </>
        ) : (
          <>
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
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Yeni Müşteri</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <CustomerList 
              customers={filteredCustomers} 
              isLoading={isLoading || isRefetching} 
              onSelectCustomer={handleSelectCustomer}
            />
          </>
        )}

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
              dukkanId={isletmeData?.id}
            />
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
}
