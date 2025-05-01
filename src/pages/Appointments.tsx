
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AppointmentStatusFilter } from "@/components/appointments/AppointmentStatusFilter";
import { AppointmentCalendarView } from "@/components/appointments/AppointmentCalendarView";
import { AppointmentWeekView } from "@/components/appointments/AppointmentWeekView";
import { AppointmentDayView } from "@/components/appointments/AppointmentDayView";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { randevuServisi } from "@/lib/supabase";
import { useShopData } from "@/hooks/useShopData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { RandevuDurumu } from "@/lib/supabase/types";
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog";

export default function Appointments() {
  // State for the view tab
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<RandevuDurumu | 'all'>('all');
  const { user } = useAuth();
  const { isletmeData } = useShopData();
  const dukkanId = isletmeData?.id;
  const userRole = user?.user_metadata?.role || "customer";
  const isStaff = userRole === "staff" || userRole === "admin";
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  
  // Get appointments with initial filters by date
  const { 
    appointments, 
    isLoading, 
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
  const handleStatusChange = (status: RandevuDurumu | 'all') => {
    setStatusFilter(status);
    setFilters(prev => ({ ...prev, status: status === 'all' ? null : status }));
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await randevuServisi.durumGuncelle(appointmentId, newStatus as RandevuDurumu);
      toast.success("Randevu durumu güncellendi");
      refetch();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Randevu durumu güncellenirken bir hata oluştu");
    }
  };

  const handleNewAppointmentSuccess = () => {
    refetch();
    setIsNewAppointmentDialogOpen(false);
    toast.success("Randevu başarıyla oluşturuldu");
  };

  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Randevular</h1>
          {isStaff && (
            <Button 
              onClick={() => setIsNewAppointmentDialogOpen(true)}
              className="flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Randevu
            </Button>
          )}
        </div>
        
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <AppointmentStatusFilter 
                value={statusFilter}
                onChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)} className="space-y-4">
          <TabsList>
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
              onDateChange={handleDateChange}
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

      <NewAppointmentDialog
        isOpen={isNewAppointmentDialogOpen}
        onOpenChange={setIsNewAppointmentDialogOpen}
        onSuccess={handleNewAppointmentSuccess}
      />
    </StaffLayout>
  );
}
