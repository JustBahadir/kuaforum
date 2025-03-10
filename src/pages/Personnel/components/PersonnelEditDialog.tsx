import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Personel, personelServisi, profilServisi } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface PersonnelEditDialogProps {
  personelId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditComplete?: () => void;
}

// IBAN formatter function
const formatIBAN = (value: string) => {
  // Ensure it starts with TR
  let cleaned = value.replace(/[^A-Z0-9]/g, '');
  
  // If it doesn't start with TR, add it
  if (!cleaned.startsWith('TR')) {
    cleaned = 'TR' + cleaned.replace(/\D/g, '');
  }
  
  // Limit to 26 characters (TR + 24 digits)
  cleaned = cleaned.substring(0, 26);
  
  // Format in groups of 4
  let formatted = '';
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += cleaned[i];
  }
  
  return formatted;
};

export function PersonnelEditDialog({ personelId, open, onOpenChange, onEditComplete }: PersonnelEditDialogProps) {
  const [personelDuzenle, setPersonelDuzenle] = useState<Personel | null>(null);
  const [formattedIBAN, setFormattedIBAN] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { userRole } = useCustomerAuth();
  const queryClient = useQueryClient();

  // Fetch personel data based on personelId
  const { data: personel, isLoading, refetch } = useQuery({
    queryKey: ['personel', personelId],
    queryFn: () => personelServisi.getirById(personelId),
    enabled: open && personelId > 0,
    retry: 3,
    retryDelay: 1000
  });

  // Update personelDuzenle state when personel data is loaded
  useEffect(() => {
    if (personel) {
      setPersonelDuzenle(personel);
      // Format IBAN if it exists
      if (personel.iban) {
        setFormattedIBAN(formatIBAN(personel.iban));
      } else {
        setFormattedIBAN('');
      }
    }
  }, [personel]);

  // Handle IBAN changes
  const handleIBANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow TR and digits
    const rawValue = e.target.value.replace(/[^0-9TR]/gi, '');
    const formattedValue = formatIBAN(rawValue);
    setFormattedIBAN(formattedValue);
    
    // Update the personelDuzenle with the unformatted value for saving
    setPersonelDuzenle((prev) => 
      prev ? { ...prev, iban: formattedValue.replace(/\s/g, '') } : null
    );
  };

  const { mutate: personelGuncelle } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Personel> }) =>
      personelServisi.guncelle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      setIsSaving(false);
      toast.success("Personel başarıyla güncellendi.");
      onOpenChange(false);
      if (onEditComplete) {
        onEditComplete();
      }
    },
    onError: (error) => {
      setIsSaving(false);
      toast.error("Personel güncellenirken bir hata oluştu: " + (error as Error).message);
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (personelDuzenle) {
      setIsSaving(true);
      
      // Only send the fields that should be editable
      const { id } = personelDuzenle;
      const guncellenecekVeriler: Partial<Personel> = {
        maas: personelDuzenle.maas,
        calisma_sistemi: personelDuzenle.calisma_sistemi,
        prim_yuzdesi: personelDuzenle.prim_yuzdesi,
      };
      
      // If the user is owner or admin, they can edit more fields
      if (userRole === 'admin') {
        Object.assign(guncellenecekVeriler, {
          ad_soyad: personelDuzenle.ad_soyad,
          telefon: personelDuzenle.telefon,
          eposta: personelDuzenle.eposta,
          adres: personelDuzenle.adres,
          personel_no: personelDuzenle.personel_no,
          iban: personelDuzenle.iban?.replace(/\s/g, '')
        });
      }
      
      personelGuncelle({ id, data: guncellenecekVeriler });
    }
  };

  if (isLoading || !personelDuzenle) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personel Düzenle</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleUpdate}>
          <DialogHeader>
            <DialogTitle>Personel Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_ad_soyad">Ad Soyad</Label>
              <Input
                id="edit_ad_soyad"
                value={personelDuzenle.ad_soyad}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev ? { ...prev, ad_soyad: e.target.value } : null
                  )
                }
                disabled={!isAdmin}
                className={!isAdmin ? "bg-gray-100" : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_telefon">Telefon</Label>
              <Input
                id="edit_telefon"
                type="tel"
                value={personelDuzenle.telefon}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev ? { ...prev, telefon: e.target.value } : null
                  )
                }
                disabled={!isAdmin}
                className={!isAdmin ? "bg-gray-100" : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_eposta">E-posta</Label>
              <Input
                id="edit_eposta"
                type="email"
                value={personelDuzenle.eposta}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev ? { ...prev, eposta: e.target.value } : null
                  )
                }
                disabled={!isAdmin}
                className={!isAdmin ? "bg-gray-100" : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_adres">Adres</Label>
              <Input
                id="edit_adres"
                value={personelDuzenle.adres}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev ? { ...prev, adres: e.target.value } : null
                  )
                }
                disabled={!isAdmin}
                className={!isAdmin ? "bg-gray-100" : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_personel_no">Personel No</Label>
              <Input
                id="edit_personel_no"
                value={personelDuzenle.personel_no}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev ? { ...prev, personel_no: e.target.value } : null
                  )
                }
                disabled={!isAdmin}
                className={!isAdmin ? "bg-gray-100" : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_maas">Maaş</Label>
              <Input
                id="edit_maas"
                type="number"
                value={personelDuzenle.maas}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev ? { ...prev, maas: Number(e.target.value) } : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_calisma_sistemi">Çalışma Sistemi</Label>
              <Select
                onValueChange={(value) =>
                  setPersonelDuzenle((prev) =>
                    prev
                      ? {
                          ...prev,
                          calisma_sistemi: value as "haftalik" | "aylik",
                        }
                      : null
                  )
                }
                value={personelDuzenle.calisma_sistemi}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Çalışma Sistemi Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haftalik">Haftalık</SelectItem>
                  <SelectItem value="aylik">Aylık</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_prim_yuzdesi">Prim Yüzdesi</Label>
              <Input
                id="edit_prim_yuzdesi"
                type="number"
                value={personelDuzenle.prim_yuzdesi}
                onChange={(e) =>
                  setPersonelDuzenle((prev) =>
                    prev
                      ? { ...prev, prim_yuzdesi: Number(e.target.value) }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_iban">IBAN</Label>
              <Input
                id="edit_iban"
                value={formattedIBAN}
                onChange={handleIBANChange}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                disabled={!isAdmin}
                className={!isAdmin ? "bg-gray-100" : ""}
                maxLength={36}
              />
              <p className="text-xs text-gray-500">
                IBAN bilgisi personel profilinden senkronize edilecektir.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
