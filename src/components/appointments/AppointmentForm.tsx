
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
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
import { supabase } from "@/lib/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AppointmentFormProps {
  onSubmit?: (data: AppointmentFormValues) => void;
  isSubmitting?: boolean;
  onAppointmentCreated?: (appointment: Randevu) => void;
  initialDate?: string;
  initialServiceId?: number;
}

interface AppointmentFormValues {
  category: number | null;
  services: number[];
  date: Date | null;
  time: string;
  personnel: string;
  notes: string;
}

const formSchema = z.object({
  category: z.number().nullable(),
  services: z.array(z.number()),
  date: z.date().nullable(),
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
  initialServiceId,
}: AppointmentFormProps) {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'category' | 'services' | 'details'>(
    initialServiceId ? 'details' : 'category'
  );

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

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      date: initialDate ? new Date(initialDate) : null,
      services: initialServiceId ? [initialServiceId] : [],
    },
  });

  // Get filtered services based on selected category
  const filteredServices = React.useMemo(() => {
    if (!selectedCategory || !islemlerData) return [];
    return islemlerData.filter(islem => islem.kategori_id === selectedCategory);
  }, [selectedCategory, islemlerData]);

  // Initialize selectedServices with initialServiceId if provided
  useEffect(() => {
    if (initialServiceId) {
      setSelectedServices(initialServiceId ? [initialServiceId] : []);
    }
  }, [initialServiceId]);

  // Set category when initial service is provided
  useEffect(() => {
    if (initialServiceId && islemlerData) {
      const service = islemlerData.find(islem => islem.id === initialServiceId);
      if (service && service.kategori_id) {
        setSelectedCategory(service.kategori_id);
        form.setValue('category', service.kategori_id);
        setStep('details');
      }
    }
  }, [initialServiceId, islemlerData, form]);

  const toggleService = (serviceId: number, field: any) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];
    setSelectedServices(newServices);
    field.onChange(newServices);
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    form.setValue('category', categoryId);
    setStep('services');
  };

  const handleServiceSelect = () => {
    if (selectedServices.length === 0) {
      toast.error("Lütfen en az bir hizmet seçin");
      return;
    }
    setStep('details');
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
        personel_id: data.personnel && data.personnel !== "" ? parseInt(data.personnel) : undefined,
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
      setStep('category');
      
    } catch (error) {
      console.error("Randevu oluşturulurken hata:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Step 1: Category Selection */}
        {step === 'category' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Adım 1: Kategori Seçimi</h3>
            <p className="text-sm text-gray-500">Lütfen hizmet kategorisi seçin</p>
            
            <div className="grid grid-cols-1 gap-3">
              {isLoadingKategoriler ? (
                <div className="text-center p-4">Kategoriler yükleniyor...</div>
              ) : (
                kategorilerData?.map((kategori) => (
                  <Button
                    key={kategori.id}
                    type="button"
                    variant={selectedCategory === kategori.id ? "default" : "outline"}
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => handleCategorySelect(kategori.id)}
                  >
                    {kategori.kategori_adi}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Services Selection */}
        {step === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Adım 2: Hizmet Seçimi</h3>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('category')}
              >
                Geri
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              {selectedCategory && kategorilerData 
                ? `${kategorilerData.find(k => k.id === selectedCategory)?.kategori_adi} kategorisinden hizmet seçin`
                : 'Lütfen hizmet seçin'}
            </p>
            
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <div className="bg-background border rounded-md p-3">
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {isLoadingIslemler ? (
                        <p className="text-sm text-muted-foreground p-2">
                          Hizmetler yükleniyor...
                        </p>
                      ) : filteredServices.length > 0 ? (
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
                        <p className="text-sm text-muted-foreground p-2">
                          Bu kategoride hizmet bulunamadı
                        </p>
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="button" 
              onClick={handleServiceSelect} 
              disabled={selectedServices.length === 0}
              className="w-full"
            >
              Devam Et
            </Button>
          </div>
        )}

        {/* Step 3: Appointment Details */}
        {step === 'details' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Adım 3: Randevu Detayları</h3>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('services')}
              >
                Geri
              </Button>
            </div>
            
            {/* Selected Category and Services (collapsible) */}
            <Collapsible open={servicesOpen} onOpenChange={setServicesOpen} className="border rounded-md">
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 rounded-t-md">
                  <h4 className="font-medium">Seçilen Hizmetler</h4>
                  {servicesOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0 border-t">
                {selectedCategory && islemlerData && kategorilerData && (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-medium">
                      Kategori: {kategorilerData.find(k => k.id === selectedCategory)?.kategori_adi}
                    </p>
                    <p className="text-sm font-medium mb-1">Hizmetler:</p>
                    <ul className="space-y-1">
                      {selectedServices.map(serviceId => {
                        const service = islemlerData.find(s => s.id === serviceId);
                        return service ? (
                          <li key={service.id} className="text-sm flex justify-between">
                            <span>{service.islem_adi}</span>
                            <span>{service.fiyat} ₺</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "09:00"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Saat seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
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
                    value={field.value || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Personel seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Fark etmez</SelectItem>
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
          </div>
        )}

        {/* Submit button - only visible on the final step */}
        {step === 'details' && (
          <Button type="submit" disabled={isSubmitting || submitting} className="w-full">
            {isSubmitting || submitting ? "Randevu oluşturuluyor..." : "Randevu Oluştur"}
          </Button>
        )}
      </form>
    </Form>
  );
}
