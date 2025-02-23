import React, { useState, useEffect } from 'react';
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
import { Card, CardContent } from "@/components/ui/card";

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
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<any>(null);
  const [selectedStaffInfo, setSelectedStaffInfo] = useState<any>(null);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    if (selectedService) {
      const service = islemler.find(i => i.id.toString() === selectedService);
      setSelectedServiceInfo(service);
    }
    if (selectedStaff) {
      const staff = personeller.find(p => p.id.toString() === selectedStaff);
      setSelectedStaffInfo(staff);
    }
  }, [selectedService, selectedStaff, islemler, personeller]);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const handleNextStep = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePreviousStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleServiceSelect = (value: string) => {
    setSelectedService(value);
    handleNextStep();
  };

  const handleStaffSelect = (value: string) => {
    setSelectedStaff(value);
    handleNextStep();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      handleNextStep();
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = () => {
    if (selectedService && selectedStaff && selectedDate && selectedTime) {
      const randevuData = {
        islem_id: Number(selectedService),
        personel_id: Number(selectedStaff),
        tarih: format(selectedDate, 'yyyy-MM-dd'),
        saat: selectedTime
      };
      console.log('Randevu verisi:', randevuData); // Debug için
      onSubmit(randevuData);
    }
  };

  const handleCancel = () => {
    setSelectedService('');
    setSelectedStaff('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setStep(1);
    onCancel();
  };

  const AppointmentSummary = () => {
    if (!selectedService && !selectedStaff && !selectedDate && !selectedTime) return null;

    return (
      <Card className="mt-4 mb-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-2">Randevu Özeti</h4>
          <div className="space-y-2 text-sm">
            {selectedServiceInfo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hizmet:</span>
                <span className="font-medium">{selectedServiceInfo.islem_adi}</span>
              </div>
            )}
            {selectedStaffInfo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Personel:</span>
                <span className="font-medium">{selectedStaffInfo.ad_soyad}</span>
              </div>
            )}
            {selectedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarih:</span>
                <span className="font-medium">{format(selectedDate, 'dd/MM/yyyy')}</span>
              </div>
            )}
            {selectedTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saat:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  useEffect(() => {
    if (selectedService && selectedStaff && selectedDate && selectedTime) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedService, selectedStaff, selectedDate, selectedTime]);

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {!isAllSelected ? 'Randevu Oluştur' : 'Randevu Özeti'}
        </DialogTitle>
      </DialogHeader>

      {!isAllSelected ? (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="relative mb-8">
            <div className="flex items-center gap-4">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
                onClick={() => setStep(1)}
              >
                1
              </div>
              <h3 className="font-semibold">Hizmet Seçimi</h3>
            </div>
            
            {step === 1 && (
              <div className="mt-4 ml-12">
                <Select
                  value={selectedService}
                  onValueChange={handleServiceSelect}
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

          <div className="relative mb-8">
            <div className="flex items-center gap-4">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
                onClick={() => selectedService && setStep(2)}
              >
                2
              </div>
              <h3 className="font-semibold">Personel Seçimi</h3>
            </div>
            
            {step === 2 && (
              <div className="mt-4 ml-12">
                <Select
                  value={selectedStaff}
                  onValueChange={handleStaffSelect}
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

          <div className="relative mb-8">
            <div className="flex items-center gap-4">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
                onClick={() => selectedStaff && setStep(3)}
              >
                3
              </div>
              <h3 className="font-semibold">Tarih Seçimi</h3>
            </div>
            
            {step === 3 && (
              <div className="mt-4 ml-12">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={tr}
                  disabled={(date) => date < new Date()}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <div className="flex items-center gap-4">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  step === 4 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
                onClick={() => selectedDate && setStep(4)}
              >
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
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-2 mt-8">
            <div className="space-x-2">
              {step > 1 && (
                <Button variant="outline" onClick={handlePreviousStep}>
                  Geri
                </Button>
              )}
              <Button variant="outline" onClick={handleCancel}>
                İptal
              </Button>
            </div>
            <div className="space-x-2">
              {step < 4 && selectedService && (
                <Button onClick={handleNextStep}>
                  İleri
                </Button>
              )}
              {step === 4 && selectedTime && (
                <Button onClick={() => setIsAllSelected(true)}>
                  Devam Et
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AppointmentSummary />
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setIsAllSelected(false)}>
              Geri
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              Onayla
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
}
