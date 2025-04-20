
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi, personelIslemleriServisi } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { PersonnelForm } from "./PersonnelForm";
import { PersonnelCard } from "./PersonnelCard";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface PersonnelListProps {
  personnel?: any[];
  onPersonnelSelect?: (id: number | null) => void;
}

export function PersonnelList({
  personnel: externalPersonnel,
  onPersonnelSelect
}: PersonnelListProps) {
  const { userRole } = useCustomerAuth();
  const [isAddPersonnelDialogOpen, setIsAddPersonnelDialogOpen] = useState(false);
  const [isPersonnelDetailsDialogOpen, setIsPersonnelDetailsDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const {
    data: personeller = [],
    isLoading,
    refetch: refreshList
  } = useQuery({
    queryKey: ['personeller'],
    queryFn: () => personelServisi.hepsiniGetir(),
    enabled: !externalPersonnel
  });
  const {
    data: personelIslemleri = []
  } = useQuery({
    queryKey: ['personel-islemleri', 'last-30-days'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const data = await personelIslemleriServisi.hepsiniGetir();
      return data.filter(islem => {
        const islemDate = new Date(islem.created_at || '');
        return islemDate >= thirtyDaysAgo;
      });
    }
  });
  const personnelData = externalPersonnel || personeller;
  const handlePersonnelSelect = (personnel: any) => {
    setSelectedPersonnel(personnel);
    setIsPersonnelDetailsDialogOpen(true);
    if (onPersonnelSelect) {
      onPersonnelSelect(personnel.id);
    }
  };
  const deletePersonnelMutation = useMutation({
    mutationFn: async (id: number) => {
      return await personelServisi.sil(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['personeller']
      });
      toast.success("Personel başarıyla silindi.");
    },
    onError: error => {
      toast.error("Personel silinirken bir hata oluştu.");
      console.error("Error deleting personnel:", error);
    }
  });
  const handleAddPersonnelSubmit = async (values: any) => {
    if (values.email) {
      values.eposta = values.email;
      delete values.email;
    }
    try {
      await personelServisi.ekle(values);
      queryClient.invalidateQueries({
        queryKey: ['personeller']
      });
      toast.success("Personel başarıyla eklendi.");
      setIsAddPersonnelDialogOpen(false);
    } catch (error) {
      console.error("Error adding personnel:", error);
      toast.error("Personel eklenirken bir hata oluştu.");
    }
  };
  
  const enrichedPersonnel = personnelData.map(p => {
    const personnelOperations = personelIslemleri.filter(islem => islem.personel_id === p.id);
    return {
      ...p,
      islem_sayisi: personnelOperations.length,
      toplam_ciro: personnelOperations.reduce((sum, islem) => sum + (islem.tutar || 0), 0)
    };
  });
  const filteredPersonnel = enrichedPersonnel.filter(p => p.ad_soyad?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personel Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm personelleri görüntüleyebilir, düzenleyebilir ve silebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Input type="search" placeholder="Personel ara..." value={search} onChange={e => setSearch(e.target.value)} className="pl-4" />
            </div>
            <div className="flex gap-2">
              {userRole === 'admin' && (
                <Button onClick={() => setIsAddPersonnelDialogOpen(true)} >
                  Personel Ekle
                </Button>
              )}
            </div>
          </div>

          {/* Personel Kartları */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {filteredPersonnel.map(personnel => (
              <PersonnelCard
                key={personnel.id}
                personnel={personnel}
                onClick={() => handlePersonnelSelect(personnel)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personel Ekleme Dialogu */}
      {userRole === 'admin' && isAddPersonnelDialogOpen && (
        <PersonnelForm
          onSubmit={handleAddPersonnelSubmit}
          isLoading={false}
        />
      )}

      {/* Personel Detayları Dialogu */}
      {selectedPersonnel && (
        <PersonnelDetailsDialog
          personnel={selectedPersonnel}
          isOpen={isPersonnelDetailsDialogOpen}
          onOpenChange={setIsPersonnelDetailsDialogOpen}
        />
      )}
    </div>
  );
}
