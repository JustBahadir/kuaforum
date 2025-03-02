
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase/client";
import { Islem, Personel, Randevu } from "@/lib/supabase/types";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { toast } from "sonner";

interface AppointmentFormProps {
  onAppointmentCreated: (appointment: Randevu) => void;
  initialDate?: string;
}

export function AppointmentForm({ onAppointmentCreated, initialDate }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [islemler, setIslemler] = useState<Islem[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [selectedIslem, setSelectedIslem] = useState<number | null>(null);
  const [selectedPersonel, setSelectedPersonel] = useState<number | null>(null);
  const [date, setDate] = useState(initialDate || "");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [isPersonelRequestChecked, setIsPersonelRequestChecked] = useState(false);

  // Load services and personnel on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load services
        const islemlerData = await islemServisi.hepsiniGetir();
        setIslemler(islemlerData);
        
        // Load personnel
        const personellerData = await personelServisi.hepsiniGetir();
        setPersoneller(personellerData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
      }
    };
    
    loadData();
  }, []);

  // Reset form
  const resetForm = () => {
    setSelectedIslem(null);
    setSelectedPersonel(null);
    setDate(initialDate || "");
    setTime("09:00");
    setNotes("");
    setIsPersonelRequestChecked(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form
      if (!selectedIslem) {
        toast.error("Lütfen bir hizmet seçin");
        return;
      }
      
      if (!date) {
        toast.error("Lütfen tarih seçin");
        return;
      }
      
      if (!time) {
        toast.error("Lütfen saat seçin");
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Randevu oluşturmak için giriş yapmanız gerekiyor");
        return;
      }
      
      console.log("Creating appointment with data:", {
        islemler: [selectedIslem],
        personel_id: isPersonelRequestChecked ? null : selectedPersonel,
        tarih: date,
        saat: time,
        durum: "beklemede",
        notlar: notes,
        customer_id: user.id  // Add the customer_id field
      });
      
      // Create appointment
      const appointment = await randevuServisi.ekle({
        islemler: [selectedIslem],
        personel_id: isPersonelRequestChecked ? null : selectedPersonel,
        tarih: date,
        saat: time,
        durum: "beklemede",
        notlar: notes,
        customer_id: user.id  // Add the customer_id field
      });
      
      // Notify parent component
      onAppointmentCreated(appointment);
      resetForm();
      
    } catch (error) {
      console.error("Randevu kaydedilirken hata:", error);
      toast.error("Randevu oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Generate available time slots (every 30 minutes from 9 AM to 6 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 18 && minute === 30) continue; // Skip 18:30 as the last appointment is at 18:00
        
        const formattedHour = String(hour).padStart(2, "0");
        const formattedMinute = String(minute).padStart(2, "0");
        const timeValue = `${formattedHour}:${formattedMinute}`;
        
        slots.push(
          <SelectItem key={timeValue} value={timeValue}>
            {timeValue}
          </SelectItem>
        );
      }
    }
    return slots;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="service">Hizmet Seçin*</Label>
        <Select
          value={selectedIslem?.toString() || ""}
          onValueChange={(value) => setSelectedIslem(Number(value))}
        >
          <SelectTrigger id="service">
            <SelectValue placeholder="Hizmet seçin" />
          </SelectTrigger>
          <SelectContent>
            {islemler.map((islem) => (
              <SelectItem key={islem.id} value={islem.id.toString()}>
                {islem.islem_adi} - {islem.fiyat} ₺
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="request-personnel"
            checked={isPersonelRequestChecked}
            onCheckedChange={(checked) => {
              setIsPersonelRequestChecked(checked === true);
              if (checked) {
                setSelectedPersonel(null);
              }
            }}
          />
          <label
            htmlFor="request-personnel"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Personel atamasını salona bırak
          </label>
        </div>
      </div>
      
      {!isPersonelRequestChecked && (
        <div className="space-y-2">
          <Label htmlFor="personnel">Personel Seçin</Label>
          <Select
            value={selectedPersonel?.toString() || ""}
            onValueChange={(value) => setSelectedPersonel(Number(value))}
          >
            <SelectTrigger id="personnel">
              <SelectValue placeholder="Personel seçin" />
            </SelectTrigger>
            <SelectContent>
              {personeller.map((personel) => (
                <SelectItem key={personel.id} value={personel.id.toString()}>
                  {personel.ad_soyad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Tarih*</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Saat*</Label>
          <Select
            value={time}
            onValueChange={setTime}
          >
            <SelectTrigger id="time">
              <SelectValue placeholder="Saat seçin" />
            </SelectTrigger>
            <SelectContent>
              {generateTimeSlots()}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notlar</Label>
        <Textarea
          id="notes"
          placeholder="Randevu ile ilgili eklemek istediğiniz notlar"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Kaydediliyor..." : "Randevu Oluştur"}
      </Button>
    </form>
  );
}
