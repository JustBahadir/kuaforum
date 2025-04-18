
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { PersonnelForm } from "./PersonnelForm";
import { PersonnelCard } from "./PersonnelCard";
import { toast } from "sonner";
import { Search, RefreshCcw } from "lucide-react";

interface PersonnelListProps {
  personnel?: any[];
  onPersonnelSelect?: (id: number | null) => void;
}

export function PersonnelList({ personnel: externalPersonnel, onPersonnelSelect }: PersonnelListProps) {
  const [isAddPersonnelDialogOpen, setIsAddPersonnelDialogOpen] = useState(false);
  const [isEditPersonnelDialogOpen, setIsEditPersonnelDialogOpen] = useState(false);
  const [isPersonnelDetailsDialogOpen, setIsPersonnelDetailsDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [search, setSearch] = useState("");
  
  const queryClient = useQueryClient();

  const { data: personeller = [], isLoading, refetch: refreshList } = useQuery({
    queryKey: ['personeller'],
    queryFn: () => personelServisi.hepsiniGetir(),
    enabled: !externalPersonnel
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
    onError: (error) => {
      toast.error("Personel silinirken bir hata oluştu.");
      console.error("Error deleting personnel:", error);
    }
  });

  const handleAddPersonnelSubmit = async (values: any) => {
    // Map any email field to eposta
    if (values.email) {
      values.eposta = values.email;
      delete values.email;
    }
    
    try {
      await personelServisi.ekle(values);
      queryClient.invalidateQueries({ queryKey: ['personeller'] });
      toast.success("Personel başarıyla eklendi.");
      setIsAddPersonnelDialogOpen(false);
    } catch (error) {
      console.error("Error adding personnel:", error);
      toast.error("Personel eklenirken bir hata oluştu.");
    }
  };

  const handleEditPersonnelSubmit = async (values: any) => {
    const { id, ...data } = values;
    
    // Map any email field to eposta
    if (data.email) {
      data.eposta = data.email;
      delete data.email;
    }
    
    try {
      await personelServisi.guncelle(id, data);
      queryClient.invalidateQueries({ queryKey: ['personeller'] });
      toast.success("Personel başarıyla güncellendi.");
      setIsEditPersonnelDialogOpen(false);
    } catch (error) {
      console.error("Error updating personnel:", error);
      toast.error("Personel güncellenirken bir hata oluştu.");
    }
  };

  // Calculate operation count and total revenue for each personnel
  const enrichedPersonnel = personnelData.map(p => {
    // Here you would typically calculate these from operations data
    // For now, we'll just stub them
    return {
      ...p,
      islem_sayisi: p.islem_sayisi || 0,
      toplam_ciro: p.toplam_ciro || 0
    };
  });

  const filteredPersonnel = enrichedPersonnel.filter(p => 
    p.ad_soyad?.toLowerCase().includes(search.toLowerCase())
  );

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
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Personel ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => refreshList()}
                className="h-10 w-10"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button onClick={() => {
                setSelectedPersonnel(null);
                setIsAddPersonnelDialogOpen(true);
              }}>
                Personel Ekle
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              {search ? 'Arama kriterlerinize uygun personel bulunamadı.' : 'Henüz personel eklenmemiş.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPersonnel.map((personnel) => (
                <PersonnelCard
                  key={personnel.id}
                  personnel={personnel}
                  onClick={() => handlePersonnelSelect(personnel)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PersonnelDetailsDialog
        isOpen={isPersonnelDetailsDialogOpen}
        onOpenChange={setIsPersonnelDetailsDialogOpen}
        personnel={selectedPersonnel}
        onUpdate={() => {
          setIsEditPersonnelDialogOpen(true);
          setIsPersonnelDetailsDialogOpen(false);
        }}
      />

      <AlertDialog
        open={isAddPersonnelDialogOpen}
        onOpenChange={setIsAddPersonnelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personel Ekle</AlertDialogTitle>
          </AlertDialogHeader>
          <PersonnelForm
            personnel={null}
            readOnly={false}
            showWorkInfo={true}
            showPersonalInfo={true}
            onSubmit={handleAddPersonnelSubmit}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAddPersonnelSubmit((document.querySelector('form') as HTMLFormElement)?.elements)}
            >
              Kaydet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isEditPersonnelDialogOpen}
        onOpenChange={setIsEditPersonnelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personel Düzenle</AlertDialogTitle>
            <AlertDialogDescription>
              Personel bilgilerini güncelleyebilirsiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <PersonnelForm
            personnel={selectedPersonnel}
            readOnly={false}
            showWorkInfo={true}
            showPersonalInfo={true}
            onSubmit={handleEditPersonnelSubmit}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsEditPersonnelDialogOpen(false)}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleEditPersonnelSubmit({ ...selectedPersonnel, ...(document.querySelector('form') as HTMLFormElement)?.elements })}
            >
              Kaydet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
