
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { EditCustomerForm } from "./EditCustomerForm";
import { DeleteCustomerDialog } from "./DeleteCustomerDialog";
import { CustomerOperations } from "@/components/customers/CustomerOperations";
import { Musteri } from "@/lib/supabase/types";

interface CustomerDetailsProps {
  customer: Musteri;
  onEdit: () => void;
  onDelete: () => void;
  dukkanId?: number;
}

export function CustomerDetails({ customer, onEdit, onDelete, dukkanId }: CustomerDetailsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    onEdit();
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    onDelete();
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "-";
    
    // Format Turkish phone number: 5XX XXX XX XX
    if (phone.startsWith("+90")) {
      const cleaned = phone.slice(3);
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
      }
    }
    
    return phone;
  };

  const formatBirthdate = (birthdate?: string) => {
    if (!birthdate) return "-";
    return new Date(birthdate).toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">
            {customer.first_name} {customer.last_name || ""}
          </h2>
          <p className="text-muted-foreground">Müşteri ID: {customer.id}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Düzenle
          </Button>
          
          <Button 
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Müşteri Bilgileri</TabsTrigger>
          <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Ad Soyad</h3>
                  <p>{customer.first_name} {customer.last_name || ""}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Telefon</h3>
                  <p>{formatPhoneNumber(customer.phone)}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Doğum Tarihi</h3>
                  <p>{formatBirthdate(customer.birthdate)}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Kayıt Tarihi</h3>
                  <p>{new Date(customer.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operations" className="mt-6">
          <CustomerOperations customerId={customer.id} />
        </TabsContent>
      </Tabs>
      
      <EditCustomerForm 
        customer={customer}
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        dukkanId={dukkanId}
      />
      
      <DeleteCustomerDialog
        customer={customer}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
