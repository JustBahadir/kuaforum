
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { personelServisi, randevuServisi } from "@/lib/supabase";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { CalismaSaati, Randevu, RandevuDurumu } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentFormProps {
  onAppointmentCreated: (appointment: Randevu) => void;
  initialDate?: string;
  initialServiceId?: number;
}

export function AppointmentForm({ onAppointmentCreated, initialDate, initialServiceId }: AppointmentFormProps) {
  const { dukkanId, userId } = useCustomerAuth();
  const [selectedDate, setSelectedDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(initialServiceId || null);
  const [selectedPersonel, setSelectedPersonel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  
  // Queries for data
  const { data: personeller = [], isLoading: isLoadingPersoneller } = useQuery({
    queryKey: ['personeller'],
    queryFn: personelServisi.hepsiniGetir
  });
  
  const { data: kategoriler = [], isLoading: isLoadingKategoriler } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: kategoriServisi.hepsiniGetir
  });
  
  const { data: islemler = [], isLoading: isLoadingIslemler } = useQuery({
    queryKey: ['islemler', selectedCategory],
    queryFn: () => islemServisi.kategoriIslemleriGetir(selectedCategory || 0),
    enabled: !!selectedCategory
  });
  
  // Fetch available times when the date changes
  const fetchAvailableTimes = async (date: string) => {
    if (!dukkanId) return;
    
    try {
      setIsFetchingTimes(true);
      
      // Get the day of the week
      const dayOfWeek = new Date(date).getDay();
      // Convert to our internal format
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
      
      // Generate time slots
      const slots = generateTimeSlots(dayHours.acilis, dayHours.kapanis);
      setAvailableTimes(slots);
    } catch (error) {
      console.error("Error fetching available times:", error);
      // Fallback to default hours
      const defaultSlots = generateTimeSlots('09:00', '19:00');
      setAvailableTimes(defaultSlots);
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
    
    // Generate slots until 30 minutes before closing
    while (currentMinutes < closingMinutes - 30) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
      
      // Add 30 minutes for next slot
      currentMinutes += 30;
    }
    
    return slots;
  };
  
  // Handle date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchAvailableTimes(date);
  };
  
  // Create appointment mutation
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
          <SelectTrigger id="time" onClick={() => fetchAvailableTimes(selectedDate)}>
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
