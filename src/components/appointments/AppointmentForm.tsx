import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { personelServisi, randevuServisi } from "@/lib/supabase";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { CalismaSaati, RandevuDurumu } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { PhoneInputField } from "@/pages/Customers/components/FormFields/PhoneInputField";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AppointmentFormProps {
  onAppointmentCreated: (appointment: any) => void;
  initialDate?: string;
  initialServiceId?: number;
  initialCustomerId?: number;
}

export function AppointmentForm({ onAppointmentCreated, initialDate, initialServiceId, initialCustomerId }: AppointmentFormProps) {
  const { dukkanId, userId, userRole } = useCustomerAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(initialServiceId || null);
  const [selectedPersonel, setSelectedPersonel] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(initialCustomerId || null);
  const [notes, setNotes] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [phone, setPhone] = React.useState("");

  useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  const { data: personeller = [], isLoading: isLoadingPersoneller } = useQuery({
    queryKey: ['personeller'],
    queryFn: personelServisi.hepsiniGetir,
    staleTime: 300000
  });

  const { data: kategoriler = [], isLoading: isLoadingKategoriler } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: kategoriServisi.hepsiniGetir,
    staleTime: 300000
  });

  const { data: islemler = [], isLoading: isLoadingIslemler } = useQuery({
    queryKey: ['islemler', selectedCategory],
    queryFn: () => islemServisi.kategoriIslemleriGetir(selectedCategory || 0),
    enabled: !!selectedCategory,
    staleTime: 300000
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
    if (!dukkanId) {
      setAvailableTimes([]);
      return;
    }

    try {
      setIsFetchingTimes(true);
      const selected = new Date(date);
      const now = new Date();
      const isToday = selected.toDateString() === now.toDateString();

      const dayOfWeek = selected.getDay();
      const dayNames = ["pazar", "pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi"];
      const dayName = dayNames[dayOfWeek];

      const workingHours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);

      const dayHours = workingHours.find((h: CalismaSaati) => h.gun === dayName);

      if (!dayHours || dayHours.kapali || !dayHours.acilis || !dayHours.kapanis) {
        setAvailableTimes([]);
        return;
      }

      const slots = generateTimeSlots(dayHours.acilis, dayHours.kapanis, isToday);

      setAvailableTimes(slots);
    } catch (error) {
      console.error("Error fetching available times:", error);
      const fallbackSlots = generateTimeSlots('09:00', '19:00', false);
      setAvailableTimes(fallbackSlots);
    } finally {
      setIsFetchingTimes(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate, dukkanId]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchAvailableTimes(date);
  };

  const toggleCalendar = () => setShowCalendar(prev => !prev);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(Number(value));
  };

  const createAppointmentData = {
    dukkan_id: dukkanId,
    customer_id: String(selectedCustomerId),
    personel_id: selectedPersonel,
    tarih: selectedDate,
    saat: selectedTime,
    durum: "onaylandi" as RandevuDurumu,
    islemler: [selectedService],
    notlar: notes
  };

  const { mutate: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      if (!dukkanId || !selectedCustomerId || !selectedPersonel || !selectedService) {
        throw new Error("Gerekli bilgiler eksik");
      }
      return randevuServisi.ekle(createAppointmentData);
    },
    onSuccess: (data) => {
      personelIslemleriServisi.updateShopStatistics().catch(error => {
        console.error("Error updating statistics after appointment creation:", error);
      });

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

  useEffect(() => {
    if (!initialCustomerId && userRole === "customer" && userId) {
      setSelectedCustomerId(userId);
    }
  }, [initialCustomerId, userRole, userId]);

  const handleCreateAppointment = () => {
    if (!selectedDate) {
      toast.error("Lütfen bir tarih seçin");
      return;
    }

    if (!selectedTime) {
      if (userRole === "customer" || !userRole) {
        toast.error("Lütfen bir saat seçin");
        return;
      }
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

  const handleUndo = () => {
    setSelectedCategory(null);
    setSelectedService(null);
    setSelectedPersonel(null);
    setSelectedDate(initialDate || format(new Date(), 'yyyy-MM-dd'));
    setSelectedTime("");
    setNotes("");
    setPhone("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select onValueChange={handleCategoryChange} value={selectedCategory?.toString() || ""}>
          <SelectTrigger id="category">
            <div className="flex items-center justify-between pr-2">
              <SelectValue placeholder="Kategori seçin" />
              <CalendarIcon className="ml-2 h-5 w-5 text-gray-900" />
            </div>
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
        <Select onValueChange={(value) => setSelectedPersonel(Number(value))} value={selectedPersonel?.toString() || ""}>
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

      <div className="space-y-2 relative">
        <Label htmlFor="date">Tarih</Label>
        <div className="relative flex items-center gap-2">
          <Input 
            id="date" 
            type="date" 
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="GG.AA.YYYY"
            className="flex-grow"
          />
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                aria-label="Takvimi Aç/Kapat"
                className="p-2"
                type="button"
              >
                <CalendarIcon className="h-5 w-5 text-gray-800" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white rounded-md shadow-md">
              <Calendar 
                mode="single" 
                selected={new Date(selectedDate)} 
                onSelect={(date) => {
                  if (date) {
                    const formattedDate = format(date, 'yyyy-MM-dd');
                    setSelectedDate(formattedDate);
                    fetchAvailableTimes(formattedDate);
                    setShowCalendar(false);
                  }
                }} 
                locale={tr}
                initialFocus
                className="pointer-events-auto rounded-md bg-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Saat</Label>
        <Select onValueChange={setSelectedTime} value={selectedTime}>
          <SelectTrigger id="time">
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
        <Label htmlFor="phone">Telefon</Label>
        <PhoneInputField 
          id="phone" 
          value={phone} 
          onChange={setPhone} 
          placeholder="05xx xxx xx xx" 
        />
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

      <div className="flex justify-between gap-4">
        <Button 
          variant="outline"
          type="button"
          onClick={handleUndo}
        >
          Geri Al
        </Button>
        <Button 
          className="flex-grow" 
          onClick={handleCreateAppointment}
          disabled={!isFormValid || isCreating}
        >
          {isCreating ? "Randevu Oluşturuluyor..." : "Randevu Oluştur"}
        </Button>
      </div>
    </div>
  );
}
