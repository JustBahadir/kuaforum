
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerOperationsTable } from "./CustomerOperationsTable";
import { Musteri } from "@/lib/supabase";
import { CustomerPreferences } from "./CustomerPreferences";

interface CustomerDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Musteri | null;
}

export function CustomerDetails({ open, onOpenChange, customer }: CustomerDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Müşteri Detayları</DialogTitle>
        </DialogHeader>
        
        {customer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">AD SOYAD</h3>
                <p className="mt-1 text-base">{customer.first_name} {customer.last_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">TELEFON</h3>
                <p className="mt-1 text-base">{customer.phone || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">KAYIT TARİHİ</h3>
                <p className="mt-1 text-base">
                  {customer.created_at 
                    ? new Date(customer.created_at).toLocaleDateString('tr-TR') 
                    : '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">TOPLAM İŞLEM</h3>
                <p className="mt-1 text-base">{customer.total_services || 0}</p>
              </div>
            </div>

            <Tabs defaultValue="islemler" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="islemler" className="flex-1">İşlem Geçmişi</TabsTrigger>
                <TabsTrigger value="randevular" className="flex-1">Randevu Geçmişi</TabsTrigger>
                <TabsTrigger value="tercihler" className="flex-1">Kişisel Tercihler</TabsTrigger>
              </TabsList>
              <TabsContent value="islemler" className="border rounded-md mt-4">
                <CustomerOperationsTable customerId={customer.id} />
              </TabsContent>
              <TabsContent value="randevular" className="border rounded-md p-4 mt-4">
                <div className="text-center py-4">Randevu geçmişi burada gösterilecek.</div>
              </TabsContent>
              <TabsContent value="tercihler" className="border rounded-md mt-4">
                <CustomerPreferences customerId={customer.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
