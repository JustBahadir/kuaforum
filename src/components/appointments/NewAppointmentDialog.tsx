import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { kategorilerServisi } from "@/lib/supabase/services/kategorilerServisi";
import { personelServisi } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

interface NewAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string | null;
  dukkanId?: number | null;
  onSuccess?: () => void;
}

export function NewAppointmentDialog({ 
  isOpen, 
  onOpenChange, 
  customerId, 
  dukkanId,
  onSuccess 
}: NewAppointmentDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedKategori, setSelectedKategori] = useState<string>("");
  const [selectedIslem, setSelectedIslem] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedPersonel, setSelectedPersonel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories for the given shop
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', dukkanId],
    queryFn: () => kategorilerServisi.hepsiniGetir(dukkanId || undefined),
    enabled: !!dukkanId,
  });

  // Fetch services for the selected category
  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ['services', selectedKategori],
    queryFn: async () => {
      if (!selectedKategori) return [];
      try {
        // Fix the method call to kategoriIslemleriniGetir
        return await islemServisi.kategoriIslemleriniGetir(parseInt(selectedKategori));
      } catch (error) {
        console.error("Error fetching services:", error);
        return [];
      }
    },
    enabled: !!selectedKategori
  });

  // Fetch staff for the shop
  const { data: staff = [] } = useQuery({
    queryKey: ['staff', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      try {
        const data = await personelServisi.hepsiniGetir(dukkanId);
        return data || [];
      } catch (error) {
        console.error("Error fetching staff:", error);
        return [];
      }
    },
    enabled: !!dukkanId
  });

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Reset form fields
  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedKategori("");
    setSelectedIslem("");
    setSelectedPersonel("");
    setNotes("");
  };

  // Update services when category changes
  useEffect(() => {
    if (selectedKategori) {
      refetchServices();
    }
    setSelectedIslem("");
  }, [selectedKategori, refetchServices]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedDate) {
      toast.error("Lütfen bir tarih seçin");
      return;
    }

    if (!selectedTime) {
      toast.error("Lütfen bir saat seçin");
      return;
    }

    if (!selectedIslem) {
      toast.error("Lütfen bir işlem seçin");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedService = services.find(s => s.id.toString() === selectedIslem);
      
      if (!selectedService) {
        toast.error("Seçilen işlem bulunamadı");
        setIsSubmitting(false);
        return;
      }

      const randevuData = {
        tarih: format(selectedDate, 'yyyy-MM-dd'),
        saat: selectedTime,
        islemler: [
          {
            id: parseInt(selectedIslem),
            islem_adi: selectedService.islem_adi,
            fiyat: selectedService.fiyat
          }
        ],
        musteri_id: null, // Legacy field
        customer_id: customerId,
        dukkan_id: dukkanId,
        personel_id: selectedPersonel ? parseInt(selectedPersonel) : null,
        notlar: notes,
        durum: "onaylandi"
      };

      // Change from ekle to randevuOlustur which exists in the service
      await randevuServisi.randevuOlustur(randevuData);
      toast.success("Randevu başarıyla oluşturuldu");
      
      if (onSuccess) {
        onSuccess();
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Randevu oluşturulurken hata:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots for the day
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        slots.push(`${hourFormatted}:${minuteFormatted}`);
      }
    }
    return slots;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Randevu</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Date Selection */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="date">Tarih</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP', { locale: tr }) : <span>Tarih seçin</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time Selection */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="time">Saat</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Saat seçin" />
                </SelectTrigger>
                <SelectContent>
                  {getTimeSlots().map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Category Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="kategori">Kategori</Label>
            <Select value={selectedKategori} onValueChange={setSelectedKategori}>
              <SelectTrigger id="kategori">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.kategori_adi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Service Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="islem">İşlem</Label>
            <Select value={selectedIslem} onValueChange={setSelectedIslem} disabled={!selectedKategori}>
              <SelectTrigger id="islem">
                <SelectValue placeholder="İşlem seçin" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.islem_adi} - {service.fiyat} TL
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Staff Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="personel">Personel (İsteğe Bağlı)</Label>
            <Select value={selectedPersonel} onValueChange={setSelectedPersonel}>
              <SelectTrigger id="personel">
                <SelectValue placeholder="Personel seçin (isteğe bağlı)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Belirtilmedi</SelectItem>
                {staff.map((person) => (
                  <SelectItem key={person.id} value={person.id.toString()}>
                    {person.ad_soyad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="notes">Notlar</Label>
            <Input 
              id="notes" 
              placeholder="Randevu notları (isteğe bağlı)" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">İptal</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Randevu Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
