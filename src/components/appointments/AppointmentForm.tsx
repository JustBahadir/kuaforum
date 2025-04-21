
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useNavigate } from "react-router-dom";
import { useShopData } from "@/hooks/useShopData";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useOperations } from "@/hooks/useOperations";
import { usePersonnel } from "@/hooks/usePersonnel";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  date: z.date({
    required_error: "Lütfen bir tarih seçin."
  }),
  time: z.string({
    required_error: "Lütfen bir saat seçin."
  }),
  service: z.string({
    required_error: "Lütfen bir hizmet seçin."
  }),
  personnel: z.string({
    required_error: "Lütfen bir personel seçin."
  }),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function AppointmentForm({ shopId }: { shopId: number }) {
  const { userId } = useCustomerAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState("");
  const { isletmeData } = useShopData(shopId);
  const { data: operations } = useOperations(shopId);
  const { data: personnel } = usePersonnel(shopId);

  // useAvailableTimeSlots returns UseQueryResult<string[], Error>
  const { data: availableTimeSlots, isLoading: timeSlotsLoading } = useAvailableTimeSlots({
    date: selectedDate,
    shopId,
    personnelId: selectedPersonnelId ? Number(selectedPersonnelId) : undefined,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined,
      time: "",
      service: "",
      personnel: "",
      notes: ""
    }
  });

  // Reset time when date or personnel changes
  useEffect(() => {
    form.setValue("time", "");
  }, [selectedDate, selectedPersonnelId, form]);

  // Filter personnel by selected service
  const filteredPersonnel = React.useMemo(() => {
    if (!selectedServiceId || !personnel) return personnel;
    // If no service is selected, show all personnel
    return personnel.filter((person) => {
      // Check if this person can perform the selected service
      const canPerformService = person.hizmetler?.some((service) => service.id.toString() === selectedServiceId);
      return canPerformService;
    });
  }, [selectedServiceId, personnel]);

  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast.error("Randevu oluşturmak için giriş yapmalısınız.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date and time for database
      const appointmentDate = new Date(values.date);
      const [hours, minutes] = values.time.split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Get service details
      const selectedService = operations?.find((op) => op.id.toString() === values.service);

      if (!selectedService) {
        toast.error("Seçilen hizmet bulunamadı.");
        setIsSubmitting(false);
        return;
      }

      // Calculate end time based on service duration
      const endDate = new Date(appointmentDate);
      endDate.setMinutes(endDate.getMinutes() + (selectedService.sure || 30));

      // Create appointment
      const { data, error } = await supabase.from("randevular").insert([
        {
          musteri_id: userId,
          personel_id: Number(values.personnel),
          isletme_id: shopId,
          hizmet_id: Number(values.service),
          baslangic_zamani: appointmentDate.toISOString(),
          bitis_zamani: endDate.toISOString(),
          notlar: values.notes || null,
          durum: "beklemede"
        }
      ]);

      if (error) {
        console.error("Randevu oluşturma hatası:", error);
        toast.error("Randevu oluşturulurken bir hata oluştu.");
        return;
      }

      toast.success("Randevunuz başarıyla oluşturuldu!");
      queryClient.invalidateQueries({
        queryKey: [
          "appointments"
        ]
      });

      // Reset form
      form.reset();
      setSelectedDate(undefined);
      setSelectedServiceId("");
      setSelectedPersonnelId("");

      // Navigate to appointments page
      navigate("/appointments");
    } catch (error) {
      console.error("Randevu oluşturma hatası:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form} className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      variant="outline"
                      className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP", { locale: tr }) : <span>Tarih seçin</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setSelectedDate(date || undefined);
                    }}
                    disabled={(date) => {
                      // Disable past dates and dates more than 30 days in the future
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const thirtyDaysLater = new Date();
                      thirtyDaysLater.setDate(today.getDate() + 30);
                      return date < today || date > thirtyDaysLater ||
                        // Disable Sundays (0 is Sunday in JavaScript)
                        date.getDay() === 0;
                    }}
                    initialFocus={true}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hizmet</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedServiceId(value);
                  // Reset personnel when service changes
                  form.setValue("personnel", "");
                  setSelectedPersonnelId("");
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hizmet seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {operations?.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id.toString()}>
                      {operation.ad} - {operation.fiyat}₺ ({operation.sure} dk)
                    </SelectItem>
                  ))}
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
              <FormLabel>Personel</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedPersonnelId(value);
                }}
                value={field.value}
                disabled={!selectedServiceId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedServiceId ? "Personel seçin" : "Önce hizmet seçin"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredPersonnel?.length > 0 ? filteredPersonnel.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.ad} {person.soyad}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-personnel" disabled>
                      Bu hizmet için personel bulunamadı
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
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saat</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedDate || !selectedPersonnelId || timeSlotsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedDate ? "Önce tarih seçin" :
                          !selectedPersonnelId ? "Önce personel seçin" :
                            timeSlotsLoading ? "Yükleniyor..." : "Saat seçin"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTimeSlots?.length > 0 ? availableTimeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-slots" disabled>
                      {timeSlotsLoading ? "Yükleniyor..." : "Uygun saat bulunamadı"}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar (İsteğe bağlı)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Randevu ile ilgili eklemek istediğiniz notlar..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Randevu Oluşturuluyor..." : "Randevu Oluştur"}
        </Button>
      </form>
    </Form>
  );
}
