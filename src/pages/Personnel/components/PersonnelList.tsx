
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Trash, Plus } from "lucide-react";
import { PersonnelDialog } from "./PersonnelDialog";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PersonnelList() {
  const { userRole } = useCustomerAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPersonel, setSelectedPersonel] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personelToDelete, setPersonelToDelete] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: personeller = [], isLoading, error } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });
  
  const handleOpenDetailsDialog = (personelId: number) => {
    setSelectedPersonel(personelId);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setSelectedPersonel(null);
    setDetailsDialogOpen(false);
  };

  const deletePersonelMutation = useMutation({
    mutationFn: (id: number) => personelServisi.sil(id),
    onSuccess: () => {
      toast.success("Personel başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      setDeleteDialogOpen(false);
      setPersonelToDelete(null);
    },
    onError: (error) => {
      toast.error(`Silme işlemi başarısız: ${error.message}`);
    }
  });

  const handleOpenDeleteDialog = (personelId: number) => {
    setPersonelToDelete(personelId);
    setDeleteDialogOpen(true);
  };

  const handleDeletePersonel = () => {
    if (personelToDelete) {
      deletePersonelMutation.mutate(personelToDelete);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Personel verisi alınamadı: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  if (userRole !== 'admin') {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca yöneticiler personel yönetimi yapabilir.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personel Listesi</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Personel Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : personeller.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            Kayıtlı personel bulunmamaktadır.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personeller.map((personel) => (
              <Card key={personel.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {personel.ad_soyad.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium">{personel.ad_soyad}</h3>
                        <p className="text-sm text-muted-foreground">
                          {personel.personel_no}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Telefon:</span>
                        <span>{personel.telefon}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">E-posta:</span>
                        <span className="truncate max-w-[150px]">{personel.eposta}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prim:</span>
                        <span>%{personel.prim_yuzdesi}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Çalışma:</span>
                        <span>{personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dükkan:</span>
                        <span>{personel.dukkan?.ad || 'Atanmamış'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-t divide-x">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none" 
                      title="Detaylar"
                      onClick={() => handleOpenDetailsDialog(personel.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">Detaylar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none text-destructive" 
                      title="Sil"
                      onClick={() => handleOpenDeleteDialog(personel.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">Sil</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <PersonnelDialog 
          open={addDialogOpen} 
          onOpenChange={setAddDialogOpen} 
        />

        {selectedPersonel && (
          <PersonnelDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={handleCloseDetailsDialog}
            personelId={selectedPersonel}
          />
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Personel Silme</AlertDialogTitle>
              <AlertDialogDescription>
                Bu personeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePersonel}
                disabled={deletePersonelMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletePersonelMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
