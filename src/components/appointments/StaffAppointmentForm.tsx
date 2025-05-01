
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { personelServisi, islemServisi, kategorilerServisi, musteriServisi, randevuServisi } from "@/lib/supabase";

// Schema definition
const FormSchema = z.object({
  musteri_id: z.string().min(1, { message: "Müşteri seçiniz" }),
  personel_id: z.string().min(1, { message: "Personel seçiniz" }),
  kategori_id: z.string().min(1, { message: "Kategori seçiniz" }),
  islem_id: z.string().min(1, { message: "Hizmet seçiniz" }),
  tarih: z.date({ required_error: "Tarih seçiniz" }),
  saat: z.string().min(1, { message: "Saat seçiniz" }),
  notlar: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export interface StaffAppointmentFormProps {
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  initialData?: Partial<FormValues>;
}

export function StaffAppointmentForm({ onSubmit, onCancel, initialData }: StaffAppointmentFormProps) {
  const [selectedKategoriId, setSelectedKategoriId] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      musteri_id: initialData?.musteri_id || "",
      personel_id: initialData?.personel_id || "",
      kategori_id: initialData?.kategori_id || "",
      islem_id: initialData?.islem_id || "",
      tarih: initialData?.tarih || new Date(),
      saat: initialData?.saat || "",
      notlar: initialData?.notlar || "",
    },
  });

  // Queries
  const { data: musteriler = [], isLoading: isLoadingMusteriler } = useQuery({
    queryKey: ['musteriler'],
    queryFn: () => musteriServisi.hepsiniGetir(),
  });

  const { data: personel = [], isLoading: isLoadingPersonel } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir(),
  });

  const { data: kategoriler = [], isLoading: isLoadingKategoriler } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: () => kategorilerServisi.hepsiniGetir(),
  });

  const { data: islemler = [], isLoading: isLoadingIslemler } = useQuery({
    queryKey: ['islemler', selectedKategoriId],
    queryFn: () => islemServisi.hepsiniGetir(),
    enabled: !!selectedKategoriId,
  });

  // Generate time slots
  useEffect(() => {
    const slots = [];
    for (let hour = 9; hour <= 19; hour++) {
      for (let min = 0; min < 60; min += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
    }
    setTimeSlots(slots);
  }, []);

  // Handle kategori change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "kategori_id") {
        setSelectedKategoriId(value.kategori_id as string || null);
        form.setValue("islem_id", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Submit handler
  const handleSubmit = (values: FormValues) => {
    try {
      onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu");
    }
  };

  const filteredIslemler = selectedKategoriId 
    ? islemler.filter(islem => islem.kategori_id.toString() === selectedKategoriId)
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="musteri_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Müşteri Seçin</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {musteriler.map((musteri) => (
                    <SelectItem key={musteri.id} value={musteri.id.toString()}>
                      {musteri.first_name} {musteri.last_name || ""}
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
          name="personel_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personel Seçin</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {personel.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.ad_soyad}
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
          name="kategori_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Seçin</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {kategoriler.map((kategori) => (
                    <SelectItem key={kategori.id} value={kategori.id.toString()}>
                      {kategori.kategori_adi}
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
          name="islem_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hizmet Seçin</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedKategoriId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hizmet seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredIslemler.map((islem) => (
                    <SelectItem key={islem.id} value={islem.id.toString()}>
                      {islem.islem_adi} - {islem.fiyat} ₺
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
          name="tarih"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tarih</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
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
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="saat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saat</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Saat seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
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
          name="notlar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar (opsiyonel)</FormLabel>
              <FormControl>
                <Textarea placeholder="Randevu için notlar..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button type="submit">Randevu Oluştur</Button>
        </div>
      </form>
    </Form>
  );
}
