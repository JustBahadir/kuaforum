
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { personelServisi, randevuServisi } from "@/lib/supabase";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { CalismaSaati, Randevu, RandevuDurumu } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";

interface AppointmentFormProps {
  onAppointmentCreated: (appointment: Randevu) => void;
  initialDate?: string;
  initialServiceId?: number;
}

export function AppointmentForm({ onAppointmentCreated, initialDate, initialServiceId }: AppointmentFormProps) {
  const { dukkanId, userId } = useCustomerAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(initialServiceId || null);
  const [selectedPersonel, setSelectedPersonel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  
  const { data: personeller = [], isLoading: isLoadingPersoneller } = useQuery({
    queryKey: ['personeller'],
    queryFn: personelServisi.hepsiniGetir,
    staleTime: 300000 // 5 minutes
  });
  
  const { data: kategoriler = [], isLoading: isLoadingKategoriler } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: kategoriServisi.hepsiniGetir,
    staleTime: 300000 // 5 minutes
  });
  
  const { data: islemler = [], isLoading: isLoadingIslemler } = useQuery({
    queryKey: ['islemler', selectedCategory],
    queryFn: () => islemServisi.kategoriIslemleriGetir(selectedCategory || 0),
    enabled: !!selectedCategory,
    staleTime: 300000 // 5 minutes
  });
  
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
  
  const fetchAvailableTimes = async (date: string) => {
    if (!dukkanId) return;
    
    try {
      setIsFetchingTimes(true);
      console.log(`Fetching available times for date: ${date}`);
      
      const selected = new Date(date);
      const now = new Date();
      const isToday = selected.getDate() === now.getDate() && 
                      selected.getMonth() === now.getMonth() && 
                      selected.getFullYear() === now.getFullYear();
      
      const dayOfWeek = selected.getDay();
      const dayNames = ["pazar", "pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi"];
      const dayName = dayNames[dayOfWeek];
      
      console.log(`Day of week: ${dayName}, Dukkan ID: ${dukkanId}`);
      
      const workingHours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
      console.log("Working hours retrieved:", workingHours);
      
      const dayHours = workingHours.find((h: CalismaSaati) => h.gun === dayName);
      console.log("Hours for this day:", dayHours);
      
      if (!dayHours || dayHours.kapali || !dayHours.acilis || !dayHours.kapanis) {
        console.log("Shop is closed or working hours not set for this day");
        setAvailableTimes([]);
        return;
      }
      
      const slots = generateTimeSlots(dayHours.acilis, dayHours.kapanis, isToday);
      console.log("Generated time slots:", slots);
      setAvailableTimes(slots);
    } catch (error) {
      console.error("Error fetching available times:", error);
      // Fallback
      const isToday = new Date(date).toDateString() === new Date().toDateString();
      const defaultSlots = generateTimeSlots('09:00', '19:00', isToday);
      console.log("Using fallback time slots:", defaultSlots);
      setAvailableTimes(defaultSlots);
    } finally {
      setIsFetchingTimes(false);
    }
  };
  
  // Force fetch times when component mounts or date changes
  React.useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate, dukkanId]);
  
  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchAvailableTimes(date);
  };
  
  const { mutate: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      if (!dukkanId || !userId || !selectedPersonel || !selectedService) {
        throw new Error("Gerekli bilgiler eksik");
      }
      
      const randevuData = {
        dukkan_id: dukkanId,
        customer_id: userId,
        personel_id: selectedPersonel,
        tarih: selectedDate,
        saat: selectedTime,
        durum: "onaylandi" as RandevuDurumu,
        islemler: [selectedService],
        notlar: notes
      };
      
      return randevuServisi.ekle(randevuData);
    },
    onSuccess: (data) => {
      // Force update shop statistics
      personelIslemleriServisi.updateShopStatistics().catch(error => {
        console.error("Error updating statistics after appointment creation:", error);
      });
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['shop-statistics'] });
      
      toast.success("Randevu başarıyla oluşturuldu");
      onAppointmentCreated(data);
    },
    onError: (error: any) => {
      console.error("Randevu oluşturma hatası:", error);
      toast.error(`Randevu eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  });
  
  const handleCreateAppointment = () => {
    if (!selectedDate) {
      toast.error("Lütfen bir tarih seçin");
      return;
    }
    
    if (!selectedTime) {
      toast.error("Lütfen bir saat seçin");
      return;
    }
    
    if (!selectedService) {
      toast.error("Lütfen bir hizmet seçin");
      return;
    }
    
    if (!selectedPersonel) {
      toast.error("Lütfen bir personel seçin");
      return;
    }
    
    createAppointment();
  };
  
  const isFormValid = selectedDate && selectedTime && selectedService && selectedPersonel;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select onValueChange={(value) => setSelectedCategory(Number(value))}>
          <SelectTrigger id="category">
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
        <Label htmlFor="service">Hizmet</Label>
        <Select 
          onValueChange={(value) => setSelectedService(Number(value))}
          disabled={!selectedCategory || isLoadingIslemler}
          value={selectedService?.toString()}
        >
          <SelectTrigger id="service">
            <SelectValue placeholder={!selectedCategory ? "Önce kategori seçin" : "Hizmet seçin"} />
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
                <SelectItem key={islem.id} value={islem.id.toString()}>
                  {islem.islem_adi} - {islem.fiyat} TL
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="personel">Personel</Label>
        <Select onValueChange={(value) => setSelectedPersonel(Number(value))}>
          <SelectTrigger id="personel">
            <SelectValue placeholder="Personel seçin" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingPersoneller ? (
              <div className="p-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full mt-2" />
              </div>
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
        <Label htmlFor="date">Tarih</Label>
        <Input 
          id="date" 
          type="date" 
          value={selectedDate}
          onChange={handleDateChange}
          min={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">Saat</Label>
        <Select onValueChange={setSelectedTime}>
          <SelectTrigger id="time">
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
        <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
        <Textarea 
          id="notes" 
          placeholder="Randevu hakkında notlar..." 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleCreateAppointment}
        disabled={!isFormValid || isCreating}
      >
        {isCreating ? "Randevu Oluşturuluyor..." : "Randevu Oluştur"}
      </Button>
    </div>
  );
}
