
import { useState } from "react";
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

export default function Customers() {
  const [searchText, setSearchText] = useState("");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  
  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['musteriler'],
    queryFn: () => musteriServisi.hepsiniGetir(),
    retry: 1, // Only retry once to avoid too many recursion errors
    meta: {
      onError: (err: any) => {
        console.error("Müşteri listesi yüklenirken hata:", err);
      }
    }
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

  const getErrorMessage = (error: any) => {
    if (!error) return "Bilinmeyen bir hata oluştu.";
    
    if (error.message && error.message.includes("infinite recursion")) {
      return "Sonsuz döngü hatası: Profil ilişkileri için sonsuz özyineleme algılandı. Lütfen sistem yöneticinizle iletişime geçin.";
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
            <AlertDescription>
              {getErrorMessage(error)}
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
