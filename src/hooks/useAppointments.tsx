
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { Randevu, Personel, Musteri } from "@/lib/supabase/types";
import { toast } from "sonner";
import { personelServisi } from "@/lib/supabase";
import { supabase } from '@/lib/supabase/client';
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";

export function useAppointments(dukkanId?: number) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Randevu | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [currentPersonelId, setCurrentPersonelId] = useState<number | undefined>(undefined);
  const [appointmentData, setAppointmentData] = useState<Randevu[]>([]);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const fetchCurrentPersonnel = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const personel = await personelServisi.getirByAuthId(data.user.id);
          if (personel) {
            console.log("Mevcut personel bulundu:", personel);
            setCurrentPersonelId(personel.id);
          }
        }
      } catch (error) {
        console.error("Error fetching current personnel:", error);
      }
    };
    
    fetchCurrentPersonnel();
  }, []);
  
  const { 
    data: appointmentsRaw = [], 
    isLoading,
    refetch,
    isError,
    error
  } = useQuery({
    queryKey: ['appointments', dukkanId, selectedDate],
    queryFn: async () => {
      console.log("Randevuları getirme fonksiyonu çalıştırılıyor - Dükkan ID:", dukkanId);
      try {
        let data: Randevu[] = [];
        
        if (dukkanId) {
          const randevular = await randevuServisi.dukkanRandevulariniGetir(dukkanId);
          data = randevular || [];
        } else {
          const randevular = await randevuServisi.kendiRandevulariniGetir();
          data = randevular || [];
        }
        
        console.log("Randevular başarıyla getirildi:", data);
        return data;
      } catch (error) {
        console.error("Randevuları getirme hatası:", error);
        toast.error("Randevular yüklenirken bir hata oluştu");
        throw error;
      }
    },
    enabled: true,
    refetchOnWindowFocus: true, // Changed to true for better real-time updates
    staleTime: 10000, // Reduced to 10 seconds for more frequent refresh
    refetchInterval: 30000 // Reduced to 30 seconds for more frequent refresh
  });
  
  const enhanceAppointments = useCallback(async () => {
    if (!appointmentsRaw?.length) {
      setAppointmentData([]);
      return;
    }
    
    const enhancedAppointments = [...appointmentsRaw];
    
    for (const appointment of enhancedAppointments) {
      if (appointment.personel_id && !appointment.personel) {
        try {
          const personel = await personelServisi.getirById(appointment.personel_id);
          if (personel) {
            appointment.personel = personel as Personel;
          }
        } catch (error) {
          console.error(`Error fetching personnel for appointment ${appointment.id}:`, error);
        }
      }
      
      if (appointment.musteri_id && !appointment.musteri) {
        try {
          const musteri = await musteriServisi.getirById(appointment.musteri_id);
          if (musteri) {
            // Add a role property to make it compatible with Profile type
            const customerWithRole = {
              ...musteri,
              role: 'customer' // Add the missing role property
            };
            appointment.musteri = customerWithRole as unknown as any;
          }
        } catch (error) {
          console.error(`Error fetching customer for appointment ${appointment.id}:`, error);
        }
      }
    }
    
    setAppointmentData(enhancedAppointments);
  }, [appointmentsRaw]);
  
  useEffect(() => {
    enhanceAppointments();
  }, [appointmentsRaw, enhanceAppointments]);
  
  const { mutate: completeAppointment, isPending: isCompletingAppointment } = useMutation({
    mutationFn: async (appointmentId: number) => {
      try {
        console.log(`Completing appointment with ID: ${appointmentId}`);
        
        // First mark the appointment as completed
        const result = await randevuServisi.guncelle(appointmentId, {
          durum: "tamamlandi"
        });
        
        // Make sure to create operations for personnel and customer
        await randevuServisi.randevuTamamlandi(appointmentId);
        
        // Force update shop statistics
        await personelIslemleriServisi.updateShopStatistics();
        
        return result;
      } catch (error) {
        console.error("Error during appointment completion:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries to trigger refetches
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['personnelOperations'] });
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      queryClient.invalidateQueries({ queryKey: ['shop-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['personelIslemleri'] });
      
      toast.success("Randevu tamamlandı");
      setConfirmDialogOpen(false);
      
      // Immediately trigger a refetch
      refetch();
    },
    onError: (error: any) => {
      console.error("Error completing appointment:", error);
      toast.error(`Randevu tamamlanırken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
      setConfirmDialogOpen(false);
    }
  });
  
  const { mutate: cancelAppointment, isPending: isCancelingAppointment } = useMutation({
    mutationFn: async (appointmentId: number) => {
      return randevuServisi.guncelle(appointmentId, {
        durum: "iptal_edildi"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['shop-statistics'] });
      
      toast.success("Randevu iptal edildi");
      setCancelDialogOpen(false);
      
      // Immediately trigger a refetch
      refetch();
    },
    onError: (error: any) => {
      console.error("Error canceling appointment:", error);
      toast.error(`Randevu iptal edilirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  });
  
  const handleCompleteClick = (appointment: Randevu) => {
    setSelectedAppointment(appointment);
    setConfirmDialogOpen(true);
  };
  
  const handleCancelClick = (appointment: Randevu) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };
  
  const handleAppointmentComplete = () => {
    if (selectedAppointment) {
      completeAppointment(selectedAppointment.id);
    }
  };
  
  const handleAppointmentCancel = () => {
    if (selectedAppointment) {
      cancelAppointment(selectedAppointment.id);
    }
  };

  return {
    appointments: appointmentData,
    isLoading,
    isError,
    error,
    selectedDate,
    setSelectedDate,
    selectedAppointment,
    setSelectedAppointment,
    confirmDialogOpen,
    setConfirmDialogOpen,
    cancelDialogOpen,
    setCancelDialogOpen,
    currentPersonelId,
    handleCompleteClick,
    handleCancelClick,
    handleAppointmentComplete,
    handleAppointmentCancel,
    isCompletingAppointment,
    isCancelingAppointment,
    refetch
  };
}
