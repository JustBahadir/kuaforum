
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
    staleTime: 1000, // Reduced to 1 second to improve freshness
    gcTime: 1000 * 30, // Cache for 30 seconds (replaced cacheTime with gcTime)
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
  
  // Optimize the enhancement of appointments by using a more efficient approach
  const enhanceAppointments = useCallback(async () => {
    if (!appointmentsRaw?.length) {
      setAppointmentData([]);
      return;
    }
    
    try {
      const enhancedAppointments = [...appointmentsRaw];
      
      // Get all personel IDs that need to be fetched
      const personelIds = enhancedAppointments
        .filter(app => app.personel_id && !app.personel)
        .map(app => app.personel_id)
        .filter((id, index, self) => id !== null && self.indexOf(id) === index) as number[];
      
      // Get all customer IDs that need to be fetched
      const customerIds = enhancedAppointments
        .filter(app => app.musteri_id && !app.musteri)
        .map(app => app.musteri_id)
        .filter((id, index, self) => id !== null && self.indexOf(id) === index) as number[];
      
      // Fetch all personnel in one query
      if (personelIds.length > 0) {
        const { data: personelData } = await supabase
          .from('personel')
          .select('*')
          .in('id', personelIds);
        
        if (personelData) {
          const personelMap = personelData.reduce((map, p) => {
            map[p.id] = p;
            return map;
          }, {} as Record<number, Personel>);
          
          // Assign personnel to appointments
          enhancedAppointments.forEach(app => {
            if (app.personel_id && !app.personel && personelMap[app.personel_id]) {
              app.personel = personelMap[app.personel_id];
            }
          });
        }
      }
      
      // Fetch all customers in one query
      if (customerIds.length > 0) {
        const { data: customerData } = await supabase
          .from('musteriler')
          .select('*')
          .in('id', customerIds);
        
        if (customerData) {
          const customerMap = customerData.reduce((map, c) => {
            // Add a role property to make it compatible with Profile type
            const customerWithRole = {
              ...c,
              role: 'customer'
            };
            map[c.id] = customerWithRole as unknown as any;
            return map;
          }, {} as Record<number, any>);
          
          // Assign customers to appointments
          enhancedAppointments.forEach(app => {
            if (app.musteri_id && !app.musteri && customerMap[app.musteri_id]) {
              app.musteri = customerMap[app.musteri_id];
            }
          });
        }
      }
      
      setAppointmentData(enhancedAppointments);
    } catch (error) {
      console.error("Error enhancing appointments:", error);
    }
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
