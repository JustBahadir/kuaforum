
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { Randevu } from "@/lib/supabase/types";
import { toast } from "sonner";
import { personelServisi } from "@/lib/supabase";
import { supabase } from '@/lib/supabase/client';

export function useAppointments(dukkanId?: number) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Randevu | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [currentPersonelId, setCurrentPersonelId] = useState<number | undefined>(undefined);
  
  const queryClient = useQueryClient();
  
  // Get current staff info if logged in as staff
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
  
  // Fetch appointments using the security definer functions
  const { 
    data: appointments = [], 
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
          // For staff/admin users - use the RPC function to avoid recursion
          const { data: randevular, error } = await supabase
            .rpc('get_appointments_by_dukkan', { p_dukkan_id: dukkanId });
            
          if (error) throw error;
          
          // Fetch customer and staff details separately to avoid recursion
          if (randevular && randevular.length > 0) {
            for (let i = 0; i < randevular.length; i++) {
              const randevu = randevular[i];
              
              // Get customer details if customer_id exists
              if (randevu.customer_id) {
                const { data: musteriData } = await supabase
                  .from('profiles')
                  .select('first_name, last_name')
                  .eq('id', randevu.customer_id)
                  .maybeSingle();
                  
                if (musteriData) {
                  randevu.musteri = musteriData;
                }
              }
              
              // Get personnel details if personel_id exists
              if (randevu.personel_id) {
                const { data: personelData } = await supabase
                  .from('personel')
                  .select('ad_soyad')
                  .eq('id', randevu.personel_id)
                  .maybeSingle();
                  
                if (personelData) {
                  randevu.personel = personelData;
                }
              }
            }
          }
          
          data = randevular || [];
        } else {
          // For regular customers
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error("Oturum açmış kullanıcı bulunamadı");
          }

          // Use the RPC function to avoid recursion
          const { data: randevular, error } = await supabase
            .rpc('get_customer_appointments', { p_customer_id: user.id });
            
          if (error) throw error;
          
          // Fetch personnel details separately to avoid recursion
          if (randevular && randevular.length > 0) {
            for (let i = 0; i < randevular.length; i++) {
              const randevu = randevular[i];
              
              // Get personnel details if personel_id exists
              if (randevu.personel_id) {
                const { data: personelData } = await supabase
                  .from('personel')
                  .select('ad_soyad')
                  .eq('id', randevu.personel_id)
                  .maybeSingle();
                  
                if (personelData) {
                  randevu.personel = personelData;
                }
              }
            }
          }
          
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
    enabled: true // Always enable the query
  });
  
  // Mark appointment as complete
  const { mutate: completeAppointment } = useMutation({
    mutationFn: async (appointmentId: number) => {
      return randevuServisi.guncelle(appointmentId, {
        durum: "tamamlandi"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Randevu tamamlandı olarak işaretlendi");
      setConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error completing appointment:", error);
      toast.error(`Randevu tamamlanırken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  });
  
  // Cancel appointment
  const { mutate: cancelAppointment } = useMutation({
    mutationFn: async (appointmentId: number) => {
      return randevuServisi.guncelle(appointmentId, {
        durum: "iptal_edildi"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Randevu iptal edildi");
      setCancelDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error canceling appointment:", error);
      toast.error(`Randevu iptal edilirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  });
  
  // Handle complete button click
  const handleCompleteClick = (appointment: Randevu) => {
    setSelectedAppointment(appointment);
    setConfirmDialogOpen(true);
  };
  
  // Handle cancel button click
  const handleCancelClick = (appointment: Randevu) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };
  
  // Confirm completion
  const handleAppointmentComplete = () => {
    if (selectedAppointment) {
      completeAppointment(selectedAppointment.id);
    }
  };
  
  // Confirm cancellation
  const handleAppointmentCancel = () => {
    if (selectedAppointment) {
      cancelAppointment(selectedAppointment.id);
    }
  };

  return {
    appointments,
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
    refetch
  };
}
