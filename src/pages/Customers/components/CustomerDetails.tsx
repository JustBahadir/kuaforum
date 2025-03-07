import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  User, Calendar, Mail, Phone, MapPin, Briefcase, Edit, Save, Trash2, AlertTriangle
} from "lucide-react";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Musteri } from "@/lib/supabase/types";
import { customerPersonalDataService, musteriServisi } from "@/lib/supabase";
import type { CustomerPersonalData } from "@/lib/supabase";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { PhoneInputField } from "../components/FormFields/PhoneInputField";
import { getHoroscope, getHoroscopeDescription } from "../utils/horoscopeUtils";

interface CustomerDetailsProps {
  customer: Musteri;
  dukkanId?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CustomerDetails({ customer, dukkanId, onEdit, onDelete }: CustomerDetailsProps) {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [editMode, setEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Customer basic data form
  const [formData, setFormData] = useState({
    first_name: customer.first_name,
    last_name: customer.last_name || "",
    phone: customer.phone || "",
    birthdate: customer.birthdate || ""
  });
  
  // Customer personal data form
  const [personalData, setPersonalData] = useState<CustomerPersonalData>({
    customer_id: customer.id.toString(),
    birth_date: null,
    anniversary_date: null,
    horoscope: null,
    horoscope_description: null,
    children_names: [],
    custom_notes: null
  });

  // Calculate horoscope from birthdate
  useEffect(() => {
    if (formData.birthdate) {
      const horoscope = getHoroscope(new Date(formData.birthdate));
      const horoscopeDescription = getHoroscopeDescription(horoscope);
      
      setPersonalData(prev => ({
        ...prev,
        horoscope,
        horoscope_description: horoscopeDescription
      }));
    }
  }, [formData.birthdate]);

  // Fetch customer personal data
  const { data: customerPersonalData, isLoading: isLoadingPersonalData } = useQuery({
    queryKey: ['customerPersonalData', customer.id],
    queryFn: async () => {
      try {
        return await customerPersonalDataService.getByCustomerId(customer.id.toString());
      } catch (err) {
        console.error("Customer personal data fetch error:", err);
        return null;
      }
    }
  });

  // Update personal data state when fetched from API
  useEffect(() => {
    if (customerPersonalData) {
      setPersonalData({
        ...customerPersonalData,
        customer_id: customer.id.toString()
      });
    }
  }, [customerPersonalData, customer.id]);

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (activeTab === "basic") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (activeTab === "personal") {
      setPersonalData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle phone input changes
  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, phone }));
  };

  // Calculate customer's initials for avatar
  const getInitials = () => {
    if (!customer.first_name) return "?";
    return `${customer.first_name.charAt(0)}${customer.last_name ? customer.last_name.charAt(0) : ''}`;
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  // Save customer changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First save basic customer data
      if (activeTab === "basic") {
        await musteriServisi.guncelle(customer.id, formData);
        toast.success("Müşteri bilgileri başarıyla güncellendi");
      } 
      // Save personal data
      else if (activeTab === "personal") {
        await customerPersonalDataService.upsert(personalData);
        toast.success("Müşteri kişisel bilgileri başarıyla güncellendi");
      }
      
      setEditMode(false);
      if (onEdit) onEdit();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast.error(`Kaydetme hatası: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async () => {
    try {
      await musteriServisi.sil(customer.id);
      toast.success("Müşteri başarıyla silindi");
      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast.error(`Silme hatası: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Müşteri Bilgileri</CardTitle>
            <div className="flex gap-2">
              {!editMode ? (
                <Button variant="outline" size="sm" onClick={handleEditToggle}>
                  <Edit className="h-4 w-4 mr-1" />
                  Düzenle
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              )}
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Sil
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg bg-purple-100 text-purple-600">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 flex-1">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <User className="h-4 w-4" /> AD SOYAD
                </h3>
                <p className="mt-1 text-base font-medium">
                  {customer.first_name} {customer.last_name || ''} 
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Phone className="h-4 w-4" /> TELEFON
                </h3>
                <p className="mt-1 text-base">
                  {customer.phone ? formatPhoneNumber(customer.phone) : '-'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> DOĞUM TARİHİ
                </h3>
                <p className="mt-1 text-base">{formatDate(customer.birthdate)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> KAYIT TARİHİ
                </h3>
                <p className="mt-1 text-base">{formatDate(customer.created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="basic" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Temel Bilgiler
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Detaylı Bilgiler
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Temel Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Ad</Label>
                  <Input 
                    id="first_name" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Soyad</Label>
                  <Input 
                    id="last_name" 
                    name="last_name" 
                    value={formData.last_name} 
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <PhoneInputField 
                    id="phone"
                    label="Telefon"
                    value={formData.phone || ''} 
                    onChange={handlePhoneChange}
                    disabled={!editMode}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Doğum Tarihi</Label>
                  <Input 
                    id="birthdate" 
                    name="birthdate" 
                    type="date" 
                    value={formData.birthdate || ''} 
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Detaylar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingPersonalData ? (
                <div className="p-8 text-center">Bilgiler yükleniyor...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="anniversary_date">Evlilik Yıl Dönümü Tarihi</Label>
                      <Input 
                        id="anniversary_date" 
                        name="anniversary_date" 
                        type="date" 
                        value={personalData.anniversary_date || ''} 
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="horoscope">Burç</Label>
                      <Input 
                        id="horoscope" 
                        name="horoscope" 
                        value={personalData.horoscope || ''} 
                        onChange={handleChange}
                        disabled={true}
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Doğum tarihine göre otomatik hesaplanır</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="horoscope_description">Burç Özellikleri</Label>
                    <Textarea 
                      id="horoscope_description" 
                      name="horoscope_description" 
                      value={personalData.horoscope_description || ''} 
                      onChange={handleChange}
                      disabled={true}
                      rows={3}
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Günlük Burç Yorumu</Label>
                    <Card className="p-3 bg-gray-50">
                      <p className="font-semibold mb-1">
                        {format(new Date(), "d MMMM yyyy", { locale: tr })}
                      </p>
                      <p className="text-sm">
                        {personalData.horoscope ? 
                          `${personalData.horoscope} burcu için günlük yorum henüz yüklenmedi.` : 
                          "Burç bilgisi bulunamadı. Lütfen doğum tarihi giriniz."}
                      </p>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="children_names">Çocuklarının İsimleri (virgülle ayırın)</Label>
                    <Input 
                      id="children_names" 
                      name="children_names" 
                      value={personalData.children_names?.join(', ') || ''} 
                      onChange={(e) => {
                        const names = e.target.value.split(',').map(name => name.trim());
                        setPersonalData(prev => ({ ...prev, children_names: names }));
                      }}
                      disabled={!editMode}
                      placeholder="Ali, Ayşe, Mehmet"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom_notes">Notlar</Label>
                    <Textarea 
                      id="custom_notes" 
                      name="custom_notes" 
                      value={personalData.custom_notes || ''} 
                      onChange={handleChange}
                      disabled={!editMode}
                      rows={4}
                      placeholder="Müşteri hakkında özel notlar..."
                    />
                  </div>
                </>
              )}
            </CardContent>
            {editMode && (
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Müşteri Kaydını Sil
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-black">{customer.first_name} {customer.last_name}</span> adlı müşteriye ait tüm bilgiler kalıcı olarak silinecektir. Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal Et</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCustomer}
              className="bg-red-600 hover:bg-red-700"
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
