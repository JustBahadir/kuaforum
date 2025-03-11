
import React from "react";
import { Randevu } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentListProps {
  appointments: Randevu[];
  isLoading: boolean;
  isMinimal?: boolean; // For simplified view
}

export function AppointmentList({ appointments, isLoading, isMinimal = false }: AppointmentListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "beklemede":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Beklemede</Badge>;
      case "onaylandi":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Onaylandı</Badge>;
      case "tamamlandi":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Tamamlandı</Badge>;
      case "iptal_edildi":
        return <Badge variant="outline" className="bg-red-100 text-red-800">İptal Edildi</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">Bilinmiyor</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Randevu geçmişi bulunamadı.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {format(new Date(appointment.tarih), "d MMMM yyyy", { locale: tr })} - {appointment.saat.substring(0, 5)}
                </div>
                {getStatusBadge(appointment.durum)}
              </div>
              
              {!isMinimal && appointment.personel && (
                <div className="text-sm text-gray-600">
                  Personel: {appointment.personel.ad_soyad}
                </div>
              )}
              
              {appointment.notlar && (
                <div className="text-sm text-gray-600 border-t pt-2 mt-2">
                  <span className="font-medium">Notlar:</span> {appointment.notlar}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
