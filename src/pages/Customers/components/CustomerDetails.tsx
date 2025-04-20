
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CustomerAppointmentsTable } from "./CustomerAppointmentsTable";
import { CustomerOperationsTable } from "./CustomerOperationsTable";
import { CustomerLoyaltyCard } from "./CustomerLoyaltyCard";
import { CustomerProfile } from "./CustomerProfile";
import { useQuery } from "@tanstack/react-query";
import { musteriServisi, islemServisi } from "@/lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { CustomerPersonalData } from "./CustomerPersonalData";
import { CustomerPhotoGallery } from "./CustomerPhotoGallery";
import { customerPersonalDataService } from "@/lib/supabase/services/customerPersonalDataService";

interface CustomerDetailsProps {
  customerId?: number;
}

export function CustomerDetails({ customerId: propCustomerId }: CustomerDetailsProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const customerId = propCustomerId !== undefined ? propCustomerId : params.id ? Number(params.id) : undefined;

  const { 
    data: customer, 
    isLoading: isLoadingCustomer,
    error: customerError
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("No customer ID provided");
      return musteriServisi.getirById(customerId);
    },
    enabled: !!customerId,
  });
  
  const {
    data: personalData,
    isLoading: isLoadingPersonalData
  } = useQuery({
    queryKey: ['customer-personal-data', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("No customer ID provided");
      return customerPersonalDataService.getCustomerPersonalData(customerId);
    },
    enabled: !!customerId
  });

  const customerWithPersonalData = customer && personalData ? {
    ...customer,
    ...personalData
  } : customer;

  const { data: services = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir,
  });

  const isPointSystemEnabled = services.some((service: any) => service.puan > 0);
  
  const handleCreateAppointment = () => {
    if (customerId) {
      navigate(`/appointments?customerId=${customerId}&newAppointment=true`);
    }
  };

  if (isLoadingCustomer || isLoadingPersonalData) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="p-4 md:p-6 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Müşteri Bulunamadı</h3>
        <p className="mt-1 text-sm text-gray-500">Bu müşteri bulunamadı veya bir hata oluştu.</p>
      </div>
    );
  }

  const customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{customerName || 'İsimsiz Müşteri'}</h2>
          <p className="text-sm text-gray-500">Müşteri #: {customer.id}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            Mesaj Gönder
          </Button>
          <Button size="sm" onClick={handleCreateAppointment}>Randevu Oluştur</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:grid-cols-5 mb-4">
          <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
          <TabsTrigger value="detailed">Detaylı Bilgiler</TabsTrigger>
          <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="photos">Fotoğraflar</TabsTrigger>
          {isPointSystemEnabled && (
            <TabsTrigger value="loyalty">Sadakat & Puanlar</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerProfile customer={customerWithPersonalData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detaylı Bilgiler</CardTitle>
            </CardHeader>
            <CardContent>
              {customerId && <CustomerPersonalData customerId={customerId} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          {customerId && <CustomerOperationsTable customerId={customerId} />}
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Fotoğrafları</CardTitle>
            </CardHeader>
            <CardContent>
              {customerId && <CustomerPhotoGallery customerId={customerId} />}
            </CardContent>
          </Card>
        </TabsContent>

        {isPointSystemEnabled && (
          <TabsContent value="loyalty">
            <Card>
              <CardHeader>
                <CardTitle>Sadakat Programı ve Puanlar</CardTitle>
              </CardHeader>
              <CardContent>
                {customerId && <CustomerLoyaltyCard customerId={customerId} expanded={true} />}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
