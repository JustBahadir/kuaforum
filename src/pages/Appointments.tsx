
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDatePicker } from "@/components/appointments/CalendarDatePicker";
import { AppointmentStatusFilter } from "@/components/appointments/AppointmentStatusFilter";
import { AppointmentCalendarView } from "@/components/appointments/AppointmentCalendarView";
import { AppointmentWeekView } from "@/components/appointments/AppointmentWeekView";
import { AppointmentDayView } from "@/components/appointments/AppointmentDayView";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { useShopData } from "@/hooks/useShopData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StaffAppointmentForm } from "@/components/appointments/StaffAppointmentForm";

export default function Appointments() {
  // State for the view tab
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
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
      await randevuServisi.durumGuncelle(appointmentId, newStatus);
      toast.success("Randevu durumu güncellendi");
      refetch();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Randevu durumu güncellenirken bir hata oluştu");
    }
  };

  const handleNewAppointmentCreated = () => {
    toast.success("Randevu başarıyla oluşturuldu");
    setShowNewAppointmentDialog(false);
    refetch();
  };

  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Randevular</h1>
          <Button 
            onClick={() => setShowNewAppointmentDialog(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Yeni Randevu
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tarih ve Durum Filtresi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CalendarDatePicker 
                  date={selectedDate}
                  onDateChange={handleDateChange}
                />
                <AppointmentStatusFilter 
                  selectedStatus={filters.status || null}
                  onChange={handleStatusChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="day">Günlük</TabsTrigger>
            <TabsTrigger value="week">Haftalık</TabsTrigger>
            <TabsTrigger value="month">Aylık</TabsTrigger>
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
        </Tabs>
      </div>
      
      <Dialog 
        open={showNewAppointmentDialog} 
        onOpenChange={setShowNewAppointmentDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
          </DialogHeader>
          <StaffAppointmentForm onSuccess={handleNewAppointmentCreated} />
        </DialogContent>
      </Dialog>
    </StaffLayout>
  );
}
