
// Fix the type conversion issues in WorkingHours.tsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useWorkingHours } from "./hooks/useWorkingHours";

interface WorkingHoursProps {
  isletmeId: string;
  editable?: boolean;
  onSave?: (saatler: any[]) => void;
}

export function WorkingHours({ isletmeId, editable = true, onSave }: WorkingHoursProps) {
  const {
    calisma_saatleri,
    gunIsimleri,
    yukleniyor,
    saatleriGuncelle,
    gunuKapaliYap,
    butunGunleriAc
  } = useWorkingHours(isletmeId);

  const handleTimeChange = (index: number, field: string, value: string) => {
    saatleriGuncelle(index, field, value);
  };

  const handleToggleDay = (index: number, kapali: boolean) => {
    gunuKapaliYap(index, kapali);
  };

  const handleSubmit = () => {
    if (onSave) {
      onSave(calisma_saatleri);
    }
  };

  if (yukleniyor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>İşletme Çalışma Saatleri</CardTitle>
          <CardDescription>
            Yükleniyor...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşletme Çalışma Saatleri</CardTitle>
        <CardDescription>
          İşletmenizin açılış ve kapanış saatlerini belirleyin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calisma_saatleri.map((saat, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-center">
              <div className="font-medium">{gunIsimleri[index]}</div>
              
              <Select
                disabled={!editable || saat.kapali}
                value={saat.acilis}
                onValueChange={(value) => handleTimeChange(index, "acilis", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Açılış" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, saat) => (
                    <SelectItem key={saat} value={String(saat).padStart(2, '0') + ':00'}>
                      {String(saat).padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                disabled={!editable || saat.kapali}
                value={saat.kapanis}
                onValueChange={(value) => handleTimeChange(index, "kapanis", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kapanış" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, saat) => (
                    <SelectItem key={saat} value={String(saat).padStart(2, '0') + ':00'}>
                      {String(saat).padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`day-${index}`}
                  disabled={!editable}
                  checked={!saat.kapali}
                  onCheckedChange={(checked) => handleToggleDay(index, !checked)}
                />
                <Label htmlFor={`day-${index}`}>
                  {saat.kapali ? "Kapalı" : "Açık"}
                </Label>
              </div>
            </div>
          ))}

          {editable && (
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={butunGunleriAc}
              >
                Tüm Günleri Aç
              </Button>
              <Button onClick={handleSubmit}>Kaydet</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
