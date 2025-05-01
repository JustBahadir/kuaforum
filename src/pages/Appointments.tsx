
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { StaffAppointmentForm } from "@/components/appointments/StaffAppointmentForm";
import { AppointmentsList } from "@/components/appointments/AppointmentsList";
import { AppointmentCalendarView } from "@/components/appointments/AppointmentCalendarView";
import { useAppointments } from "@/hooks/useAppointments";
import { Toaster } from "sonner";

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  
  const { 
    appointments, 
    isLoading, 
    refetch,
    filters,
    setFilters
  } = useAppointments({
    date: selectedDate
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setFilters({ ...filters, date });
  };

  const handleSuccessfulAppointment = () => {
    refetch();
  };

  const openNewAppointmentModal = () => {
    setIsNewAppointmentOpen(true);
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Randevular</h1>
            <p className="text-muted-foreground">
              {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setSelectedDate(new Date())}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Bugün</span>
            </Button>
            
            <Button 
              onClick={openNewAppointmentModal}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Yeni Randevu</span>
            </Button>
          </div>
        </div>
        
        <Tabs 
          value={viewMode} 
          onValueChange={(value) => setViewMode(value as "daily" | "weekly" | "monthly")}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="daily">Günlük</TabsTrigger>
            <TabsTrigger value="weekly">Haftalık</TabsTrigger>
            <TabsTrigger value="monthly">Aylık</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <AppointmentsList 
              onAddClick={openNewAppointmentModal} 
              selectedDate={selectedDate}
            />
          </TabsContent>
          
          <TabsContent value="weekly">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">
                Haftalık görünüm şu anda yapım aşamasında.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <AppointmentCalendarView 
                  appointments={appointments}
                  isLoading={isLoading}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>
              <div className="md:w-1/3">
                <AppointmentsList 
                  onAddClick={openNewAppointmentModal} 
                  selectedDate={selectedDate}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* New appointment modal */}
      <StaffAppointmentForm 
        open={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
        onSuccess={handleSuccessfulAppointment}
        defaultDate={selectedDate}
      />
      
      <Toaster richColors position="bottom-right" />
    </StaffLayout>
  );
}
