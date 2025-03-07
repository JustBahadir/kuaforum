
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { CalismaSaati, Randevu } from "@/lib/supabase/types";
import { 
  islemServisi, 
  kategoriServisi, 
  personelServisi, 
  randevuServisi,
  dukkanServisi,
  calismaSaatleriServisi
} from "@/lib/supabase";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { CustomerSelection } from "./CustomerSelection";
import { gunIsimleri } from "@/components/operations/constants/workingDays";
import { useNavigate } from "react-router-dom";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";

interface StaffAppointmentFormProps {
  onAppointmentCreated?: (appointment: Randevu) => void;
  initialDate?: string;
  initialServiceId?: number;
}

const formSchema = z.object({
  customerId: z.number({
    required_error: "Müşteri seçilmelidir",
  }),
  category: z.number({
    required_error: "Kategori seçilmelidir",
  }),
  service: z.number({
    required_error: "Hizmet seçilmelidir",
  }),
  date: z.date({
    required_error: "Tarih seçilmelidir",
  }),
  time: z.string({
    required_error: "Saat seçilmelidir",
  }),
  personnel: z.string({
    required_error: "Personel seçilmelidir",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function StaffAppointmentForm({
  onAppointmentCreated,
  initialDate,
  initialServiceId,
}: StaffAppointmentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { dukkanId, userRole } = useCustomerAuth();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: undefined,
      category: 0,
      service: initialServiceId || 0,
      date: initialDate ? new Date(initialDate) : new Date(),
      time: "09:00",
      personnel: "",
      notes: "",
    },
  });

  const { data: kategorilerData, isLoading: isLoadingKategoriler } = useQuery({
    queryKey: ["kategoriler"],
    queryFn: async () => {
      return await kategoriServisi.hepsiniGetir();
    },
  });

  const { data: islemlerData, isLoading: isLoadingIslemler } = useQuery({
    queryKey: ["islemler"],
    queryFn: async () => {
      return await islemServisi.hepsiniGetir();
    },
  });

  const { data: personellerData, isLoading: isLoadingPersoneller } = useQuery({
    queryKey: ["personeller"],
    queryFn: async () => {
      return await personelServisi.hepsiniGetir();
    },
  });

  const { data: dukkanData } = useQuery({
    queryKey: ["dukkan", dukkanId],
    queryFn: async () => {
      if (!dukkanId) return null;
      return await dukkanServisi.getirById(dukkanId);
    },
    enabled: !!dukkanId,
  });

  const { data: calismaSaatleri = [] } = useQuery({
    queryKey: ["calisma_saatleri", dukkanId],
    queryFn: async () => {
      try {
        console.log("StaffAppointmentForm: Fetching working hours for shop ID:", dukkanId);
        if (dukkanId) {
          const data = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
          console.log("StaffAppointmentForm: Fetched working hours:", data);
          return data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching working hours:", error);
        return [];
      }
    },
    enabled: !!dukkanId
  });

  const selectedCategory = form.watch("category");
  const selectedDate = form.watch("date");
  
  const filteredServices = React.useMemo(() => {
    if (!selectedCategory || !islemlerData) return [];
    return islemlerData.filter(islem => islem.kategori_id === selectedCategory);
  }, [selectedCategory, islemlerData]);

  useEffect(() => {
    if (initialServiceId && islemlerData) {
      const service = islemlerData.find(islem => islem.id === initialServiceId);
      if (service && service.kategori_id) {
        form.setValue('category', service.kategori_id);
        form.setValue('service', initialServiceId);
      }
    }
  }, [initialServiceId, islemlerData, form]);

  // Mevcut gün için saat aralıklarını hesapla
  const getTimeSlots = (date: Date, saatler: CalismaSaati[]) => {
    // Gün adını al (küçük harfle)
    const dayName = format(date, 'EEEE', { locale: tr }).toLowerCase();
    
    // Seçilen güne ait çalışma saatlerini bul
    const dayWorkingHours = saatler.find(saat => 
      saat.gun.toLowerCase() === dayName
    );
    
    // Çalışma saati yoksa veya kapalıysa boş array döndür
    if (!dayWorkingHours || dayWorkingHours.kapali || !dayWorkingHours.acilis || !dayWorkingHours.kapanis) {
      console.log(`${dayName} günü için çalışma saati bulunamadı veya kapalı.`);
      return [];
    }
    
    console.log(`${dayName} günü çalışma saatleri:`, dayWorkingHours.acilis, "to", dayWorkingHours.kapanis);
    
    // Açılış ve kapanış saatlerini parçala
    const [openHour, openMinute] = dayWorkingHours.acilis.split(':').map(Number);
    const [closeHour, closeMinute] = dayWorkingHours.kapanis.split(':').map(Number);
    
    // Saat aralıklarını oluştur
    const timeSlots: string[] = [];
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    // Kapanıştan 30 dakika öncesine kadar 30'ar dakikalık randevu saatleri oluştur
    while (
      currentHour < closeHour || 
      (currentHour === closeHour && currentMinute <= closeMinute - 30)
    ) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      timeSlots.push(timeStr);
      
      // 30 dakika ekle
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    console.log("Oluşturulan saat dilimleri:", timeSlots);
    return timeSlots;
  };

  const availableTimes = React.useMemo(() => {
    if (!selectedDate || !calismaSaatleri || calismaSaatleri.length === 0) {
      return [];
    }
    
    return getTimeSlots(selectedDate, calismaSaatleri);
  }, [selectedDate, calismaSaatleri]);

  // Takvimde kapalı günleri devre dışı bırak
  const isDateDisabled = (date: Date) => {
    // Gün adını al ve dükkanın o gün kapalı olup olmadığını kontrol et
    const dayName = format(date, 'EEEE', { locale: tr }).toLowerCase();
    const dayWorkingHours = calismaSaatleri.find(saat => 
      saat.gun.toLowerCase() === dayName
    );
    
    // Sadece çalışma saati bilgisi VAR ise ve dükkan açıkça kapalı ise devre dışı bırak
    if (dayWorkingHours && dayWorkingHours.kapali) {
      return true;
    }
    
    // Bu gün için çalışma saati yoksa, seçime izin ver (varsayılan olarak açık)
    return false;
  };

  const handleFormSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      console.log("Form verileri gönderiliyor:", data);
      
      if (!dukkanId) {
        toast.error("Dükkan ID bulunamadı");
        return;
      }
      
      // Müşteri bilgilerini al
      const customerDetails = await musteriServisi.getirById(data.customerId);
      console.log("Müşteri bilgileri alındı:", customerDetails);
      
      if (!customerDetails) {
        toast.error("Müşteri bilgileri alınamadı");
        return;
      }
      
      // Randevu verilerini doğru formatta hazırla
      const formattedDate = format(data.date, 'yyyy-MM-dd');
      
      const randevuData = {
        dukkan_id: dukkanId,
        musteri_id: data.customerId,
        personel_id: parseInt(data.personnel),
        tarih: formattedDate,
        saat: data.time,
        durum: "onaylandi" as const,
        notlar: data.notes || "",
        islemler: [data.service],
        customer_id: customerDetails.auth_id || null // Auth ID yoksa null olarak gönder
      };
      
      console.log("Randevu verileri gönderiliyor:", randevuData);

      // Randevuyu oluştur
      const newRandevu = await randevuServisi.ekle(randevuData);
      console.log("Yeni randevu oluşturuldu:", newRandevu);
      
      toast.success("Randevu başarıyla oluşturuldu");
      
      if (onAppointmentCreated && newRandevu) {
        onAppointmentCreated(newRandevu);
      }
      
    } catch (error: any) {
      console.error("Randevu oluşturulurken hata:", error);
      toast.error(error.message || "Randevu oluşturulurken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewCustomerClick = () => {
    navigate("/customers?new=true");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Müşteri Seçin*</FormLabel>
              <CustomerSelection 
                dukkanId={dukkanId}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleNewCustomerClick}
                >
                  Yeni Müşteri Ekle
                </Button>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Kategori Seçin*</FormLabel>
              <Select
                disabled={isLoadingKategoriler}
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                  form.setValue('service', 0);
                }}
                value={field.value ? field.value.toString() : undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingKategoriler ? (
                    <SelectItem value="loading" disabled>
                      Yükleniyor...
                    </SelectItem>
                  ) : kategorilerData && kategorilerData.length > 0 ? (
                    kategorilerData.map((kategori) => (
                      <SelectItem
                        key={kategori.id}
                        value={kategori.id.toString()}
                      >
                        {kategori.kategori_adi}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Kategori bulunamadı
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Hizmet Seçin*</FormLabel>
              <Select
                disabled={!selectedCategory || isLoadingIslemler}
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value ? field.value.toString() : undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hizmet seçin" />
                </SelectTrigger>
                <SelectContent>
                  {!selectedCategory ? (
                    <SelectItem value="none" disabled>
                      Önce kategori seçin
                    </SelectItem>
                  ) : isLoadingIslemler ? (
                    <SelectItem value="loading" disabled>
                      Yükleniyor...
                    </SelectItem>
                  ) : filteredServices && filteredServices.length > 0 ? (
                    filteredServices.map((islem) => (
                      <SelectItem
                        key={islem.id}
                        value={islem.id.toString()}
                      >
                        {islem.islem_adi} - {islem.fiyat} ₺ ({islem.puan} Puan)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Bu kategoride hizmet bulunamadı
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personnel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Personel Seçin*</FormLabel>
              <Select
                disabled={isLoadingPersoneller}
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPersoneller ? (
                    <SelectItem value="loading" disabled>
                      Yükleniyor...
                    </SelectItem>
                  ) : personellerData && personellerData.length > 0 ? (
                    personellerData.map((personel) => (
                      <SelectItem
                        key={personel.id}
                        value={personel.id.toString()}
                      >
                        {personel.ad_soyad}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Personel bulunamadı
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base">Tarih*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd.MM.yyyy", { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                          // Tarih değiştiğinde saatleri hesapla
                          setTimeout(() => {
                            const newTimes = getTimeSlots(date, calismaSaatleri);
                            if (newTimes && newTimes.length > 0) {
                              form.setValue('time', newTimes[0]);
                            } else {
                              form.setValue('time', '');
                            }
                          }, 0);
                        }
                      }}
                      disabled={isDateDisabled}
                      initialFocus
                      locale={tr}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Saat*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!availableTimes || availableTimes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !availableTimes || availableTimes.length === 0 
                        ? "Saat seçin" 
                        : "Saat seçin"
                    } />
                  </SelectTrigger>
                  <SelectContent className="h-[200px]">
                    <ScrollArea className="h-[200px]">
                      {availableTimes && availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Lütfen başka bir tarih seçin
                        </SelectItem>
                      )}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Notlar</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Personele özel notlar (Müşteri talepleri, dikkat edilmesi gereken hususlar...)"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Randevu ile ilgili personele özel notları buraya yazabilirsiniz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={submitting} 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {submitting ? "İşleniyor..." : "Randevu Oluştur"}
        </Button>
      </form>
    </Form>
  );
}
