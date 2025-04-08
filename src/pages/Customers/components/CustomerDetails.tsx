
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
import { useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { CustomerPersonalData } from "./CustomerPersonalData";
import { CustomerPhotoGallery } from "./CustomerPhotoGallery";
import { Textarea } from "@/components/ui/textarea";

interface CustomerDetailsProps {
  customerId?: number;
}

export function CustomerDetails({ customerId: propCustomerId }: CustomerDetailsProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [customerNote, setCustomerNote] = useState("");
  const params = useParams<{ id: string }>();
  
  // Use the prop customerId if provided, otherwise get it from URL params
  const customerId = propCustomerId !== undefined ? propCustomerId : params.id ? Number(params.id) : undefined;

  const { 
    data: customer, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("No customer ID provided");
      return musteriServisi.getirById(customerId);
    },
    enabled: !!customerId,
  });

  // Check if points system is enabled
  const { data: services = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir,
  });

  const isPointSystemEnabled = services.some((service: any) => service.puan > 0);
  
  const handleSaveNote = () => {
    // Save note functionality would go here
    console.log("Saving note:", customerNote);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !customer) {
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

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Düzenle
          </Button>
          <Button variant="outline" size="sm">
            Mesaj Gönder
          </Button>
          <Button size="sm">Randevu Oluştur</Button>
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
        
        {/* Temel Bilgiler (Basic Info) */}
        <TabsContent value="basic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Müşteri Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerProfile customer={customer} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Not Ekle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Müşteri hakkında notlarınızı buraya ekleyin..." 
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <Button onClick={handleSaveNote} className="w-full md:w-auto">Kaydet</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Son Randevular</CardTitle>
              </CardHeader>
              <CardContent>
                {customerId && <CustomerAppointmentsTable customerId={customerId} limitCount={3} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detaylı Bilgiler (Detailed Info) */}
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

        {/* İşlem Geçmişi (Operations) */}
        <TabsContent value="operations">
          {customerId && <CustomerOperationsTable customerId={customerId} />}
        </TabsContent>

        {/* Fotoğraflar (Photos) */}
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

        {/* Sadakat & Puanlar (Loyalty) */}
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
