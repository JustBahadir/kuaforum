
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { personelServisi } from "@/lib/supabase";
import { Randevu } from "@/lib/supabase/types";

export function useAppointments(dukkanId: number | undefined) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Randevu | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [currentPersonelId, setCurrentPersonelId] = useState<number | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });

  const { data: currentPersonel } = useQuery({
    queryKey: ['currentPersonel', currentUser?.id],
    queryFn: () => personelServisi.getirByAuthId(currentUser?.id || ""),
    enabled: !!currentUser?.id
  });
  
  useEffect(() => {
    if (currentPersonel) {
      setCurrentPersonelId(currentPersonel.id);
    }
  }, [currentPersonel]);
  
  const { 
    data: appointments = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['dukkan-randevular', dukkanId],
    queryFn: async () => {
      if (dukkanId) {
        return randevuServisi.dukkanRandevulariniGetir(dukkanId);
      }
      return [];
    },
    enabled: !!dukkanId
  });

  const handleAppointmentComplete = async () => {
    if (!selectedAppointment) return;
    
    try {
      await randevuServisi.guncelle(selectedAppointment.id, {
        durum: 'tamamlandi'
      });
      
      if (selectedAppointment.islemler && selectedAppointment.islemler.length > 0) {
        for (const islemId of selectedAppointment.islemler) {
          await personelIslemleriServisi.ekle({
            personel_id: selectedAppointment.personel_id || 0,
            islem_id: islemId,
            tutar: 0,
            odenen: 0,
            prim_yuzdesi: 0,
            puan: 0,
            aciklama: selectedAppointment.notlar || '',
            musteri_id: selectedAppointment.musteri_id,
            tarih: selectedAppointment.tarih,
            notlar: selectedAppointment.notlar || ''
          });
        }
      }
      
      toast.success("İşlem başarıyla tamamlandı ve işlem geçmişine eklendi");
      refetch();
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("İşlem tamamlanırken hata:", error);
      toast.error("İşlem tamamlanırken bir hata oluştu");
    }
  };
  
  const handleAppointmentCancel = async () => {
    if (!selectedAppointment) return;
    
    try {
      await randevuServisi.guncelle(selectedAppointment.id, {
        durum: 'iptal_edildi'
      });
      
      toast.success("Randevu iptal edildi");
      refetch();
      setCancelDialogOpen(false);
    } catch (error) {
      console.error("Randevu iptal edilirken hata:", error);
      toast.error("Randevu iptal edilirken bir hata oluştu");
    }
  };

  const handleCompleteClick = (appointment: Randevu) => {
    setSelectedAppointment(appointment);
    setConfirmDialogOpen(true);
  };

  const handleCancelClick = (appointment: Randevu) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  return {
    appointments,
    isLoading,
    selectedDate,
    setSelectedDate,
    currentPersonelId,
    selectedAppointment,
    confirmDialogOpen,
    setConfirmDialogOpen,
    cancelDialogOpen,
    setCancelDialogOpen,
    handleAppointmentComplete,
    handleAppointmentCancel,
    handleCompleteClick,
    handleCancelClick,
    refetch
  };
}
