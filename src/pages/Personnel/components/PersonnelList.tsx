
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Personel, personelServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PersonnelDialog } from "./PersonnelDialog";
import { PersonnelEditDialog } from "./PersonnelEditDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PersonnelList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [personelDuzenle, setPersonelDuzenle] = useState<Personel | null>(null);
  const queryClient = useQueryClient();

  const { data: personeller = [], isLoading } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  const { mutate: personelSil } = useMutation({
    mutationFn: (id: number) => personelServisi.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success("Personel başarıyla silindi.");
    },
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2" />
          Yeni Personel Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personeller.map((personel) => (
          <div
            key={personel.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{personel.ad_soyad}</h3>
                <p className="text-sm text-muted-foreground">
                  Telefon: {personel.telefon} | E-posta: {personel.eposta}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPersonelDuzenle(personel)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu personeli silmek istediğinizden emin misiniz?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => personelSil(personel.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PersonnelDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {personelDuzenle && (
        <PersonnelEditDialog
          personel={personelDuzenle}
          open={!!personelDuzenle}
          onOpenChange={(open) => !open && setPersonelDuzenle(null)}
        />
      )}
    </div>
  );
}
