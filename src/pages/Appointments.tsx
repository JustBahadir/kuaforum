import React, { useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Randevu, RandevuDurum } from "@/lib/supabase/types";

interface AppointmentCardProps {
  appointment: Randevu;
  onApprove: (appointment: Randevu) => void;
  onCancel: (appointment: Randevu) => void;
  onComplete: (appointment: Randevu) => void;
  onDelete: (appointment: Randevu) => void;
  selectedTab: RandevuDurum;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onApprove, 
  onCancel, 
  onComplete,
  onDelete,
  selectedTab
}) => {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{appointment.musteri_kimlik}</p>
          <p className="text-sm text-gray-500">
            {appointment.tarih} - {appointment.saat}
          </p>
          <p className="text-sm text-gray-500">
            Hizmetler: {appointment.islemler.join(', ')}
          </p>
          {appointment.notlar && (
            <p className="text-sm mt-2">Not: {appointment.notlar}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {selectedTab === "bekliyor" && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onApprove(appointment)}
              >
                Onayla
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-600"
                onClick={() => onCancel(appointment)}
              >
                İptal
              </Button>
            </>
          )}
          
          {selectedTab === "onaylandi" && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onComplete(appointment)}
              >
                Tamamlandı
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-600"
                onClick={() => onCancel(appointment)}
              >
                İptal
              </Button>
            </>
          )}
          
          {(selectedTab === "iptal" || selectedTab === "tamamlandi") && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-600"
              onClick={() => onDelete(appointment)}
            >
              Sil
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Appointments() {
  // Get shop ID from context/state/storage
  const isletmeId = "your-shop-id"; // Replace with actual shop ID
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState<RandevuDurum>("bekliyor");
  const [selectedAppointment, setSelectedAppointment] = useState<Randevu | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { 
    appointments, 
    isLoading, 
    fetchAppointments,
    updateAppointmentStatus,
    deleteAppointment,
    filters,
    setFilters
  } = useAppointments({
    isletmeId,
    date: date ? format(date, 'yyyy-MM-dd') : undefined
  });

  // Set the date filter when the calendar selection changes
  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setFilters(prev => ({ ...prev, date: format(newDate, 'yyyy-MM-dd') }));
    }
  };

  // Filter appointments based on selected tab/status
  const filteredAppointments = appointments.filter(appointment => 
    appointment.durum === selectedTab
  );

  // Handle action confirmation (approve, cancel, complete)
  const handleConfirmAction = async () => {
    if (!selectedAppointment) return;
    
    if (actionType === 'approve') {
      await updateAppointmentStatus(selectedAppointment.kimlik, "onaylandi");
    } else if (actionType === 'cancel') {
      await updateAppointmentStatus(selectedAppointment.kimlik, "iptal");
    } else if (actionType === 'complete') {
      await updateAppointmentStatus(selectedAppointment.kimlik, "tamamlandi");
    } else if (actionType === 'plan') {
      await updateAppointmentStatus(selectedAppointment.kimlik, "planlandi" as RandevuDurum);
    } else if (actionType === 'delete') {
      await deleteAppointment(selectedAppointment.kimlik);
    }
    
    setIsDialogOpen(false);
    setSelectedAppointment(null);
  };

  // Handle action button clicks
  const handleAction = (appointment: Randevu, action: string) => {
    setSelectedAppointment(appointment);
    setActionType(action);
    setIsDialogOpen(true);
  };

  // Generate dialog title based on action type
  const getDialogTitle = () => {
    switch (actionType) {
      case 'approve': 
        return 'Randevu Onaylanacak';
      case 'cancel': 
        return 'Randevu İptal Edilecek';
      case 'complete': 
        return 'Randevu Tamamlandı Olarak İşaretlenecek';
      case 'plan': 
        return 'Randevu Planlandı Olarak İşaretlenecek';
      case 'delete': 
        return 'Randevu Silinecek';
      default: 
        return 'Randevu Durumu Değişecek';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Randevu Yönetimi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              locale={tr}
              className="rounded-md border"
            />
            <p className="mt-2 text-center text-sm text-gray-500">
              {date ? `Seçili tarih: ${format(date, 'dd MMMM yyyy', { locale: tr })}` : 'Tarih seçiniz'}
            </p>
          </CardContent>
        </Card>
        
        {/* Appointments List */}
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as RandevuDurum)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="bekliyor">Bekleyen</TabsTrigger>
                <TabsTrigger value="onaylandi">Onaylanan</TabsTrigger>
                <TabsTrigger value="iptal">İptal</TabsTrigger>
                <TabsTrigger value="tamamlandi">Tamamlanan</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab}>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Randevular yükleniyor...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Bu durumda randevu bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onApprove={(appointment) => handleAction(appointment, 'approve')}
                        onCancel={(appointment) => handleAction(appointment, 'cancel')}
                        onComplete={(appointment) => handleAction(appointment, 'complete')}
                        onDelete={(appointment) => handleAction(appointment, 'delete')}
                        selectedTab={selectedTab}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Onayla</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
