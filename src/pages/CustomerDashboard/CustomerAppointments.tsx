
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { randevuServisi, musteriServisi } from "@/lib/supabase";
import { Randevu, RandevuDurum } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CustomerAppointments() {
  const { user } = useAuth();
  const [randevular, setRandevular] = useState<Randevu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Randevu | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Load customer's appointments
  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Get customer profile first (to get the customer ID)
        const musteriListesi = await musteriServisi.isletmeyeGoreGetir(user.id);
        if (musteriListesi.length === 0) {
          // No customer record for this user
          setRandevular([]);
          return;
        }
        
        const musteri = musteriListesi[0];
        
        // Get appointments
        const appointments = await randevuServisi.musteriyeGoreGetir(musteri.kimlik);
        setRandevular(appointments);
      } catch (error) {
        console.error("Randevular yüklenirken hata:", error);
        toast.error("Randevular yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, [user?.id]);

  // Filter appointments based on active tab
  const filteredAppointments = randevular.filter((randevu) => {
    if (activeTab === "upcoming") {
      return randevu.durum === "planlandi";
    } else if (activeTab === "past") {
      return randevu.durum === "tamamlandi" || randevu.durum === "iptal";
    }
    return true;
  });

  // Format appointment date
  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "d MMMM yyyy");
    } catch (error) {
      return dateStr;
    }
  };

  // Open cancel dialog
  const openCancelDialog = (appointment: Randevu) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  // Cancel appointment
  const cancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setCancelLoading(true);
      
      const success = await randevuServisi.durumGuncelle(selectedAppointment.kimlik, "iptal");
      
      if (success) {
        // Update local state
        setRandevular((prev) =>
          prev.map((randevu) =>
            randevu.kimlik === selectedAppointment.kimlik
              ? { ...randevu, durum: "iptal" as RandevuDurum }
              : randevu
          )
        );
        
        toast.success("Randevu başarıyla iptal edildi");
        setCancelDialogOpen(false);
      } else {
        toast.error("Randevu iptal edilemedi");
      }
    } catch (error) {
      console.error("Randevu iptal edilirken hata:", error);
      toast.error("Randevu iptal edilemedi");
    } finally {
      setCancelLoading(false);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: RandevuDurum) => {
    switch (status) {
      case "planlandi":
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Planlandı</span>;
      case "tamamlandi":
        return <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Tamamlandı</span>;
      case "iptal":
        return <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">İptal</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Randevularım</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Yaklaşan Randevular</TabsTrigger>
              <TabsTrigger value="past">Geçmiş Randevular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Yaklaşan randevunuz bulunmamaktadır
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((randevu) => (
                    <div
                      key={randevu.kimlik}
                      className="flex justify-between items-center p-4 rounded-lg border"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {formatAppointmentDate(randevu.tarih)} - {randevu.saat}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          İşlem: {randevu.hizmet_kimlik || "Belirtilmemiş"}
                        </p>
                        <div className="mt-2">
                          {renderStatusBadge(randevu.durum)}
                        </div>
                      </div>
                      <div>
                        {randevu.durum === "planlandi" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCancelDialog(randevu)}
                          >
                            İptal Et
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Geçmiş randevunuz bulunmamaktadır
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((randevu) => (
                    <div
                      key={randevu.kimlik}
                      className="flex justify-between items-center p-4 rounded-lg border"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {formatAppointmentDate(randevu.tarih)} - {randevu.saat}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          İşlem: {randevu.hizmet_kimlik || "Belirtilmemiş"}
                        </p>
                        <div className="mt-2">
                          {renderStatusBadge(randevu.durum)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Randevu İptal Diyaloğu */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Randevu İptal</DialogTitle>
            <DialogDescription>
              Randevunuzu iptal etmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bu işlem geri alınamaz. Randevunuz iptal edilecektir.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Randevu Bilgileri:</p>
                <p className="text-sm">
                  Tarih: {formatAppointmentDate(selectedAppointment.tarih)}
                </p>
                <p className="text-sm">
                  Saat: {selectedAppointment.saat}
                </p>
                <p className="text-sm">
                  İşlem: {selectedAppointment.hizmet_kimlik || "Belirtilmemiş"}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelLoading}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={cancelAppointment}
              disabled={cancelLoading}
            >
              {cancelLoading ? "İptal Ediliyor..." : "Randevuyu İptal Et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
