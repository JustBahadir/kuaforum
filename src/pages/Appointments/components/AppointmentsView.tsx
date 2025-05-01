
import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { AppointmentHeader } from "@/components/appointments/AppointmentHeader";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentsList } from "@/components/appointments/AppointmentsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RandevuDurumu } from "@/lib/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppointmentsViewProps {
  appointments: any[];
  loading: boolean;
  reload: () => void;
}

export function AppointmentsView({ appointments = [], loading, reload }: AppointmentsViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<RandevuDurumu | "all">("all");
  
  // Get appointments for the selected date and filter by status if applied
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.tarih);
    const isSameDate = 
      appointmentDate.getFullYear() === selectedDate.getFullYear() &&
      appointmentDate.getMonth() === selectedDate.getMonth() &&
      appointmentDate.getDate() === selectedDate.getDate();

    // Status filter check
    const statusMatch = statusFilter === "all" || appointment.durum === statusFilter;
      
    return isSameDate && statusMatch;
  });

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  // Format the date for display as "YYYY-MM-DD"
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* Left column (30%) for calendar */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <Card>
            <CardHeader>
              <CardTitle>Takvim</CardTitle>
              <CardDescription>Tarih seçin</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column (70%) for appointments list */}
        <div className="w-full md:w-2/3">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Randevular</CardTitle>
                <AppointmentHeader 
                  currentDate={selectedDate}
                  onPrevious={handlePreviousDay}
                  onNext={handleNextDay}
                />
              </div>
              
              <div className="w-[180px]">
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="beklemede">Beklemede</SelectItem>
                    <SelectItem value="iptal">İptal</SelectItem>
                    <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <AppointmentsList 
                appointments={filteredAppointments}
                loading={loading}
                reload={reload}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                defaultStatus="beklemede"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
