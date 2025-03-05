
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Eye, Star, History, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerDetails } from "@/pages/Customers/components/CustomerDetails";
import { Musteri } from "@/lib/supabase";

interface CustomerListProps {
  customers: any[];
  isLoading: boolean;
  error: Error | null;
}

export function CustomerList({ customers, isLoading, error }: CustomerListProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Musteri | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleOpenDetails = (customer: Musteri) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCustomer(null);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Müşteriler yüklenirken bir hata oluştu: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Müşteri Listesi</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg font-medium">Kayıtlı Müşteri Bulunmamaktadır</p>
            <p className="mt-2">Yeni müşteri eklemek için "Yeni Müşteri" butonunu kullanabilirsiniz.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card key={customer.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {customer.first_name && customer.last_name
                            ? `${customer.first_name[0]}${customer.last_name[0]}`.toUpperCase()
                            : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {customer.total_services ? (
                            <Badge variant="outline" className="rounded-sm">
                              {customer.total_services} İşlem
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 rounded-sm">
                              Yeni Müşteri
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[180px]">{customer.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Kayıt: {new Date(customer.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/20 p-3 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenDetails(customer)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Detaylar
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <History className="h-4 w-4 mr-1" /> İşlemler
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <Calendar className="h-4 w-4 mr-1" /> Randevu
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedCustomer && (
          <CustomerDetails
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            customer={selectedCustomer}
          />
        )}
      </CardContent>
    </Card>
  );
}
