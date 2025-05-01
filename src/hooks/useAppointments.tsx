
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { randevuServisi } from '@/lib/supabase';
import { toast } from 'sonner';

export type AppointmentFilters = {
  status?: string | null;
  date?: Date | null;
  personnelId?: number | null;
  customerId?: number | null;
};

export function useAppointments(initialFilters: AppointmentFilters = {}) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AppointmentFilters>(initialFilters);
  const userRole = user?.user_metadata?.role || 'customer';

  // Determine the fetch function based on user role
  const fetchAppointments = async () => {
    if (!user) {
      return [];
    }

    try {
      let appointments = [];

      if (userRole === 'admin') {
        // Admin sees all appointments for their shop
        console.log('Fetching appointments for admin');
        appointments = await randevuServisi.dukkanRandevulariniGetir(null);
      } else if (userRole === 'staff') {
        // Staff sees all appointments for their shop
        console.log('Fetching appointments for staff');
        appointments = await randevuServisi.dukkanRandevulariniGetir(null);
      } else {
        // Customers see only their own appointments
        console.log('Fetching appointments for customer');
        appointments = await randevuServisi.kendiRandevulariniGetir(null);
      }

      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Randevular yüklenirken bir hata oluştu.');
      return [];
    }
  };

  const { 
    data: appointments = [], 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['appointments', userRole, user?.id],
    queryFn: fetchAppointments,
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Apply filters to the fetched appointments
  const filteredAppointments = appointments.filter(appointment => {
    let matches = true;

    // Filter by status if specified
    if (filters.status && appointment.durum !== filters.status) {
      matches = false;
    }

    // Filter by date if specified
    if (filters.date) {
      const filterDate = new Date(filters.date);
      const appointmentDate = new Date(appointment.tarih);

      // Compare year, month, day only
      if (
        filterDate.getFullYear() !== appointmentDate.getFullYear() ||
        filterDate.getMonth() !== appointmentDate.getMonth() ||
        filterDate.getDate() !== appointmentDate.getDate()
      ) {
        matches = false;
      }
    }

    // Filter by personnelId if specified
    if (filters.personnelId && appointment.personel_id !== filters.personnelId) {
      matches = false;
    }

    // Filter by customerId if specified
    if (filters.customerId && appointment.musteri_id !== filters.customerId) {
      matches = false;
    }

    return matches;
  });

  return {
    appointments: filteredAppointments,
    isLoading,
    isError,
    refetch,
    filters,
    setFilters,
  };
}
