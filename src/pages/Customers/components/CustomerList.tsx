
import { useState } from "react";
import { CustomerDetails } from "./CustomerDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface CustomerListProps {
  customers: any[];
  isLoading: boolean;
  error: Error | null;
}

export function CustomerList({ customers, isLoading, error }: CustomerListProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-[250px] mb-2" />
                  <Skeleton className="h-6 w-[100px]" />
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-4 w-[140px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return null; // Error already displayed above this component
  }

  if (customers.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground py-10">Kayıtlı müşteri bulunmamaktadır.</p>
        </CardContent>
      </Card>
    );
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  };

  const openCustomerDetails = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  return (
    <>
      <div className="space-y-4">
        {customers.map((customer) => (
          <Card 
            key={customer.id} 
            className="overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => openCustomerDetails(customer)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg">{customer.first_name} {customer.last_name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.total_services || 0} işlem
                </div>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                {customer.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    {formatPhoneNumber(customer.phone)}
                  </div>
                )}
                
                {customer.birthdate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {format(new Date(customer.birthdate), 'dd MMMM yyyy', { locale: tr })}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 mr-1" />
                  {format(new Date(customer.created_at), 'dd MMMM yyyy', { locale: tr })} tarihinde eklendi
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedCustomer && (
        <CustomerDetails 
          customer={selectedCustomer} 
          isOpen={!!selectedCustomer} 
          onClose={closeCustomerDetails}
        />
      )}
    </>
  );
}
