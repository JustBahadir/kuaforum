
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { 
  personelServisi, 
  musteriServisi, 
  randevuServisi, 
  kategoriServisi, 
  islemServisi 
} from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RandevuDurumu } from "@/lib/supabase/types";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Form schema with validation
const appointmentSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunludur"),
  personnelId: z.string().min(1, "Personel seçimi zorunludur"),
  categoryId: z.string().min(1, "Kategori seçimi zorunludur"),
  serviceId: z.string().min(1, "Hizmet seçimi zorunludur"),
  date: z.date({
    required_error: "Tarih seçimi zorunludur",
  }),
  time: z.string().min(1, "Saat seçimi zorunludur"),
  notes: z.string().optional(),
});

export function NewAppointmentDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: NewAppointmentDialogProps) {
  const { dukkanId } = getCurrentDukkanId();
  const [selectedKategoriId, setSelectedKategoriId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Helper function to get dukkan id for the component
  async function getCurrentDukkanId() {
    const [id, setId] = useState<number | null>(null);
    
    useEffect(() => {
      const fetchDukkanId = async () => {
        try {
          const dukkanId = await randevuServisi.getCurrentDukkanId();
          setId(dukkanId);
        } catch (error) {
          console.error("Error fetching dukkan ID:", error);
        }
      };
      
      fetchDukkanId();
    }, []);
    
    return { dukkanId: id };
  }
  
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerId: "",
      personnelId: "",
      categoryId: "",
      serviceId: "",
      time: "",
      notes: "",
    }
  });
  
  // Reset the form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset();
      setSelectedKategoriId(null);
    }
  }, [open, form]);

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", dukkanId],
    queryFn: () => kategoriServisi.hepsiniGetir(dukkanId ? dukkanId : undefined),
    enabled: !!dukkanId && open,
  });

  // Fetch services based on selected category
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", selectedKategoriId],
    queryFn: () => 
      islemServisi.kategoriIdyeGoreGetir(
        selectedKategoriId ? parseInt(selectedKategoriId) : 0, 
        dukkanId
      ),
    enabled: !!selectedKategoriId && open,
  });

  // Fetch personnel
  const { data: personnel = [], isLoading: isLoadingPersonnel } = useQuery({
    queryKey: ["personnel", dukkanId],
    queryFn: () => personelServisi.hepsiniGetir(dukkanId ? dukkanId : undefined),
    enabled: !!dukkanId && open,
  });

  // Fetch customers
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers", dukkanId],
    queryFn: () => musteriServisi.hepsiniGetir(dukkanId ? dukkanId : undefined),
    enabled: !!dukkanId && open,
  });

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    form.setValue("categoryId", categoryId);
    setSelectedKategoriId(categoryId);
    form.setValue("serviceId", ""); // Reset service when category changes
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof appointmentSchema>) => {
    if (!dukkanId) {
      toast.error("Dükkan bilgisi bulunamadı");
      return;
    }
    
    try {
      setIsSaving(true);
      
      const appointmentData = {
        dukkan_id: dukkanId,
        musteri_id: parseInt(data.customerId),
        personel_id: parseInt(data.personnelId),
        tarih: format(data.date, "yyyy-MM-dd"),
        saat: data.time,
        durum: "onaylandi" as RandevuDurumu,
        notlar: data.notes || "",
        islemler: JSON.stringify([parseInt(data.serviceId)]),
      };
      
      await randevuServisi.randevuOlustur(appointmentData);
      toast.success("Randevu başarıyla oluşturuldu");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Randevu oluşturma hatası:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate time slots (30 min intervals from 9:00 to 20:00)
  const timeSlots = [];
  for (let hour = 9; hour < 21; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 20 && minute === 30) continue; // Skip 20:30
      timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Müşteri</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingCustomers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Müşteri seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCustomers ? (
                          <div className="flex justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : customers.length > 0 ? (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.first_name} {customer.last_name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Müşteri bulunamadı
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Personnel Selection */}
              <FormField
                control={form.control}
                name="personnelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personel</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingPersonnel}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Personel seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingPersonnel ? (
                          <div className="flex justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : personnel.length > 0 ? (
                          personnel.map((person) => (
                            <SelectItem key={person.id} value={person.id.toString()}>
                              {person.ad_soyad}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Personel bulunamadı
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => handleCategoryChange(value)}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <div className="flex justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.kategori_adi}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Kategori bulunamadı
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Service Selection */}
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hizmet</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingServices || !selectedKategoriId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedKategoriId ? "Hizmet seçin" : "Önce kategori seçin"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingServices ? (
                          <div className="flex justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : services.length > 0 ? (
                          services.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.islem_adi} - {service.fiyat} ₺
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            {selectedKategoriId 
                              ? "Bu kategoride hizmet bulunamadı" 
                              : "Lütfen önce kategori seçin"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
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
                              format(field.value, "d MMMM yyyy", { locale: tr })
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
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Saat seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
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
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Randevu ile ilgili notlar..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Randevu Oluştur
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
