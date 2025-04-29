
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentDayView } from '@/components/appointments/AppointmentDayView';
import { AppointmentWeekView } from '@/components/appointments/AppointmentWeekView';
import { AppointmentCalendarView } from '@/components/appointments/AppointmentCalendarView';
import { AppointmentsList } from '@/components/appointments/AppointmentsList';
import { AppointmentStatusFilter } from '@/components/appointments/AppointmentStatusFilter';
import { CalendarDatePicker } from '@/components/appointments/CalendarDatePicker';
import { PageHeader } from '@/components/common/PageHeader';
import { RandevuDurumu } from '@/lib/supabase/types';

type ViewMode = 'day' | 'week' | 'calendar' | 'list';

export default function Appointments() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  
  const { 
    appointments, 
    loading, 
    error, 
    status, 
    selectedDate, 
    setDate,
    setAppointmentStatus, 
    updateStatus,
    currentPersonelId
  } = useAppointments();

  const handleDateChange = (date: Date | null) => {
    setDate(date);
  };

  const handleStatusChange = (status: RandevuDurumu | 'all') => {
    setAppointmentStatus(status);
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <PageHeader
        title="Randevular"
        subtitle="Randevuları görüntüleyin, düzenleyin ve yönetin"
        button={{ label: "Yeni Randevu", href: "/new-appointment" }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-4">
        <div className="md:col-span-3">
          <AppointmentStatusFilter value={status} onChange={handleStatusChange} />
        </div>
        <div>
          <CalendarDatePicker date={selectedDate} onSelect={handleDateChange} />
        </div>
      </div>

      <Card>
        <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="day">Günlük</TabsTrigger>
            <TabsTrigger value="week">Haftalık</TabsTrigger>
            <TabsTrigger value="calendar">Takvim</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-4 pb-0">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-900">Bir hata oluştu</h3>
                  <p className="mt-2 text-gray-500">{error.message}</p>
                </div>
              </div>
            ) : (
              <>
                <TabsContent value="day">
                  <AppointmentDayView
                    selectedDate={selectedDate || new Date()}
                    appointments={appointments}
                    isLoading={loading}
                    onDateChange={handleDateChange}
                    onUpdateStatus={updateStatus}
                    currentPersonelId={currentPersonelId}
                  />
                </TabsContent>
                
                <TabsContent value="week">
                  <AppointmentWeekView
                    selectedDate={selectedDate || new Date()}
                    appointments={appointments}
                    isLoading={loading}
                    onDateChange={handleDateChange}
                    currentPersonelId={currentPersonelId}
                  />
                </TabsContent>
                
                <TabsContent value="calendar">
                  <AppointmentCalendarView
                    appointments={appointments}
                    isLoading={loading}
                    onDateChange={handleDateChange}
                    onUpdateStatus={updateStatus}
                    currentPersonelId={currentPersonelId}
                  />
                </TabsContent>
                
                <TabsContent value="list">
                  <AppointmentsList
                    appointments={appointments}
                    isLoading={loading}
                    onUpdateStatus={updateStatus}
                    currentPersonelId={currentPersonelId}
                  />
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
