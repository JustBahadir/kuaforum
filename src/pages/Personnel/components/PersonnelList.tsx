
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, UserPlus, Search } from "lucide-react";
import { PersonnelAnalyst } from "@/components/analyst/PersonnelAnalyst";
import { PersonnelDialog } from "./PersonnelDialog";
import { Personel } from "@/lib/supabase/types";
import { PersonnelEditDialog } from "./PersonnelEditDialog";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface PersonnelListProps {
  onPersonnelSelect: (id: number) => void;
}

export function PersonnelList({ onPersonnelSelect }: PersonnelListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { userRole } = useCustomerAuth();
  
  const queryClient = useQueryClient();
  
  const { data: personeller = [], isLoading } = useQuery({
    queryKey: ['personel-list'],
    queryFn: personelServisi.hepsiniGetir
  });
  
  // Define color based on working type
  const getWorkingTypeColor = (type: string): string => {
    switch (type) {
      case 'aylik_maas':
        return 'bg-blue-100 text-blue-800';
      case 'prim_komisyon':
        return 'bg-green-100 text-green-800';
      case 'gunluk_yevmiye':
        return 'bg-orange-100 text-orange-800';
      case 'haftalik_yevmiye':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get working type label
  const getWorkingTypeLabel = (type: string): string => {
    switch (type) {
      case 'aylik_maas':
        return 'Aylık Maaş';
      case 'prim_komisyon':
        return 'Prim/Komisyon';
      case 'gunluk_yevmiye':
        return 'Günlük Yevmiye';
      case 'haftalik_yevmiye':
        return 'Haftalık Yevmiye';
      default:
        return 'Belirsiz';
    }
  };
  
  const handleOpenEditDialog = (personel: Personel) => {
    setSelectedPersonnel(personel);
    setEditDialogOpen(true);
    onPersonnelSelect(personel.id);
  };
  
  const handleAddNew = () => {
    setIsDialogOpen(true);
  };
  
  // Filter active and inactive personnel
  const activePersonnel = personeller.filter(p => p.aktif !== false);
  const inactivePersonnel = personeller.filter(p => p.aktif === false);
  
  // Filter based on search term
  const filteredActivePersonnel = searchTerm 
    ? activePersonnel.filter(personel =>
        personel.ad_soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personel.telefon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personel.eposta?.toLowerCase().includes(searchTerm.toLowerCase()))
    : activePersonnel;
    
  const filteredInactivePersonnel = searchTerm 
    ? inactivePersonnel.filter(personel =>
        personel.ad_soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personel.telefon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personel.eposta?.toLowerCase().includes(searchTerm.toLowerCase()))
    : inactivePersonnel;

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personel Listesi</CardTitle>
        {userRole === 'admin' && (
          <Button onClick={handleAddNew} className="flex items-center gap-1">
            <UserPlus size={16} />
            <span className="hidden sm:inline">Personel Kaydını Görüntüle</span>
            <span className="sm:hidden">Personel</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Personel ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : filteredActivePersonnel.length > 0 || filteredInactivePersonnel.length > 0 ? (
          <div>
            {filteredActivePersonnel.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-gray-500">Aktif Personeller ({filteredActivePersonnel.length})</h3>
                {filteredActivePersonnel.map((personel) => (
                  <Collapsible key={personel.id} className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                          {personel.ad_soyad?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{personel.ad_soyad}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className={getWorkingTypeColor(personel.calisma_sistemi || 'aylik_maas')}>
                              {getWorkingTypeLabel(personel.calisma_sistemi || 'aylik_maas')}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-100">
                              {personel.telefon}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDialog(personel);
                        }} 
                        className="ml-2"
                      >
                        Düzenle
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50 p-4 border-t">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">E-posta:</span> {personel.eposta}
                        </div>
                        {personel.baslama_tarihi && (
                          <div>
                            <span className="font-medium">İşe Başlama:</span> {format(new Date(personel.baslama_tarihi), "PP", { locale: tr })}
                          </div>
                        )}
                        {personel.calisma_sistemi === 'aylik_maas' && (
                          <div>
                            <span className="font-medium">Aylık Maaş:</span> {personel.maas?.toLocaleString()} ₺
                          </div>
                        )}
                        {personel.calisma_sistemi === 'gunluk_yevmiye' && (
                          <div>
                            <span className="font-medium">Günlük Ücret:</span> {personel.gunluk_ucret?.toLocaleString()} ₺
                          </div>
                        )}
                        {personel.calisma_sistemi === 'haftalik_yevmiye' && (
                          <div>
                            <span className="font-medium">Haftalık Ücret:</span> {personel.haftalik_ucret?.toLocaleString()} ₺
                          </div>
                        )}
                        {personel.calisma_sistemi === 'prim_komisyon' && (
                          <div>
                            <span className="font-medium">Komisyon Oranı:</span> %{personel.prim_yuzdesi}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
            
            {filteredInactivePersonnel.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="font-medium text-sm text-gray-500">Pasif Personeller ({filteredInactivePersonnel.length})</h3>
                {filteredInactivePersonnel.map((personel) => (
                  <Collapsible key={personel.id} className="border rounded-lg overflow-hidden opacity-70">
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                          {personel.ad_soyad?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{personel.ad_soyad}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className="bg-gray-200 text-gray-800">
                              {getWorkingTypeLabel(personel.calisma_sistemi || 'aylik_maas')}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-200">
                              {personel.telefon}
                            </Badge>
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              Pasif
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDialog(personel);
                        }} 
                        className="ml-2"
                      >
                        Düzenle
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50 p-4 border-t">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">E-posta:</span> {personel.eposta}
                        </div>
                        {personel.baslama_tarihi && (
                          <div>
                            <span className="font-medium">İşe Başlama:</span> {format(new Date(personel.baslama_tarihi), "PP", { locale: tr })}
                          </div>
                        )}
                        {personel.calisma_sistemi === 'aylik_maas' && (
                          <div>
                            <span className="font-medium">Aylık Maaş:</span> {personel.maas?.toLocaleString()} ₺
                          </div>
                        )}
                        {personel.calisma_sistemi === 'gunluk_yevmiye' && (
                          <div>
                            <span className="font-medium">Günlük Ücret:</span> {personel.gunluk_ucret?.toLocaleString()} ₺
                          </div>
                        )}
                        {personel.calisma_sistemi === 'haftalik_yevmiye' && (
                          <div>
                            <span className="font-medium">Haftalık Ücret:</span> {personel.haftalik_ucret?.toLocaleString()} ₺
                          </div>
                        )}
                        {personel.calisma_sistemi === 'prim_komisyon' && (
                          <div>
                            <span className="font-medium">Komisyon Oranı:</span> %{personel.prim_yuzdesi}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
            
            {/* Add PersonnelAnalyst component */}
            <div className="mt-8">
              <PersonnelAnalyst />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "Arama kriterlerine uygun personel bulunamadı" : "Henüz personel kaydı bulunmuyor"}
          </div>
        )}
      </CardContent>
      
      {/* Personnel Dialog */}
      <PersonnelDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      
      {/* Personnel Edit Dialog */}
      {selectedPersonnel && (
        <PersonnelEditDialog
          personelId={selectedPersonnel.id}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </Card>
  );
}
