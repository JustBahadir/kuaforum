
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dukkanServisi, personelServisi } from "@/lib/supabase";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { toast } from "sonner";

export const useShopData = (dukkanId?: number | null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isletmeData, setIsletmeData] = useState<any>(null);
  const [personelListesi, setPersonelListesi] = useState<any[]>([]);
  const [calisma_saatleri, setCalismaSaatleri] = useState<any[]>([]);

  const { data: dukkan, isLoading: dukkanLoading, error: dukkanError } = useQuery({
    queryKey: ["dukkan", dukkanId],
    queryFn: () => (dukkanId ? dukkanServisi.getirById(dukkanId) : null),
    enabled: !!dukkanId,
  });

  const { data: personeller, isLoading: personelLoading } = useQuery({
    queryKey: ["personeller"],
    queryFn: () => personelServisi.hepsiniGetir(),
    enabled: !!dukkanId, // Only fetch if we have a dukkan ID
  });

  const { data: saatler, isLoading: saatlerLoading } = useQuery({
    queryKey: ["calisma_saatleri", dukkanId],
    queryFn: () =>
      dukkanId ? calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId) : [],
    enabled: !!dukkanId,
  });

  useEffect(() => {
    if (dukkanError) {
      setError((dukkanError as Error).message);
      toast.error("İşletme bilgileri alınırken bir hata oluştu");
    }
  }, [dukkanError]);

  useEffect(() => {
    if (!dukkanLoading && !personelLoading && !saatlerLoading) {
      setLoading(false);
      setIsletmeData(dukkan);
      
      // Only set personnel data if we have valid data from the same shop
      if (personeller && Array.isArray(personeller)) {
        // Double check that personnel belongs to this shop
        const filteredPersonnel = personeller.filter(
          (p) => p.dukkan_id === dukkanId
        );
        setPersonelListesi(filteredPersonnel);
      }
      
      if (saatler && Array.isArray(saatler)) {
        setCalismaSaatleri(saatler);
      }
    }
  }, [dukkan, personeller, saatler, dukkanLoading, personelLoading, saatlerLoading, dukkanId]);

  return {
    isletmeData,
    loading,
    error,
    personelListesi,
    calisma_saatleri,
  };
};
