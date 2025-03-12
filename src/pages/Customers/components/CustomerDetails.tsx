
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Musteri, musteriServisi, randevuServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CustomerOperations } from "@/components/customer-operations/CustomerOperations";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Phone, Calendar, Clock, Plus, Trash2, Edit, Star, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

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
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [newChildName, setNewChildName] = useState("");
  
  const queryClient = useQueryClient();
  const { userRole } = useCustomerAuth();
  
  // Get customer personal data
  const { data: personalData } = useQuery({
    queryKey: ['customer-personal-data', customer.id],
    queryFn: async () => {
      // This is a placeholder - we would need to implement this service
      // to fetch customer personal data like notes, spouse, children
      // For now we'll return mock data
      return {
        custom_notes: "Bu müşteri düzenli gelir.",
        children_names: ["Ali", "Ayşe"],
        spouse_name: "Mehmet"
      };
    },
  });
  
  // Update form data when customer changes
  useEffect(() => {
    setFormData({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      phone: customer.phone || "",
      birthdate: customer.birthdate || "",
    });
    setIsEditMode(false);
  }, [customer]);
  
  // Update state from personalData when it loads
  useEffect(() => {
    if (personalData) {
      setPersonalNotes(personalData.custom_notes || "");
      setChildrenNames(personalData.children_names || []);
      setSpouseName(personalData.spouse_name || "");
    }
  }, [personalData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const { mutate: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: (data: Partial<Musteri>) => 
      musteriServisi.guncelle(customer.id, data),
    onSuccess: () => {
      toast.success("Müşteri başarıyla güncellendi.");
      queryClient.invalidateQueries({ queryKey: ['musteriler'] });
      setIsEditMode(false);
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
  
  const handleAddChild = () => {
    if (newChildName.trim()) {
      setChildrenNames(prev => [...prev, newChildName.trim()]);
      setNewChildName("");
      
      // Here we would also update this in the database
    }
  };
  
  const handleRemoveChild = (index: number) => {
    setChildrenNames(prev => prev.filter((_, i) => i !== index));
    
    // Here we would also update this in the database
  };
  
  const formatDate = (date?: string) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: tr });
    } catch (e) {
      return date;
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-bold">
                {customer.first_name?.[0]}{customer.last_name?.[0]}
              </div>
              
              {!isReadOnly && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Düzenle
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Sil
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
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-6">
              {isEditMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Adı</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
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
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="05XX XXX XX XX"
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
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditMode(false)}
                    >
                      İptal
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {customer.first_name} {customer.last_name}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Müşteri #:</span>
                      <span className="font-medium">{customer.id}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Telefon:</span>
                      <span className="font-medium">{customer.phone || "-"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Doğum Tarihi:</span>
                      <span className="font-medium">{formatDate(customer.birthdate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Kayıt Tarihi:</span>
                      <span className="font-medium">{formatDate(customer.created_at)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detaylı Bilgiler</TabsTrigger>
          <TabsTrigger value="appointments">Randevular</TabsTrigger>
          <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>
                Müşteri hakkında özel notlar ve ailevi bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Özel Notlar</Label>
                <Textarea
                  placeholder="Müşteriye özel notlar..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isReadOnly}
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Eşinin Adı</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Müşterinin eşinin adı..."
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          // Save spouse name logic here
                          toast.success("Eş bilgisi kaydedildi");
                        }}
                      >
                        Kaydet
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Çocukların İsimleri</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {childrenNames.map((child, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {child}
                        {!isReadOnly && (
                          <button 
                            onClick={() => handleRemoveChild(index)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            &times;
                          </button>
                        )}
                      </Badge>
                    ))}
                    {childrenNames.length === 0 && (
                      <span className="text-sm text-muted-foreground">Henüz çocuk bilgisi eklenmemiş</span>
                    )}
                  </div>
                  
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Çocuk adı ekle..."
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddChild}
                        disabled={!newChildName.trim()}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Ekle
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            
            {!isReadOnly && (
              <CardFooter>
                <Button 
                  onClick={() => {
                    // Save all personal data
                    toast.success("Kişisel bilgiler güncellendi");
                  }}
                  className="ml-auto"
                >
                  Tüm Bilgileri Kaydet
                </Button>
              </CardFooter>
            )}
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
                allowAddingPhotos={!isReadOnly}
                maxPhotos={4}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
