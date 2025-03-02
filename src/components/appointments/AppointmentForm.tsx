import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { useQuery } from "@tanstack/react-query";
import { Islem, Kategori, Personel, Randevu } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  islemServisi, 
  kategoriServisi, 
  personelServisi, 
  randevuServisi 
} from "@/lib/supabase";

interface AppointmentFormValues {
  category: number | null;
  services: number[];
  date: Date | null;
  time: string;
  personnel: string;
  notes: string;
}

interface AppointmentFormProps {
  onSubmit?: (data: AppointmentFormValues) => void;
  isSubmitting?: boolean;
  onAppointmentCreated?: (appointment: Randevu) => void;
  initialDate?: string;
}

const formSchema = z.object({
  category: z.number().optional(),
  services: z.array(z.number()),
  date: z.date().optional(),
  time: z.string().optional(),
  personnel: z.string().optional(),
  notes: z.string().optional(),
});

const defaultValues = {
  category: null,
  services: [],
  date: null,
  time: "09:00",
  personnel: "",
  notes: "",
};

export function AppointmentForm({
  onSubmit,
  isSubmitting = false,
  onAppointmentCreated,
  initialDate,
}: AppointmentFormProps) {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredServices, setFilteredServices] = useState<Islem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      date: initialDate ? new Date(initialDate) : null,
    },
  });

  const { data: islemlerData, isLoading: isLoadingIslemler } = useQuery({
    queryKey: ["islemler"],
    queryFn: async () => {
      return await islemServisi.hepsiniGetir();
    },
  });

  const { data: kategorilerData, isLoading: isLoadingKategoriler } = useQuery({
    queryKey: ["kategoriler"],
    queryFn: async () => {
      return await kategoriServisi.hepsiniGetir();
    },
  });

  const { data: personellerData, isLoading: isLoadingPersoneller } = useQuery({
    queryKey: ["personeller"],
    queryFn: async () => {
      return await personelServisi.hepsiniGetir();
    },
  });

  useEffect(() => {
    if (selectedCategory && islemlerData) {
      const filtered = islemlerData.filter(
        (islem) => islem.kategori_id === selectedCategory
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(islemlerData || []);
    }
  }, [selectedCategory, islemlerData]);

  const toggleService = (serviceId: number, field: any) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];
    setSelectedServices(newServices);
    field.onChange(newServices);
  };

  const handleFormSubmit = async (data: AppointmentFormValues) => {
    if (!data.date) {
      toast.error("Lütfen bir tarih seçin");
      return;
    }

    if (data.services.length === 0) {
      toast.error("Lütfen en az bir hizmet seçin");
      return;
    }

    try {
      setSubmitting(true);

      // If the external onSubmit is provided, use it
      if (onSubmit) {
        onSubmit(data);
        return;
      }

      // Otherwise, handle the submission ourselves
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Oturum açmanız gerekiyor");
        return;
      }

      const randevuData = {
        customer_id: user.id,
        personel_id: data.personnel ? parseInt(data.personnel) : undefined,
        tarih: format(data.date, 'yyyy-MM-dd'),
        saat: data.time || "09:00",
        durum: "beklemede" as const,
        notlar: data.notes,
        islemler: data.services,
      };

      const newRandevu = await randevuServisi.ekle(randevuData);
      
      toast.success("Randevunuz başarıyla oluşturuldu");
      
      // If onAppointmentCreated callback is provided, call it with the new appointment
      if (onAppointmentCreated) {
        onAppointmentCreated(newRandevu);
      }
      
      // Reset the form
      form.reset(defaultValues);
      setSelectedServices([]);
      setSelectedCategory(null);
      
    } catch (error) {
      console.error("Randevu oluşturulurken hata:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const availableTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Service Categories Selection */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hizmet Kategorisi</FormLabel>
              <Select
                onValueChange={(value) => {
                  const numValue = parseInt(value);
                  field.onChange(numValue);
                  setSelectedCategory(numValue);
                }}
                value={field.value?.toString() || ""}
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
                    <SelectItem value="empty" disabled>
                      Kategori bulunamadı
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Services Selection */}
        <FormField
          control={form.control}
          name="services"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hizmetler</FormLabel>
              <div className="bg-background border rounded-md p-4">
                <div className="grid grid-cols-1 gap-3">
                  {isLoadingIslemler ? (
                    <p className="text-sm text-muted-foreground">
                      Hizmetler yükleniyor...
                    </p>
                  ) : filteredServices && filteredServices.length > 0 ? (
                    filteredServices.map((islem) => (
                      <div
                        key={islem.id}
                        className={cn(
                          "flex justify-between items-center p-3 rounded-md border cursor-pointer hover:bg-accent",
                          selectedServices.includes(islem.id) &&
                            "bg-primary/10 border-primary"
                        )}
                        onClick={() => toggleService(islem.id, field)}
                      >
                        <span className="font-medium">{islem.islem_adi}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {islem.puan} Puan
                          </span>
                          <span className="text-sm font-semibold">
                            {islem.fiyat} ₺
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedCategory
                        ? "Bu kategoride hizmet bulunamadı"
                        : "Lütfen önce bir kategori seçin"}
                    </p>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Selection */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tarih</FormLabel>
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
                        format(field.value, "PPP", { locale: tr })
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
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Selection */}
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saat</FormLabel>
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
                      {field.value || "Saat seçin"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <ScrollArea className="h-60 w-full">
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={field.value === time ? "default" : "outline"}
                          className="h-8 w-full"
                          onClick={() => {
                            field.onChange(time);
                          }}
                          type="button"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personnel Selection */}
        <FormField
          control={form.control}
          name="personnel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personel (Opsiyonel)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Fark etmez</SelectItem>
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
                    <SelectItem value="empty" disabled>
                      Personel bulunamadı
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar (Opsiyonel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Randevu ile ilgili eklemek istediğiniz notlar..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Özel isteklerinizi veya dikkat edilmesini istediğiniz hususları
                buraya yazabilirsiniz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || submitting}>
          {isSubmitting || submitting ? "Randevu oluşturuluyor..." : "Randevu Oluştur"}
        </Button>
      </form>
    </Form>
  );
}
