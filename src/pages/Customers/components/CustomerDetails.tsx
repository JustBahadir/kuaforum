
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Musteri, musteriServisi, randevuServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CustomerOperations } from "@/components/customer-operations/CustomerOperations";

interface CustomerDetailsProps {
  customer: Musteri;
  onEdit: () => void;
  onDelete: () => void;
  dukkanId?: number;
  isReadOnly?: boolean; // New prop to control editing permissions
}

export function CustomerDetails({ customer, onEdit, onDelete, dukkanId, isReadOnly = false }: CustomerDetailsProps) {
  const [formData, setFormData] = useState({
    first_name: customer.first_name || "",
    last_name: customer.last_name || "",
    phone: customer.phone || "",
    birthdate: customer.birthdate || "",
  });
  
  const queryClient = useQueryClient();
  
  // Update form data when customer changes
  useEffect(() => {
    setFormData({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      phone: customer.phone || "",
      birthdate: customer.birthdate || "",
    });
  }, [customer]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const { mutate: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: (data: Partial<Musteri>) => 
      musteriServisi.guncelle(customer.id, data),
    onSuccess: () => {
      toast.success("Müşteri başarıyla güncellendi.");
      queryClient.invalidateQueries({ queryKey: ['musteriler'] });
      onEdit();
    },
    onError: (error: any) => {
      toast.error(`Müşteri güncellenirken bir hata oluştu: ${error.message}`);
    }
  });
  
  const { mutate: deleteCustomer, isPending: isDeleting } = useMutation({
    mutationFn: () => musteriServisi.sil(customer.id),
    onSuccess: () => {
      toast.success("Müşteri başarıyla silindi.");
      queryClient.invalidateQueries({ queryKey: ['musteriler'] });
      onDelete();
    },
    onError: (error: any) => {
      toast.error(`Müşteri silinirken bir hata oluştu: ${error.message}`);
    }
  });
  
  // Get customer's appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['customer-appointments', customer.id],
    queryFn: () => randevuServisi.musteriRandevulariGetir(customer.id),
    enabled: !!customer.id
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer(formData);
  };
  
  return (
    <div className="space-y-8">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Müşteri Bilgileri</TabsTrigger>
          <TabsTrigger value="appointments">Randevular</TabsTrigger>
          <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Müşteri Detayları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Adı</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className={isReadOnly ? "bg-gray-50" : ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Soyadı</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className={isReadOnly ? "bg-gray-50" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="05XX XXX XX XX"
                    disabled={isReadOnly}
                    className={isReadOnly ? "bg-gray-50" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Doğum Tarihi</Label>
                  <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className={isReadOnly ? "bg-gray-50" : ""}
                  />
                </div>
              </CardContent>
              
              {!isReadOnly && (
                <CardFooter className="flex justify-between">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" type="button" disabled={isDeleting}>
                        {isDeleting ? "Siliniyor..." : "Müşteriyi Sil"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm randevu ve işlem geçmişi de silinecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteCustomer()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Evet, Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Randevu Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentList 
                appointments={appointments} 
                isLoading={isLoadingAppointments}
                isMinimal={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerOperations 
                customerId={customer.id.toString()} 
                allowAddingPhotos={!isReadOnly} // Only admin can add photos
                maxPhotos={4}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
