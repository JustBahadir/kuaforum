
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, BadgeDollarSign, User } from "lucide-react";
import { PersonnelAnalyst } from "@/components/analyst/PersonnelAnalyst";

interface PersonnelListProps {
  onPersonnelSelect: (id: number) => void;
}

export function PersonnelList({ onPersonnelSelect }: PersonnelListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
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
      calisma_sistemi, // Already of type "haftalik" | "aylik"
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
          Yeni Personel
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPersonnel.map((personel) => (
                <div
                  key={personel.id}
                  className="border rounded-md p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onPersonnelSelect(personel.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-700 font-semibold">
                          {personel.ad_soyad?.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{personel.ad_soyad}</h3>
                        <p className="text-sm text-gray-500">{personel.telefon}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(personel);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Pencil size={14} />
                      Düzenle
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-gray-500 text-sm">Email:</p>
                      <p className="text-sm">{personel.eposta}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Sistem:</p>
                      <p className="text-sm">{personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Maaş:</p>
                      <p className="text-sm font-medium">{personel.maas}₺</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Prim:</p>
                      <p className="text-sm font-medium">%{personel.prim_yuzdesi}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <div className="flex items-center text-green-600">
                      <BadgeDollarSign className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">%{personel.prim_yuzdesi} prim</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Personnel Analyst component - directly after personnel list */}
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
    </Card>
  );
}
