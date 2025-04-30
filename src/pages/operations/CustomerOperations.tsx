
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StaffLayout } from '@/components/ui/staff-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useShopData } from '@/hooks/useShopData';
import { personelIslemleriServisi } from '@/lib/supabase/services/personelIslemleriServisi';
import { musteriServisi } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function CustomerOperations() {
  const { isletmeData } = useShopData();
  const dukkanId = isletmeData?.id;
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  
  // Fetch customers
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers', dukkanId],
    queryFn: () => dukkanId ? musteriServisi.hepsiniGetir(dukkanId) : Promise.resolve([]),
    enabled: !!dukkanId
  });
  
  // Fetch operations for selected customer
  const { data: customerOperations = [], isLoading: isLoadingOperations } = useQuery({
    queryKey: ['customer-operations', selectedCustomerId],
    queryFn: () => selectedCustomerId ? 
      personelIslemleriServisi.musteriIslemleriGetir(selectedCustomerId) : 
      Promise.resolve([]),
    enabled: !!selectedCustomerId
  });
  
  // Select a customer
  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomerId(customerId);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };
  
  // Calculate total revenue from customer
  const calculateTotalRevenue = () => {
    if (!customerOperations || !Array.isArray(customerOperations)) return 0;
    return customerOperations.reduce((total, op) => total + (op.tutar || 0), 0);
  };

  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Müşteri İşlemleri</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Müşteriler</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingCustomers ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : customers && customers.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>İsim</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(customers) && customers.map((customer) => (
                        <TableRow 
                          key={customer.id}
                          className={`cursor-pointer ${selectedCustomerId === customer.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                          onClick={() => handleSelectCustomer(customer.id)}
                        >
                          <TableCell className="font-medium">
                            {customer.first_name} {customer.last_name || ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">Henüz müşteri bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Operations List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedCustomerId ? (
                  <>
                    {customers.find(c => c.id === selectedCustomerId)?.first_name || ''} {customers.find(c => c.id === selectedCustomerId)?.last_name || ''} - İşlemleri
                  </>
                ) : (
                  'Müşteri İşlemleri'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!selectedCustomerId ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">İşlemleri görüntülemek için bir müşteri seçin.</p>
                </div>
              ) : isLoadingOperations ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : customerOperations && customerOperations.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>İşlem</TableHead>
                        <TableHead>Personel</TableHead>
                        <TableHead className="text-right">Tutar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOperations.map((op) => (
                        <TableRow key={op.id}>
                          <TableCell>{formatDate(op.created_at)}</TableCell>
                          <TableCell>{op.aciklama}</TableCell>
                          <TableCell>{op.personel?.ad_soyad || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(op.tutar)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="p-4 border-t bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Toplam</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(calculateTotalRevenue())}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">Bu müşteri için henüz işlem kaydı bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
}
