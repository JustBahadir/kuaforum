import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { Randevu, Personel, Musteri } from "@/lib/supabase/types";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase/client';
import { personelServisi } from "@/lib/supabase";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";

import { Undo } from "lucide-react"; // icon import for Undo button (if needed in a component)
 
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
      try {
        let data: Randevu[] = [];
        
        if (dukkanId) {
          const randevular = await randevuServisi.dukkanRandevulariniGetir(dukkanId);
          data = randevular || [];
        } else {
          const randevular = await randevuServisi.kendiRandevulariniGetir();
          data = randevular || [];
        }
        
        data.forEach(app => {
          if(app.durum === "onaylandi" && app.notlar?.toLowerCase().includes("geri alındı")) {
            (app as any).isReturnedFromCancel = true;
          }
        });
        
        return data;
      } catch (error) {
        toast.error("Randevular yüklenirken bir hata oluştu");
        throw error;
      }
    },
    enabled: true,
    staleTime: 1000,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
  
  const enhanceAppointments = useCallback(async () => {
    if (!appointmentsRaw?.length) {
      setAppointmentData([]);
      return;
    }
    
    try {
      const enhancedAppointments = [...appointmentsRaw];
      
      const personelIds = enhancedAppointments
        .filter(app => app.personel_id && !app.personel)
        .map(app => app.personel_id)
        .filter((id, index, self) => id !== null && self.indexOf(id) === index) as number[];
      
      const customerIds = enhancedAppointments
        .filter(app => app.musteri_id && !app.musteri)
        .map(app => app.musteri_id)
        .filter((id, index, self) => id !== null && self.indexOf(id) === index) as number[];
      
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
          
          enhancedAppointments.forEach(app => {
            if (app.personel_id && !app.personel && personelMap[app.personel_id]) {
              app.personel = personelMap[app.personel_id];
            }
          });
        }
      }
      
      if (customerIds.length > 0) {
        const { data: customerData } = await supabase
          .from('musteriler')
          .select('*')
          .in('id', customerIds);
        
        if (customerData) {
          const customerMap = customerData.reduce((map, c) => {
            const customerWithRole = {
              ...c,
              role: 'customer'
            };
            map[c.id] = customerWithRole as unknown as any;
            return map;
          }, {} as Record<number, any>);
          
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
        const result = await randevuServisi.guncelle(appointmentId, {
          durum: "tamamlandi"
        });
        
        await randevuServisi.randevuTamamlandi(appointmentId);
        
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async (_, appointmentId) => {
      toast.success("Randevu tamamlandı");
      
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['personnelOperations'] });
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      queryClient.invalidateQueries({ queryKey: ['shop-statistics'] });
      
      await refetch();
      setConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Randevu tamamlanırken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
      setConfirmDialogOpen(false);
    }
  });
  
  const { mutate: cancelAppointment, isPending: isCancelingAppointment } = useMutation({
    mutationFn: async (appointmentId: number) => {
      return randevuServisi.guncelle(appointmentId, {
        durum: "iptal_edildi" as RandevuDurumu
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['shop-statistics'] });
      toast.success("Randevu iptal edildi");
      setCancelDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Randevu iptal edilirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  });

  // Undo cancel: reactivate appointment to "onaylandi"
  const { mutate: undoCancelAppointment, isPending: isUndoingCancel } = useMutation({
    mutationFn: async (appointmentId: number) => {
      // Update appointment status to "onaylandi" and add note
      return randevuServisi.guncelle(appointmentId, {
        durum: "onaylandi",
        notlar: "Geri alındı"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Randevu geri alındı");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Randevu geri alınırken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
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

  const handleUndoCancelClick = (appointment: Randevu) => {
    undoCancelAppointment(appointment.id);
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
    handleUndoCancelClick,
    handleAppointmentComplete,
    handleAppointmentCancel,
    isCompletingAppointment,
    isCancelingAppointment,
    isUndoingCancel,
    refetch
  };
}
