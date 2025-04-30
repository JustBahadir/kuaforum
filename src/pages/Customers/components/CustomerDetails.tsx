
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { musteriServisi, personelIslemleriServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import { CustomerPersonalInfo } from "./CustomerPersonalInfo";
import CustomerOperationsTable from "./CustomerOperationsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCustomerForm } from "./EditCustomerForm";
import { toast } from "sonner";
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
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface CustomerDetailsProps {
  customerId: number;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function CustomerDetails({ customerId, onUpdate, onDelete }: CustomerDetailsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { userRole } = useCustomerAuth();
  
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => musteriServisi.getirById(customerId),
    enabled: !!customerId,
  });

  const { data: operations = [] } = useQuery({
    queryKey: ['customer-operations', customerId],
    queryFn: async () => {
      try {
        // Using customerOperationsService instead of personelIslemleriServisi
        // Import customerOperationsService at the top if needed
        return await personelIslemleriServisi.getirByMusteriId(customerId);
      } catch (error) {
        console.error("Müşteri işlemleri getirilirken hata:", error);
        return [];
      }
    },
    enabled: !!customerId
  });

  const handleDelete = async () => {
    if (!customerId) return;
    
    try {
      await musteriServisi.sil(customerId);
      toast.success("Müşteri başarıyla silindi");
      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Müşteri silinirken hata:", error);
      toast.error("Müşteri silinirken bir hata oluştu");
    }
  };

  const handleCustomerUpdated = () => {
    if (onUpdate) onUpdate();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-4 w-4" />
            <p className="font-semibold">Müşteri bilgileri yüklenemedi</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Müşteri bilgileri getirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {customer.first_name} {customer.last_name}
        </h2>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Düzenle
          </Button>
          
          {userRole === 'admin' && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Sil
            </Button>
          )}
        </div>
      </div>

      <CustomerPersonalInfo customer={customer} customerId={customer.id} />
      
      <Card>
        <CardHeader>
          <CardTitle>İşlem Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerOperationsTable customerId={customer.id} />
        </CardContent>
      </Card>

      <EditCustomerForm 
        customer={customer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleCustomerUpdated}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve 
              müşteriye ait tüm veriler kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
