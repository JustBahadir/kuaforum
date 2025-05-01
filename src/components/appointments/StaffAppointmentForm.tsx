import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { supabase } from '@/lib/supabase/client';

interface StaffAppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editAppointmentId?: number;
  defaultDate?: Date;
}

export function StaffAppointmentForm({
  open,
  onOpenChange,
  onSuccess,
  editAppointmentId,
  defaultDate = new Date(),
}: StaffAppointmentFormProps) {
  const queryClient = useQueryClient();
  
  const [customerId, setCustomerId] = useState<string>("");
  const [personnelId, setPersonnelId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<Date>(defaultDate);
  const [time, setTime] = useState<string>("09:00");
  const [notes, setNotes] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const resetForm = () => {
    setCustomerId("");
    setPersonnelId("");
    setCategoryId("");
    setServiceId("");
    setDate(defaultDate);
    setTime("09:00");
    setNotes("");
  };

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        return await musteriServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Müşteri listesi alınamadı");
        return [];
      }
    },
  });

  const { data: personnel = [], isLoading: isLoadingPersonnel } = useQuery({
    queryKey: ["personnel"],
    queryFn: async () => {
      try {
        return await personelServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching personnel:", error);
        toast.error("Personel listesi alınamadı");
        return [];
      }
    },
  });

  // Add query for categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        return await kategoriServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Kategori listesi alınamadı");
        return [];
      }
    },
  });

  // Add query for services based on selected category
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      try {
        const { data, error } = await supabase
          .from('islemler')
          .select('*')
          .eq('kategori_id', parseInt(categoryId))
          .order('sira', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Hizmet listesi alınamadı");
        return [];
      }
    },
    enabled: !!categoryId,
  });

  useEffect(() => {
    if (open && editAppointmentId) {
      // Fetch the appointment data if editing
      const fetchAppointment = async () => {
        try {
          const appointmentData = await randevuServisi.getir(editAppointmentId);
          if (appointmentData) {
            setCustomerId(appointmentData.musteri_id.toString());
            setPersonnelId(appointmentData.personel_id.toString());
            setDate(new Date(appointmentData.tarih));
            setTime(appointmentData.saat.substring(0, 5));
            setNotes(appointmentData.notlar || "");
          }
        } catch (error) {
          console.error("Error fetching appointment:", error);
          toast.error("Randevu bilgileri alınamadı");
        }
      };
      
      fetchAppointment();
    } else {
      // Reset form when opening new appointment
      resetForm();
    }
  }, [open, editAppointmentId]);

  // Generate available times
  useEffect(() => {
    const times = [];
    let hour = 9;
    let minute = 0;
    
    while (hour < 20) {
      times.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      minute += 30;
      
      if (minute === 60) {
        hour += 1;
        minute = 0;
      }
    }
    
    setAvailableTimes(times);
  }, []);

  // Create or update appointment
  const { mutate: saveAppointment, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!customerId || !personnelId || !date || !time || !serviceId) {
        throw new Error("Lütfen tüm alanları doldurun");
      }
      
      const appointmentData = {
        musteri_id: parseInt(customerId),
        personel_id: parseInt(personnelId),
        tarih: format(date, "yyyy-MM-dd"),
        saat: time,
        durum: "beklemede",
        notlar: notes,
        islemler: [parseInt(serviceId)],
      };
      
      if (editAppointmentId) {
        return await randevuServisi.randevuGuncelle(editAppointmentId, appointmentData);
      } else {
        return await randevuServisi.randevuOlustur(appointmentData);
      }
    },
    onSuccess: () => {
      toast.success(
        editAppointmentId
          ? "Randevu başarıyla güncellendi"
          : "Randevu başarıyla oluşturuldu"
      );
      
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Error saving appointment:", error);
      toast.error(
        `Randevu ${editAppointmentId ? "güncellenirken" : "oluşturulurken"} bir hata oluştu: ${error.message}`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppointment();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editAppointmentId ? "Randevu Düzenle" : "Yeni Randevu Oluştur"}
          </DialogTitle>
          <DialogDescription>
            Lütfen randevu detaylarını girin.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Müşteri Seçin</Label>
            <Select
              value={customerId}
              onValueChange={setCustomerId}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Müşteri seçin" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCustomers ? (
                  <SelectItem value="loading" disabled>
                    Yükleniyor...
                  </SelectItem>
                ) : customers.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Müşteri bulunamadı
                  </SelectItem>
                ) : (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.first_name} {customer.last_name || ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori Seçin</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value);
                setServiceId(""); // Reset service when category changes
              }}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Önce kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="loading" disabled>
                    Yükleniyor...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Kategori bulunamadı
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.kategori_adi}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Hizmet Seçin</Label>
            <Select
              value={serviceId}
              onValueChange={setServiceId}
              disabled={isSaving || !categoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoryId ? "Hizmet seçin" : "Önce kategori seçin"} />
              </SelectTrigger>
              <SelectContent>
                {!categoryId ? (
                  <SelectItem value="nocategory" disabled>
                    Önce kategori seçin
                  </SelectItem>
                ) : isLoadingServices ? (
                  <SelectItem value="loading" disabled>
                    Yükleniyor...
                  </SelectItem>
                ) : services.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Hizmet bulunamadı
                  </SelectItem>
                ) : (
                  services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.islem_adi}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="personnel">Personel Seçin</Label>
            <Select
              value={personnelId}
              onValueChange={setPersonnelId}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Personel seçin" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPersonnel ? (
                  <SelectItem value="loading" disabled>
                    Yükleniyor...
                  </SelectItem>
                ) : personnel.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Personel bulunamadı
                  </SelectItem>
                ) : (
                  personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.ad_soyad}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tarih Seçin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={isSaving}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "d MMMM yyyy", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Saat Seçin</Label>
              <Select value={time} onValueChange={setTime} disabled={isSaving}>
                <SelectTrigger>
                  <SelectValue placeholder="Saat seçin" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {timeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Randevu hakkında notlar..."
              disabled={isSaving}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSaving || !customerId || !personnelId || !date || !time || !serviceId}
          >
            {isSaving
              ? "Kaydediliyor..."
              : editAppointmentId
              ? "Randevu Güncelle"
              : "Randevu Oluştur"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
