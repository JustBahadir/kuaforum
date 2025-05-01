
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
              onClick={() => setIsNewAppointmentOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Yeni Randevu</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={filters.status === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, status: undefined })}
                >
                  Hepsi
                </Button>
                <Button
                  variant={filters.status === "beklemede" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, status: "beklemede" })}
                >
                  Beklemede
                </Button>
                <Button
                  variant={filters.status === "tamamlandi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, status: "tamamlandi" })}
                >
                  Tamamlandı
                </Button>
                <Button
                  variant={filters.status === "iptal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, status: "iptal" })}
                >
                  İptal
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
                  onAddClick={() => setIsNewAppointmentOpen(true)}
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
                    {/* Daily appointments view */}
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="font-medium mb-4">
                        {format(selectedDate, "d MMMM yyyy", { locale: tr })}
                      </h3>
                      <div className="space-y-4">
                        {isLoading ? (
                          <p>Yükleniyor...</p>
                        ) : appointments.length === 0 ? (
                          <p className="text-center py-4 text-muted-foreground">
                            Bu tarihte randevu bulunmuyor.
                          </p>
                        ) : (
                          appointments.map((appointment) => (
                            <div key={appointment.id} className="border-l-4 border-blue-500 pl-3 py-2">
                              <p className="font-medium">
                                {appointment.saat.substring(0, 5)} - {appointment.musteri?.first_name} {appointment.musteri?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.personel?.ad_soyad}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
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
