
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Filter, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { AppointmentCards } from "@/components/appointments/AppointmentCards";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";
import { randevuServisi } from "@/lib/supabase";
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog";

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  
  const {
    appointments,
    isLoading,
    refetch,
    filters,
    setFilters,
  } = useAppointments();

  // Effect to set filters when tabs or date changes
  useEffect(() => {
    const newFilters: any = {};
    
    // Status filter based on active tab
    if (activeTab !== "all") {
      newFilters.status = activeTab;
    }
    
    // Date filter if selected
    if (selectedDate) {
      newFilters.date = selectedDate;
    }
    
    setFilters(newFilters);
  }, [activeTab, selectedDate, setFilters]);

  const handleAppointmentStatusUpdate = async (id: number, status: string) => {
    try {
      await randevuServisi.durumGuncelle(id, status);
      toast.success(`Randevu durumu "${status}" olarak güncellendi`);
      refetch();
    } catch (error) {
      console.error("Randevu durumu güncellenirken hata:", error);
      toast.error("Randevu durumu güncellenemedi");
    }
  };

  const resetFilters = () => {
    setSelectedDate(null);
    setActiveTab("all");
    setFilters({});
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Randevular</h1>
          <Button 
            onClick={() => setIsAppointmentDialogOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Randevu</span>
          </Button>
        </div>
        
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="all">Tümü</TabsTrigger>
                    <TabsTrigger value="beklemede">Beklemede</TabsTrigger>
                    <TabsTrigger value="onaylandi">Onaylandı</TabsTrigger>
                    <TabsTrigger value="tamamlandi">Tamamlandı</TabsTrigger>
                    <TabsTrigger value="iptal">İptal</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={selectedDate ? "text-foreground" : "text-muted-foreground"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "d MMMM yyyy", { locale: tr })
                      ) : (
                        "Tarih Seçin"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={(date) => setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {(selectedDate || activeTab !== "all") && (
                  <Button variant="ghost" onClick={resetFilters}>
                    Filtreleri Temizle
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Appointment List */}
        <AppointmentCards 
          appointments={appointments}
          isLoading={isLoading}
          onAppointmentStatusUpdate={handleAppointmentStatusUpdate}
        />
        
        {/* New Appointment Dialog */}
        <NewAppointmentDialog
          open={isAppointmentDialogOpen}
          onOpenChange={setIsAppointmentDialogOpen}
          onSuccess={refetch}
        />
      </div>
    </StaffLayout>
  );
}
