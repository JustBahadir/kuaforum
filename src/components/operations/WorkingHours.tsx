
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkingHours, gunIsimleri } from "@/components/operations/hooks/useWorkingHours";
import { Loader2 } from "lucide-react";

interface WorkingHoursProps {
  isletmeId: string;
}

export function WorkingHours({ isletmeId }: WorkingHoursProps) {
  const {
    calisma_saatleri,
    yukleniyor,
    kaydetmeBasarili,
    saatleriGuncelle,
    saatleriKaydet,
    gunuKapaliYap,
    butunGunleriAc
  } = useWorkingHours(isletmeId);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Çalışma Saatleri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {yukleniyor ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-5">
              {calisma_saatleri.map((saat, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={!saat.kapali} 
                      onCheckedChange={(checked) => gunuKapaliYap(index, !checked)}
                      aria-label={`${saat.gun} açık/kapalı durumu`}
                    />
                    <Label className="font-medium text-gray-700">{saat.gun}</Label>
                  </div>
                  
                  <div className="flex flex-1 max-w-[280px] gap-3">
                    <div className="flex-1">
                      <Input 
                        type="time"
                        value={saat.acilis}
                        onChange={(e) => saatleriGuncelle(index, "acilis", e.target.value)}
                        disabled={saat.kapali}
                        className={saat.kapali ? "opacity-50" : ""}
                      />
                    </div>
                    <span className="flex items-center text-gray-500">-</span>
                    <div className="flex-1">
                      <Input 
                        type="time"
                        value={saat.kapanis}
                        onChange={(e) => saatleriGuncelle(index, "kapanis", e.target.value)}
                        disabled={saat.kapali}
                        className={saat.kapali ? "opacity-50" : ""}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row pt-4 gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={butunGunleriAc}
              >
                Tüm Günleri Aç
              </Button>
              <Button 
                className="flex-1"
                onClick={saatleriKaydet}
                disabled={yukleniyor}
              >
                {yukleniyor ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Kaydediliyor...
                  </>
                ) : (
                  "Değişiklikleri Kaydet"
                )}
              </Button>
            </div>
            
            {kaydetmeBasarili === true && (
              <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
                Çalışma saatleri başarıyla kaydedildi.
              </div>
            )}
            
            {kaydetmeBasarili === false && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                Çalışma saatleri kaydedilirken bir hata oluştu.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
