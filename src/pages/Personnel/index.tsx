
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Plus, Search, Trash } from "lucide-react";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { useQuery } from "@tanstack/react-query";
import { PersonnelActionMenu } from "./components/PersonnelActionMenu";
import { PersonnelDetail } from "./components/PersonnelDetail";
import { CreatePersonnelForm } from "./components/CreatePersonnelForm";
import { Toaster } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { usePersonnelMutation } from "./hooks/usePersonnelMutation";

export default function PersonnelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  // Query personnel data
  const { data: personnel = [], isLoading } = useQuery({
    queryKey: ["personnel"],
    queryFn: async () => {
      try {
        const data = await personelServisi.hepsiniGetir();
        return data;
      } catch (error) {
        console.error("Error fetching personnel:", error);
        return [];
      }
    },
  });

  // Filter personnel by search term and status
  const filteredPersonnel = personnel.filter((person) => {
    const matchesSearch =
      searchTerm === "" ||
      person.ad_soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.telefon.includes(searchTerm);

    if (activeTab === "active") {
      return matchesSearch && person.aktif !== false;
    }
    return matchesSearch && person.aktif === false;
  });

  // Mutations
  const { deletePersonnel } = usePersonnelMutation();

  // Handlers
  const handleSelectPersonnel = (id: number) => {
    setSelectedPersonnelId(id);
  };

  const handleCloseDetail = () => {
    setSelectedPersonnelId(null);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleDeleteConfirm = (id: number) => {
    if (confirm("Bu personeli silmek istediğinizden emin misiniz?")) {
      deletePersonnel.mutate(id);
    }
  };

  // This is a modal to display personnel details
  const renderPersonnelDetailModal = () => {
    if (!selectedPersonnelId) return null;

    const selectedPersonnel = personnel.find(
      (person) => person.id === selectedPersonnelId
    );

    if (!selectedPersonnel) return null;

    return (
      <Dialog open={!!selectedPersonnelId} onOpenChange={handleCloseDetail}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Personel Detayları</DialogTitle>
            <DialogDescription>
              {selectedPersonnel.ad_soyad} adlı personelin bilgileri
            </DialogDescription>
          </DialogHeader>
          
          <PersonnelDetail
            personnelId={selectedPersonnelId}
            onClose={handleCloseDetail}
          />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Personel Ekle
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Personel Listesi</CardTitle>
                <CardDescription>
                  İşletmenizde çalışan personellerin listesi
                </CardDescription>
              </div>

              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Personel ara..."
                    className="pl-8 max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full mt-3"
            >
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="active">Aktif Personeller</TabsTrigger>
                <TabsTrigger value="inactive">İnaktif Personeller</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredPersonnel.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? "Arama kriterlerine uygun personel bulunamadı."
                  : activeTab === "active"
                  ? "Aktif personel bulunmamaktadır."
                  : "İnaktif personel bulunmamaktadır."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Personel Adı</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Çalışma Sistemi</TableHead>
                      <TableHead>Maaş</TableHead>
                      <TableHead>Prim Yüzdesi</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPersonnel.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div className="font-medium">{person.ad_soyad}</div>
                          <div className="text-sm text-muted-foreground">
                            {person.eposta}
                          </div>
                        </TableCell>
                        <TableCell>
                          {person.telefon && formatPhoneNumber(person.telefon)}
                        </TableCell>
                        <TableCell>{person.calisma_sistemi}</TableCell>
                        <TableCell>{person.maas} ₺</TableCell>
                        <TableCell>%{person.prim_yuzdesi}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSelectPersonnel(person.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteConfirm(person.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <PersonnelActionMenu personnelId={person.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        {renderPersonnelDetailModal()}

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Personel Ekle</DialogTitle>
              <DialogDescription>
                İşletmenize yeni bir personel eklemek için formu doldurun.
              </DialogDescription>
            </DialogHeader>
            <CreatePersonnelForm onClose={handleCloseCreateModal} />
          </DialogContent>
        </Dialog>

        <Toaster richColors position="bottom-right" />
      </div>
    </StaffLayout>
  );
}
