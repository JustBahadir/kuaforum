
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Check, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface AppointmentCardsProps {
  appointments: any[];
  isLoading: boolean;
  onAppointmentStatusUpdate?: (id: number, status: string) => void;
}

export function AppointmentCards({ 
  appointments, 
  isLoading,
  onAppointmentStatusUpdate 
}: AppointmentCardsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Bu kriterlere uygun randevu bulunamadı</h3>
        <p className="text-gray-500 mt-2">
          Farklı bir filtre kullanmayı veya yeni randevu oluşturmayı deneyebilirsiniz.
        </p>
      </div>
    );
  }

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const dateKey = appointment.tarih;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(appointment);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort dates
  const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  // Status badge styles and text
  const getStatusBadge = (status: string) => {
    const statusInfo: Record<string, { class: string, text: string }> = {
      'beklemede': { class: 'bg-amber-100 text-amber-800 hover:bg-amber-200', text: 'Beklemede' },
      'onaylandi': { class: 'bg-green-100 text-green-800 hover:bg-green-200', text: 'Onaylandı' },
      'iptal': { class: 'bg-red-100 text-red-800 hover:bg-red-200', text: 'İptal Edildi' },
      'iptal_edildi': { class: 'bg-red-100 text-red-800 hover:bg-red-200', text: 'İptal Edildi' },
      'tamamlandi': { class: 'bg-blue-100 text-blue-800 hover:bg-blue-200', text: 'Tamamlandı' }
    };
    
    return statusInfo[status] || { class: 'bg-gray-100 text-gray-800', text: status };
  };

  const getCardBgColor = (status: string) => {
    if (status === 'tamamlandi') return 'bg-green-50';
    if (status === 'beklemede') return 'bg-amber-50';
    if (status === 'iptal' || status === 'iptal_edildi') return 'bg-red-50';
    return 'bg-white';
  };

  return (
    <div className="space-y-8">
      {sortedDates.map(dateKey => {
        const dateAppointments = appointmentsByDate[dateKey];
        const displayDate = format(new Date(dateKey), 'd MMMM yyyy, EEEE', { locale: tr });
        
        return (
          <div key={dateKey} className="space-y-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium capitalize">{displayDate}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateAppointments.map(appointment => (
                <Card 
                  key={appointment.id} 
                  className={`overflow-hidden ${getCardBgColor(appointment.durum)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">{appointment.saat}</span>
                        </div>
                        
                        <div className="font-medium">
                          {appointment.musteri?.first_name} {appointment.musteri?.last_name}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {appointment.personel?.ad_soyad || 'Personel atanmamış'}
                        </div>
                        
                        {appointment.notlar && (
                          <div className="mt-2 text-sm border-t pt-2 text-muted-foreground">
                            {appointment.notlar}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatusBadge(appointment.durum).class}>
                          {getStatusBadge(appointment.durum).text}
                        </Badge>
                        
                        {onAppointmentStatusUpdate && appointment.durum === 'beklemede' && (
                          <div className="flex space-x-1 mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 px-2 border-green-500 hover:bg-green-50"
                              onClick={() => onAppointmentStatusUpdate(appointment.id, 'onaylandi')}
                            >
                              <Check className="h-3 w-3 mr-1 text-green-600" />
                              <span className="text-green-600">Onayla</span>
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 border-red-500 hover:bg-red-50"
                              onClick={() => onAppointmentStatusUpdate(appointment.id, 'iptal')}
                            >
                              <X className="h-3 w-3 mr-1 text-red-600" />
                              <span className="text-red-600">İptal</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
