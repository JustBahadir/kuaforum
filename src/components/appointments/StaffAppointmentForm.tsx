import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, isBefore, isToday, set } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, UserPlus } from "lucide-react";
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
import { Islem, Kategori, Personel, Randevu, CalismaSaati } from "@/lib/supabase/types";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface StaffAppointmentFormProps {
  onAppointmentCreated?: (appointment: Randevu) => void;
  initialDate?: string;
  initialServiceId?: number;
}

interface StaffAppointmentFormValues {
  customerId: number;
  category: number;
  service: number;
  date: Date;
  time: string;
  personnel: string;
  notes: string;
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

export function StaffAppointmentForm({
  onAppointmentCreated,
  initialDate,
  initialServiceId,
}: StaffAppointmentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { dukkanId, userRole } = useCustomerAuth();
  const navigate = useNavigate();
  
  const form = useForm<StaffAppointmentFormValues>({
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

  // Get working hours for the shop
  const { data: calismaSaatleri = [] } = useQuery({
    queryKey: ["calisma_saatleri"],
    queryFn: calismaSaatleriServisi.hepsiniGetir,
  });

  const selectedCategory = form.watch("category");
  const selectedDate = form.watch("date");
  
  const filteredServices = React.useMemo(() => {
    if (!selectedCategory || !islemlerData) return [];
    return islemlerData.filter(islem => islem.kategori_id === selectedCategory);
  }, [selectedCategory, islemlerData]);

  // Update service selection when initialServiceId is provided
  useEffect(() => {
    if (initialServiceId && islemlerData) {
      const service = islemlerData.find(islem => islem.id === initialServiceId);
      if (service && service.kategori_id) {
        form.setValue('category', service.kategori_id);
        form.setValue('service', initialServiceId);
      }
    }
  }, [initialServiceId, islemlerData, form]);

  // Generate available times based on working hours for the selected day
  const availableTimes = React.useMemo(() => {
    if (!selectedDate || !calismaSaatleri.length) return [];
    
    // Get the day name in Turkish
    const dayName = format(selectedDate, 'EEEE', { locale: tr }).toLowerCase();
    
    // Find the working hours for the selected day
    const dayWorkingHours = calismaSaatleri.find(calisma => 
      calisma.gun.toLowerCase() === dayName
    );
    
    // If no working hours found or the shop is closed on this day, return empty array
    if (!dayWorkingHours || dayWorkingHours.kapali || !dayWorkingHours.acilis || !dayWorkingHours.kapanis) {
      return [];
    }
    
    // Parse opening and closing hours
    const [openHour, openMinute] = dayWorkingHours.acilis.split(':').map(Number);
    const [closeHour, closeMinute] = dayWorkingHours.kapanis.split(':').map(Number);
    
    const times: string[] = [];
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    // Generate times with 30-minute intervals
    // Stop 30 minutes before closing time
    while (
      currentHour < closeHour || 
      (currentHour === closeHour && currentMinute < closeMinute - 30)
    ) {
      times.push(
        `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
      );
      
      // Advance 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    return times;
  }, [selectedDate, calismaSaatleri]);

  // Custom calendar day validator
  const isDateDisabled = (date: Date) => {
    // Prevent selecting past dates
    if (isBefore(date, new Date()) && !isToday(date)) {
      return true;
    }
    
    // Check if the shop is closed on this day
    const dayName = format(date, 'EEEE', { locale: tr }).toLowerCase();
    const dayWorkingHours = calismaSaatleri.find(calisma => 
      calisma.gun.toLowerCase() === dayName
    );
    
    // If no working hours found or the shop is closed on this day, disable it
    return !dayWorkingHours || dayWorkingHours.kapali;
  };

  const handleFormSubmit = async (data: StaffAppointmentFormValues) => {
    try {
      setSubmitting(true);
      
      const randevuData = {
        dukkan_id: dukkanId,
        musteri_id: data.customerId,
        personel_id: parseInt(data.personnel),
        tarih: format(data.date, 'yyyy-MM-dd'),
        saat: data.time || "09:00",
        durum: "onaylandi" as const, // Staff-created appointments are automatically confirmed
        notlar: data.notes,
        islemler: [data.service],
        customer_id: undefined // This field will be null for staff-created appointments
      };

      const newRandevu = await randevuServisi.ekle(randevuData);
      
      toast.success("Randevu başarıyla oluşturuldu");
      
      if (onAppointmentCreated) {
        onAppointmentCreated(newRandevu);
      }
      
    } catch (error) {
      console.error("Randevu oluşturulurken hata:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewCustomerClick = () => {
    // Close the current dialog and navigate to the customers page with a query parameter
    // to open the new customer dialog
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
                  <UserPlus className="mr-2 h-4 w-4" />
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
                      onSelect={(date) => date && field.onChange(date)}
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
                  disabled={availableTimes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      availableTimes.length === 0 
                        ? "Bu gün için uygun saat yok" 
                        : "Saat seçin"
                    } />
                  </SelectTrigger>
                  <SelectContent className="h-[200px]">
                    <ScrollArea className="h-[200px]">
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Bu gün için uygun saat bulunamadı
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
