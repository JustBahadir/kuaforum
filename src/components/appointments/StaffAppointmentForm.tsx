
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { musteriServisi, personelServisi, randevuServisi } from "@/lib/supabase";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { CalismaSaati, RandevuDurumu } from "@/lib/supabase/types";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneInput } from "@/components/ui/phone-input";

interface StaffAppointmentFormProps {
  onAppointmentCreated: () => void;
  initialDate?: string;
}

interface FormValues {
  musteri_id: number;
  personel_id: number;
  tarih: string;
  saat: string;
  islemler: number[];
  notlar: string;
}

export function StaffAppointmentForm({ onAppointmentCreated, initialDate }: StaffAppointmentFormProps) {
  const navigate = useNavigate();
  const { dukkanId, userRole } = useCustomerAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      tarih: initialDate || format(new Date(), 'yyyy-MM-dd'),
      saat: "",
      notlar: ""
    }
  });
  
  const selectedDate = watch('tarih');
  
  // Queries for data
  const { data: musteriler = [], isLoading: isLoadingMusteriler } = useQuery({
    queryKey: ['musteriler', dukkanId],
    queryFn: () => musteriServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId
  });
  
  const { data: personeller = [], isLoading: isLoadingPersoneller } = useQuery({
    queryKey: ['personeller'],
    queryFn: personelServisi.hepsiniGetir
  });
  
  const { data: kategoriler = [], isLoading: isLoadingKategoriler } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: () => kategoriServisi.hepsiniGetir()
  });
  
  const { data: islemler = [], isLoading: isLoadingIslemler } = useQuery({
    queryKey: ['islemler', selectedCategory],
    queryFn: () => islemServisi.kategoriIslemleriGetir(selectedCategory || 0),
    enabled: !!selectedCategory
  });
  
  // Fetch available time slots when the date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate]);
  
  const fetchAvailableTimes = async (date: string) => {
    if (!dukkanId) return;
    
    try {
      setIsFetchingTimes(true);
      
      // Allow past dates
      const selected = new Date(date);
      const now = new Date();
      const isToday = selected.toDateString() === now.toDateString();
      
      // Get the day of the week
      const dayOfWeek = selected.getDay();
      const dayNames = ["pazar", "pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi"];
      const dayName = dayNames[dayOfWeek];
      
      // Get working hours for this shop
      const workingHours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
      console.log("Fetched working hours:", workingHours);
      
      // Find working hours for this day
      const dayHours = workingHours.find((h: CalismaSaati) => h.gun === dayName);
      console.log("Day hours for", dayName, ":", dayHours);
      
      if (!dayHours || dayHours.kapali || !dayHours.acilis || !dayHours.kapanis) {
        setAvailableTimes([]);
        return;
      }
      
      // Generate time slots from opening to closing
      const slots = generateTimeSlots(dayHours.acilis, dayHours.kapanis, isToday);
      console.log("Generated time slots:", slots);
      setAvailableTimes(slots);
    } catch (error) {
      console.error("Error fetching available times:", error);
      
      // Fallback - generate default time slots for the selected day
      const defaultSlots = generateTimeSlots('09:00', '19:00', false);
      setAvailableTimes(defaultSlots);
    } finally {
      setIsFetchingTimes(false);
    }
  };
  
  const generateTimeSlots = (openingTime: string, closingTime: string, isToday: boolean) => {
    const slots = [];
    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);
    
    let currentMinutes = openHour * 60 + openMinute;
    const closingMinutes = closeHour * 60 + closeMinute;
    
    if (isToday) {
      const now = new Date();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      // Add buffer to current time (30 min)
      const roundedMinutes = Math.ceil((currentTimeMinutes + 30) / 30) * 30;
      currentMinutes = Math.max(currentMinutes, roundedMinutes);
    }
    
    while (currentMinutes < closingMinutes - 30) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
      
      currentMinutes += 30;
    }
    
    return slots;
  };
  
  // Create appointment mutation
  const { mutate: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!dukkanId) {
        throw new Error("Dükkan ID bulunamadı");
      }
      
      const randevuData = {
        ...data,
        dukkan_id: dukkanId,
        durum: "onaylandi" as RandevuDurumu,
      };
      
      return randevuServisi.ekle(randevuData);
    },
    onSuccess: () => {
      toast.success("Randevu başarıyla oluşturuldu");
      onAppointmentCreated();
    },
    onError: (error: any) => {
      console.error("Randevu oluşturma hatası:", error);
      toast.error(`Randevu eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  });
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(Number(categoryId));
    // Reset selected service when category changes
    setSelectedService(null);
  };
  
  const handleServiceChange = (serviceId: string) => {
    const id = Number(serviceId);
    setSelectedService(id);
    setValue('islemler', [id]);
  };
  
  const onSubmit = (data: FormValues) => {
    // Use selected service
    if (selectedService) {
      data.islemler = [selectedService];
    } else {
      toast.error("Bir hizmet seçmelisiniz");
      return;
    }
    
    createAppointment(data);
  };
  
  const handleAddCustomer = () => {
    navigate("/admin/customers/new");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="musteri">Müşteri Seçin</Label>
        <Select 
          onValueChange={(value) => setValue('musteri_id', Number(value))} 
          required
          value={watch('musteri_id')?.toString() || ""}
        >
          <SelectTrigger id="musteri">
            <SelectValue placeholder="Müşteri seçin" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingMusteriler ? (
              <div className="p-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full mt-2" />
              </div>
            ) : musteriler.length === 0 ? (
              <SelectItem value="empty" disabled>
                Kayıtlı müşteri bulunamadı
              </SelectItem>
            ) : (
              musteriler
                .sort((a, b) => a.first_name.localeCompare(b.first_name))
                .map((musteri) => (
                  <SelectItem key={musteri.id} value={musteri.id.toString()}>
                    {musteri.first_name} {musteri.last_name || ""}
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={handleAddCustomer}
      >
        Yeni Müşteri Ekle
      </Button>
      
      <div className="space-y-2">
        <Label htmlFor="kategori">Kategori Seçin</Label>
        <Select onValueChange={handleCategoryChange} value={selectedCategory?.toString() || ""}>
          <SelectTrigger id="kategori">
            <SelectValue placeholder="Kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingKategoriler ? (
              <div className="p-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full mt-2" />
              </div>
            ) : (
              kategoriler.map((kategori) => (
                <SelectItem key={kategori.id} value={kategori.id.toString()}>
                  {kategori.kategori_adi}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hizmet">Hizmet Seçin</Label>
        <Select 
          onValueChange={handleServiceChange}
          disabled={!selectedCategory || isLoadingIslemler}
          value={selectedService?.toString() || ""}
        >
          <SelectTrigger id="hizmet">
            <SelectValue placeholder={
              !selectedCategory 
                ? "Önce kategori seçin" 
                : "Hizmet seçin"
            } />
          </SelectTrigger>
          <SelectContent>
            {isLoadingIslemler ? (
              <div className="p-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full mt-2" />
              </div>
            ) : islemler.length === 0 ? (
              <SelectItem value="empty" disabled>
                Bu kategoride işlem bulunamadı
              </SelectItem>
            ) : (
              islemler.map((islem) => (
                <SelectItem 
                  key={islem.id} 
                  value={islem.id.toString()}
                >
                  {islem.islem_adi} - {islem.fiyat} TL
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="personel">Personel Seçin</Label>
        <Select 
          onValueChange={(value) => setValue('personel_id', Number(value))}
          required
          value={watch('personel_id')?.toString() || ""}
        >
          <SelectTrigger id="personel">
            <SelectValue placeholder="Personel seçin" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingPersoneller ? (
              <div className="p-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full mt-2" />
              </div>
            ) : personeller.length === 0 ? (
              <SelectItem value="empty" disabled>
                Kayıtlı personel bulunamadı
              </SelectItem>
            ) : (
              personeller.map((personel) => (
                <SelectItem key={personel.id} value={personel.id.toString()}>
                  {personel.ad_soyad}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tarih">Tarih Seçin</Label>
        <Input 
          id="tarih" 
          type="date" 
          {...register('tarih', { required: true })}
          min={undefined} // Allow past dates
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="saat">Saat Seçin</Label>
        <Select 
          onValueChange={(value) => setValue('saat', value)}
          required
          value={watch('saat') || ""}
        >
          <SelectTrigger id="saat">
            <SelectValue placeholder={
              isFetchingTimes 
                ? "Saatler yükleniyor..." 
                : availableTimes.length === 0
                  ? (userRole === "customer" || !userRole ? "Seçilen tarihte müsait saat yok" : "")
                  : "Saat seçin"
            } />
          </SelectTrigger>
          <SelectContent>
            {isFetchingTimes ? (
              <div className="p-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full mt-2" />
              </div>
            ) : availableTimes.length === 0 ? (
              userRole === "customer" || !userRole ? (
                <SelectItem value="empty" disabled>
                  Seçilen tarihte müsait saat yok
                </SelectItem>
              ) : null
            ) : (
              availableTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notlar">Notlar (Opsiyonel)</Label>
        <Textarea id="notlar" placeholder="Randevu hakkında notlar..." {...register('notlar')} />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isCreating}
      >
        {isCreating ? "Randevu Oluşturuluyor..." : "Randevu Oluştur"}
      </Button>
    </form>
  );
}
