
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { randevuServisi, kategoriServisi, islemServisi, musteriServisi, personelServisi } from "@/lib/supabase";
import { toast } from "sonner";

interface NewAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewAppointmentDialog({ isOpen, onOpenChange, onSuccess }: NewAppointmentDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [selectedMusteriId, setSelectedMusteriId] = useState<number | null>(null);
  const [selectedPersonelId, setSelectedPersonelId] = useState<number | null>(null);
  const [selectedKategoriId, setSelectedKategoriId] = useState<number | null>(null);
  const [selectedIslemIds, setSelectedIslemIds] = useState<number[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Get current dukkan_id
  const { data: dukkanIdResult } = useQuery({
    queryKey: ['dukkanId'],
    queryFn: async () => {
      const id = await musteriServisi.getCurrentUserDukkanId();
      return { dukkanId: id };
    }
  });

  const dukkanId = dukkanIdResult?.dukkanId;

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers', dukkanId],
    queryFn: () => musteriServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId,
  });

  // Fetch personnel
  const { data: personnel = [] } = useQuery({
    queryKey: ['personnel', dukkanId],
    queryFn: () => personelServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', dukkanId],
    queryFn: () => kategoriServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId,
  });

  // Fetch services based on selected category
  const { data: services = [] } = useQuery({
    queryKey: ['services', selectedKategoriId, dukkanId],
    queryFn: () => islemServisi.kategoriIdyeGoreGetir(selectedKategoriId || 0, dukkanId),
    enabled: !!selectedKategoriId && !!dukkanId,
  });

  // Create range of available time slots
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  // Handle form reset
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(new Date());
      setSelectedTime("09:00");
      setSelectedMusteriId(null);
      setSelectedPersonelId(null);
      setSelectedKategoriId(null);
      setSelectedIslemIds([]);
      setNotes("");
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMusteriId || !selectedPersonelId || selectedIslemIds.length === 0 || !selectedDate || !selectedTime) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    
    try {
      setLoading(true);
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // Use the insert method since randevuServisi.randevuOlustur doesn't exist
      await supabase
        .from('randevular')
        .insert({
          dukkan_id: dukkanId,
          musteri_id: selectedMusteriId,
          personel_id: selectedPersonelId,
          tarih: formattedDate,
          saat: selectedTime,
          durum: "onaylandi",
          notlar: notes,
          islemler: selectedIslemIds
        });
      
      toast.success("Randevu başarıyla oluşturuldu");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(`Randevu oluşturulurken hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Müşteri</label>
              <Select value={selectedMusteriId?.toString()} onValueChange={(value) => setSelectedMusteriId(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((musteri) => (
                    <SelectItem key={musteri.id} value={musteri.id.toString()}>
                      {musteri.first_name} {musteri.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Personel</label>
              <Select value={selectedPersonelId?.toString()} onValueChange={(value) => setSelectedPersonelId(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((personel) => (
                    <SelectItem key={personel.id} value={personel.id.toString()}>
                      {personel.ad_soyad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select value={selectedKategoriId?.toString()} onValueChange={(value) => setSelectedKategoriId(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((kategori) => (
                    <SelectItem key={kategori.id} value={kategori.id.toString()}>
                      {kategori.kategori_adi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Hizmet</label>
              <Select 
                value={selectedIslemIds.length > 0 ? selectedIslemIds[0].toString() : ""} 
                onValueChange={(value) => setSelectedIslemIds([Number(value)])}
                disabled={!selectedKategoriId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hizmet seçin" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((islem) => (
                    <SelectItem key={islem.id} value={islem.id.toString()}>
                      {islem.islem_adi} - {islem.fiyat} ₺
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Saat</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Saat seçin" />
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
          
            <div className="space-y-2">
              <label className="text-sm font-medium">Notlar (opsiyonel)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Randevu için notlar..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "Randevu Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
