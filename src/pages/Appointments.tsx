
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { StaffAppointmentForm } from "@/components/appointments/StaffAppointmentForm";
import { Randevu } from "@/lib/supabase/types";
import { Plus } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentDayView } from "@/components/appointments/AppointmentDayView";
import { AppointmentWeekView } from "@/components/appointments/AppointmentWeekView";
import { AppointmentCalendarView } from "@/components/appointments/AppointmentCalendarView";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Appointments() {
  const { dukkanId, userRole } = useCustomerAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const {
    appointments,
    isLoading,
    isError,
    error,
    selectedDate,
    setSelectedDate,
    currentPersonelId,
    confirmDialogOpen,
    setConfirmDialogOpen,
    cancelDialogOpen,
    setCancelDialogOpen,
    selectedAppointment,
    handleAppointmentComplete,
    handleAppointmentCancel,
    handleCompleteClick,
    handleCancelClick,
    refetch
  } = useAppointments(dukkanId);
  
  const handleAppointmentCreated = () => {
    refetch();
    setAddDialogOpen(false);
  };
  
  const AppointmentFormComponent = userRole === 'staff' || userRole === 'admin' 
    ? StaffAppointmentForm 
    : AppointmentForm;

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Randevular</h1>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Randevu
          </Button>
        </div>
        
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="day">Günlük Görünüm</TabsTrigger>
            <TabsTrigger value="week">Haftalık Görünüm</TabsTrigger>
            <TabsTrigger value="calendar">Takvim</TabsTrigger>
          </TabsList>
          
          <TabsContent value="day">
            <AppointmentDayView
              selectedDate={selectedDate}
              appointments={appointments}
              isLoading={isLoading}
              isError={isError}
              error={error}
              currentPersonelId={currentPersonelId}
              onCompleteClick={handleCompleteClick}
              onCancelClick={handleCancelClick}
              onDateChange={setSelectedDate}
            />
          </TabsContent>
          
          <TabsContent value="week">
            <AppointmentWeekView
              selectedDate={selectedDate}
              appointments={appointments}
              isLoading={isLoading}
              currentPersonelId={currentPersonelId}
              onDateChange={setSelectedDate}
            />
          </TabsContent>
          
          <TabsContent value="calendar">
            <AppointmentCalendarView
              selectedDate={selectedDate}
              appointments={appointments}
              isLoading={isLoading}
              isError={isError}
              error={error}
              currentPersonelId={currentPersonelId}
              onCompleteClick={handleCompleteClick}
              onCancelClick={handleCancelClick}
              onDateChange={setSelectedDate}
            />
          </TabsContent>
        </Tabs>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
            </DialogHeader>
            <AppointmentFormComponent 
              onAppointmentCreated={handleAppointmentCreated}
              initialDate={selectedDate.toISOString().split('T')[0]}
            />
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>İşlemi Onayla</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlemi tamamlandı olarak işaretleyeceksiniz. Bu işlem müşterinin işlem geçmişine kaydedilecek ve istatistiklere eklenecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleAppointmentComplete}>
                Tamamlandı Olarak İşaretle
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Randevuyu İptal Et</AlertDialogTitle>
              <AlertDialogDescription>
                Bu randevuyu iptal etmek istediğinize emin misiniz? İptal edilen randevular geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Vazgeç</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleAppointmentCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                Randevuyu İptal Et
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StaffLayout>
  );
}
