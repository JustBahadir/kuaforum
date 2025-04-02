
import { StaffLayout } from "@/components/ui/staff-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { toast } from "sonner";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { CustomerHistoryTable } from "@/components/customers/CustomerHistoryTable";
import { CustomerPhotoGallery } from "@/components/customers/CustomerPhotoGallery";
import { Pencil, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function CustomerProfile() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customerIdNumber = customerId ? parseInt(customerId) : undefined;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerIdNumber],
    queryFn: async () => {
      if (!customerIdNumber) return null;
      return musteriServisi.getirById(customerIdNumber);
    },
    enabled: !!customerIdNumber,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!customerIdNumber) throw new Error("Müşteri ID gerekli");
      return musteriServisi.sil(customerIdNumber);
    },
    onSuccess: () => {
      toast.success("Müşteri başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
    onError: (error: Error) => {
      toast.error(`Müşteri silinirken bir hata oluştu: ${error.message}`);
    },
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleCustomerUpdated = () => {
    setEditMode(false);
    queryClient.invalidateQueries({ queryKey: ['customer', customerIdNumber] });
    toast.success("Müşteri bilgileri güncellendi");
  };

  // Helper function for first letter capitalization
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const getInitials = () => {
    if (!customer) return "";
    const first = customer.first_name?.charAt(0) || "";
    const last = customer.last_name?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  if (isLoading) {
    return (
      <StaffLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (!customer) {
    return (
      <StaffLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Müşteri Bulunamadı</h1>
            <p className="mb-4">Bu müşteri kaydı bulunamadı veya silinmiş olabilir.</p>
            <Button onClick={() => navigate('/customers')}>
              Müşteri Listesine Dön
            </Button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto py-8">
        {editMode ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Müşteri Düzenle</h2>
            <CustomerForm
              initialData={customer}
              onCancel={handleCancelEdit}
              onSuccess={handleCustomerUpdated}
            />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 text-xl font-bold mr-4">
                    {getInitials()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {customer.first_name} {customer.last_name || ""}
                    </h1>
                    {customer.phone && (
                      <p className="text-gray-600">{customer.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleEditClick}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleDeleteClick}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    TAM AD
                  </h3>
                  <p className="mt-1">
                    {customer.first_name} {customer.last_name || ""}
                  </p>
                </div>
                {customer.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      TELEFON
                    </h3>
                    <p className="mt-1">{customer.phone}</p>
                  </div>
                )}
                {customer.birthdate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      DOĞUM TARİHİ
                    </h3>
                    <p className="mt-1">
                      {new Date(customer.birthdate).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    KAYIT TARİHİ
                  </h3>
                  <p className="mt-1">
                    {new Date(customer.created_at).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="history" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
                <TabsTrigger value="photos">Fotoğraflar</TabsTrigger>
                <TabsTrigger value="notes">Notlar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <CustomerHistoryTable customerId={customerIdNumber} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="photos">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <CustomerPhotoGallery customerId={customerIdNumber} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notes">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Müşteri Notları</h3>
                  <p className="text-muted-foreground">Bu özellik geliştirme aşamasındadır.</p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Müşteriyi Silmek İstiyor musunuz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. Bu müşteri ve ilgili tüm veriler sistemden silinecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDelete}>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StaffLayout>
  );
}
