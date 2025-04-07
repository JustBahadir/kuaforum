
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
  const { totals } = useCustomerOperations(customer.id);

  const handleDelete = async () => {
    try {
      await musteriServisi.sil(customer.id);
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
        <div className="p-6">
          {/* Simplified header with just name and buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-xl">
                {customer.first_name?.[0] || "?"}{customer.last_name?.[0] || ""}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">
                  {customer.first_name} {customer.last_name || ""}
                </h2>
                <p className="text-gray-600">Kayıt: {format(new Date(customer.created_at), "dd.MM.yyyy")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                Düzenle
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
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
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="temel">Temel Bilgiler</TabsTrigger>
              <TabsTrigger value="detayli">Detaylı Bilgiler</TabsTrigger>
              <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="fotograflar">Fotoğraflar</TabsTrigger>
            </TabsList>

            <TabsContent value="temel" className="p-2">
              <CustomerPersonalInfo 
                customer={customer} 
                customerId={Number(customer.id)}
                editMode={false} 
              />
            </TabsContent>

            <TabsContent value="detayli" className="p-2">
              <CustomerPreferences customerId={String(customer.id)} />
            </TabsContent>

            <TabsContent value="islemler" className="p-2">
              <CustomerOperationsTable customerId={customer.id} />
            </TabsContent>

            <TabsContent value="fotograflar" className="p-2">
              <CustomerPhotoGallery customerId={String(customer.id)} />
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteri Silme İşlemi</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{customer.first_name} {customer.last_name}</strong> isimli müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
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
