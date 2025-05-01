
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, CirclePlus, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { randevuServisi, musteriServisi, personelServisi, islemServisi, kategoriServisi } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function StaffAppointmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch customers
  const { data: customers = [], isLoading: isCustomersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const data = await musteriServisi.hepsiniGetir();
      return data;
    },
  });

  // Fetch staff members
  const { data: staff = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const data = await personelServisi.hepsiniGetir();
      return data;
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await kategoriServisi.hepsiniGetir();
      return data;
    },
  });

  // Fetch services based on selected category
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ['services', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const categoryId = parseInt(selectedCategory, 10);
      const allServices = await islemServisi.hepsiniGetir();
      return allServices.filter(service => service.kategori_id === categoryId);
    },
    enabled: !!selectedCategory,
  });

  const handleServiceSelect = (serviceId: string) => {
    const id = parseInt(serviceId, 10);
    setSelectedServices((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error("Lütfen bir tarih seçin");
      return;
    }
    
    if (!selectedTime) {
      toast.error("Lütfen bir saat seçin");
      return;
    }
    
    if (!selectedCustomer) {
      toast.error("Lütfen bir müşteri seçin");
      return;
    }
    
    if (!selectedStaff) {
      toast.error("Lütfen bir personel seçin");
      return;
    }
    
    if (selectedServices.length === 0) {
      toast.error("Lütfen en az bir hizmet seçin");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format date as YYYY-MM-DD
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      const appointmentData = {
        musteri_id: parseInt(selectedCustomer),
        personel_id: parseInt(selectedStaff),
        tarih: formattedDate,
        saat: selectedTime,
        durum: "onaylandi",
        islemler: selectedServices,
        notlar: notes || undefined
      };
      
      const result = await randevuServisi.ekle(appointmentData);
      
      if (result) {
        toast.success("Randevu başarıyla oluşturuldu");
        
        // Reset form
        setSelectedDate(undefined);
        setSelectedTime("");
        setSelectedCustomer("");
        setSelectedStaff("");
        setSelectedCategory("");
        setNotes("");
        setSelectedServices([]);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error("Randevu oluşturulurken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create array of available time slots (30 min intervals between 9:00 - 21:00)
  const timeSlots = [];
  for (let i = 9; i <= 21; i++) {
    for (let j = 0; j < 60; j += 30) {
      timeSlots.push(`${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`);
    }
  }

  // Get service name by id
  const getServiceName = (id: number) => {
    const service = services.find((s: any) => s.id === id);
    return service ? service.islem_adi : "Bilinmeyen Hizmet";
  };
  
  return (
    <div className="w-full">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: tr })
                    ) : (
                      <span>Bir tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Saat</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Bir saat seçin" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Müşteri</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {isCustomersLoading ? (
                    <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                  ) : customers.length === 0 ? (
                    <SelectItem value="empty" disabled>Müşteri bulunamadı</SelectItem>
                  ) : (
                    customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.first_name} {customer.last_name || ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Personel</label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {isStaffLoading ? (
                    <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                  ) : staff.length === 0 ? (
                    <SelectItem value="empty" disabled>Personel bulunamadı</SelectItem>
                  ) : (
                    staff.map((person: any) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {person.ad_soyad}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {isCategoriesLoading ? (
                    <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="empty" disabled>Kategori bulunamadı</SelectItem>
                  ) : (
                    categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.kategori_adi}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Hizmetler</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {selectedCategory ? (
                isServicesLoading ? (
                  <div className="col-span-full text-center py-4">Hizmetler yükleniyor...</div>
                ) : services.length === 0 ? (
                  <div className="col-span-full text-center py-4">Bu kategoride hizmet bulunamadı</div>
                ) : (
                  services.map((service: any) => (
                    <Button
                      key={service.id}
                      type="button"
                      variant={selectedServices.includes(service.id) ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleServiceSelect(service.id.toString())}
                    >
                      {selectedServices.includes(service.id) ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <CirclePlus className="mr-2 h-4 w-4" />
                      )}
                      {service.islem_adi}
                    </Button>
                  ))
                )
              ) : (
                <div className="col-span-full text-center py-4 text-muted-foreground">
                  Lütfen önce bir kategori seçin
                </div>
              )}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedServices.map((serviceId) => (
                  <Badge 
                    key={serviceId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getServiceName(serviceId)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleServiceSelect(serviceId.toString())}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notlar</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Randevu için notlar ekleyin..."
              className="resize-none"
              rows={3}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor..." : "Randevu Oluştur"}
        </Button>
      </CardFooter>
    </div>
  );
}
