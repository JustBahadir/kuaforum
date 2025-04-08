
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { PersonnelAnalyst } from "@/components/analyst/PersonnelAnalyst";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { Personel } from "@/lib/supabase/types";

interface PersonnelListProps {
  onPersonnelSelect: (id: number) => void;
}

export function PersonnelList({ onPersonnelSelect }: PersonnelListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPersonnelForDetails, setSelectedPersonnelForDetails] = useState<Personel | null>(null);
  
  // Form state
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [eposta, setEposta] = useState("");
  const [adres, setAdres] = useState("");
  const [maas, setMaas] = useState<number>(0);
  const [primYuzdesi, setPrimYuzdesi] = useState<number>(0);
  const [calisma_sistemi, setCalisma_sistemi] = useState<"haftalik" | "aylik">("aylik");
  const [iban, setIban] = useState("");
  
  const queryClient = useQueryClient();
  
  const { data: personeller = [], isLoading } = useQuery({
    queryKey: ['personel-list'],
    queryFn: personelServisi.hepsiniGetir
  });
  
  const { mutate: addPersonnel } = useMutation({
    mutationFn: personelServisi.ekle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel-list'] });
      resetForm();
      setIsDialogOpen(false);
      toast.success("Personel başarıyla eklendi");
    },
    onError: (error) => {
      console.error("Personel eklenirken hata:", error);
      toast.error("Personel eklenirken bir hata oluştu");
    }
  });
  
  const { mutate: updatePersonnel } = useMutation({
    mutationFn: ({ id, personel }: { id: number; personel: any }) => 
      personelServisi.guncelle(id, personel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel-list'] });
      resetForm();
      setIsDialogOpen(false);
      toast.success("Personel başarıyla güncellendi");
    },
    onError: (error) => {
      console.error("Personel güncellenirken hata:", error);
      toast.error("Personel güncellenirken bir hata oluştu");
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const personelData = {
      ad_soyad: adSoyad,
      telefon,
      eposta,
      adres,
      maas: Number(maas),
      prim_yuzdesi: Number(primYuzdesi),
      calisma_sistemi, // "haftalik" | "aylik"
      iban,
      personel_no: Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    
    if (selectedPersonnel) {
      updatePersonnel({ id: selectedPersonnel.id, personel: personelData });
    } else {
      addPersonnel(personelData);
    }
  };
  
  const handleEdit = (personel: any) => {
    setSelectedPersonnel(personel);
    setAdSoyad(personel.ad_soyad || "");
    setTelefon(personel.telefon || "");
    setEposta(personel.eposta || "");
    setAdres(personel.adres || "");
    setMaas(personel.maas || 0);
    setPrimYuzdesi(personel.prim_yuzdesi || 0);
    setCalisma_sistemi(personel.calisma_sistemi || "aylik");
    setIban(personel.iban || "");
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    resetForm();
    setSelectedPersonnel(null);
    setIsDialogOpen(true);
  };
  
  const resetForm = () => {
    setAdSoyad("");
    setTelefon("");
    setEposta("");
    setAdres("");
    setMaas(0);
    setPrimYuzdesi(0);
    setCalisma_sistemi("aylik");
    setIban("");
  };

  const handlePersonnelClick = (personel: Personel) => {
    setSelectedPersonnelForDetails(personel);
    setDetailsDialogOpen(true);
    onPersonnelSelect(personel.id);
  };
  
  const filteredPersonnel = personeller.filter(personel =>
    personel.ad_soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    personel.telefon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    personel.eposta?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personel Listesi</CardTitle>
        <Button onClick={handleAddNew} className="flex items-center gap-1">
          <Plus size={16} />
          Personel Ekle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input 
            placeholder="Ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : filteredPersonnel.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPersonnel.map((personel) => (
                <div
                  key={personel.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handlePersonnelClick(personel)}
                >
                  <div className="p-4 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold mr-3">
                      {personel.ad_soyad?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{personel.ad_soyad}</h3>
                      <p className="text-sm text-gray-500">Personel</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(personel);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add PersonnelAnalyst right below the personnel list */}
            <div className="mt-4">
              <PersonnelAnalyst />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Personel bulunamadı
          </div>
        )}
      </CardContent>
      
      {/* Personnel Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPersonnel ? "Personeli Düzenle" : "Yeni Personel Ekle"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adSoyad" className="text-right">
                  Ad Soyad
                </Label>
                <Input 
                  id="adSoyad" 
                  className="col-span-3" 
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefon" className="text-right">
                  Telefon
                </Label>
                <Input 
                  id="telefon" 
                  className="col-span-3" 
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eposta" className="text-right">
                  E-posta
                </Label>
                <Input 
                  id="eposta" 
                  className="col-span-3" 
                  type="email"
                  value={eposta}
                  onChange={(e) => setEposta(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adres" className="text-right">
                  Adres
                </Label>
                <Input 
                  id="adres" 
                  className="col-span-3" 
                  value={adres}
                  onChange={(e) => setAdres(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maas" className="text-right">
                  Maaş
                </Label>
                <Input 
                  id="maas" 
                  className="col-span-3" 
                  type="number"
                  value={maas}
                  onChange={(e) => setMaas(Number(e.target.value))}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="primYuzdesi" className="text-right">
                  Prim %
                </Label>
                <Input 
                  id="primYuzdesi" 
                  className="col-span-3" 
                  type="number"
                  value={primYuzdesi}
                  onChange={(e) => setPrimYuzdesi(Number(e.target.value))}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="calisma_sistemi" className="text-right">
                  Çalışma
                </Label>
                <select
                  id="calisma_sistemi"
                  className="col-span-3 border rounded-md h-10 px-3"
                  value={calisma_sistemi}
                  onChange={(e) => setCalisma_sistemi(e.target.value as "haftalik" | "aylik")}
                  required
                >
                  <option value="haftalik">Haftalık</option>
                  <option value="aylik">Aylık</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="iban" className="text-right">
                  IBAN
                </Label>
                <Input 
                  id="iban" 
                  className="col-span-3" 
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {selectedPersonnel ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Personnel Details Dialog */}
      {selectedPersonnelForDetails && (
        <PersonnelDetailsDialog
          personel={selectedPersonnelForDetails}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </Card>
  );
}
