
import { useState, useEffect } from "react";
import { CalismaSaati } from "@/lib/supabase/types";
import { calismaSaatleriServisi, isletmeServisi } from "@/lib/supabase";
import { defaultCalismaSaatleriOlustur, getDefaultWorkingHours } from "../utils/workingHoursUtils";
import { toast } from "sonner";

export function useWorkingHours() {
  const [calisma_saatleri, setCalisma_saatleri] = useState<CalismaSaati[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchWorkingHours();
  }, []);
  
  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user's business ID
      const isletmeId = await isletmeServisi.getCurrentUserIsletmeId();
      
      if (!isletmeId) {
        throw new Error("İşletme kimliği bulunamadı");
      }
      
      // Get working hours for the business
      let saatler = await calismaSaatleriServisi.isletmeyeGoreGetir(isletmeId);
      
      // If no working hours exist, create default ones
      if (saatler.length === 0) {
        const varsayilanSaatler = defaultCalismaSaatleriOlustur(isletmeId);
        await calismaSaatleriServisi.topluGuncelle(varsayilanSaatler);
        saatler = varsayilanSaatler;
      }
      
      setCalisma_saatleri(saatler);
    } catch (error: any) {
      console.error("Çalışma saatleri getirilirken hata:", error);
      setError(error);
      toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  const updateWorkingHour = (id: string, updates: Partial<CalismaSaati>) => {
    setCalisma_saatleri((prevSaatler) => 
      prevSaatler.map((saat) => 
        saat.id === id ? { ...saat, ...updates } : saat
      )
    );
  };
  
  const saveWorkingHours = async () => {
    try {
      setLoading(true);
      await calismaSaatleriServisi.topluGuncelle(calisma_saatleri);
      toast.success("Çalışma saatleri başarıyla kaydedildi");
      return true;
    } catch (error: any) {
      console.error("Çalışma saatleri kaydedilirken hata:", error);
      toast.error("Çalışma saatleri kaydedilirken bir hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    calisma_saatleri,
    loading,
    error,
    updateWorkingHour,
    saveWorkingHours,
    yenile: fetchWorkingHours
  };
}
