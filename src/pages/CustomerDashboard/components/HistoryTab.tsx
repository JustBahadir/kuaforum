
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HistoryTabProps {
  appointments: any[];
  isLoading: boolean;
}

export function HistoryTab({ appointments, isLoading }: HistoryTabProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Sort appointments based on date
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.tarih} ${a.saat}`);
    const dateB = new Date(`${b.tarih} ${b.saat}`);
    return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (sortedAppointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Henüz tamamlanmış randevunuz bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Geçmiş Randevularım</h2>
        <div className="flex space-x-2">
          <Button
            variant={sortOrder === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortOrder('newest')}
          >
            En Yeni
          </Button>
          <Button
            variant={sortOrder === 'oldest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortOrder('oldest')}
          >
            En Eski
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedAppointments.map((appointment) => {
          const appointmentDate = new Date(appointment.tarih);
          const formattedDate = format(appointmentDate, 'dd MMMM yyyy', { locale: tr });
          
          return (
            <Card key={appointment.id} className="overflow-hidden border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{formattedDate}</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                    <span className="text-sm">{appointment.saat}</span>
                  </div>
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" /> Tamamlandı
                  </Badge>
                </div>
                <CardDescription>
                  {appointment.personel?.ad_soyad || 'İsimsiz Personel'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-sm">
                  <div className="font-medium">Hizmetler:</div>
                  <div className="text-muted-foreground mt-1">
                    {Array.isArray(appointment.islemler) && appointment.islemler.length > 0 
                      ? appointment.islemler.join(', ')
                      : 'Hizmet detayı bulunmuyor'}
                  </div>
                  
                  {appointment.notlar && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="font-medium">Notlar:</div>
                      <div className="text-muted-foreground mt-1">{appointment.notlar}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryTab;
