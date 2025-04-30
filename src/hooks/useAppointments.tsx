
import { useState, useEffect, useCallback } from 'react';
import { randevuServisi, personelServisi } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Randevu, RandevuDurumu } from '@/lib/supabase/types';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { supabase } from '@/lib/supabase/client';  // Add the missing supabase import

interface UseAppointmentsProps {
  initialStatus?: RandevuDurumu | 'all';
  initialDate?: Date | null;
}

export const useAppointments = ({ initialStatus = 'beklemede', initialDate = new Date() }: UseAppointmentsProps = {}) => {
  const [status, setStatus] = useState<RandevuDurumu | 'all'>(initialStatus);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [appointments, setAppointments] = useState<Randevu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { dukkanId } = useCustomerAuth();
  const [personelId, setPersonelId] = useState<number | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let fetchedAppointments: Randevu[] = [];

      if (user.user_metadata?.role === 'admin') {
        if (dukkanId) {
          // Ensure admin only sees their own shop's appointments
          fetchedAppointments = await randevuServisi.dukkanRandevulariniGetir(dukkanId);
        } else {
          console.warn("İşletme ID bulunamadı");
          setLoading(false);
          return;
        }
      } else if (user.user_metadata?.role === 'staff') {
        if (personelId && dukkanId) {
          // For staff, we need to get appointments assigned to them
          // Since there's no direct personelRandevulariniGetir method, we'll filter from dukkanRandevulariniGetir
          const allAppointments = await randevuServisi.dukkanRandevulariniGetir(dukkanId);
          fetchedAppointments = allAppointments.filter(appt => appt.personel_id === personelId);
        } else {
          console.warn("Personel veya İşletme bilgisi bulunamadı");
          setLoading(false);
          return;
        }
      } else {
        fetchedAppointments = await randevuServisi.kendiRandevulariniGetir();
      }

      let filteredAppointments = fetchedAppointments;

      if (selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        filteredAppointments = filteredAppointments.filter(
          (appointment) => appointment.tarih && appointment.tarih.split('T')[0] === formattedDate
        );
      }

      if (status !== 'all') {
        filteredAppointments = filteredAppointments.filter((appointment) => appointment.durum === status);
      }

      setAppointments(filteredAppointments);
    } catch (err: any) {
      setError(err);
      console.error("Randevu fetch hatası:", err);
      toast.error("Randevular yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [status, selectedDate, user, personelId, dukkanId]);

  useEffect(() => {
    if (user && user.user_metadata?.role === 'staff') {
      const fetchPersonelId = async () => {
        try {
          const personel = await personelServisi.getirByAuthId(user.id);
          if (personel?.id) {
            setPersonelId(personel.id);
          } else {
            console.warn("Personel bilgisi bulunamadı");
          }
        } catch (error) {
          console.error("Error fetching personel ID:", error);
          toast.error("Personel bilgileri alınırken bir hata oluştu");
        }
      };
      fetchPersonelId();
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const setDate = (date: Date | null) => {
    // Ensure we always set a valid date
    setSelectedDate(date || new Date());
  };

  const setAppointmentStatus = (newStatus: RandevuDurumu | 'all') => {
    setStatus(newStatus);
  };

  const updateStatus = async (id: number, status: RandevuDurumu) => {
    if (!id) {
      console.error("Cannot update appointment without valid ID");
      toast.error("Geçersiz randevu kimliği");
      return null;
    }
    
    try {
      // For security, verify that the appointment belongs to this shop before updating
      const { data: appointmentData } = await supabase
        .from('randevular')
        .select('dukkan_id')
        .eq('id', id)
        .single();
      
      if (appointmentData?.dukkan_id !== dukkanId) {
        throw new Error("Bu randevu sizin işletmenize ait değil");
      }
      
      const updatedAppointment = await randevuServisi.guncelle(id, { durum: status });
      if (updatedAppointment) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === id ? { ...appointment, durum: status } : appointment
          )
        );
        toast.success("Randevu durumu başarıyla güncellendi");
        return updatedAppointment;
      } else {
        toast.error("Randevu durumu güncellenirken bir hata oluştu");
        return null;
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Randevu durumu güncellenirken bir hata oluştu");
      return null;
    }
  };

  return {
    appointments,
    loading,
    error,
    status,
    selectedDate,
    setDate,
    setAppointmentStatus,
    updateStatus,
    currentPersonelId: personelId,
    dukkanId
  };
};
