
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar, PlusCircle, User, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { Musteri } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getHoroscope, getHoroscopeDescription } from "../utils/horoscopeUtils";
import { customerPersonalDataService } from "@/lib/supabase/services/customerPersonalDataService";

interface CustomerPersonalInfoProps {
  customerId: string | number;
  customer: Musteri;
  editMode: boolean;
}

interface PersonalData {
  birth_date: string | null;
  anniversary_date: string | null;
  children_names: string[];
  horoscope: string | null;
  horoscope_description: string | null;
  custom_notes: string | null;
  daily_horoscope_reading: string | null;
  spouse_name: string | null;
  spouse_birthdate: string | null;
}

export function CustomerPersonalInfo({ customerId, customer, editMode }: CustomerPersonalInfoProps) {
  const queryClient = useQueryClient();
  const [newChild, setNewChild] = useState("");
  const [childrenListOpen, setChildrenListOpen] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData>({
    birth_date: null,
    anniversary_date: null,
    children_names: [],
    horoscope: null,
    horoscope_description: null,
    custom_notes: null,
    daily_horoscope_reading: null,
    spouse_name: null,
    spouse_birthdate: null
  });
  const [isLoadingHoroscope, setIsLoadingHoroscope] = useState(false);

  // Fetch customer personal data
  const { data: existingData, isLoading } = useQuery({
    queryKey: ['customer_personal_data', customerId],
    queryFn: async () => {
      try {
        console.log("Fetching personal data for customer ID:", customerId);
        
        // Convert customerId to string before passing to the service
        const data = await customerPersonalDataService.getByCustomerId(customerId.toString());
        console.log("Fetched personal data:", data);
        return data;
      } catch (error) {
        console.error("Error fetching personal data:", error);
        return null;
      }
    },
    staleTime: 30000, // 30 seconds
  });

  // Prefill form with existing data
  useEffect(() => {
    if (existingData) {
      setPersonalData({
        birth_date: existingData.birth_date,
        anniversary_date: existingData.anniversary_date,
        children_names: existingData.children_names || [],
        horoscope: existingData.horoscope,
        horoscope_description: existingData.horoscope_description,
        custom_notes: existingData.custom_notes,
        daily_horoscope_reading: existingData.daily_horoscope_reading,
        spouse_name: existingData.spouse_name,
        spouse_birthdate: existingData.spouse_birthdate
      });
    }
  }, [existingData]);

  // Update horoscope when birth date changes
  useEffect(() => {
    if (personalData.birth_date) {
      updateHoroscope(personalData.birth_date);
    }
  }, [personalData.birth_date]);

  // Update or create personal data
  const mutation = useMutation({
    mutationFn: async (data: PersonalData) => {
      console.log("Saving customer personal data:", data);
      
      try {
        // Always convert customerId to string
        await customerPersonalDataService.updateCustomerPersonalData(customerId.toString(), {
          customer_id: customerId.toString(),
          birth_date: data.birth_date,
          anniversary_date: data.anniversary_date,
          children_names: data.children_names,
          horoscope: data.horoscope,
          horoscope_description: data.horoscope_description,
          custom_notes: data.custom_notes,
          daily_horoscope_reading: data.daily_horoscope_reading,
          spouse_name: data.spouse_name,
          spouse_birthdate: data.spouse_birthdate
        });
      } catch (error) {
        console.error("Error saving personal data:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer_personal_data', customerId]
      });
      toast.success("Müşteri bilgileri kaydedildi");
    },
    onError: (error) => {
      console.error("Müşteri bilgileri kaydedilemedi:", error);
      toast.error("Müşteri bilgileri kaydedilemedi");
    }
  });

  const handleSave = () => {
    console.log("Saving customer data:", personalData);
    mutation.mutate(personalData);
  };

  const handleDateChange = (field: 'birth_date' | 'anniversary_date' | 'spouse_birthdate', date: Date | undefined) => {
    if (!date) return;
    setPersonalData(prev => ({
      ...prev,
      [field]: date.toISOString().split('T')[0]
    }));
  };

  const addChild = () => {
    if (!newChild.trim()) return;
    
    setPersonalData(prev => ({
      ...prev,
      children_names: [...(prev.children_names || []), newChild.trim()]
    }));
    
    setNewChild("");
  };

  const removeChild = (index: number) => {
    setPersonalData(prev => ({
      ...prev,
      children_names: (prev.children_names || []).filter((_, i) => i !== index)
    }));
  };

  const updateHoroscope = async (birthDateStr: string) => {
    try {
      setIsLoadingHoroscope(true);
      const birthDate = new Date(birthDateStr);
      const horoscope = getHoroscope(birthDate);
      
      // Fetch daily horoscope description if we have a valid horoscope sign
      let horoscopeDescription = "";
      if (horoscope) {
        horoscopeDescription = await getHoroscopeDescription(horoscope);
      }
      
      setPersonalData(prev => ({
        ...prev,
        horoscope,
        horoscope_description: horoscopeDescription
      }));
    } catch (error) {
      console.error("Burç bilgileri güncellenirken hata oluştu:", error);
    } finally {
      setIsLoadingHoroscope(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Bilgiler yükleniyor...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>
          
          <div className="space-y-2">
            <Label htmlFor="birthDate">Doğum Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !personalData.birth_date && "text-muted-foreground"
                  )}
                  disabled={!editMode}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {personalData.birth_date ? (
                    format(new Date(personalData.birth_date), "dd MMMM yyyy", { locale: tr })
                  ) : (
                    <span>Bir tarih seçin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={personalData.birth_date ? new Date(personalData.birth_date) : undefined}
                  onSelect={(date) => handleDateChange('birth_date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {personalData.horoscope && (
            <div className="space-y-2">
              <Label>Burç</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-2 py-1 bg-purple-50">
                  {personalData.horoscope}
                </Badge>
                {isLoadingHoroscope && <span className="text-xs text-muted-foreground">Güncelleniyor...</span>}
              </div>
              {personalData.horoscope_description && (
                <div className="mt-2 p-3 bg-muted/40 rounded-md text-sm">
                  <p>{personalData.horoscope_description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kaynak: elle.com.tr
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="anniversaryDate">Evlilik Yıldönümü</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !personalData.anniversary_date && "text-muted-foreground"
                  )}
                  disabled={!editMode}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {personalData.anniversary_date ? (
                    format(new Date(personalData.anniversary_date), "dd MMMM yyyy", { locale: tr })
                  ) : (
                    <span>Bir tarih seçin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={personalData.anniversary_date ? new Date(personalData.anniversary_date) : undefined}
                  onSelect={(date) => handleDateChange('anniversary_date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Eş Bilgileri</h3>
          
          <div className="space-y-2">
            <Label htmlFor="spouseName">Eş Adı</Label>
            <Input
              id="spouseName"
              value={personalData.spouse_name || ""}
              onChange={(e) => setPersonalData(prev => ({ ...prev, spouse_name: e.target.value }))}
              placeholder="Eşinin adı"
              disabled={!editMode}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="spouseBirthdate">Eş Doğum Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !personalData.spouse_birthdate && "text-muted-foreground"
                  )}
                  disabled={!editMode}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {personalData.spouse_birthdate ? (
                    format(new Date(personalData.spouse_birthdate), "dd MMMM yyyy", { locale: tr })
                  ) : (
                    <span>Bir tarih seçin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={personalData.spouse_birthdate ? new Date(personalData.spouse_birthdate) : undefined}
                  onSelect={(date) => handleDateChange('spouse_birthdate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Çocuk Bilgileri</h3>
        
        {editMode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Çocuk ismi ekle"
                value={newChild}
                onChange={(e) => setNewChild(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={addChild}
                disabled={!newChild.trim()}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Ekle
              </Button>
            </div>
            
            {(personalData.children_names && personalData.children_names.length > 0) ? (
              <div className="border rounded-md p-2 space-y-2">
                {personalData.children_names.map((child, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{child}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChild(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Henüz çocuk eklenmemiş.</p>
            )}
          </div>
        ) : (
          (personalData.children_names && personalData.children_names.length > 0) ? (
            <div className="border rounded-md p-3">
              <ul className="space-y-1">
                {personalData.children_names.map((child, index) => (
                  <li key={index} className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{child}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Çocuk bilgisi yok.</p>
          )
        )}
      </div>
      
      <Separator className="my-6" />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notlar</h3>
        <Textarea
          placeholder="Müşteri hakkında özel notlar..."
          className="min-h-[100px]"
          value={personalData.custom_notes || ""}
          onChange={(e) => setPersonalData(prev => ({ ...prev, custom_notes: e.target.value }))}
          disabled={!editMode}
        />
      </div>
      
      {editMode && (
        <div className="flex justify-end">
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={mutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {mutation.isPending ? "Kaydediliyor..." : "Bilgileri Kaydet"}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper Label component since it's not imported
function Label({ htmlFor, children, className }: { htmlFor?: string, children: React.ReactNode, className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm font-medium text-gray-700", className)}>
      {children}
    </label>
  );
}
