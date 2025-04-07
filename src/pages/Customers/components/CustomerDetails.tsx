
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { musteriServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { EditCustomerForm } from "./EditCustomerForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerPersonalInfo } from "./CustomerPersonalInfo";
import { CustomerPreferences } from "./CustomerPreferences";
import { CustomerOperationsTable } from "./CustomerOperationsTable";
import { CustomerPhotoGallery } from "./CustomerPhotoGallery";
import { useCustomerOperations } from "@/hooks/useCustomerOperations";
import { Musteri } from "@/lib/supabase/types";
import { format } from "date-fns";

interface CustomerDetailsProps {
  customer: Musteri;
  onEdit: () => void;
  onDelete: () => void;
  dukkanId?: number;
}

export function CustomerDetails({ 
  customer, 
  onEdit,
  onDelete,
  dukkanId
}: CustomerDetailsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("temel");
  
  // Convert customer.id to number to ensure it's properly typed
  const customerId = typeof customer.id === 'string' ? parseInt(customer.id, 10) : customer.id;
  const { totals } = useCustomerOperations(customerId);

  const handleDelete = async () => {
    try {
      // Make sure we're passing a number for customer.id
      await musteriServisi.sil(customerId);
      toast.success("Müşteri başarıyla silindi");
      onDelete();
    } catch (error) {
      console.error("Müşteri silinirken hata:", error);
      toast.error("Müşteri silinemedi");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 md:p-6">
          {/* Responsive header with flexible layout */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-lg md:text-xl">
                {customer.first_name?.[0] || "?"}{customer.last_name?.[0] || ""}
              </div>
              <div className="ml-3 md:ml-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  {customer.first_name} {customer.last_name || ""}
                </h2>
                <p className="text-sm md:text-base text-gray-600">Kayıt: {format(new Date(customer.created_at), "dd.MM.yyyy")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
                className="min-h-10 px-3 md:px-4"
              >
                Düzenle
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="min-h-10 px-3 md:px-4"
              >
                Sil
              </Button>
            </div>
          </div>
          
          {totals && totals.totalPoints > 0 && (
            <div className="mb-4">
              <div className="inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                Toplam Puan: {totals.totalPoints}
              </div>
            </div>
          )}
        
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-2">
              <TabsTrigger value="temel" className="text-xs md:text-sm py-2">Temel Bilgiler</TabsTrigger>
              <TabsTrigger value="detayli" className="text-xs md:text-sm py-2">Detaylı Bilgiler</TabsTrigger>
              <TabsTrigger value="islemler" className="text-xs md:text-sm py-2">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="fotograflar" className="text-xs md:text-sm py-2">Fotoğraflar</TabsTrigger>
            </TabsList>

            <TabsContent value="temel" className="p-2">
              <CustomerPersonalInfo 
                customer={customer} 
                customerId={customerId} 
                editMode={false} 
              />
            </TabsContent>

            <TabsContent value="detayli" className="p-2">
              <CustomerPreferences customerId={String(customerId)} />
            </TabsContent>

            <TabsContent value="islemler" className="p-2">
              <CustomerOperationsTable customerId={customerId} />
            </TabsContent>

            <TabsContent value="fotograflar" className="p-2">
              <CustomerPhotoGallery customerId={String(customerId)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <EditCustomerForm 
          customer={customer}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onEdit}
          dukkanId={dukkanId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteri Silme İşlemi</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{customer.first_name} {customer.last_name}</strong> isimli müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
