
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WorkingHours } from "./WorkingHours";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { Loader2 } from "lucide-react";
import { CalismaSaati } from "@/lib/supabase/types";

// Add dukkanId to the props interface
interface WorkingHoursFormProps {
  dukkanId?: number | null;
}

export function WorkingHoursForm({ dukkanId }: WorkingHoursFormProps) {
  const queryClient = useQueryClient();
  const [gunler, setGunler] = useState<CalismaSaati[]>([
    { gun: "Pazartesi", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Salı", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Çarşamba", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Perşembe", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Cuma", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Cumartesi", acilis: "09:00", kapanis: "18:00", kapali: false },
    { gun: "Pazar", acilis: "09:00", kapanis: "18:00", kapali: true },
  ]);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Use the dukkanId in the query key if provided
  const { data: calismaSaatleri, isLoading } = useQuery({
    queryKey: ['calisma-saatleri', dukkanId],
    queryFn: calismaSaatleriServisi.hepsiniGetir,
    enabled: true,
  });

  useEffect(() => {
    if (calismaSaatleri && calismaSaatleri.length > 0) {
      setGunler(calismaSaatleri);
    }
  }, [calismaSaatleri]);

  const kaydetMutation = useMutation({
    mutationFn: async (gunler: CalismaSaati[]) => {
      // Eğer ID varsa güncelle, yoksa ekle
      const promises = gunler.map(gun => {
        if (gun.id) {
          return calismaSaatleriServisi.guncelle(gun.id, gun);
        } else {
          return calismaSaatleriServisi.ekle(gun);
        }
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calisma-saatleri'] });
      toast.success("Çalışma saatleri başarıyla kaydedildi");
    },
    onError: (error: any) => {
      console.error("Çalışma saatleri kaydedilirken hata:", error);
      toast.error("Çalışma saatleri kaydedilemedi: " + error.message);
    }
  });

  const saatleriGuncelle = (index: number, field: keyof CalismaSaati, value: any) => {
    const yeniGunler = [...gunler];
    yeniGunler[index] = { ...yeniGunler[index], [field]: value };
    setGunler(yeniGunler);
  };

  const kaydet = async () => {
    setYukleniyor(true);
    try {
      // Add dukkanId to each record if it exists
      const gunlerWithDukkan = dukkanId 
        ? gunler.map(gun => ({ ...gun, dukkan_id: dukkanId }))
        : gunler;
        
      await kaydetMutation.mutateAsync(gunlerWithDukkan);
    } catch (error) {
      console.error("Kaydetme işlemi sırasında hata:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Çalışma saatleri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkingHours gunler={gunler} onChange={saatleriGuncelle} />
      
      <Button 
        onClick={kaydet} 
        className="w-full md:w-auto"
        disabled={yukleniyor}
      >
        {yukleniyor ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Kaydediliyor
          </>
        ) : (
          "Değişiklikleri Kaydet"
        )}
      </Button>
    </div>
  );
}
