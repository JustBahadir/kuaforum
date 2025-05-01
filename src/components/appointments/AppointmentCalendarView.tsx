
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentCalendarViewProps {
  appointments: any[];
  isLoading: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function AppointmentCalendarView({ appointments, isLoading, selectedDate, onDateSelect }: AppointmentCalendarViewProps) {
  const [appointmentDates, setAppointmentDates] = useState<Date[]>([]);
  
  // Extract dates from appointments
  useEffect(() => {
    const dates = appointments.map(appointment => {
      const dateStr = appointment.tarih;
      return new Date(dateStr);
    });
    setAppointmentDates(dates);
  }, [appointments]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Function to decorate days with appointments
  const decorateDay = (date: Date) => {
    const hasAppointments = appointmentDates.some(appointmentDate => 
      isSameDay(appointmentDate, date)
    );
    
    const countAppointments = appointmentDates.filter(appointmentDate => 
      isSameDay(appointmentDate, date)
    ).length;
    
    return hasAppointments ? (
      <div className="relative w-full h-full flex justify-center">
        <div>{date.getDate()}</div>
        <Badge 
          variant="secondary" 
          className="absolute bottom-0 text-[10px] px-1"
        >
          {countAppointments}
        </Badge>
      </div>
    ) : date.getDate();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="rounded-md border w-full"
          locale={tr}
          weekStartsOn={1}
          formatters={{
            formatCaption: (date, options) => format(date, 'MMMM yyyy', { locale: options?.locale }),
          }}
          components={{
            DayContent: ({ date }) => decorateDay(date)
          }}
        />
      </CardContent>
    </Card>
  );
}
