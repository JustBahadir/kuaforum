
import { useState, useEffect } from "react";
import { randevuServisi } from "@/lib/supabase";
import { Randevu, RandevuDurum } from "@/lib/supabase/types";
import { toast } from "sonner";

export interface UseAppointmentsProps {
  isletmeId?: string;
  personelId?: string;
  musteriId?: string;
  initialDate?: string;
  autoFetch?: boolean;
  date?: string; // Added this property to fix the error
}

export const useAppointments = ({ 
  isletmeId, 
  personelId, 
  musteriId, 
  initialDate, 
  autoFetch = true,
  date
}: UseAppointmentsProps = {}) => {
  const [appointments, setAppointments] = useState<Randevu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    date: date || initialDate || new Date().toISOString().split('T')[0],
    personelId: personelId || "",
    status: ""
  });

  const fetchAppointments = async () => {
    if (!isletmeId && !personelId && !musteriId) {
      console.error("isletmeId, personelId veya musteriId gereklidir");
      return;
    }

    setIsLoading(true);
    try {
      let randevular: Randevu[] = [];

      if (isletmeId) {
        if (filters.date) {
          randevular = await randevuServisi.tariheGoreGetir(isletmeId, filters.date);
        } else {
          randevular = await randevuServisi.isletmeyeGoreGetir(isletmeId);
        }
      } else if (personelId) {
        randevular = await randevuServisi.personeleGoreGetir(personelId);
      } else if (musteriId) {
        randevular = await randevuServisi.musteriyeGoreGetir(musteriId);
      }

      // Filtreler uygulanıyor
      if (filters.personelId) {
        randevular = randevular.filter(r => r.personel_id === filters.personelId);
      }
      
      if (filters.status) {
        randevular = randevular.filter(r => r.durum === filters.status);
      }

      setAppointments(randevular);
    } catch (error) {
      console.error("Randevular alınırken hata:", error);
      toast.error("Randevular alınamadı");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchAppointments();
    }
  }, [isletmeId, personelId, musteriId, filters.date, filters.personelId, filters.status, autoFetch]);

  // Randevu durumunu güncelleme
  const updateAppointmentStatus = async (appointmentId: string, newStatus: RandevuDurum) => {
    try {
      const updatedAppointment = await randevuServisi.durumGuncelle(appointmentId, newStatus);
      
      if (updatedAppointment) {
        setAppointments(prev => 
          prev.map(appt => 
            appt.id === updatedAppointment.id ? updatedAppointment : appt
          )
        );
        toast.success("Randevu durumu güncellendi");
      }
    } catch (error) {
      console.error("Randevu durumu güncellenirken hata:", error);
      toast.error("Randevu durumu güncellenemedi");
    }
  };

  // Randevu silme
  const deleteAppointment = async (appointmentId: string) => {
    try {
      const success = await randevuServisi.sil(appointmentId);
      
      if (success) {
        setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
        toast.success("Randevu silindi");
      }
    } catch (error) {
      console.error("Randevu silinirken hata:", error);
      toast.error("Randevu silinemedi");
    }
  };

  return {
    appointments,
    isLoading,
    filters,
    setFilters,
    fetchAppointments,
    updateAppointmentStatus,
    deleteAppointment
  };
};
