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
import { Copy } from "lucide-react";

interface PersonnelEditDialogProps {
  personelId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditComplete?: () => void;
}

export function PersonnelEditDialog({ personelId, open, onOpenChange, onEditComplete }: PersonnelEditDialogProps) {
  const [personelDuzenle, setPersonelDuzenle] = useState<Personel | null>(null);
  const [formattedIBAN, setFormattedIBAN] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { userRole } = useCustomerAuth();
  const queryClient = useQueryClient();

  const { data: personel, isLoading, refetch } = useQuery({
    queryKey: ['personel', personelId],
    queryFn: () => personelServisi.getirById(personelId),
    enabled: open && personelId > 0,
    retry: 3,
    retryDelay: 1000
  });

  useEffect(() => {
    if (personel) {
      setPersonelDuzenle(personel);
      if (personel.iban) {
        setFormattedIBAN(formatIBAN(personel.iban));
      } else {
        setFormattedIBAN('');
      }
    }
  }, [personel]);

  const formatIBAN = (value: string) => {
    let cleaned = value.replace(/[^0-9TR]/gi, '');
    if (!cleaned.startsWith('TR')) {
      cleaned = 'TR' + cleaned.replace(/\D/g, '');
    } else {
      cleaned = 'TR' + cleaned.substring(2).replace(/\D/g, '');
    }
    cleaned = cleaned.substring(0, 26);
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    return formatted;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopyalandı");
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
      const { id } = personelDuzenle;
      const guncellenecekVeriler: Partial<Personel> = {
        maas: personelDuzenle.maas,
        calisma_sistemi: personelDuzenle.calisma_sistemi,
      };
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
          
          {isAdmin && (
            <div className="p-4 bg-amber-50 rounded-lg mb-4">
              <p className="text-sm text-amber-600">
                Dükkan yöneticisi olarak, sadece maaş ve çalışma sistemi bilgilerini değiştirebilirsiniz.
                Personel, kendi kişisel bilgilerini kendi profil sayfasından güncelleyebilir.
              </p>
            </div>
          )}
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_ad_soyad">Ad Soyad</Label>
              <Input
                id="edit_ad_soyad"
                value={personelDuzenle.ad_soyad}
                disabled={true}
                className="bg-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_telefon">Telefon</Label>
              <Input
                id="edit_telefon"
                type="tel"
                value={personelDuzenle.telefon}
                disabled={true}
                className="bg-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_eposta">E-posta</Label>
              <Input
                id="edit_eposta"
                type="email"
                value={personelDuzenle.eposta}
                disabled={true}
                className="bg-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_adres">Adres</Label>
              <Input
                id="edit_adres"
                value={personelDuzenle.adres}
                disabled={true}
                className="bg-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_personel_no">Personel No</Label>
              <Input
                id="edit_personel_no"
                value={personelDuzenle.personel_no}
                disabled={true}
                className="bg-gray-100"
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
              <Label htmlFor="edit_iban">IBAN (Personel tarafından güncellenir)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit_iban"
                  value={formattedIBAN}
                  disabled={true}
                  className="bg-gray-100 flex-1"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  maxLength={36}
                />
                {formattedIBAN && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(formattedIBAN)}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                IBAN bilgisi personel profilinden otomatik olarak senkronize edilir. Personel kendi profilinden bu bilgiyi güncelleyebilir.
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
