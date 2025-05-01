
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDatePicker } from "@/components/appointments/CalendarDatePicker";
import { AppointmentStatusFilter } from "@/components/appointments/AppointmentStatusFilter";
import { AppointmentCalendarView } from "@/components/appointments/AppointmentCalendarView";
import { AppointmentWeekView } from "@/components/appointments/AppointmentWeekView";
import { AppointmentDayView } from "@/components/appointments/AppointmentDayView";
import { AppointmentsList } from "@/components/appointments/AppointmentsList";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { useShopData } from "@/hooks/useShopData";
import { toast } from "sonner";

export default function Appointments() {
  // State for the view tab
  const [currentView, setCurrentView] = useState<"day" | "week" | "month" | "list">("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();
  const { isletmeData } = useShopData();
  const dukkanId = isletmeData?.id;
  const userRole = user?.user_metadata?.role || "customer";
  const isStaff = userRole === "staff" || userRole === "admin";
  
  // Get personel_id from user metadata for staff members
  const currentPersonelId = user?.user_metadata?.personel_id 
    ? Number(user.user_metadata.personel_id) 
    : undefined;

  // Get appointments with initial filters by status and date
  const { 
    appointments, 
    isLoading, 
    isError, 
    refetch, 
    filters, 
    setFilters 
  } = useAppointments({ date: selectedDate });

  // Set appointment date filter
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFilters(prev => ({ ...prev, date }));
    }
  };

  // Set appointment status filter
  const handleStatusChange = (status: string | null) => {
    setFilters(prev => ({ ...prev, status }));
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await randevuServisi.randevuDurumGuncelle(appointmentId, newStatus);
      toast.success("Randevu durumu güncellendi");
      refetch();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Randevu durumu güncellenirken bir hata oluştu");
    }
  };

  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Randevular</h1>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tarih Seçimi</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarDatePicker 
                date={selectedDate}
                onDateChange={handleDateChange}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Durum Filtresi</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentStatusFilter 
                selectedStatus={filters.status || null}
                onChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="day">Günlük</TabsTrigger>
            <TabsTrigger value="week">Haftalık</TabsTrigger>
            <TabsTrigger value="month">Aylık</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>

          <TabsContent value="day">
            <AppointmentDayView 
              appointments={appointments}
              isLoading={isLoading}
              selectedDate={selectedDate}
              onAppointmentStatusUpdate={updateAppointmentStatus}
            />
          </TabsContent>

          <TabsContent value="week">
            <AppointmentWeekView 
              appointments={appointments}
              isLoading={isLoading}
              selectedDate={selectedDate}
              onAppointmentStatusUpdate={updateAppointmentStatus}
            />
          </TabsContent>

          <TabsContent value="month">
            <AppointmentCalendarView 
              appointments={appointments}
              isLoading={isLoading}
              selectedDate={selectedDate}
              onDateSelect={handleDateChange}
            />
          </TabsContent>

          <TabsContent value="list">
            <AppointmentsList 
              appointments={appointments}
              isLoading={isLoading}
              onAppointmentStatusUpdate={updateAppointmentStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
