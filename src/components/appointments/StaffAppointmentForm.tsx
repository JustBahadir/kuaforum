
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
  const { dukkanId } = useCustomerAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
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
      
      // Get the day of the week (0 for Sunday, 1 for Monday, etc.)
      const dayOfWeek = new Date(date).getDay();
      // Convert to our internal format (pazartesi, sali, etc.)
      const dayNames = ["pazar", "pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi"];
      const dayName = dayNames[dayOfWeek];
      
      // Get working hours for this shop
      const workingHours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
      
      // Find working hours for this day
      const dayHours = workingHours.find((h: CalismaSaati) => h.gun === dayName);
      
      if (!dayHours || dayHours.kapali || !dayHours.acilis || !dayHours.kapanis) {
        setAvailableTimes([]);
        return;
      }
      
      // Generate time slots from opening to closing with 30-minute intervals
      const slots = generateTimeSlots(dayHours.acilis, dayHours.kapanis);
      setAvailableTimes(slots);
    } catch (error) {
      console.error("Error fetching available times:", error);
      toast.error("Müsait saatler yüklenirken bir hata oluştu");
    } finally {
      setIsFetchingTimes(false);
    }
  };
  
  const generateTimeSlots = (openingTime: string, closingTime: string) => {
    const slots = [];
    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);
    
    let currentMinutes = openHour * 60 + openMinute;
    const closingMinutes = closeHour * 60 + closeMinute;
    
    // Generate slots until 30 minutes before closing time
    while (currentMinutes < closingMinutes - 30) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
      
      // Add 30 minutes for the next slot
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
    // Reset selected services when category changes
    setSelectedServices([]);
  };
  
  const handleServiceChange = (serviceId: string) => {
    const id = Number(serviceId);
    
    // Toggle service selection
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };
  
  const onSubmit = (data: FormValues) => {
    // Use selected services from state
    data.islemler = selectedServices;
    
    if (selectedServices.length === 0) {
      toast.error("En az bir hizmet seçmelisiniz");
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
        <Select onValueChange={handleCategoryChange}>
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
        >
          <SelectTrigger id="hizmet">
            <SelectValue placeholder={
              !selectedCategory 
                ? "Önce kategori seçin" 
                : selectedServices.length > 0 
                  ? `${selectedServices.length} hizmet seçildi` 
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
                  className={selectedServices.includes(islem.id) ? "bg-primary/10" : ""}
                >
                  {islem.islem_adi} - {islem.fiyat} TL
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        {selectedServices.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedServices.map(id => {
              const service = islemler.find(i => i.id === id);
              return service ? (
                <div key={id} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center">
                  {service.islem_adi}
                  <button 
                    type="button"
                    onClick={() => setSelectedServices(selectedServices.filter(s => s !== id))}
                    className="ml-2 text-primary hover:text-primary/80 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="personel">Personel Seçin</Label>
        <Select onValueChange={(value) => setValue('personel_id', Number(value))} required>
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
          min={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="saat">Saat Seçin</Label>
        <Select onValueChange={(value) => setValue('saat', value)} required>
          <SelectTrigger id="saat">
            <SelectValue placeholder={
              isFetchingTimes 
                ? "Saatler yükleniyor..." 
                : availableTimes.length === 0 
                  ? "Seçilen tarihte müsait saat yok" 
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
              <SelectItem value="empty" disabled>
                Seçilen tarihte müsait saat yok
              </SelectItem>
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
