
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { tr } from 'date-fns/locale';
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentFormProps {
  islemler: any[];
  personeller: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AppointmentForm({
  islemler,
  personeller,
  onSubmit,
  onCancel
}: AppointmentFormProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');

  // Örnek saat dilimleri
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const handleSubmit = () => {
    onSubmit({
      islem_id: selectedService,
      personel_id: selectedStaff,
      tarih: format(selectedDate!, 'yyyy-MM-dd'),
      saat: selectedTime,
    });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Randevu Oluştur</DialogTitle>
      </DialogHeader>

      <div className="relative">
        {/* İlerleme çubuğu */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* Adım 1: Hizmet Seçimi */}
        <div className="relative mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              1
            </div>
            <h3 className="font-semibold">Hizmet Seçimi</h3>
          </div>
          
          {step === 1 && (
            <div className="mt-4 ml-12">
              <Select
                value={selectedService}
                onValueChange={(value) => {
                  setSelectedService(value);
                  setStep(2);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hizmet seçin" />
                </SelectTrigger>
                <SelectContent>
                  {islemler.map((islem) => (
                    <SelectItem key={islem.id} value={islem.id.toString()}>
                      {islem.islem_adi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Adım 2: Personel Seçimi */}
        <div className="relative mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              2
            </div>
            <h3 className="font-semibold">Personel Seçimi</h3>
          </div>
          
          {step === 2 && (
            <div className="mt-4 ml-12">
              <Select
                value={selectedStaff}
                onValueChange={(value) => {
                  setSelectedStaff(value);
                  setStep(3);
                }}
              >
                <SelectTrigger>
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
        </div>

        {/* Adım 3: Tarih Seçimi */}
        <div className="relative mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              3
            </div>
            <h3 className="font-semibold">Tarih Seçimi</h3>
          </div>
          
          {step === 3 && (
            <div className="mt-4 ml-12">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setStep(4);
                }}
                locale={tr}
                disabled={(date) => date < new Date()}
              />
            </div>
          )}
        </div>

        {/* Adım 4: Saat Seçimi */}
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 4 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              4
            </div>
            <h3 className="font-semibold">Saat Seçimi</h3>
          </div>
          
          {step === 4 && (
            <div className="mt-4 ml-12">
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-8">
        <Button variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!selectedService || !selectedStaff || !selectedDate || !selectedTime}
        >
          Randevu Oluştur
        </Button>
      </div>
    </DialogContent>
  );
}
