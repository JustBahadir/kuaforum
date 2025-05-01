
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { musteriServisi, personelServisi, islemServisi, randevuServisi, kategorilerServisi } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { RandevuDurumu } from "@/lib/supabase/types";
import { CalendarIcon } from "lucide-react";

// Define form schema with zod
const formSchema = z.object({
  musteri_id: z.coerce.number({
    required_error: "Müşteri seçimi zorunludur",
  }),
  kategori_id: z.coerce.number({
    required_error: "Kategori seçimi zorunludur",
  }),
  islem_id: z.coerce.number({
    required_error: "İşlem seçimi zorunludur",
  }),
  personel_id: z.coerce.number({
    required_error: "Personel seçimi zorunludur",
  }),
  tarih: z.date({
    required_error: "Tarih seçimi zorunludur",
  }),
  saat: z.string({
    required_error: "Saat seçimi zorunludur",
  }),
  durum: z.string().default("beklemede"),
  notlar: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StaffAppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultDate?: Date;
}

export function StaffAppointmentForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  defaultDate = new Date() 
}: StaffAppointmentFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<number | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tarih: defaultDate,
      durum: "beklemede",
      notlar: "",
    },
  });
  
  // Get customers
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        return await musteriServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
      }
    },
  });
  
  // Get categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        return await kategorilerServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
  });

  // Get services based on category
  const { data: services = [] } = useQuery({
    queryKey: ["services", selectedKategori],
    queryFn: async () => {
      if (!selectedKategori) return [];
      try {
        const allServices = await islemServisi.hepsiniGetir();
        return allServices.filter(service => service.kategori_id === selectedKategori);
      } catch (error) {
        console.error("Error fetching services:", error);
        return [];
      }
    },
    enabled: !!selectedKategori,
  });
  
  // Get personnel
  const { data: personnel = [] } = useQuery({
    queryKey: ["personnel"],
    queryFn: async () => {
      try {
        return await personelServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching personnel:", error);
        return [];
      }
    },
  });
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    const categoryId = parseInt(value, 10);
    setSelectedKategori(categoryId);
    // Reset service selection when category changes
    form.setValue("islem_id", 0);
  };

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 20; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const hourStr = hour.toString().padStart(2, "0");
        const minStr = min.toString().padStart(2, "0");
        slots.push(`${hourStr}:${minStr}`);
      }
    }
    return slots;
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      
      // Format date as YYYY-MM-DD
      const formattedDate = format(data.tarih, "yyyy-MM-dd");
      
      const appointmentData = {
        musteri_id: data.musteri_id,
        personel_id: data.personel_id,
        tarih: formattedDate,
        saat: data.saat,
        durum: data.durum as RandevuDurumu, // Use the correct type
        islemler: [data.islem_id], // Convert to array for the API
        notlar: data.notlar || ""
      };
      
      await randevuServisi.ekle(appointmentData);
      
      toast.success("Randevu başarıyla oluşturuldu.");
      form.reset();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(`Randevu oluşturulamadı: ${error.message || "Beklenmeyen bir hata oluştu."}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        tarih: defaultDate,
        durum: "beklemede",
        notlar: "",
      });
      setSelectedKategori(null);
    }
  }, [open, form, defaultDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="musteri_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Müşteri Seçin</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Müşteri seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.first_name} {customer.last_name || ""}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Kategori Seçin</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleCategoryChange(value);
                    }}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Önce kategori seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.kategori_adi}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Hizmet Seçin</FormLabel>
                  <Select
                    disabled={isLoading || !selectedKategori}
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedKategori ? "Hizmet seçin" : "Önce kategori seçin"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.islem_adi} ({service.fiyat} ₺)
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
                <FormItem className="flex flex-col">
                  <FormLabel>Personel Seçin</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Personel seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {personnel.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.ad_soyad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tarih"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tarih Seçin</FormLabel>
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
                              format(field.value, "dd MMMM yyyy", { locale: tr })
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
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Saat Seçin</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Saat seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {generateTimeSlots().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notlar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Randevu hakkında notlar..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? "Oluşturuluyor..." : "Randevu Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
