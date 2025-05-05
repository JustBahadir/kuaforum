
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { Randevu } from "@/lib/supabase/types";

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "bekliyor":
      return "bg-yellow-100 text-yellow-800";
    case "onaylandi":
      return "bg-green-100 text-green-800";
    case "iptal":
      return "bg-red-100 text-red-800";
    case "tamamlandi":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to translate status
const translateStatus = (status: string) => {
  switch (status) {
    case "bekliyor":
      return "Onay Bekliyor";
    case "onaylandi":
      return "Onaylandı";
    case "iptal":
      return "İptal Edildi";
    case "tamamlandi":
      return "Tamamlandı";
    default:
      return status;
  }
};

export default function CustomerAppointments() {
  const [appointments, setAppointments] = useState<Randevu[]>([]);
  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<Record<string, any>>({});
  const [services, setServices] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Kullanıcı bilgileri alınamadı");
        return;
      }

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("randevular")
        .select("*")
        .eq("customer_id", user.id)
        .order("tarih", { ascending: false });

      if (appointmentsError) throw appointmentsError;

      setAppointments(appointmentsData || []);

      // Get unique personnel and service IDs
      const personelIds = [...new Set(appointmentsData?.map(a => a.personel_id) || [])];
      const serviceIds = [...new Set(appointmentsData?.flatMap(a => a.islemler) || [])];

      // Fetch personnel data
      if (personelIds.length > 0) {
        const { data: personelData, error: personelError } = await supabase
          .from("personel")
          .select("id, ad_soyad")
          .in("id", personelIds);

        if (!personelError && personelData) {
          const personelMap: Record<string, any> = {};
          personelData.forEach(p => {
            personelMap[p.id] = p;
          });
          setPersonnel(personelMap);
        }
      }

      // Fetch service data
      if (serviceIds.length > 0) {
        const { data: serviceData, error: serviceError } = await supabase
          .from("islemler")
          .select("id, islem_adi, fiyat")
          .in("id", serviceIds);

        if (!serviceError && serviceData) {
          const serviceMap: Record<string, any> = {};
          serviceData.forEach(s => {
            serviceMap[s.id] = s;
          });
          setServices(serviceMap);
        }
      }

    } catch (error) {
      console.error("Randevular alınamadı:", error);
      toast.error("Randevular alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string | number) => {
    try {
      const { error } = await supabase
        .from("randevular")
        .update({ durum: "iptal" })
        .eq("id", appointmentId);

      if (error) throw error;

      toast.success("Randevu iptal edildi");
      fetchAppointments();
    } catch (error) {
      console.error("Randevu iptal edilemedi:", error);
      toast.error("Randevu iptal edilemedi");
    }
  };

  const getServiceName = (serviceId: string | number) => {
    // Check if serviceId exists in our services map
    return services[serviceId]?.islem_adi || "Bilinmeyen Hizmet";
  };

  const getPersonnelName = (personnelId: string | number) => {
    // Check if personnelId exists in our personnel map
    return personnel[personnelId]?.ad_soyad || "Bilinmeyen Personel";
  };

  const formatAppointmentTime = (date: string, time: string) => {
    try {
      const dateObj = parseISO(`${date}T${time}`);
      return format(dateObj, "dd MMMM yyyy, HH:mm");
    } catch (error) {
      return `${date} ${time}`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Randevularım</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Henüz randevunuz bulunmamaktadır.</p>
              <Button className="mt-4">Randevu Al</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatAppointmentTime(appointment.tarih, appointment.saat)}
                        </span>
                      </div>
                      <Badge className={getStatusColor(appointment.durum)}>
                        {translateStatus(appointment.durum)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Service info - accessing using array indexing instead of hizmet_kimlik */}
                      {appointment.islemler && appointment.islemler.length > 0 && (
                        <div>
                          <p className="font-medium">Hizmet:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {appointment.islemler.map((serviceId: string | number, index: number) => (
                              <li key={index}>
                                {getServiceName(serviceId)} 
                                {services[serviceId]?.fiyat && (
                                  <span className="text-gray-600 ml-2">
                                    {services[serviceId].fiyat} ₺
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Personnel info */}
                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 mt-1 text-gray-500" />
                        <div>
                          <p className="font-medium">Personel:</p>
                          <p>{getPersonnelName(appointment.personel_id)}</p>
                        </div>
                      </div>

                      {/* Notes if available */}
                      {appointment.notlar && (
                        <div>
                          <p className="font-medium">Notlar:</p>
                          <p className="text-gray-600">{appointment.notlar}</p>
                        </div>
                      )}

                      {/* Cancel button - only show if appointment is not completed or already canceled */}
                      {appointment.durum !== "tamamlandi" && appointment.durum !== "iptal" && (
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => cancelAppointment(appointment.id)}
                          >
                            Randevuyu İptal Et
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
